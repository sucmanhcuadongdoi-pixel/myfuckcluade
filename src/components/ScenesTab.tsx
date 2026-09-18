import React, { useState, useRef } from 'react';
import { ScriptScene, EpisodeMeta, CharacterInfo } from '../types';
import {
  Play,
  Plus,
  Trash2,
  Download,
  Upload,
  Save,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Volume2,
  Image,
  Music,
  CheckCircle2,
  Zap,
  RotateCcw,
  Copy,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  FileCode,
  Clock
} from 'lucide-react';

interface ScenesTabProps {
  seriesName: string;
  episodes: EpisodeMeta[];
  currentEpId: string;
  onSelectEpisode: (epId: string) => void;
  scenes: ScriptScene[];
  characters: CharacterInfo[];
  isRunning: boolean;
  onRunEpisode: () => void;
  onBatchRunAll?: () => void;
  onResetSeriesAllExceptScript?: () => void;
  onSaveEpisode: () => void;
  onAddScene: () => void;
  onUpdateScene?: (index: number, updated: Partial<ScriptScene>) => void;
  onDeleteScene?: (index: number) => void;
  onDuplicateScene?: (index: number) => void;
  onMoveScene?: (index: number, direction: 'up' | 'down') => void;
  onImportJson?: (importedScenes: ScriptScene[]) => void;
  onDeleteEpisode: () => void;
  onDownloadJson: () => void;
  onRetryScene: (index: number) => void;
  isDirty?: boolean;
  isSaving?: boolean;
  lastSavedTime?: string | null;
}

export const ScenesTab: React.FC<ScenesTabProps> = ({
  seriesName,
  episodes,
  currentEpId,
  onSelectEpisode,
  scenes,
  characters,
  isRunning,
  onRunEpisode,
  onBatchRunAll,
  onResetSeriesAllExceptScript,
  onSaveEpisode,
  onAddScene,
  onUpdateScene,
  onDeleteScene,
  onDuplicateScene,
  onMoveScene,
  onImportJson,
  onDeleteEpisode,
  onDownloadJson,
  onRetryScene,
  isDirty = false,
  isSaving = false,
  lastSavedTime = null
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate episode stats
  const totalWords = scenes.reduce((acc, sc) => acc + (sc.script ? sc.script.trim().split(/\s+/).filter(Boolean).length : 0), 0);
  const estimatedSeconds = Math.round(totalWords * 0.4);
  const estMinutes = (estimatedSeconds / 60).toFixed(1);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'done':
        return <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono"><CheckCircle2 className="w-3 h-3" /> done</span>;
      case 'running':
        return <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-mono animate-pulse"><RefreshCw className="w-3 h-3 animate-spin" /> running</span>;
      case 'error':
        return <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-mono">error</span>;
      case 'skip':
        return <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-mono">skip</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-mono">pending</span>;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        let sceneList: ScriptScene[] = [];

        if (Array.isArray(parsed)) {
          sceneList = parsed;
        } else if (parsed && Array.isArray(parsed.scenes)) {
          sceneList = parsed.scenes;
        } else {
          throw new Error('File JSON không chứa danh sách mảng "scenes" hợp lệ.');
        }

        if (sceneList.length === 0) {
          throw new Error('Danh sách cảnh trong file rỗng.');
        }

        if (onImportJson) {
          onImportJson(sceneList);
          setImportNotice({ type: 'success', message: `✓ Đã nhập thành công ${sceneList.length} cảnh từ file "${file.name}"!` });
        }
      } catch (err: any) {
        setImportNotice({ type: 'error', message: `Lỗi đọc JSON: ${err?.message || 'Định dạng không hợp lệ'}` });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setImportNotice(null), 6000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="scenes-tab-view" className="space-y-4 text-slate-200">
      {/* Hidden File Input for JSON Script Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Top Section: Series & Episode Pills + Episode Metric Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>{seriesName}</span>
          </h2>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30">
              {scenes.length} Scenes
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono flex items-center gap-1 border border-slate-700">
              <Clock className="w-3 h-3 text-emerald-400" />
              {totalWords} từ (~{estMinutes} phút)
            </span>
          </div>
        </div>

        {/* Episode Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {episodes.map((ep) => (
            <button
              key={ep.ep_id}
              onClick={() => onSelectEpisode(ep.ep_id)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                currentEpId === ep.ep_id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'bg-[#1b1e22] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{ep.title.split(' - ')[0] || ep.ep_id.toUpperCase()}</span>
              {ep.status === 'done' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
            </button>
          ))}
        </div>
      </div>

      {/* Import Notification Banner */}
      {importNotice && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            importNotice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <span>{importNotice.message}</span>
          <button
            type="button"
            onClick={() => setImportNotice(null)}
            className="text-slate-400 hover:text-slate-200 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#141619] border border-slate-800 rounded-lg p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {onBatchRunAll && (
            <button
              id="btn-batch-run-toolbar"
              type="button"
              onClick={onBatchRunAll}
              disabled={isRunning}
              className="px-3 py-1.5 rounded bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-amber-600/30"
              title="Tự động hoàn thành tất cả script trong thư mục lần lượt từng cái"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ Chạy Hết Script Thư Mục</span>
            </button>
          )}

          <button
            id="btn-run-toolbar"
            type="button"
            onClick={onRunEpisode}
            disabled={isRunning}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Chạy tập này</span>
          </button>

          <button
            type="button"
            onClick={onAddScene}
            className="px-2.5 py-1.5 rounded bg-[#1b1e22] hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Thêm Scene</span>
          </button>

          {/* SAVE SCRIPT BUTTON WITH REAL-TIME DIRTY/SAVING STATUS */}
          <button
            type="button"
            onClick={onSaveEpisode}
            disabled={isSaving}
            className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              isDirty
                ? 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 shadow-sm shadow-amber-600/30 animate-pulse'
                : isSaving
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-[#1b1e22] hover:bg-slate-800 text-emerald-300 border border-slate-700'
            }`}
            title="Lưu kịch bản vào ổ đĩa và RAM hệ thống (Phím tắt: Ctrl + S)"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Save className={`w-3.5 h-3.5 ${isDirty ? 'text-white' : 'text-emerald-400'}`} />
            )}
            <span>
              {isSaving ? 'Đang lưu...' : isDirty ? 'Lưu Kịch Bản (Chưa lưu ●)' : 'Lưu Kịch Bản'}
            </span>
          </button>

          {/* Last Saved Indicator */}
          {lastSavedTime && !isDirty && (
            <span className="text-[11px] text-emerald-400/90 font-mono hidden md:inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Đã lưu {lastSavedTime}</span>
            </span>
          )}

          {onResetSeriesAllExceptScript && (
            <button
              id="btn-reset-series-toolbar"
              type="button"
              onClick={onResetSeriesAllExceptScript}
              disabled={isRunning}
              className="px-2.5 py-1.5 rounded bg-[#1b1e22] hover:bg-amber-950/40 text-amber-400 text-xs font-medium border border-amber-900/50 hover:border-amber-600/60 flex items-center gap-1 transition-colors"
              title="Nguyên tắc đặt lại: Xóa sạch tất cả media đã render trong series TRỪ KỊCH BẢN"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>⟲ Đặt Lại Media (Giữ Script)</span>
            </button>
          )}
        </div>

        {/* JSON Import & Export Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded bg-[#1b1e22] hover:bg-slate-800 text-purple-300 hover:text-purple-200 text-xs font-medium border border-slate-800 flex items-center gap-1 transition-colors"
            title="Nhập kịch bản từ file JSON có sẵn trên máy tính"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span>Nhập JSON</span>
          </button>

          <button
            type="button"
            onClick={onDownloadJson}
            className="px-2.5 py-1.5 rounded bg-[#1b1e22] hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium border border-slate-800 flex items-center gap-1 transition-colors"
            title="Tải kịch bản tập về máy định dạng JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải JSON</span>
          </button>
        </div>
      </div>

      {/* Characters Info Banner */}
      {characters.length > 0 && (
        <div className="bg-[#141619] border border-slate-800 rounded-lg p-3 flex items-center gap-3 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium shrink-0">🎭 Nhân vật tập:</span>
          <div className="flex items-center gap-2">
            {characters.map((char) => (
              <div
                key={char.name}
                className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1b1e22] border border-slate-700 text-slate-200 shrink-0"
              >
                {char.image_url ? (
                  <img src={char.image_url} alt={char.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">
                    {char.name[0]}
                  </span>
                )}
                <span className="font-medium">{char.name}</span>
                <span className="text-[10px] text-slate-500 uppercase">({char.role})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scene Table */}
      <div className="bg-[#141619] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#1b1e22] border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-4 min-w-[200px]">Scene Title & Script</th>
                <th className="py-2.5 px-3 w-24">TTS</th>
                <th className="py-2.5 px-3 w-28">Image</th>
                <th className="py-2.5 px-3 w-24">SFX</th>
                <th className="py-2.5 px-3 w-24">Clip</th>
                <th className="py-2.5 px-3 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {scenes.map((scene, idx) => {
                const isExpanded = expandedIndex === idx;
                const wordCount = scene.script ? scene.script.trim().split(/\s+/).filter(Boolean).length : 0;
                const estSec = (wordCount * 0.4).toFixed(1);
                const isTooLong = wordCount > 50;

                return (
                  <React.Fragment key={idx}>
                    <tr
                      onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? 'bg-[#1a1d22]' : 'hover:bg-[#181a1e]'
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-mono font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100 flex items-center gap-2">
                          <span>{scene.title || `Scene ${idx + 1}`}</span>
                          {scene.characters && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-normal">
                              {scene.characters}
                            </span>
                          )}
                          {isTooLong && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-normal flex items-center gap-1" title="Cảnh có hơn 50 từ, nên cân nhắc tách bớt để hình ảnh sinh động hơn">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                              Dài ({wordCount} từ)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">
                          {scene.script}
                        </div>
                      </td>
                      <td className="py-3 px-3">{getStatusBadge(scene.tts_status)}</td>
                      <td className="py-3 px-3">{getStatusBadge(scene.img_status)}</td>
                      <td className="py-3 px-3">{getStatusBadge(scene.sfx_status)}</td>
                      <td className="py-3 px-3">{getStatusBadge(scene.clip_status)}</td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>

                    {/* Expandable Details & IN-PLACE SCRIPT EDITOR */}
                    {isExpanded && (
                      <tr className="bg-[#121417]">
                        <td colSpan={7} className="p-4 border-t border-slate-800/80">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left Column: Script Narration Editor */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Kịch Bản Lời Thoại (Script):
                                </span>
                                <span className={`font-mono ${isTooLong ? 'text-amber-400 font-medium' : 'text-slate-400'}`}>
                                  {wordCount} từ (~{estSec}s)
                                </span>
                              </div>

                              {onUpdateScene ? (
                                <textarea
                                  rows={4}
                                  value={scene.script || ''}
                                  onChange={(e) => onUpdateScene(idx, { script: e.target.value })}
                                  placeholder="Nhập lời dẫn chuyện thoại cho cảnh này..."
                                  className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-y"
                                />
                              ) : (
                                <div className="p-3 rounded-lg bg-[#1b1e22] border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                                  {scene.script}
                                </div>
                              )}

                              {isTooLong && (
                                <div className="text-[11px] text-amber-400/90 bg-amber-950/20 border border-amber-900/40 rounded p-2 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                                  <span>Gợi ý: Đoạn thoại này tương đối dài ({wordCount} từ). Việc nhân bản và tách thành 2 cảnh sẽ giúp hình ảnh không bị đứng quá lâu.</span>
                                </div>
                              )}

                              {/* SFX / Bối cảnh âm Field */}
                              <div className="pt-1 space-y-1">
                                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                  <Music className="w-3 h-3 text-amber-400" />
                                  <span>SFX / Hiệu ứng âm thanh:</span>
                                </div>
                                {onUpdateScene ? (
                                  <input
                                    type="text"
                                    value={scene.fx || ''}
                                    onChange={(e) => onUpdateScene(idx, { fx: e.target.value })}
                                    placeholder="VD: coastal wind, rain, distant thunder, footsteps"
                                    className="w-full bg-[#1b1e22] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 font-sans focus:outline-none focus:border-amber-500"
                                  />
                                ) : (
                                  <div className="text-xs text-slate-400">
                                    {scene.fx || 'Chưa gán SFX'}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Column: Visual Prompt & Characters Editor */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                                  <Image className="w-3.5 h-3.5 text-purple-400" />
                                  Prompt Sinh Ảnh (AgnesAI / GG):
                                </span>
                                <span className="text-[10px] text-purple-400 font-mono">1920x1080 Aspect 16:9</span>
                              </div>

                              {onUpdateScene ? (
                                <textarea
                                  rows={4}
                                  value={scene.prompt || ''}
                                  onChange={(e) => onUpdateScene(idx, { prompt: e.target.value })}
                                  placeholder="Mô tả bối cảnh hình ảnh chi tiết (tiếng Anh)..."
                                  className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 leading-relaxed font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all resize-y"
                                />
                              ) : (
                                <div className="p-3 rounded-lg bg-[#1b1e22] border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                                  {scene.prompt}
                                </div>
                              )}

                              {/* Characters in this scene */}
                              <div className="pt-1 space-y-1">
                                <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                  <span>Nhân vật xuất hiện trong cảnh:</span>
                                </div>
                                {onUpdateScene ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={scene.characters || ''}
                                      onChange={(e) => onUpdateScene(idx, { characters: e.target.value })}
                                      placeholder="VD: Elise Rowan, Silas"
                                      className="flex-1 bg-[#1b1e22] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-300 font-sans focus:outline-none focus:border-blue-500"
                                    />
                                    {characters.map((c) => (
                                      <button
                                        key={c.name}
                                        type="button"
                                        onClick={() => {
                                          const current = scene.characters || '';
                                          if (!current.includes(c.name)) {
                                            const updated = current ? `${current}, ${c.name}` : c.name;
                                            onUpdateScene(idx, { characters: updated });
                                          }
                                        }}
                                        className="text-[10px] px-2 py-1 rounded bg-[#1b1e22] hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition-colors"
                                      >
                                        + {c.name.split(' ')[0]}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-xs text-slate-400">
                                    {scene.characters || 'Không có'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Scene Action Toolbar: Move Up / Down, Duplicate, Delete, Retry */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-3 border-t border-slate-800">
                            <div className="flex items-center gap-1.5">
                              {onMoveScene && (
                                <>
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => onMoveScene(idx, 'up')}
                                    className="p-1.5 rounded bg-[#1b1e22] hover:bg-slate-800 disabled:opacity-30 text-slate-300 text-xs border border-slate-700 flex items-center gap-1"
                                    title="Di chuyển cảnh này lên trước"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="hidden sm:inline">Lên</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === scenes.length - 1}
                                    onClick={() => onMoveScene(idx, 'down')}
                                    className="p-1.5 rounded bg-[#1b1e22] hover:bg-slate-800 disabled:opacity-30 text-slate-300 text-xs border border-slate-700 flex items-center gap-1"
                                    title="Di chuyển cảnh này xuống sau"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="hidden sm:inline">Xuống</span>
                                  </button>
                                </>
                              )}

                              {onDuplicateScene && (
                                <button
                                  type="button"
                                  onClick={() => onDuplicateScene(idx)}
                                  className="px-2.5 py-1.5 rounded bg-[#1b1e22] hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1 transition-colors"
                                  title="Tạo bản sao của cảnh này ngay bên dưới"
                                >
                                  <Copy className="w-3.5 h-3.5 text-purple-400" />
                                  <span>Nhân bản Cảnh</span>
                                </button>
                              )}

                              {onDeleteScene && scenes.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc muốn xóa cảnh ${idx + 1} (${scene.title || 'Scene'}) không?`)) {
                                      onDeleteScene(idx);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded bg-[#1b1e22] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs border border-slate-700 hover:border-rose-900/50 flex items-center gap-1 transition-colors"
                                  title="Xóa cảnh này khỏi kịch bản"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Xóa Cảnh</span>
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRetryScene(idx);
                                }}
                                className="px-3 py-1.5 rounded bg-[#1b1e22] hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3 text-blue-400" />
                                <span>Render lại Scene này</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
