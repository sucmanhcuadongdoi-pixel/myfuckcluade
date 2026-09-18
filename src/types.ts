export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  sceneId?: number;
  branchId?: string;
  stackTrace?: string;
}

export interface ApiKeyItem {
  id: string;
  key: string;
  label: string;
  status: 'idle' | 'testing' | 'valid' | 'rate_limited' | 'invalid';
  error?: string;
  usageCount: number;
  lastUsed?: string;
}

export interface AppConfig {
  kokoro_url: string;
  gradio_tts_url?: string;
  tts_engine?: 'kokoro' | 'gradio_local' | 'valle_x';
  tts_speed?: number;
  python_path?: string;
  ffmpeg_path?: string;
  agnes_keys: ApiKeyItem[];
  agnes_model: string;
  agnes_custom_model?: string;
  google_keys: ApiKeyItem[];
  google_model: string;
  google_custom_model?: string;
  freesound_key?: string;
  elevenlabs_key?: string;
  rotation_mode: 'on_error' | 'round_robin';
  active_agnes_key_idx: number;
  active_google_key_idx: number;
}

export interface SfxItem {
  id: string;
  name: string;
  category: string;
  description: string;
  license: string;
  commercial_free: boolean;
  download_url: string;
  preview_url: string;
  duration?: string;
}

export interface PythonEnvInfo {
  found: boolean;
  path: string;
  version?: string;
  type: 'system' | 'venv' | 'conda' | 'pyenv';
}

export interface ScriptScene {
  title: string;
  script: string;
  prompt: string;
  fx?: string;
  note?: string;
  characters?: string;
  tts_status?: 'done' | 'running' | 'error' | 'skip' | 'pending';
  img_status?: 'done' | 'running' | 'error' | 'skip' | 'pending';
  sfx_status?: 'done' | 'running' | 'error' | 'skip' | 'pending';
  clip_status?: 'done' | 'running' | 'error' | 'skip' | 'pending';
  audio_path?: string;
  image_path?: string;
  fx_path?: string;
  clip_path?: string;
  tts_error?: string;
  img_error?: string;
  clip_error?: string;
  img_cached?: boolean;
  activeBranch?: string;
}

export interface EpisodeData {
  episode: string;
  series?: string;
  scenes: ScriptScene[];
  _method?: string;
}

export interface EpisodeMeta {
  ep_id: string;
  file: string;
  title: string;
  scenes: number;
  status: 'new' | 'done' | 'running';
  ran_at?: string;
  final?: string;
}

export interface SeriesInfo {
  series_id: string;
  name: string;
  voice: string;
  visual_style: string;
  episodes: EpisodeMeta[];
  path?: string;
  _fromDirPicker?: boolean;
}

export interface CharacterInfo {
  name: string;
  role: string;
  prompt: string;
  has_sheet: boolean;
  image_url?: string;
}

export interface CodeFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  description: string;
}

export interface DiagramNode {
  id: string;
  label: string;
  subLabel?: string;
  category: 'input' | 'process' | 'branch_decision' | 'fallback' | 'output' | 'constraint';
  status: 'idle' | 'active' | 'error' | 'diverted' | 'success';
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  isFallback?: boolean;
  style?: 'solid' | 'dashed';
}

export interface CodeDiff {
  file: string;
  originalSnippet: string;
  fixedSnippet: string;
  explanation: string;
}

export interface AnalysisReport {
  id: string;
  title: string;
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  relatedNodeId: string;
  branchName: string;
  rootCause: string;
  detailedExplanation: string;
  suggestedAction: string;
  codeDiffs: CodeDiff[];
  diagramPath: string[]; // Node IDs in sequence for the resolution path
  status: 'DETECTED' | 'TRIAGED' | 'FIX_PROPOSED' | 'RESOLVED';
}

export interface ProgressMetric {
  timestamp: string;
  detected: number;
  inProgress: number;
  fallbackHandled: number;
  resolved: number;
  successRate: number;
}

export interface SceneStatus {
  sceneId: number;
  title: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'ERROR_SKIPPED' | 'FALLBACK_RESOLVED';
  currentBranch?: string;
  errorCount: number;
  durationMs: number;
}

export interface ProseAnalysisResult {
  episode: string;
  series: string;
  characterCount: number;
  sceneCount: number;
  characters: CharacterInfo[];
  scenes: ScriptScene[];
  summary?: string;
  _source: 'gemini' | 'heuristic';
}

export interface BatchEpisodeProgress {
  epId: string;
  title: string;
  totalScenes: number;
  doneScenes: number;
  status: 'pending' | 'running' | 'done' | 'error';
}
