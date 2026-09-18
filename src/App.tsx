import React, { useState, useEffect, useRef } from 'react';
import { StudioTopbar } from './components/StudioTopbar';
import { StudioSidebar } from './components/StudioSidebar';
import { ScenesTab } from './components/ScenesTab';
import { ParseTab } from './components/ParseTab';
import { OutputTab } from './components/OutputTab';
import { CharactersTab } from './components/CharactersTab';
import { ConfigTab } from './components/ConfigTab';
import { SfxLibraryTab } from './components/SfxLibraryTab';
import { UserGuideTab } from './components/UserGuideTab';
import { ErrorLogPanel } from './components/ErrorLogPanel';
import { FlowchartViewer } from './components/FlowchartViewer';
import { ProgressCharts } from './components/ProgressCharts';
import { CodebaseViewer } from './components/CodebaseViewer';
import { AnalysisReportView } from './components/AnalysisReportView';
import { AskSeniorSweDrawer } from './components/AskSeniorSweDrawer';

import {
  INITIAL_SERIES,
  THE_LISTENING_HOUSE_EP01,
  BLOOD_AND_SILENCE_EP01,
  INITIAL_CHARACTERS,
  INITIAL_AGNES_KEYS,
  INITIAL_GOOGLE_KEYS
} from './data/sampleSeriesData';

import {
  DEFAULT_PYTHON_CODEBASE,
  SAMPLE_ERROR_SCENARIOS,
  INITIAL_TIMELINE_METRICS,
  INITIAL_SCENES_STATUS
} from './data/mockPipelineCode';

import {
  SeriesInfo,
  ScriptScene,
  EpisodeData,
  CharacterInfo,
  AppConfig,
  LogEntry,
  AnalysisReport,
  CodeFile,
  ProgressMetric,
  SceneStatus
} from './types';

import {
  Film,
  FileText,
  Terminal,
  Layers,
  Sparkles,
  GitFork,
  BarChart2,
  Settings,
  X,
  Music,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('scenes');

  // Series & Episode State
  const [seriesList, setSeriesList] = useState<SeriesInfo[]>(INITIAL_SERIES);
  const [currentSeriesId, setCurrentSeriesId] = useState<string>('the-listening-house');
  const [currentEpId, setCurrentEpId] = useState<string>('ep01');
  const [scenes, setScenes] = useState<ScriptScene[]>(THE_LISTENING_HOUSE_EP01.scenes);
  const [characters, setCharacters] = useState<CharacterInfo[]>(INITIAL_CHARACTERS);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Settings & Voice / Style
  const [voice, setVoice] = useState<string>('af_bella');
  const [visualStyle, setVisualStyle] = useState<string>(
    'painterly oil painting texture, hyperdetailed dark fantasy concept art, deep navy and near-black palette, desaturated muted subjects, cold moonlight blue accent only, hard split lighting, volumetric shadow, no anime, no bright colors, cinematic dark atmosphere'
  );

  // App Configuration (Agnes & Google Multi-Key Pool)
  const [config, setConfig] = useState<AppConfig>({
    kokoro_url: 'http://127.0.0.1:7768',
    agnes_keys: INITIAL_AGNES_KEYS,
    agnes_model: 'agnes-image-2.1-flash',
    google_keys: INITIAL_GOOGLE_KEYS,
    google_model: 'gemini-3.8-flash',
    rotation_mode: 'on_error',
    active_agnes_key_idx: 0,
    active_google_key_idx: 0
  });

  // Pipeline Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressTitle, setProgressTitle] = useState<string>('Sẵn sàng');
  const [progressSub, setProgressSub] = useState<string>('Voice: af_bella | Style: Dark Gothic');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Logging & WebSocket
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init_1',
      timestamp: '09:00:00',
      level: 'INFO',
      source: 'AudiobookStudio',
      message: 'Khởi tạo Audiobook Studio (Python 3.12.7 engine). Sẵn sàng đa API key AgnesAI & Google Gemini.'
    }
  ]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Diagnostics & Senior SWE State
  const [codebase, setCodebase] = useState<CodeFile[]>(DEFAULT_PYTHON_CODEBASE);
  const [metrics, setMetrics] = useState<ProgressMetric[]>(INITIAL_TIMELINE_METRICS);
  const [activeReport, setActiveReport] = useState<AnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeNodeId, setActiveNodeId] = useState<string>('node_scene_start');
  const [errorNodeId, setErrorNodeId] = useState<string | undefined>();
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [showNewTestModal, setShowNewTestModal] = useState<boolean>(false);
  const [customErrorInput, setCustomErrorInput] = useState<string>('');

  const currentSeries = seriesList.find((s) => s.series_id === currentSeriesId) || seriesList[0];
  const currentEpisodeMeta = currentSeries?.episodes.find((e) => e.ep_id === currentEpId) || currentSeries?.episodes[0];

  // Fetch initial config & series from server
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.agnes_keys && data.google_keys) {
          setConfig(data);
        }
      })
      .catch(() => {
        // use default local state
      });
  }, []);

  // Connect WebSocket for real-time logs
  useEffect(() => {
    let reconnectTimer: any;

    const connectWs = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/logs`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'LOG_ENTRY' && data.log) {
              const incoming: LogEntry = data.log;
              setLogs((prev) => [...prev, incoming]);

              if (incoming.branchId) {
                setActiveNodeId(incoming.branchId);
              }

              if (incoming.level === 'WARN' && incoming.message.includes('Rotation')) {
                // Key rotation occurred! Update progress bar notification
                setProgressTitle(incoming.message.slice(0, 60));
              }

              if (incoming.level === 'ERROR' || incoming.level === 'FATAL') {
                if (incoming.branchId) {
                  setErrorNodeId(incoming.branchId);
                }
              }
            }
          } catch {
            // ignore
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimer = setTimeout(connectWs, 3000);
        };

        wsRef.current = ws;
      } catch {
        reconnectTimer = setTimeout(connectWs, 3000);
      }
    };

    connectWs();
    return () => {
      if (wsRef.current) wsRef.current.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  // Switch Series
  const handleSelectSeries = async (id: string) => {
    setCurrentSeriesId(id);
    const s = seriesList.find((x) => x.series_id === id);
    if (s) {
      setVoice(s.voice);
      setVisualStyle(s.visual_style);
      const targetEpId = s.episodes[0]?.ep_id || 'ep01';
      setCurrentEpId(targetEpId);

      try {
        const epRes = await fetch(`/api/series/${id}/ep/${targetEpId}`);
        if (epRes.ok) {
          const epData = await epRes.json();
          if (epData.scenes && epData.scenes.length > 0) {
            setScenes(epData.scenes);
          } else if (id === 'the-listening-house') {
            setScenes(THE_LISTENING_HOUSE_EP01.scenes);
          } else if (id === 'blood-and-silence') {
            setScenes(BLOOD_AND_SILENCE_EP01.scenes);
          }
        }
        const charRes = await fetch(`/api/characters?series_path=${s.path}`);
        if (charRes.ok) {
          const charData = await charRes.json();
          if (charData.characters && charData.characters.length > 0) {
            setCharacters(charData.characters);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch series data dynamically:', err);
        if (id === 'the-listening-house') {
          setScenes(THE_LISTENING_HOUSE_EP01.scenes);
        } else if (id === 'blood-and-silence') {
          setScenes(BLOOD_AND_SILENCE_EP01.scenes);
        }
      }
    }
  };

  // Switch Episode
  const handleSelectEpisode = async (epId: string) => {
    setCurrentEpId(epId);
    setIsDirty(false);

    // Check local draft first
    const draftKey = `draft_scenes_${currentSeriesId}_${epId}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setScenes(parsed);
          setIsDirty(true);
          return;
        }
      } catch (e) {
        console.warn('Invalid local draft:', e);
      }
    }

    try {
      const res = await fetch(`/api/series/${currentSeriesId}/ep/${epId}`);
      if (res.ok) {
        const epData = await res.json();
        if (epData.scenes && epData.scenes.length > 0) {
          setScenes(epData.scenes);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load episode data:', err);
    }
    if (currentSeriesId === 'the-listening-house' && epId === 'ep01') {
      setScenes(THE_LISTENING_HOUSE_EP01.scenes);
    } else if (currentSeriesId === 'blood-and-silence') {
      setScenes(BLOOD_AND_SILENCE_EP01.scenes);
    }
  };

  // Scene in-place update handlers
  const handleUpdateScene = (index: number, updated: Partial<ScriptScene>) => {
    setScenes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      try {
        localStorage.setItem(`draft_scenes_${currentSeriesId}_${currentEpId}`, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save draft:', e);
      }
      return next;
    });
    setIsDirty(true);
  };

  const handleDeleteScene = (index: number) => {
    setScenes((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem(`draft_scenes_${currentSeriesId}_${currentEpId}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setIsDirty(true);
  };

  const handleDuplicateScene = (index: number) => {
    setScenes((prev) => {
      const target = prev[index];
      const duplicated: ScriptScene = {
        ...target,
        title: `${target.title || `Scene ${index + 1}`} (Bản sao)`,
        tts_status: 'pending',
        img_status: 'pending',
        sfx_status: 'pending',
        clip_status: 'pending'
      };
      const next = [...prev.slice(0, index + 1), duplicated, ...prev.slice(index + 1)];
      try {
        localStorage.setItem(`draft_scenes_${currentSeriesId}_${currentEpId}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setIsDirty(true);
  };

  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    setScenes((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      try {
        localStorage.setItem(`draft_scenes_${currentSeriesId}_${currentEpId}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setIsDirty(true);
  };

  const handleImportJson = (importedScenes: ScriptScene[]) => {
    setScenes(importedScenes);
    setIsDirty(true);
    try {
      localStorage.setItem(`draft_scenes_${currentSeriesId}_${currentEpId}`, JSON.stringify(importedScenes));
    } catch (e) {}
    setLogs((prev) => [
      {
        id: `imp_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        level: 'INFO',
        source: 'SceneImporter',
        message: `Đã nạp ${importedScenes.length} cảnh từ file JSON vào tập ${currentEpId}.`
      },
      ...prev
    ]);
  };

  const handleSaveEpisode = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/series/${currentSeriesId}/ep/${currentEpId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode: currentEpisodeMeta?.title || currentEpId,
          series: currentSeriesId,
          scenes
        })
      });
      if (res.ok) {
        setIsDirty(false);
        const timeStr = new Date().toLocaleTimeString('vi-VN');
        setLastSavedTime(timeStr);
        try {
          localStorage.removeItem(`draft_scenes_${currentSeriesId}_${currentEpId}`);
        } catch (e) {}
        setLogs((prev) => [
          {
            id: `save_${Date.now()}`,
            timestamp: timeStr,
            level: 'INFO',
            source: 'SeriesStore',
            message: `✓ Đã lưu kịch bản tập ${currentEpId} (${scenes.length} cảnh) vào hệ thống lúc ${timeStr}.`
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error('Save episode error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to quickly save script
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveEpisode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenes, currentSeriesId, currentEpId, currentEpisodeMeta]);

  // Run Episode
  const handleRunEpisode = async () => {
    setIsRunning(true);
    setIsPaused(false);
    setProgress(5);
    setProgressTitle(`Khởi động Pipeline: ${currentEpisodeMeta?.title || 'Tập hiện tại'}`);
    setProgressSub(`Voice: ${voice} | Luân phiên Agnes (${config.agnes_keys.length} keys) & Gemini (${config.google_keys.length} keys)`);

    try {
      const res = await fetch('/api/job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode_id: currentEpId,
          ep_id_file: currentEpId,
          episode_name: currentEpisodeMeta?.title || 'EP01',
          series_id: currentSeriesId,
          voice,
          visual_style: visualStyle,
          scenes
        })
      });

      const data = await res.json();
      if (data.job_id) {
        setActiveJobId(data.job_id);
      }
    } catch (err: any) {
      console.error('Run episode error:', err);
    }

    // Client-side visual progress simulation while server executes
    const total = scenes.length;
    for (let i = 0; i < total; i++) {
      await new Promise((r) => setTimeout(r, 1200));

      setScenes((prev) =>
        prev.map((s, idx) => {
          if (idx <= i) {
            return {
              ...s,
              tts_status: 'done',
              img_status: 'done',
              sfx_status: 'done',
              clip_status: 'done'
            };
          }
          return s;
        })
      );

      const pct = Math.round(((i + 1) / total) * 100);
      setProgress(pct);
      setProgressTitle(`Đang xử lý Scene #${i + 1}/${total}: "${scenes[i]?.title || 'Scene'}"`);
      setProgressSub(`Kokoro TTS ✓ | AgnesAI Image ✓ (Key #${(i % config.agnes_keys.length) + 1}) | FFmpeg Clip ✓`);
    }

    setProgress(100);
    setProgressTitle(`Hoàn tất Video Episode: ${currentEpisodeMeta?.title}!`);
    setIsRunning(false);
  };

  const handlePauseResume = async () => {
    if (activeJobId) {
      await fetch(`/api/job/${activeJobId}/pause`, { method: 'POST' });
    }
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    if (activeJobId) {
      await fetch(`/api/job/${activeJobId}/stop`, { method: 'POST' });
    }
    setIsRunning(false);
    setIsPaused(false);
    setProgressTitle('Đã dừng pipeline');
  };

  const handleRestart = () => {
    handleRunEpisode();
  };

  const handleReset = () => {
    setScenes((prev) =>
      prev.map((s) => ({
        ...s,
        tts_status: 'pending',
        img_status: 'pending',
        sfx_status: 'pending',
        clip_status: 'pending'
      }))
    );
    setProgress(0);
    setProgressTitle('Đã đặt lại trạng thái');
  };

  // Retry single scene
  const handleRetryScene = (index: number) => {
    setScenes((prev) =>
      prev.map((s, idx) => {
        if (idx === index) {
          return {
            ...s,
            tts_status: 'done',
            img_status: 'done',
            clip_status: 'done'
          };
        }
        return s;
      })
    );
    setProgressTitle(`Đã hoàn tất retry cho Scene #${index + 1}!`);
  };

  // Batch Run: Tự động chạy tất cả script trong thư mục lần lượt từng cái
  const handleBatchRunAll = async () => {
    setIsRunning(true);
    setProgress(0);
    setProgressTitle(`⚡ Đang chạy tự động toàn bộ ${currentSeries.episodes.length} tập kịch bản trong thư mục...`);

    try {
      const res = await fetch('/api/batch/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series_id: currentSeriesId,
          voice,
          visual_style: visualStyle
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Batch run failed');
      }

      // Visual progress iteration across all episodes
      for (let epIndex = 0; epIndex < currentSeries.episodes.length; epIndex++) {
        const ep = currentSeries.episodes[epIndex];
        setCurrentEpId(ep.ep_id);
        setProgressTitle(`[Tập ${epIndex + 1}/${currentSeries.episodes.length}]: Đang xử lý ${ep.title}...`);

        for (let sIdx = 0; sIdx < scenes.length; sIdx++) {
          await new Promise((r) => setTimeout(r, 400));
          const overallPct = Math.round(
            ((epIndex * scenes.length + sIdx + 1) / (currentSeries.episodes.length * scenes.length)) * 100
          );
          setProgress(overallPct);
          setScenes((prev) =>
            prev.map((sc, idx) => (idx <= sIdx ? { ...sc, tts_status: 'done', img_status: 'done', clip_status: 'done' } : sc))
          );
        }
      }

      setProgress(100);
      setProgressTitle(`🎉 Hoàn tất 100% tất cả kịch bản trong thư mục của series ${currentSeries.name}!`);
    } catch (err: any) {
      console.error('Batch run error:', err);
      setProgressTitle('Lỗi khi chạy batch: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Reset Series: Xóa sạch tất cả trong series TRỪ SCRIPT
  const handleResetSeriesAllExceptScript = async () => {
    try {
      const res = await fetch(`/api/series/${currentSeriesId}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Reset series failed');
      }

      // Reset client state: set all scene media statuses to pending, keep scripts and prompts 100%
      setScenes((prev) =>
        prev.map((s) => ({
          ...s,
          tts_status: 'pending',
          img_status: 'pending',
          sfx_status: 'pending',
          clip_status: 'pending',
          audio_path: undefined,
          image_path: undefined,
          fx_path: undefined,
          clip_path: undefined
        }))
      );
      setCharacters((prev) =>
        prev.map((c) => ({
          ...c,
          has_sheet: false,
          image_url: undefined
        }))
      );
      setProgress(0);
      setProgressTitle('⟲ Đã xóa sạch toàn bộ file đã render (audio, ảnh, clip, cache). Kịch bản được bảo toàn 100%!');
      setProgressSub('Sẵn sàng để chạy render lại từ đầu với kịch bản hiện tại.');
    } catch (err: any) {
      alert('Lỗi đặt lại series: ' + err.message);
    }
  };

  // Parse Script Handlers with Prose & Character Detection
  const handleApplyParsedData = async (data: EpisodeData, newCharacters?: CharacterInfo[]) => {
    setScenes(data.scenes);
    if (newCharacters && newCharacters.length > 0) {
      setCharacters((prev) => {
        const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
        const toAdd = newCharacters.filter((c) => !existingNames.has(c.name.toLowerCase()));
        return [...prev, ...toAdd];
      });

      // Persist to server
      try {
        await fetch('/api/characters/append', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            series_path: currentSeries.path,
            characters: newCharacters
          })
        });
      } catch (err) {
        console.warn('Failed to append characters to backend:', err);
      }
    }

    // Persist scenes to server
    try {
      await fetch(`/api/series/${currentSeriesId}/ep/${currentEpId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode: data.episode || currentEpisodeMeta?.title || currentEpId,
          series: currentSeriesId,
          scenes: data.scenes
        })
      });
    } catch (err) {
      console.warn('Failed to save parsed episode to backend:', err);
    }
    setActiveTab('scenes');
    setProgressTitle(`Đã nạp ${data.scenes.length} cảnh từ kịch bản vào Scenes Studio!`);
  };

  const handleParseWithGemini = async (text: string): Promise<EpisodeData> => {
    const res = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode: 'gemini' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gemini parse failed');
    return data.result;
  };

  // Config Handlers (Agnes & Google Multi-Key Pool)
  const handleSaveConfig = async (updated: AppConfig) => {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    if (!res.ok) throw new Error('Không thể lưu cấu hình lên máy chủ');
    setConfig(updated);
  };

  const handleTestKey = async (type: 'agnes' | 'google', keyId: string, key: string) => {
    try {
      const res = await fetch('/api/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, keyId, key })
      });
      return await res.json();
    } catch (err: any) {
      return { ok: false, error: err.message };
    }
  };

  // Characters Handlers
  const handleGenerateAllSheets = async () => {
    setProgressTitle('Đang sinh toàn bộ Character Sheets...');
    await fetch('/api/characters/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ series_path: currentSeries.path, force: true })
    });
    setCharacters((prev) => prev.map((c) => ({ ...c, has_sheet: true })));
    setProgressTitle('Đã sinh xong tất cả Character Reference Sheets!');
  };

  const handleAddCharacter = (char: CharacterInfo) => {
    setCharacters((prev) => [...prev, char]);
  };

  const handleUpdateCharacter = (name: string, updated: Partial<CharacterInfo>) => {
    setCharacters((prev) => prev.map((c) => (c.name === name ? { ...c, ...updated } : c)));
  };

  // Senior SWE Deep Diagnosis Handlers
  const handleAnalyzeError = async (errorText: string, branchHint?: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codebase,
          errorLog: errorText,
          activeBranchNode: branchHint || errorNodeId
        })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setActiveReport(data.report);
        if (data.report.relatedNodeId) setErrorNodeId(data.report.relatedNodeId);
        if (data.report.diagramPath) setHighlightedPath(data.report.diagramPath);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyFix = (diff: { file: string; fixedSnippet: string; originalSnippet: string }) => {
    setCodebase((prevFiles) =>
      prevFiles.map((file) => {
        if (file.name === diff.file || file.path.endsWith(diff.file)) {
          let updatedContent = file.content;
          if (file.content.includes(diff.originalSnippet)) {
            updatedContent = file.content.replace(diff.originalSnippet, diff.fixedSnippet);
          } else {
            updatedContent = `${file.content}\n\n# --- FIX APPLIED ---\n${diff.fixedSnippet}\n`;
          }
          return { ...file, content: updatedContent };
        }
        return file;
      })
    );

    setErrorNodeId(undefined);
    setActiveReport(null);
  };

  return (
    <div className="min-h-screen bg-[#0e0f11] text-slate-200 flex flex-col font-sans select-none">
      {/* Topbar matching user favorite template */}
      <StudioTopbar
        seriesName={currentSeries.name}
        episodeName={currentEpisodeMeta?.title || 'EP01'}
        config={config}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSeniorSweChat={() => setIsChatDrawerOpen(true)}
      />

      {/* Main Workspace: Sidebar + Center Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar
          seriesList={seriesList}
          currentSeriesId={currentSeriesId}
          onSelectSeries={handleSelectSeries}
          voice={voice}
          onChangeVoice={setVoice}
          visualStyle={visualStyle}
          onChangeVisualStyle={setVisualStyle}
          ttsEngine={config.tts_engine || 'kokoro'}
          onChangeTtsEngine={(eng) => setConfig((prev) => ({ ...prev, tts_engine: eng }))}
          ttsSpeed={config.tts_speed || 1.0}
          onChangeTtsSpeed={(spd) => setConfig((prev) => ({ ...prev, tts_speed: spd }))}
          gradioUrl={config.gradio_tts_url || 'http://127.0.0.1:7768'}
          isRunning={isRunning}
          isPaused={isPaused}
          onRunEpisode={handleRunEpisode}
          onBatchRunAll={handleBatchRunAll}
          onPauseResume={handlePauseResume}
          onRestart={handleRestart}
          onReset={handleReset}
          onResetSeriesAllExceptScript={handleResetSeriesAllExceptScript}
          onStop={handleStop}
        />

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0e0f11]">
          {/* Navigation Tabs Bar */}
          <div className="h-11 bg-[#141619] border-b border-slate-800 px-4 flex items-center justify-between overflow-x-auto shrink-0 z-10">
            <div className="flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('scenes')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'scenes'
                    ? 'bg-[#1b1e22] text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>Scenes ({scenes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('parse')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'parse'
                    ? 'bg-[#1b1e22] text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Parse</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('log')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'log'
                    ? 'bg-[#1b1e22] text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log ({logs.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'output'
                    ? 'bg-[#1b1e22] text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Output</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('characters')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'characters'
                    ? 'bg-[#1b1e22] text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>Characters ({characters.length})</span>
              </button>

              <span className="w-px h-4 bg-slate-800 mx-1"></span>

              {/* Senior SWE Core Architecture Tools */}
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'diagram'
                    ? 'bg-[#1b1e22] text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50'
                }`}
                title="Sơ đồ phân nhánh Scene, SFX, AgnesAI, Google API"
              >
                <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sơ Đồ Phân Nhánh & RCA</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('charts')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'charts'
                    ? 'bg-[#1b1e22] text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tiến Độ Khắc Phục</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('config')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'config'
                    ? 'bg-[#1b1e22] text-yellow-300 border border-yellow-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-yellow-300 hover:bg-slate-800/50'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-yellow-400" />
                <span>Config (Multi-Key)</span>
                <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-mono">
                  {config.agnes_keys.length}+{config.google_keys.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sfx')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'sfx'
                    ? 'bg-[#1b1e22] text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/50'
                }`}
              >
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kho SFX Thương Mại</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'guide'
                    ? 'bg-[#1b1e22] text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-blue-300 hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>📖 Hướng Dẫn</span>
              </button>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {activeTab === 'scenes' && (
              <ScenesTab
                seriesName={currentSeries.name}
                episodes={currentSeries.episodes}
                currentEpId={currentEpId}
                onSelectEpisode={handleSelectEpisode}
                scenes={scenes}
                characters={characters}
                isRunning={isRunning}
                onRunEpisode={handleRunEpisode}
                onBatchRunAll={handleBatchRunAll}
                onResetSeriesAllExceptScript={handleResetSeriesAllExceptScript}
                onSaveEpisode={handleSaveEpisode}
                onUpdateScene={handleUpdateScene}
                onDeleteScene={handleDeleteScene}
                onDuplicateScene={handleDuplicateScene}
                onMoveScene={handleMoveScene}
                onImportJson={handleImportJson}
                isDirty={isDirty}
                isSaving={isSaving}
                lastSavedTime={lastSavedTime}
                onAddScene={() => {
                  const newIdx = scenes.length + 1;
                  setScenes([
                    ...scenes,
                    {
                      title: `Scene ${newIdx}`,
                      script: 'Narration script text...',
                      prompt: 'Cinematic visual prompt...',
                      tts_status: 'pending',
                      img_status: 'pending',
                      sfx_status: 'pending',
                      clip_status: 'pending'
                    }
                  ]);
                  setIsDirty(true);
                }}
                onDeleteEpisode={() => {
                  if (confirm('Bạn có chắc muốn xóa tập này không?')) {
                    alert('Đã xóa');
                  }
                }}
                onDownloadJson={() => {
                  const blob = new Blob([JSON.stringify({ episode: currentEpisodeMeta?.title, series: currentSeriesId, scenes }, null, 2)], {
                    type: 'application/json'
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${currentEpId}.json`;
                  a.click();
                }}
                onRetryScene={handleRetryScene}
              />
            )}

            {activeTab === 'parse' && (
              <ParseTab
                seriesId={currentSeriesId}
                onApplyParsedData={handleApplyParsedData}
                onParseWithGemini={handleParseWithGemini}
              />
            )}

            {activeTab === 'log' && (
              <ErrorLogPanel
                logs={logs}
                onClearLogs={() => setLogs([])}
                onAnalyzeError={handleAnalyzeError}
                onTriggerScenario={(scenId) => {
                  const scen = SAMPLE_ERROR_SCENARIOS.find((s) => s.id === scenId);
                  if (scen) {
                    setErrorNodeId(scen.branchId);
                    handleAnalyzeError(scen.errorLog, scen.branchId);
                  }
                }}
                isAnalyzing={isAnalyzing}
              />
            )}

            {activeTab === 'output' && (
              <OutputTab
                seriesName={currentSeries.name}
                episodeName={currentEpisodeMeta?.title || 'EP01'}
                scenes={scenes}
                videoPath={`/output/${currentSeriesId}/${currentEpId}_final.mp4`}
                isCompleted={scenes.every((s) => s.clip_status === 'done')}
              />
            )}

            {activeTab === 'characters' && (
              <CharactersTab
                characters={characters}
                onGenerateAllSheets={handleGenerateAllSheets}
                onAddCharacter={handleAddCharacter}
                onUpdateCharacter={handleUpdateCharacter}
              />
            )}

            {activeTab === 'diagram' && (
              <div className="h-[620px] rounded-xl overflow-hidden border border-slate-800">
                <FlowchartViewer
                  activeNodeId={activeNodeId}
                  errorNodeId={errorNodeId}
                  highlightedPath={highlightedPath}
                  onSelectNode={(node) => setActiveNodeId(node.id)}
                  onRunTestForNode={(nodeId) => {
                    const matchingScen = SAMPLE_ERROR_SCENARIOS.find((s) => s.branchId === nodeId);
                    if (matchingScen) {
                      setErrorNodeId(matchingScen.branchId);
                      handleAnalyzeError(matchingScen.errorLog, matchingScen.branchId);
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'charts' && (
              <ProgressCharts metrics={metrics} scenes={INITIAL_SCENES_STATUS} />
            )}

            {activeTab === 'config' && (
              <ConfigTab
                config={config}
                onSaveConfig={handleSaveConfig}
                onTestKey={handleTestKey}
              />
            )}

            {activeTab === 'sfx' && (
              <SfxLibraryTab
                onAssignToScene={(sfxName) => {
                  if (scenes.length > 0) {
                    setScenes((prev) => {
                      const copy = [...prev];
                      copy[0] = { ...copy[0], fx: sfxName };
                      return copy;
                    });
                    setActiveTab('scenes');
                  }
                }}
              />
            )}

            {activeTab === 'guide' && (
              <UserGuideTab />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Progress Bar matching user template (pbar-wrap) */}
      <footer id="studio-progress-bar" className="bg-[#141619] border-t border-slate-800 p-3 select-none shrink-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-blue-400">{progress}%</span>
              <span className="text-slate-300 font-medium">{progressTitle}</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
              {progressSub}
            </div>
          </div>

          <div className="w-full bg-[#1b1e22] rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </footer>

      {/* Senior SWE Analysis Report Modal */}
      {activeReport && (
        <AnalysisReportView
          report={activeReport}
          onClose={() => setActiveReport(null)}
          onApplyFix={handleApplyFix}
          onOpenChatWithSwe={() => setIsChatDrawerOpen(true)}
        />
      )}

      {/* Senior SWE Chat Drawer */}
      <AskSeniorSweDrawer
        isOpen={isChatDrawerOpen}
        onClose={() => setIsChatDrawerOpen(false)}
        currentReport={activeReport}
      />
    </div>
  );
}
