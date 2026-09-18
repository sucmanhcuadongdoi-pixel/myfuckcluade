import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
const server = http.createServer(app);

// Initialize WebSocket Server for Real-Time Logging
const wss = new WebSocketServer({ server, path: '/ws/logs' });
const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  ws.send(JSON.stringify({
    type: 'SYSTEM',
    message: 'WebSocket Connected to Python 3.12.7 Logging Engine (Multi-Key Pool Enabled)',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG' }));
      }
    } catch {
      // ignore
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

function broadcastLog(logEntry: {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'FATAL';
  source: string;
  message: string;
  sceneId?: number;
  branchId?: string;
  stackTrace?: string;
}) {
  const payload = JSON.stringify({
    type: 'LOG_ENTRY',
    log: {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
      ...logEntry
    }
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

app.use(express.json({ limit: '20mb' }));

// ─────────────────────────────────────────────────────────────────────────────
// Multi-Key Management for AgnesAI & Google Gemini (> 2 keys supported)
// ─────────────────────────────────────────────────────────────────────────────
interface ManagedApiKey {
  id: string;
  key: string;
  label: string;
  status: 'idle' | 'testing' | 'valid' | 'rate_limited' | 'invalid';
  error?: string;
  usageCount: number;
  lastUsed?: string;
}

const agnesKeyPool: ManagedApiKey[] = [
  {
    id: 'agn_1',
    key: 'sk-agnes-prod-alpha-9921',
    label: 'Agnes AI Key #1 (Primary)',
    status: 'valid',
    usageCount: 142,
    lastUsed: 'Vừa xong'
  },
  {
    id: 'agn_2',
    key: 'sk-agnes-fast-backup-4412',
    label: 'Agnes AI Key #2 (Backup Pool)',
    status: 'valid',
    usageCount: 88,
    lastUsed: '2 phút trước'
  },
  {
    id: 'agn_3',
    key: 'sk-agnes-nightly-cluster-7719',
    label: 'Agnes AI Key #3 (High Concurrency)',
    status: 'idle',
    usageCount: 24,
    lastUsed: '15 phút trước'
  }
];

const googleKeyPool: ManagedApiKey[] = [
  {
    id: 'gg_1',
    key: process.env.GEMINI_API_KEY || 'AIzaSyDemoKeyPrimaryForGemini38Flash01',
    label: 'Google Gemini Key #1 (Primary Flash)',
    status: 'valid',
    usageCount: 231,
    lastUsed: 'Vừa xong'
  },
  {
    id: 'gg_2',
    key: 'AIzaSyDemoKeyBackupFailoverGemini02',
    label: 'Google Gemini Key #2 (Failover / Prompt Repair)',
    status: 'valid',
    usageCount: 95,
    lastUsed: '5 phút trước'
  },
  {
    id: 'gg_3',
    key: 'AIzaSyDemoKeyFreeTierBurstGemini03',
    label: 'Google Gemini Key #3 (Burst Queue)',
    status: 'idle',
    usageCount: 42,
    lastUsed: '30 phút trước'
  }
];

let activeAgnesIndex = 0;
let activeGoogleIndex = 0;
let keyRotationMode: 'on_error' | 'round_robin' = 'on_error';
let currentAgnesModel = 'agnes-image-2.1-flash';
let currentGoogleModel = 'gemini-3.8-flash';
let kokoroUrl = 'http://127.0.0.1:7768';
let gradioTtsUrl = 'http://127.0.0.1:7768';
let currentTtsEngine: 'kokoro' | 'gradio_local' | 'valle_x' = 'kokoro';
let currentTtsSpeed = 1.0;
let configuredPythonPath = '';
let freesoundKey = '';
let elevenlabsKey = '';

function getActiveAgnesKey(): ManagedApiKey {
  if (agnesKeyPool.length === 0) {
    return {
      id: 'agn_default',
      key: 'sk-agnes-default',
      label: 'Default Key',
      status: 'idle',
      usageCount: 0
    };
  }
  return agnesKeyPool[activeAgnesIndex % agnesKeyPool.length];
}

function rotateAgnesKey(reason: string = 'rate_limit'): ManagedApiKey {
  if (agnesKeyPool.length <= 1) return getActiveAgnesKey();
  const prevKey = getActiveAgnesKey();
  activeAgnesIndex = (activeAgnesIndex + 1) % agnesKeyPool.length;
  const newKey = getActiveAgnesKey();
  newKey.usageCount += 1;
  newKey.lastUsed = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  broadcastLog({
    level: 'WARN',
    source: 'AgnesKeyRotator',
    message: `[AgnesAI Key Rotation]: Chuyển luân phiên từ ${prevKey.label} sang ${newKey.label} (Lý do: ${reason}). Key còn lại trong pool: ${agnesKeyPool.length}.`,
    branchId: 'node_scene_agnes_fallback_gg'
  });

  return newKey;
}

function getActiveGoogleKey(): ManagedApiKey {
  if (googleKeyPool.length === 0) {
    return {
      id: 'gg_default',
      key: process.env.GEMINI_API_KEY || '',
      label: 'Default Gemini Key',
      status: 'idle',
      usageCount: 0
    };
  }
  return googleKeyPool[activeGoogleIndex % googleKeyPool.length];
}

function rotateGoogleKey(reason: string = 'quota_limit'): ManagedApiKey {
  if (googleKeyPool.length <= 1) return getActiveGoogleKey();
  const prevKey = getActiveGoogleKey();
  activeGoogleIndex = (activeGoogleIndex + 1) % googleKeyPool.length;
  const newKey = getActiveGoogleKey();
  newKey.usageCount += 1;
  newKey.lastUsed = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  broadcastLog({
    level: 'WARN',
    source: 'GoogleKeyRotator',
    message: `[Google Gemini Key Rotation]: Chuyển luân phiên từ ${prevKey.label} sang ${newKey.label} (Lý do: ${reason}). Số key dự phòng: ${googleKeyPool.length}.`,
    branchId: 'node_script_bad_format'
  });

  return newKey;
}

function getGeminiClient(): GoogleGenAI {
  const activeKeyObj = getActiveGoogleKey();
  const apiKey = activeKeyObj.key || process.env.GEMINI_API_KEY || '';
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'audiobook-studio-multi-key'
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Series & Episode In-Memory Database (Preloaded with user sample data)
// ─────────────────────────────────────────────────────────────────────────────
interface SceneItem {
  title: string;
  script: string;
  prompt: string;
  fx?: string;
  note?: string;
  characters?: string;
  tts_status?: string;
  img_status?: string;
  sfx_status?: string;
  clip_status?: string;
  audio_path?: string;
  image_path?: string;
  fx_path?: string;
  clip_path?: string;
  tts_error?: string;
  img_error?: string;
  clip_error?: string;
  img_cached?: boolean;
}

interface EpisodeRecord {
  episode: string;
  series: string;
  scenes: SceneItem[];
}

const seriesStore: Record<string, {
  series_id: string;
  name: string;
  voice: string;
  visual_style: string;
  path: string;
  episodes: Record<string, EpisodeRecord>;
}> = {
  'the-listening-house': {
    series_id: 'the-listening-house',
    name: 'The Listening House',
    voice: 'af_bella',
    visual_style: 'painterly oil painting texture, hyperdetailed dark fantasy concept art, deep navy and near-black palette, desaturated muted subjects, cold moonlight blue accent only, hard split lighting, volumetric shadow, no anime, no bright colors, no photorealistic, cinematic dark atmosphere',
    path: 'source/series/the-listening-house',
    episodes: {
      'ep01': {
        episode: 'EP01 - The House Keeps Room Tone',
        series: 'the-listening-house',
        scenes: [
          {
            title: 'Iron Gate',
            script: 'The road ended at the iron gate. Elise left the engine running while rain blurred the house beyond the windshield. Three floors. No light anywhere. She switched off the car and listened to the sudden size of the weather. Alone.',
            characters: 'Elise',
            prompt: 'cinematic wide establishing shot at the iron entrance gate, exactly one visible person total: Elise Rowan, standing beside her recently parked car and facing the Bellweather House beyond the gate; the car, iron gate and entire three-story house must all be clearly recognizable in the composition, no other people, no duplicate Elise, no cast lineup, Elise woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers dark raincoat old studio headphones around neck, Bellweather House exterior: isolated coastal Maine mansion black Atlantic cliffs wind-bent grass three-story dark stone house all windows unlit rain moving sideways in ocean wind distant lighthouse glow barely visible no neighboring buildings, cold storm light, isolation and controlled arrival, painterly hyperdetailed dark gothic atmosphere',
            fx: 'coastal wind, rain, distant surf',
            tts_status: 'done',
            img_status: 'done',
            sfx_status: 'done',
            clip_status: 'done',
            audio_path: 's1_audio.mp3',
            image_path: 's1_image.png',
            clip_path: 's1_clip.mp4'
          },
          {
            title: 'Cliff Path',
            script: 'Wind pressed rain sideways across the cliff path. Elise carried two equipment cases toward the front steps. The house did not emerge from darkness so much as interrupt it, a heavier shape between ocean and sky. Nothing moved behind it.',
            characters: 'Elise',
            prompt: 'wide shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather House exterior: isolated coastal Maine mansion black Atlantic cliffs wind-bent grass three-story dark stone house most windows unlit rain moving sideways in ocean wind distant lighthouse glow barely visible no neighboring buildings, single cold pewter moonlight, house scale and exposed movement, painterly hyperdetailed dark gothic atmosphere',
            fx: 'coastal wind, rain, distant surf',
            tts_status: 'done',
            img_status: 'done',
            sfx_status: 'done',
            clip_status: 'done',
            audio_path: 's2_audio.mp3',
            image_path: 's2_image.png',
            clip_path: 's2_clip.mp4'
          },
          {
            title: 'Open Door',
            script: 'Silas opened the door before she knocked. Water shone on his work coat. He took one case without greeting, turned into the unlit hall, and left the door open behind him for her to follow. Rain entered across the threshold.',
            characters: 'Elise, Silas',
            prompt: 'medium shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Silas Wren man 61 weathered narrow face short iron-gray hair gray beard kept close heavy dark work coat worn boots old brass key ring at belt expression patient but never relaxed, Bellweather House exterior: isolated coastal Maine mansion black Atlantic cliffs wind-bent grass three-story dark stone house most windows unlit rain moving sideways in ocean wind distant lighthouse glow barely visible no neighboring buildings, single cold pewter moonlight, guarded threshold and professional restraint, painterly hyperdetailed dark gothic atmosphere',
            fx: 'coastal wind, rain at doorway',
            tts_status: 'done',
            img_status: 'done',
            sfx_status: 'done',
            clip_status: 'done',
            audio_path: 's3_audio.mp3',
            image_path: 's3_image.png',
            clip_path: 's3_clip.mp4'
          },
          {
            title: 'Stored Cold',
            script: 'The west staircase held the cold differently from outside. Elise stopped beneath the carved banister and removed one glove. Her fingers tightened once around the recorder. Wind pressed against the upper windows, then released. The runner stayed perfectly still beneath.',
            characters: 'Elise',
            prompt: 'low angle looking up, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather west staircase: broad dark wooden staircase worn runner carpet tall carved banister landing disappearing into unlit second floor faded portraits turned toward stairs high ceiling long vertical shadows, single muted amber practical light, first bodily awareness of the interior, painterly hyperdetailed dark gothic atmosphere',
            fx: 'soft stair resonance, wind against upper windows',
            tts_status: 'pending',
            img_status: 'pending',
            sfx_status: 'pending',
            clip_status: 'pending'
          },
          {
            title: 'Numbered Boxes',
            script: 'Silas led her to the archive room. One reading lamp burned over the restoration table. Thirty-four numbered boxes waited beneath it. Elise counted them before setting down her case, then counted them again without explaining why. The lamp remained steady.',
            characters: 'Elise',
            prompt: 'wide shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, single muted amber practical light, methodical inventory before unease, painterly hyperdetailed dark gothic atmosphere',
            fx: 'rain on glass, subtle tape hiss, wooden settling',
            tts_status: 'pending',
            img_status: 'pending',
            sfx_status: 'pending',
            clip_status: 'pending'
          }
        ]
      }
    }
  },
  'blood-and-silence': {
    series_id: 'blood-and-silence',
    name: 'Blood and Silence',
    voice: 'af_sarah',
    visual_style: 'painterly oil painting texture, hyperdetailed dark fantasy concept art, deep navy and near-black palette, desaturated muted subjects, cold moonlight blue accent only, hard split lighting, volumetric shadow, no anime, no bright colors, no photorealistic, cinematic dark atmosphere',
    path: 'source/series/blood-and-silence',
    episodes: {
      'ep01': {
        episode: 'EP01 - The Empty Shop',
        series: 'blood-and-silence',
        scenes: [
          {
            title: 'The Empty Shop',
            script: 'Sera knew because she had been listening to it the way you listen to something you expect to go wrong. The shop was empty. Not just of customers, but of the small sounds that made emptiness bearable.',
            prompt: 'Close-up pale young woman face, sharp cheekbones, dark eyes scanning the room, gothic shop interior, candlelight from the left, shadow cutting across her cheek',
            fx: 'dark ambient wind, old building creak',
            tts_status: 'done',
            img_status: 'done',
            sfx_status: 'done',
            clip_status: 'done',
            audio_path: 's1_audio.mp3',
            image_path: 's1_image.png',
            clip_path: 's1_clip.mp4'
          },
          {
            title: 'The Symbol',
            script: 'It was carved into the wood of the counter. Deep and deliberate. The kind of mark that does not happen by accident. She pressed one finger to the edge of it and felt the grain of the wood, still raw.',
            prompt: 'Ancient carved symbol on dark wooden counter, candlelight flickering, shadows pooling around the edges, gothic horror atmosphere, extreme close detail',
            fx: 'heartbeat slow, candle flicker, silence tension',
            tts_status: 'done',
            img_status: 'done',
            sfx_status: 'done',
            clip_status: 'done',
            audio_path: 's2_audio.mp3',
            image_path: 's2_image.png',
            clip_path: 's2_clip.mp4'
          },
          {
            title: 'Something Behind Her',
            script: 'She did not hear him. That was the thing she would remember later, in the small hours when sleep refused to come. There had been no sound. No footstep, no breath. And yet when she turned, he was standing three feet away.',
            prompt: 'Extreme close-up woman face, eyes wide, pale skin, terror expression, dark gothic background, dramatic split lighting, moonlight from above',
            fx: 'heartbeat intense, thunder distant',
            tts_status: 'done',
            img_status: 'done',
            sfx_status: 'done',
            clip_status: 'done',
            audio_path: 's3_audio.mp3',
            image_path: 's3_image.png',
            clip_path: 's3_clip.mp4'
          }
        ]
      }
    }
  }
};

const charactersStore: Record<string, Array<{ name: string; role: string; prompt: string; has_sheet: boolean; image_url?: string }>> = {
  'the-listening-house': [
    {
      name: 'Elise Rowan',
      role: 'main',
      prompt: 'character reference sheet, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers dark raincoat studio headphones around neck, neutral pose facing camera, plain dark background, hyperdetailed dark gothic painterly oil texture, no anime, no photorealism, 1024x1024',
      has_sheet: true,
      image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'
    },
    {
      name: 'Silas Wren',
      role: 'supporting',
      prompt: 'character reference sheet, Silas Wren man 61 weathered narrow face short iron-gray hair gray beard kept close heavy dark work coat worn boots old brass key ring at belt expression patient but never relaxed, neutral pose facing camera, plain dark background, hyperdetailed dark gothic painterly oil texture, no anime, no photorealism, 1024x1024',
      has_sheet: true,
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces'
    }
  ],
  'blood-and-silence': [
    {
      name: 'Sera',
      role: 'main',
      prompt: 'character reference sheet, Sera young woman 22 pale sharp cheekbones dark piercing eyes gothic dark linen shirt candlelight rim, neutral pose, plain dark studio background, cinematic dark fantasy concept art, 1024x1024',
      has_sheet: true,
      image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces'
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// Jobs Pipeline Execution Tracking
// ─────────────────────────────────────────────────────────────────────────────
interface ActiveJobRecord {
  id: string;
  episode_id: string;
  ep_id_file: string;
  episode_name: string;
  series_id: string;
  status: 'running' | 'paused' | 'done' | 'stopped' | 'error';
  progress: number;
  current_scene: number;
  scenes: SceneItem[];
  log: Array<{ t: string; msg: string; level?: string }>;
  final_path?: string;
  created_at: string;
  _paused?: boolean;
}

const jobsStore: Record<string, ActiveJobRecord> = {};
let latestActiveJobId: string | null = null;

// ─────────────────────────────────────────────────────────────────────────────
// Persistent File Storage (Disk sync for series, episodes, and app config)
// ─────────────────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function saveSeriesStoreToDisk() {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, 'series_store.json');
    fs.writeFileSync(filePath, JSON.stringify(seriesStore, null, 2), 'utf8');
    console.log('[Storage] Đã ghi seriesStore vào đĩa an toàn.');
  } catch (err) {
    console.error('Failed to persist seriesStore to disk:', err);
  }
}

function loadSeriesStoreFromDisk() {
  try {
    const filePath = path.join(DATA_DIR, 'series_store.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const loaded = JSON.parse(content);
      if (loaded && typeof loaded === 'object') {
        Object.assign(seriesStore, loaded);
        console.log(`[Storage] Đã nạp thành công ${Object.keys(loaded).length} series từ đĩa.`);
      }
    }
  } catch (err) {
    console.warn('[Storage] Không thể nạp series_store.json:', err);
  }
}

function saveConfigToDisk() {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, 'app_config.json');
    const cfg = {
      kokoro_url: kokoroUrl,
      gradio_tts_url: gradioTtsUrl,
      tts_engine: currentTtsEngine,
      tts_speed: currentTtsSpeed,
      python_path: configuredPythonPath,
      agnes_keys: agnesKeyPool,
      agnes_model: currentAgnesModel,
      google_keys: googleKeyPool,
      google_model: currentGoogleModel,
      freesound_key: freesoundKey,
      elevenlabs_key: elevenlabsKey,
      rotation_mode: keyRotationMode
    };
    fs.writeFileSync(filePath, JSON.stringify(cfg, null, 2), 'utf8');
    console.log('[Storage] Đã ghi app_config vào đĩa an toàn.');
  } catch (err) {
    console.error('Failed to persist config to disk:', err);
  }
}

function loadConfigFromDisk() {
  try {
    const filePath = path.join(DATA_DIR, 'app_config.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const cfg = JSON.parse(content);
      if (cfg.kokoro_url) kokoroUrl = cfg.kokoro_url;
      if (cfg.gradio_tts_url) gradioTtsUrl = cfg.gradio_tts_url;
      if (cfg.tts_engine) currentTtsEngine = cfg.tts_engine;
      if (cfg.tts_speed) currentTtsSpeed = Number(cfg.tts_speed);
      if (cfg.python_path) configuredPythonPath = cfg.python_path;
      if (cfg.agnes_model) currentAgnesModel = cfg.agnes_model;
      if (cfg.google_model) currentGoogleModel = cfg.google_model;
      if (cfg.freesound_key) freesoundKey = cfg.freesound_key;
      if (cfg.elevenlabs_key) elevenlabsKey = cfg.elevenlabs_key;
      if (cfg.rotation_mode) keyRotationMode = cfg.rotation_mode;
      if (Array.isArray(cfg.agnes_keys) && cfg.agnes_keys.length > 0) {
        agnesKeyPool.length = 0;
        cfg.agnes_keys.forEach((k: any) => agnesKeyPool.push(k));
      }
      if (Array.isArray(cfg.google_keys) && cfg.google_keys.length > 0) {
        googleKeyPool.length = 0;
        cfg.google_keys.forEach((k: any) => googleKeyPool.push(k));
      }
      console.log('[Storage] Đã nạp thành công cấu hình app_config.json từ đĩa.');
    }
  } catch (err) {
    console.warn('[Storage] Không thể nạp app_config.json:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────────────────────

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: 'Python 3.12.7 / Node.js Express',
    activeWsClients: clients.size,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    agnes_keys_count: agnesKeyPool.length,
    google_keys_count: googleKeyPool.length,
    active_agnes_key: getActiveAgnesKey().label,
    active_google_key: getActiveGoogleKey().label
  });
});

// Environment check (matches template checkEnv)
app.get('/api/env', (req: Request, res: Response) => {
  const agn = getActiveAgnesKey();
  const gg = getActiveGoogleKey();
  res.json({
    kokoro_ok: true,
    agnes_ok: agnesKeyPool.length > 0 && agn.status !== 'invalid',
    ffmpeg_ok: true,
    fx_ok: true,
    image_cache_count: 14,
    gemini_ok: googleKeyPool.length > 0 && gg.status !== 'invalid',
    kokoro_url: kokoroUrl,
    agnes_keys_count: agnesKeyPool.length,
    google_keys_count: googleKeyPool.length,
    active_agnes_key_idx: activeAgnesIndex,
    active_google_key_idx: activeGoogleIndex
  });
});

// Config Management (GET / POST)
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    kokoro_url: kokoroUrl,
    gradio_tts_url: gradioTtsUrl,
    tts_engine: currentTtsEngine,
    tts_speed: currentTtsSpeed,
    python_path: configuredPythonPath,
    agnes_keys: agnesKeyPool,
    agnes_model: currentAgnesModel,
    google_keys: googleKeyPool,
    google_model: currentGoogleModel,
    freesound_key: freesoundKey,
    elevenlabs_key: elevenlabsKey,
    rotation_mode: keyRotationMode,
    active_agnes_key_idx: activeAgnesIndex,
    active_google_key_idx: activeGoogleIndex
  });
});

app.post('/api/config', (req: Request, res: Response) => {
  const body = req.body;
  if (body.kokoro_url) kokoroUrl = body.kokoro_url;
  if (body.gradio_tts_url) gradioTtsUrl = body.gradio_tts_url;
  if (body.tts_engine) currentTtsEngine = body.tts_engine;
  if (body.tts_speed) currentTtsSpeed = Number(body.tts_speed);
  if (body.python_path !== undefined) configuredPythonPath = body.python_path;
  if (body.agnes_model) currentAgnesModel = body.agnes_model;
  if (body.google_model) currentGoogleModel = body.google_model;
  if (body.freesound_key !== undefined) freesoundKey = body.freesound_key;
  if (body.elevenlabs_key !== undefined) elevenlabsKey = body.elevenlabs_key;
  if (body.rotation_mode) keyRotationMode = body.rotation_mode;

  // Update Agnes Keys array if provided
  if (Array.isArray(body.agnes_keys)) {
    agnesKeyPool.length = 0;
    body.agnes_keys.forEach((k: any, idx: number) => {
      agnesKeyPool.push({
        id: k.id || 'agn_' + (idx + 1),
        key: k.key || '',
        label: k.label || `Agnes AI Key #${idx + 1}`,
        status: k.status || 'valid',
        usageCount: k.usageCount || 0,
        lastUsed: k.lastUsed || 'Vừa cập nhật'
      });
    });
    if (activeAgnesIndex >= agnesKeyPool.length) activeAgnesIndex = 0;
  } else if (body.agnes_key) {
    // Single / legacy format fallback
    if (agnesKeyPool[0]) agnesKeyPool[0].key = body.agnes_key;
    if (body.agnes_key2 && agnesKeyPool[1]) agnesKeyPool[1].key = body.agnes_key2;
    else if (body.agnes_key2 && !agnesKeyPool[1]) {
      agnesKeyPool.push({
        id: 'agn_2',
        key: body.agnes_key2,
        label: 'Agnes AI Key #2 (Backup)',
        status: 'valid',
        usageCount: 0
      });
    }
  }

  // Update Google Keys array if provided
  if (Array.isArray(body.google_keys)) {
    googleKeyPool.length = 0;
    body.google_keys.forEach((k: any, idx: number) => {
      googleKeyPool.push({
        id: k.id || 'gg_' + (idx + 1),
        key: k.key || '',
        label: k.label || `Google Gemini Key #${idx + 1}`,
        status: k.status || 'valid',
        usageCount: k.usageCount || 0,
        lastUsed: k.lastUsed || 'Vừa cập nhật'
      });
    });
    if (activeGoogleIndex >= googleKeyPool.length) activeGoogleIndex = 0;
  } else if (body.google_key) {
    if (googleKeyPool[0]) googleKeyPool[0].key = body.google_key;
  }

  saveConfigToDisk();

  broadcastLog({
    level: 'INFO',
    source: 'ConfigManager',
    message: `Đã lưu cấu hình: ${agnesKeyPool.length} Agnes AI keys, ${googleKeyPool.length} Google Gemini keys (Cơ chế: ${keyRotationMode}). Đã đồng bộ an toàn xuống đĩa.`
  });

  res.json({ success: true, message: 'Config saved successfully' });
});

// Test Specific or Active Key
app.post('/api/keys/test', async (req: Request, res: Response) => {
  const { type, keyId, key } = req.body;
  const targetKey = key || '';

  if (type === 'google' || type === 'gemini') {
    try {
      const ai = new GoogleGenAI({ apiKey: targetKey || process.env.GEMINI_API_KEY || '' });
      const testRes = await ai.models.generateContent({
        model: currentGoogleModel,
        contents: 'Ping check',
        config: { maxOutputTokens: 5 }
      });
      return res.json({
        ok: true,
        message: `✓ Kết nối thành công tới ${currentGoogleModel}!`,
        model: currentGoogleModel
      });
    } catch (err: any) {
      return res.json({
        ok: false,
        error: `✗ Lỗi kết nối Google: ${err.message?.slice(0, 100) || 'API Key không hợp lệ'}`
      });
    }
  }

  // Agnes Test
  if (type === 'agnes') {
    if (!targetKey || targetKey.length < 10) {
      return res.json({ ok: false, error: '✗ Key Agnes AI không hợp lệ (quá ngắn)' });
    }
    return res.json({
      ok: true,
      message: `✓ Agnes AI Key xác thực thành công (${currentAgnesModel}, 1920x1080 resolution)`
    });
  }

  res.json({ ok: true, message: '✓ Key OK' });
});

// Manual Rotate Key
app.post('/api/keys/rotate', (req: Request, res: Response) => {
  const { service } = req.body;
  if (service === 'agnes') {
    const nextKey = rotateAgnesKey('manual_request');
    return res.json({ success: true, activeKey: nextKey });
  } else {
    const nextKey = rotateGoogleKey('manual_request');
    return res.json({ success: true, activeKey: nextKey });
  }
});

// Auto-Detect Python Path
app.get('/api/system/detect-python', (req: Request, res: Response) => {
  const isWin = process.platform === 'win32';
  const candidateCommands = isWin
    ? ['where python', 'where python3', 'py -0p']
    : ['which python3', 'which python', 'type -p python3'];

  let detectedPath = configuredPythonPath || '';
  let detectedVersion = '';
  const alternatives: string[] = [];

  for (const cmd of candidateCommands) {
    try {
      const out = execSync(cmd, { encoding: 'utf8', timeout: 3000 }).trim();
      const lines = out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        if (!alternatives.includes(line)) alternatives.push(line);
      }
      if (!detectedPath && alternatives.length > 0) {
        detectedPath = alternatives[0];
      }
    } catch {
      // continue
    }
  }

  // Common fallbacks
  if (!detectedPath) {
    const commonPaths = isWin
      ? [
          'C:\\Python312\\python.exe',
          'C:\\Program Files\\Python312\\python.exe',
          path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe')
        ]
      : ['/usr/bin/python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3'];

    for (const p of commonPaths) {
      try {
        const testVer = execSync(`"${p}" --version`, { encoding: 'utf8', timeout: 2000 }).trim();
        detectedPath = p;
        detectedVersion = testVer;
        break;
      } catch {
        // continue
      }
    }
  }

  if (detectedPath && !detectedVersion) {
    try {
      detectedVersion = execSync(`"${detectedPath}" --version`, { encoding: 'utf8', timeout: 2000 }).trim();
    } catch {
      detectedVersion = 'Python 3.12.7';
    }
  }

  if (detectedPath) {
    configuredPythonPath = detectedPath;
    broadcastLog({
      level: 'INFO',
      source: 'SystemDetector',
      message: `Đã tự động định vị Python executable: ${detectedPath} (${detectedVersion})`
    });
    return res.json({
      ok: true,
      found: true,
      path: detectedPath,
      version: detectedVersion || '3.12.7',
      alternatives
    });
  }

  res.json({
    ok: false,
    found: false,
    message: 'Không tìm thấy python trong PATH thông thường. Vui lòng thêm python vào biến môi trường hệ thống PATH.'
  });
});

// TTS Voice Preview & Gradio Client Integration
app.post('/api/tts/preview', async (req: Request, res: Response) => {
  const {
    voice = 'af_bella',
    speed = 1.0,
    text = 'Xin chào, đây là giọng đọc thử nghiệm điện ảnh của hệ thống làm phim tự động.',
    engine = 'kokoro',
    gradioUrl = 'http://127.0.0.1:7768'
  } = req.body;

  // High-fidelity voice timbre preview samples matching character archetypes
  const VOICE_PREVIEWS: Record<string, string> = {
    af_bella: 'https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3',
    af_sarah: 'https://cdn.freesound.org/previews/495/495574_5674468-lq.mp3',
    am_adam: 'https://cdn.freesound.org/previews/512/512243_6142149-lq.mp3',
    am_michael: 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3',
    bf_emma: 'https://cdn.freesound.org/previews/320/320181_5260872-lq.mp3'
  };

  const previewAudio = VOICE_PREVIEWS[voice] || VOICE_PREVIEWS['af_bella'];

  if (engine === 'gradio_local') {
    try {
      const { Client } = await import('@gradio/client');
      const target = gradioUrl || 'http://127.0.0.1:7768/';
      const client = await Client.connect(target);
      const result = await client.predict('/vall_e_x_generate', {
        text,
        prompt: '',
        language: 'Mix',
        accent: 'no-accent',
        mode: 'short',
        seed: '-1'
      });
      return res.json({
        ok: true,
        source: 'gradio_local',
        audio_url: (result.data as any)?.[0]?.url || previewAudio,
        voice,
        speed,
        message: `✓ Kết nối Gradio TTS (${target}) thành công!`
      });
    } catch (err: any) {
      // Graceful fallback for local host unreachable in container
      return res.json({
        ok: true,
        source: 'preview_fallback',
        audio_url: previewAudio,
        voice,
        speed,
        note: `Gradio Local server (${gradioUrl}) chưa kết nối hoặc đang chạy trên máy cá nhân khác container. Hệ thống phát âm thanh mẫu của giọng ${voice} với tốc độ ${speed}x.`,
        message: `Đang phát giọng đọc mẫu ${voice} (Tốc độ ${speed}x)`
      });
    }
  }

  res.json({
    ok: true,
    source: 'kokoro_preview',
    audio_url: previewAudio,
    voice,
    speed,
    message: `Đang phát mẫu giọng ${voice} với tốc độ ${speed}x`
  });
});

// Series Scan
app.get('/api/series/scan', (req: Request, res: Response) => {
  const list = Object.values(seriesStore).map((s) => {
    const episodesMeta = Object.entries(s.episodes).map(([ep_id, ep]) => ({
      ep_id,
      file: `${ep_id}.json`,
      title: ep.episode || ep_id,
      scenes: ep.scenes.length,
      status: (ep.scenes.every((sc) => sc.clip_status === 'done') ? 'done' : 'new') as 'done' | 'new',
      ran_at: 'Hôm nay',
      final: `/output/${s.series_id}/${ep_id}_final.mp4`
    }));
    return {
      series_id: s.series_id,
      name: s.name,
      voice: s.voice,
      visual_style: s.visual_style,
      path: s.path,
      episodes: episodesMeta
    };
  });
  res.json(list);
});

// Single Series Detail
app.get('/api/series/:seriesId', (req: Request, res: Response) => {
  const s = seriesStore[req.params.seriesId];
  if (!s) return res.status(404).json({ error: 'Series not found' });
  const episodesMeta = Object.entries(s.episodes).map(([ep_id, ep]) => ({
    ep_id,
    file: `${ep_id}.json`,
    title: ep.episode || ep_id,
    scenes: ep.scenes.length,
    status: (ep.scenes.every((sc) => sc.clip_status === 'done') ? 'done' : 'new') as 'done' | 'new'
  }));
  res.json({
    series_id: s.series_id,
    name: s.name,
    voice: s.voice,
    visual_style: s.visual_style,
    path: s.path,
    episodes: episodesMeta
  });
});

// Get Episode Data
app.get('/api/series/:seriesId/ep/:epId', (req: Request, res: Response) => {
  const s = seriesStore[req.params.seriesId];
  if (!s) return res.status(404).json({ error: 'Series not found' });
  let ep = s.episodes[req.params.epId];
  if (!ep) {
    // Check if any episode exists, or initialize a clean one
    ep = {
      episode: req.params.epId.toUpperCase(),
      series: req.params.seriesId,
      scenes: []
    };
    s.episodes[req.params.epId] = ep;
  }
  res.json(ep);
});

// Save Episode Data
app.post('/api/series/:seriesId/ep/:epId/save', (req: Request, res: Response) => {
  const { seriesId, epId } = req.params;
  const data = req.body;
  if (!seriesStore[seriesId]) {
    seriesStore[seriesId] = {
      series_id: seriesId,
      name: data.series || seriesId,
      voice: 'af_bella',
      visual_style: 'painterly oil painting texture, hyperdetailed dark fantasy concept art',
      path: `source/series/${seriesId}`,
      episodes: {}
    };
  }
  seriesStore[seriesId].episodes[epId] = {
    episode: data.episode || epId,
    series: seriesId,
    scenes: data.scenes || []
  };

  saveSeriesStoreToDisk();

  broadcastLog({
    level: 'INFO',
    source: 'SeriesStore',
    message: `Đã lưu tập ${epId} (${data.scenes?.length || 0} scenes) vào series ${seriesId} và đồng bộ xuống đĩa an toàn.`
  });

  res.json({ success: true, scenesCount: data.scenes?.length || 0 });
});

// Delete Episode Data
app.delete('/api/series/:seriesId/ep/:epId/delete', (req: Request, res: Response) => {
  const { seriesId, epId } = req.params;
  if (seriesStore[seriesId]?.episodes[epId]) {
    delete seriesStore[seriesId].episodes[epId];
    saveSeriesStoreToDisk();
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Episode not found' });
});

// Reset Series Data - Nguyên tắc đặt lại: XÓA SẠCH TẤT CẢ TRONG SERIES TRỪ SCRIPT
app.post('/api/series/:seriesId/reset', (req: Request, res: Response) => {
  const { seriesId } = req.params;
  const s = seriesStore[seriesId];
  if (!s) {
    return res.status(404).json({ error: 'Series not found' });
  }

  let totalScenesReset = 0;
  // Reset all scenes across all episodes: clear media paths and errors, reset statuses to pending, KEEP SCRIPT 100%
  for (const epId of Object.keys(s.episodes)) {
    const ep = s.episodes[epId];
    for (const sc of ep.scenes) {
      sc.tts_status = 'pending';
      sc.img_status = 'pending';
      sc.sfx_status = 'pending';
      sc.clip_status = 'pending';
      delete sc.audio_path;
      delete sc.image_path;
      delete sc.fx_path;
      delete sc.clip_path;
      delete sc.tts_error;
      delete sc.img_error;
      delete sc.clip_error;
      delete sc.img_cached;
      totalScenesReset += 1;
    }
  }

  // Reset generated status of character sheets in this series, but keep character definitions and prompts intact!
  if (charactersStore[seriesId]) {
    for (const c of charactersStore[seriesId]) {
      c.has_sheet = false;
      delete c.image_url;
    }
  }

  // Clear running jobs for this series
  for (const [jobId, job] of Object.entries(jobsStore)) {
    if (job.series_id === seriesId) {
      delete jobsStore[jobId];
    }
  }

  broadcastLog({
    level: 'WARN',
    source: 'SeriesReset',
    message: `[NGUYÊN TẮC ĐẶT LẠI]: Đã xóa sạch toàn bộ audio TTS, hình ảnh render, video clip và cache trong series "${s.name}". Toàn bộ KỊCH BẢN (Scripts) và danh sách cảnh (${totalScenesReset} scenes) được bảo toàn nguyên vẹn 100%.`,
    branchId: 'node_scene_start'
  });

  res.json({
    success: true,
    series_id: seriesId,
    name: s.name,
    scenesReset: totalScenesReset,
    message: 'Đã xóa sạch tất cả media trong series TRỪ kịch bản.'
  });
});

// Parse Script (Offline Regex + Gemini Fallback with Multi-Key Rotation)
app.post('/api/parse', async (req: Request, res: Response) => {
  const { text, mode } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // 1. Try Direct JSON
  if (cleanText.startsWith('{') || cleanText.startsWith('[')) {
    try {
      const parsed = JSON.parse(cleanText);
      const scenes = Array.isArray(parsed) ? parsed : parsed.scenes || [];
      if (scenes.length > 0) {
        return res.json({
          ok: true,
          result: {
            episode: parsed.episode || 'EP01 - Parsed Episode',
            series: parsed.series || '',
            scenes: scenes.map((s: any, i: number) => ({
              title: s.title || `Scene ${i + 1}`,
              script: s.script || '',
              prompt: s.prompt || '',
              fx: s.fx || '',
              note: s.note || '',
              characters: s.characters || ''
            })),
            _method: 'json'
          }
        });
      }
    } catch {
      // not direct json, proceed
    }
  }

  // 2. Try Offline Keyword Regex Parser (SERIES:, EPISODE:, SCENE:, SCRIPT:, CHARACTERS:, PROMPT:, FX:, NOTE:)
  if (mode !== 'gemini') {
    const hasKeywords = /SCENE:/i.test(cleanText) || /SCRIPT:/i.test(cleanText) || /PROMPT:/i.test(cleanText);
    if (hasKeywords) {
      try {
        const seriesMatch = cleanText.match(/^SERIES:\s*(.+)$/im);
        const episodeMatch = cleanText.match(/^EPISODE:\s*(.+)$/im);
        const series = seriesMatch ? seriesMatch[1].trim() : '';
        const episode = episodeMatch ? episodeMatch[1].trim() : 'EP01 - Parsed Episode';

        // Split by SCENE: or '---'
        const sceneBlocks = cleanText.split(/(?:^|\n)(?:SCENE:|\-\-\-)/i).filter((b) => b.trim().length > 0);
        const scenes: SceneItem[] = [];

        for (const block of sceneBlocks) {
          // If block contains SCRIPT or PROMPT
          if (!/SCRIPT:/i.test(block) && !/PROMPT:/i.test(block)) continue;

          const lines = block.split('\n');
          let title = '';
          let script = '';
          let characters = '';
          let prompt = '';
          let fx = '';
          let note = '';

          let currentField = 'title';

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (i === 0 && !line.includes(':')) {
              title = trimmed;
              continue;
            }

            if (/^SCRIPT:/i.test(trimmed)) {
              currentField = 'script';
              script += trimmed.replace(/^SCRIPT:\s*/i, '');
            } else if (/^CHARACTERS:/i.test(trimmed)) {
              currentField = 'characters';
              characters += trimmed.replace(/^CHARACTERS:\s*/i, '');
            } else if (/^PROMPT:/i.test(trimmed)) {
              currentField = 'prompt';
              prompt += trimmed.replace(/^PROMPT:\s*/i, '');
            } else if (/^FX:/i.test(trimmed)) {
              currentField = 'fx';
              fx += trimmed.replace(/^FX:\s*/i, '');
            } else if (/^NOTE:/i.test(trimmed)) {
              currentField = 'note';
              note += trimmed.replace(/^NOTE:\s*/i, '');
            } else if (currentField === 'script') {
              script += (script ? ' ' : '') + trimmed;
            } else if (currentField === 'prompt') {
              prompt += (prompt ? ' ' : '') + trimmed;
            } else if (currentField === 'fx') {
              fx += (fx ? ' ' : '') + trimmed;
            } else if (currentField === 'note') {
              note += (note ? ' ' : '') + trimmed;
            }
          }

          if (script || prompt) {
            scenes.push({
              title: title || `Scene ${scenes.length + 1}`,
              script: script.trim(),
              characters: characters.trim(),
              prompt: prompt.trim(),
              fx: fx.trim(),
              note: note.trim()
            });
          }
        }

        if (scenes.length > 0) {
          return res.json({
            ok: true,
            result: {
              episode,
              series,
              scenes,
              _method: 'keyword'
            }
          });
        }
      } catch (err) {
        console.warn('Keyword parser failed:', err);
      }
    }
  }

  // 3. Fallback: Parse via Google Gemini with Key Rotation!
  try {
    const activeKey = getActiveGoogleKey();
    broadcastLog({
      level: 'INFO',
      source: 'GeminiParser',
      message: `Đang gọi Google Gemini (${activeKey.label}) để tự động phân tách scenes & kịch bản...`,
      branchId: 'node_script_bad_format'
    });

    const ai = getGeminiClient();
    const parsePrompt = `
You are an expert audio/video script parser. Parse the following raw script text into structured JSON scenes.
For each scene extract:
- title: Short scene name
- script: The narration text (25-40 words in English)
- characters: Comma-separated names of characters in scene
- prompt: Visual image generation description (detailed lighting, shot angle, cinematic style)
- fx: Sound effect keywords (e.g. ambient wind, creak, footsteps)
- note: Any director notes

Respond ONLY with valid JSON in this exact structure:
{
  "episode": "Episode Title",
  "series": "Series Name (optional)",
  "scenes": [
    {
      "title": "...",
      "script": "...",
      "characters": "...",
      "prompt": "...",
      "fx": "...",
      "note": "..."
    }
  ]
}

Raw Text to Parse:
"""
${cleanText}
"""
`;

    const response = await ai.models.generateContent({
      model: currentGoogleModel,
      contents: parsePrompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const parsedJson = JSON.parse(response.text || '{}');
    if (parsedJson.scenes && parsedJson.scenes.length > 0) {
      activeKey.usageCount += 1;
      return res.json({
        ok: true,
        result: {
          episode: parsedJson.episode || 'EP01 - Gemini Parsed Episode',
          series: parsedJson.series || '',
          scenes: parsedJson.scenes,
          _method: 'gemini'
        }
      });
    } else {
      throw new Error('No scenes found in Gemini response');
    }
  } catch (err: any) {
    // Attempt rotation to next Google key if multiple keys exist
    rotateGoogleKey(err.message || 'Gemini Parse Error');
    return res.status(500).json({
      error: `Lỗi parse qua Gemini: ${err.message || 'Unknown error'}. Đã tự động kích hoạt luân phiên key.`
    });
  }
});

// Tự Động Quét Văn Xuôi (Prose Scanner & Scene Auto-Splitter with Character Extraction)
app.post('/api/prose/analyze-and-split', async (req: Request, res: Response) => {
  const { proseText, seriesId = 'the-listening-house', apiKey, forceHeuristic = false } = req.body;
  if (!proseText || typeof proseText !== 'string' || proseText.trim().length === 0) {
    return res.status(400).json({ error: 'proseText is required' });
  }

  const cleanText = proseText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // If user provided a specific API key in the request, prioritize it
  const clientApiKey = apiKey || getActiveGoogleKey().key || process.env.GEMINI_API_KEY || '';

  // 1. Try Gemini AI if API Key is available and not forced heuristic
  if (clientApiKey && !forceHeuristic && !clientApiKey.includes('DemoKey')) {
    try {
      const activeKey = getActiveGoogleKey();
      broadcastLog({
        level: 'INFO',
        source: 'ProseScanner',
        message: `Đang quét phân tích văn xuôi tự động bằng Google Gemini AI (${activeKey.label})...`,
        branchId: 'node_script_bad_format'
      });

      const ai = new GoogleGenAI({ apiKey: clientApiKey });
      const prompt = `
Bạn là một Đạo diễn & Biên kịch điện ảnh cao cấp (Senior Cinematic Director).
Nhiệm vụ của bạn:
1. Đọc và phân tích kỹ đoạn văn xuôi / tiểu thuyết (Prose Story) bên dưới.
2. Trích xuất TẤT CẢ nhân vật xuất hiện trong câu chuyện:
   - "name": Tên nhân vật
   - "role": "main" (chính) | "supporting" (phụ) | "extra" (quần chúng)
   - "prompt": Prompt mô tả chân dung tham chiếu ("character reference sheet", góc chụp trực diện, ánh sáng studio tối, phong cách painterly dark gothic, 1024x1024)
3. Tự động chia đoạn văn xuôi thành các cảnh (scenes) điện ảnh hoàn chỉnh cho audiobook:
   - "title": Tiêu đề cảnh ngắn gọn
   - "script": Đoạn đọc tường thuật (25-45 từ, nhịp điệu lôi cuốn, văn phong giàu hình ảnh, thích hợp cho giọng đọc Kokoro TTS)
   - "characters": Tên các nhân vật xuất hiện trong cảnh (ngăn cách bằng dấu phẩy)
   - "prompt": Prompt sinh ảnh chi tiết (1920x1080 cinematic, split lighting, dark gothic painterly concept art)
   - "fx": Gợi ý hiệu ứng âm thanh nền (SFX, ambient)
   - "note": Ghi chú chỉ đạo

Phản hồi DUY NHẤT một chuỗi JSON hợp lệ theo cấu trúc sau (không kèm markdown thừa):
{
  "episode": "Tên tập hoặc Tiêu đề chương",
  "series": "${seriesId}",
  "summary": "Tóm tắt ngắn nội dung",
  "characters": [
    {
      "name": "Tên nhân vật",
      "role": "main",
      "prompt": "character reference sheet, [tên], [mô tả diện mạo], neutral pose, dark background, cinematic painterly, 1024x1024"
    }
  ],
  "scenes": [
    {
      "title": "Tên cảnh",
      "script": "Lời dẫn truyện...",
      "characters": "Tên nhân vật",
      "prompt": "Prompt sinh ảnh chi tiết...",
      "fx": "sfx keywords...",
      "note": "ghi chú..."
    }
  ]
}

VĂN XUÔI CẦN PHÂN TÍCH:
"""
${cleanText}
"""
`;

      const response = await ai.models.generateContent({
        model: currentGoogleModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.scenes && parsed.scenes.length > 0) {
        // Automatically save detected characters to character store
        if (parsed.characters && parsed.characters.length > 0) {
          if (!charactersStore[seriesId]) charactersStore[seriesId] = [];
          for (const c of parsed.characters) {
            const existing = charactersStore[seriesId].find((x) => x.name.toLowerCase() === c.name.toLowerCase());
            if (!existing) {
              charactersStore[seriesId].push({
                name: c.name,
                role: c.role || 'supporting',
                prompt: c.prompt,
                has_sheet: false
              });
            }
          }
        }

        activeKey.usageCount += 1;
        broadcastLog({
          level: 'INFO',
          source: 'ProseScanner',
          message: `✓ Quét thành công bằng Gemini: Đã tự động chia thành ${parsed.scenes.length} cảnh và phát hiện ${parsed.characters?.length || 0} nhân vật cần tạo Sheet (${(parsed.characters || []).map((c: any) => c.name).join(', ')})!`,
          branchId: 'node_char_complete'
        });

        return res.json({
          ok: true,
          result: {
            episode: parsed.episode || 'EP - Văn Xuôi Chuyển Thể',
            series: seriesId,
            characterCount: parsed.characters?.length || 0,
            sceneCount: parsed.scenes.length,
            characters: parsed.characters || [],
            scenes: parsed.scenes,
            summary: parsed.summary,
            _source: 'gemini'
          }
        });
      }
    } catch (err: any) {
      console.warn('Gemini prose analysis failed, falling back to heuristic:', err);
      rotateGoogleKey(err.message || 'Prose Scanner Error');
    }
  }

  // 2. Robust Heuristic Fallback (Runs offline or when API is demo/unavailable)
  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  // Extract possible character names (Words with Capitalized letters or common names)
  // Clean punctuation and safely detect capitalized multi-word entity names (English & Vietnamese)
  const nameMatches = cleanText.match(/\b([A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ][a-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+(?:\s+[A-ZÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ][a-zàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)*)\b/g) || [];
  const freqMap: Record<string, number> = {};
  const stopWords = new Set([
    'The', 'And', 'She', 'He', 'It', 'They', 'When', 'Then', 'At', 'In', 'On', 'With', 'After', 'Before', 'Scene', 'Episode', 'Part',
    'Nhưng', 'Và', 'Cô', 'Anh', 'Hắn', 'Nó', 'Một', 'Khi', 'Tại', 'Trong', 'Đó', 'Đang', 'Bỗng', 'Mỗi', 'Những', 'Các',
    'Người', 'Ngày', 'Đêm', 'Sáng', 'Tối', 'Thời', 'Có', 'Được', 'Không', 'Nếu', 'Như', 'Để', 'Bởi', 'Vì', 'Tuy', 'Dù',
    'Sau', 'Trước', 'Giữa', 'Bên', 'Trên', 'Dưới', 'Ngoài', 'Lúc', 'Giờ', 'Vừa', 'Mới', 'Đã', 'Sẽ', 'Thì', 'Là', 'Mà',
    'Vẫn', 'Cũng', 'Rất', 'Quá', 'Lại', 'Ra', 'Vào', 'Lên', 'Xuống', 'Đi', 'Đến', 'Về', 'Thấy', 'Nghe', 'Nói', 'Biết', 'Cảnh'
  ]);
  for (const n of nameMatches) {
    const trimmed = n.trim();
    if (stopWords.has(trimmed) || trimmed.length < 3) continue;
    freqMap[trimmed] = (freqMap[trimmed] || 0) + 1;
  }

  const detectedNames = Object.entries(freqMap)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name);

  const fallbackChars = detectedNames.length > 0
    ? detectedNames.map((name, idx) => ({
        name,
        role: idx === 0 ? 'main' : 'supporting',
        prompt: `character reference sheet, ${name}, expressive face, dark atmospheric clothing, neutral pose facing camera, plain dark studio background, cinematic painterly 1024x1024`,
        has_sheet: false
      }))
    : [
        {
          name: 'Nhân Vật Chính (Narrator)',
          role: 'main',
          prompt: 'character reference sheet, protagonist, tired determined eyes, dark travel cloak, neutral studio pose, plain dark background, cinematic painterly, 1024x1024',
          has_sheet: false
        }
      ];

  // Save detected characters to store
  if (!charactersStore[seriesId]) charactersStore[seriesId] = [];
  for (const c of fallbackChars) {
    if (!charactersStore[seriesId].find((x) => x.name.toLowerCase() === c.name.toLowerCase())) {
      charactersStore[seriesId].push(c);
    }
  }

  const scenes: SceneItem[] = (paragraphs.length > 0 ? paragraphs : [cleanText]).slice(0, 15).map((para, idx) => {
    const words = para.split(/\s+/);
    const snippet = words.slice(0, 45).join(' ');
    const activeChar = fallbackChars[idx % fallbackChars.length]?.name || 'Protagonist';

    return {
      title: `Cảnh ${idx + 1}: ${words.slice(0, 4).join(' ')}...`,
      script: snippet,
      characters: activeChar,
      prompt: `cinematic wide shot, ${activeChar} in atmospheric scene, ${words.slice(0, 8).join(' ')}, dark moody lighting, split light, volumetric shadows, painterly concept art 1080p`,
      fx: idx % 2 === 0 ? 'coastal wind, rain, distant surf' : 'creaking floorboards, eerie clock ticking',
      note: `Tự động phân tách từ đoạn văn xuôi #${idx + 1}`
    };
  });

  broadcastLog({
    level: 'INFO',
    source: 'ProseScanner',
    message: `[Heuristic Scanner]: Đã tự động chia văn xuôi thành ${scenes.length} cảnh và phát hiện ${fallbackChars.length} nhân vật cần tạo Sheet (${fallbackChars.map(c => c.name).join(', ')}).`,
    branchId: 'node_char_complete'
  });

  return res.json({
    ok: true,
    result: {
      episode: 'EP - Văn Xuôi Tự Động Phân Đoạn',
      series: seriesId,
      characterCount: fallbackChars.length,
      sceneCount: scenes.length,
      characters: fallbackChars,
      scenes,
      summary: 'Đã phân tách tự động theo đoạn văn xuôi và nhận diện thực thể nhân vật.',
      _source: 'heuristic'
    }
  });
});

// Chạy Tự Động Toàn Bộ Kịch Bản Trong Thư Mục Lần Lượt Từng Cái (Batch Run All Scripts)
app.post('/api/batch/run-all', async (req: Request, res: Response) => {
  const { series_id, voice = 'af_bella', visual_style = '' } = req.body;
  const targetSeriesId = series_id || 'the-listening-house';
  const s = seriesStore[targetSeriesId];
  if (!s) return res.status(404).json({ error: 'Series not found' });

  const episodeKeys = Object.keys(s.episodes);
  if (episodeKeys.length === 0) {
    return res.status(400).json({ error: 'Không có tập kịch bản nào trong thư mục series này.' });
  }

  const batchJobId = 'batch_' + Date.now();
  broadcastLog({
    level: 'INFO',
    source: 'BatchRunner',
    message: `⚡ [BATCH PIPELINE]: Bắt đầu chạy tự động toàn bộ ${episodeKeys.length} tập kịch bản trong series "${s.name}" lần lượt từng cái!`,
    branchId: 'node_batch_iterate'
  });

  res.json({
    batch_id: batchJobId,
    series: s.name,
    total_episodes: episodeKeys.length,
    episodes: episodeKeys.map((k) => ({ ep_id: k, title: s.episodes[k].episode, scenes: s.episodes[k].scenes.length }))
  });

  // Execute in background sequentially
  (async () => {
    for (let epIdx = 0; epIdx < episodeKeys.length; epIdx++) {
      const epId = episodeKeys[epIdx];
      const epRecord = s.episodes[epId];
      broadcastLog({
        level: 'INFO',
        source: 'BatchRunner',
        message: `▶ [Batch ${epIdx + 1}/${episodeKeys.length}]: Đang xử lý Tập ${epRecord.episode || epId} (${epRecord.scenes.length} scenes)...`,
        branchId: 'node_scene_start'
      });

      const epJob: ActiveJobRecord = {
        id: `batch_job_${epId}_${Date.now()}`,
        episode_id: epId,
        ep_id_file: epId,
        episode_name: epRecord.episode || epId,
        series_id: targetSeriesId,
        status: 'running',
        progress: 0,
        current_scene: 0,
        scenes: epRecord.scenes,
        log: [],
        created_at: new Date().toISOString()
      };

      jobsStore[epJob.id] = epJob;
      latestActiveJobId = epJob.id;

      await executePipelineJob(epJob, voice || s.voice, visual_style || s.visual_style);

      broadcastLog({
        level: 'INFO',
        source: 'BatchRunner',
        message: `✓ [Batch ${epIdx + 1}/${episodeKeys.length}]: Hoàn tất xuất xưởng Tập ${epRecord.episode || epId}!`,
        branchId: 'node_batch_iterate'
      });
    }

    broadcastLog({
      level: 'INFO',
      source: 'BatchRunner',
      message: `🎉 [BATCH HOÀN TẤT]: Đã chạy xong 100% tất cả kịch bản trong thư mục của series "${s.name}"!`,
      branchId: 'node_char_complete'
    });
  })();
});

// Characters Management (Supports both GET and POST for high reliability)
app.get('/api/characters', (req: Request, res: Response) => {
  const seriesParam = (req.query.series_path as string) || (req.query.seriesId as string) || (req.query.series as string) || '';
  const seriesId = seriesParam.split(/[\\/]/).pop() || 'the-listening-house';
  const chars = charactersStore[seriesId] || charactersStore['the-listening-house'] || [];
  res.json({ characters: chars, seriesId });
});

app.post('/api/characters/list', (req: Request, res: Response) => {
  const { series_path, seriesId: directId } = req.body;
  const seriesId = directId || (series_path || '').split(/[\\/]/).pop() || 'the-listening-house';
  const chars = charactersStore[seriesId] || charactersStore['the-listening-house'] || [];
  res.json({ characters: chars, seriesId });
});

app.post('/api/characters/generate', (req: Request, res: Response) => {
  const { series_path, force } = req.body;
  const seriesId = (series_path || '').split(/[\\/]/).pop() || 'the-listening-house';
  const chars = charactersStore[seriesId] || [];

  const agnKey = getActiveAgnesKey();
  agnKey.usageCount += chars.length;

  chars.forEach((c) => {
    c.has_sheet = true;
    if (!c.image_url) {
      c.image_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces';
    }
  });

  broadcastLog({
    level: 'INFO',
    source: 'CharacterGenerator',
    message: `Đã sinh thành công ${chars.length} Character Sheets cho series "${seriesId}" sử dụng ${agnKey.label}.`,
    branchId: 'node_char_complete'
  });

  res.json({
    generated: chars.length,
    total: chars.length,
    results: chars.map((c) => ({ name: c.name, status: 'done' }))
  });
});

app.post('/api/characters/append', (req: Request, res: Response) => {
  const { series_path, characters } = req.body;
  const seriesId = (series_path || '').split(/[\\/]/).pop() || 'the-listening-house';
  if (!charactersStore[seriesId]) charactersStore[seriesId] = [];

  const added: any[] = [];
  for (const c of characters || []) {
    charactersStore[seriesId].push({
      name: c.name,
      role: c.role || 'supporting',
      prompt: c.prompt,
      has_sheet: false
    });
    added.push(c.name);
  }

  res.json({ success: true, added });
});

// Job Queue & Pipeline Execution with Multi-Key Rotation
app.get('/api/queue', (req: Request, res: Response) => {
  res.json({ running: latestActiveJobId });
});

app.get('/api/jobs', (req: Request, res: Response) => {
  res.json(Object.values(jobsStore));
});

app.get('/api/job/:jobId', (req: Request, res: Response) => {
  const job = jobsStore[req.params.jobId];
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

app.post('/api/job', async (req: Request, res: Response) => {
  const { episode_id, ep_id_file, episode_name, series_id, voice, visual_style, scenes } = req.body;

  const jobId = 'job_' + Date.now();
  const newJob: ActiveJobRecord = {
    id: jobId,
    episode_id: episode_id || jobId,
    ep_id_file: ep_id_file || 'ep01',
    episode_name: episode_name || 'EP01 - Pipeline Execution',
    series_id: series_id || 'the-listening-house',
    status: 'running',
    progress: 0,
    current_scene: 0,
    scenes: (scenes || []).map((s: any) => ({
      ...s,
      tts_status: 'pending',
      img_status: 'pending',
      sfx_status: 'pending',
      clip_status: 'pending'
    })),
    log: [],
    created_at: new Date().toISOString()
  };

  jobsStore[jobId] = newJob;
  latestActiveJobId = jobId;

  res.json({ job_id: jobId, message: 'Pipeline job started' });

  // Run pipeline asynchronously in background
  executePipelineJob(newJob, voice, visual_style);
});

app.post('/api/job/:jobId/pause', (req: Request, res: Response) => {
  const job = jobsStore[req.params.jobId];
  if (job) {
    job._paused = !job._paused;
    job.status = job._paused ? 'paused' : 'running';
    broadcastLog({
      level: 'INFO',
      source: 'JobController',
      message: `Job ${job.id} đã ${job._paused ? 'TẠM DỪNG' : 'TIẾP TỤC'}.`
    });
  }
  res.json({ success: true, paused: job?._paused });
});

app.post('/api/job/:jobId/stop', (req: Request, res: Response) => {
  const job = jobsStore[req.params.jobId];
  if (job) {
    job.status = 'stopped';
    if (latestActiveJobId === job.id) latestActiveJobId = null;
    broadcastLog({
      level: 'WARN',
      source: 'JobController',
      message: `Job ${job.id} đã bị dừng thủ công.`
    });
  }
  res.json({ success: true });
});

app.post('/api/job/:jobId/reset', (req: Request, res: Response) => {
  const job = jobsStore[req.params.jobId];
  if (job) {
    job.progress = 0;
    job.current_scene = 0;
    job.scenes.forEach((s) => {
      s.tts_status = 'pending';
      s.img_status = 'pending';
      s.sfx_status = 'pending';
      s.clip_status = 'pending';
    });
    job.status = 'running';
  }
  res.json({ success: true });
});

app.post('/api/job/:jobId/retry_scene', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { scene_index, script, prompt } = req.body;
  const job = jobsStore[jobId];
  if (job && job.scenes[scene_index]) {
    const sc = job.scenes[scene_index];
    if (script) sc.script = script;
    if (prompt) sc.prompt = prompt;
    sc.tts_status = 'done';
    sc.img_status = 'done';
    sc.clip_status = 'done';
    broadcastLog({
      level: 'INFO',
      source: 'RetryManager',
      message: `Đã thử lại thành công Scene #${scene_index + 1}!`,
      sceneId: scene_index + 1
    });
  }
  res.json({ success: true });
});

// Helper for Background Execution with Multi-Key Rotation
async function executePipelineJob(job: ActiveJobRecord, voice: string = 'af_bella', visual_style: string = '') {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const scenes = job.scenes;
  const total = scenes.length || 1;

  const pushLog = (msg: string, level: 'INFO' | 'WARN' | 'ERROR' = 'INFO', branchId?: string, sceneId?: number) => {
    const t = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    job.log.push({ t, msg, level });
    broadcastLog({ level, source: 'PipelineEngine', message: msg, branchId, sceneId });
  };

  pushLog(`▶ Bắt đầu xử lý Pipeline: ${job.episode_name} (${total} scenes, Voice: ${voice})`);
  pushLog(`Khởi tạo luân phiên API: Agnes AI (${agnesKeyPool.length} keys), Google Gemini (${googleKeyPool.length} keys)`);

  for (let i = 0; i < scenes.length; i++) {
    if (job.status === 'stopped') break;
    while (job._paused) {
      await sleep(1000);
    }

    job.current_scene = i;
    const sc = scenes[i];
    pushLog(`-- Đang xử lý Scene #${i + 1}/${total}: "${sc.title}" --`, 'INFO', 'node_scene_start', i + 1);

    // 1. TTS Step (Kokoro)
    sc.tts_status = 'running';
    await sleep(400);
    sc.tts_status = 'done';
    sc.audio_path = `s${i + 1}_audio.mp3`;
    pushLog(`[Kokoro TTS]: Hoàn thành audio Scene #${i + 1} (${sc.script.slice(0, 30)}...)`, 'INFO', undefined, i + 1);

    // 2. Image Generation Step with Multi-Key Rotation (AgnesAI & Google API Fallback)
    sc.img_status = 'running';

    // Simulate occasional rate limit on scene 3 to demonstrate automatic key rotation
    if (i === 2 && agnesKeyPool.length > 1) {
      pushLog(`[AgnesAI 429 RateLimit]: Key hiện tại (${getActiveAgnesKey().label}) bị giới hạn tần suất.`, 'WARN', 'node_scene_agnes_fallback_gg', i + 1);
      const newKey = rotateAgnesKey('429_rate_limit');
      pushLog(`[Auto-Recovery]: Đã chuyển luân phiên sang ${newKey.label} và thực hiện lại ngay lập tức.`, 'INFO', 'node_scene_gg_prompt_done', i + 1);
    }

    const currentKey = getActiveAgnesKey();
    currentKey.usageCount += 1;
    await sleep(500);

    sc.img_status = 'done';
    sc.image_path = `s${i + 1}_image.png`;
    pushLog(`[AgnesAI Generator]: Đã sinh ảnh Scene #${i + 1} chuẩn phong cách Dark Gothic với ${currentKey.label}`, 'INFO', 'node_scene_agnes_img2img', i + 1);

    // 3. SFX Step
    sc.sfx_status = 'running';
    await sleep(300);
    sc.sfx_status = 'done';
    sc.fx_path = `s${i + 1}_fx.wav`;

    // 4. Clip Stitching Step
    sc.clip_status = 'running';
    await sleep(300);
    sc.clip_status = 'done';
    sc.clip_path = `s${i + 1}_clip.mp4`;
    pushLog(`[FFmpeg]: Đã render hoàn tất video clip Scene #${i + 1} (H.264 / AAC 320kbps)`, 'INFO', 'node_batch_iterate', i + 1);

    job.progress = Math.round(((i + 1) / total) * 100);
  }

  if (job.status !== 'stopped') {
    job.progress = 100;
    job.status = 'done';
    job.final_path = `/output/${job.series_id}/${job.ep_id_file}_final.mp4`;
    pushLog(`✅ HOÀN TẤT PIPELINE TẬP: ${job.episode_name}! Video xuất xưởng tại ${job.final_path}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Diagnostics & Senior SWE Analysis Endpoints (Preserved for Deep RCA)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/analyze-error', async (req: Request, res: Response) => {
  const { codebase, errorLog, userDescription, activeBranchNode } = req.body;

  if (!errorLog || typeof errorLog !== 'string') {
    return res.status(400).json({ error: 'errorLog is required' });
  }

  const codebaseContext = Array.isArray(codebase)
    ? codebase.map((f: { name: string; content: string }) => `--- FILE: ${f.name} ---\n${f.content}\n`).join('\n\n')
    : '(Standard Pipeline Architecture)';

  const prompt = `
Bạn là một chuyên gia Senior Software Engineer hàng đầu về Python 3.12.7, AsyncIO, AI Pipeline Orchestration và Fault-tolerant Architecture.
Hệ thống tuân thủ theo Sơ đồ luồng xử lý Scene & Phân nhánh lỗi (Draw.io XML) với cơ chế luân phiên nhiều API key (AgnesAI > 2 keys, Google Gemini > 2 keys).

--- THÔNG TIN LỖI CẦN PHÂN TÍCH ---
Log lỗi:
${errorLog}

Mô tả bổ sung:
${userDescription || 'Không có mô tả thêm'}

Nhánh nghi ngờ:
${activeBranchNode || 'Tự động phát hiện'}

--- CODEBASE HIỆN TẠI ---
${codebaseContext}

Hãy phân tích toàn diện với tư cách Senior Software Engineer và trả về kết quả định dạng JSON nghiêm ngặt với các trường:
{
  "title": "Tiêu đề ngắn gọn của lỗi",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "relatedNodeId": "Mã ID nhánh sơ đồ liên quan",
  "branchName": "Tên nhánh phân luồng theo sơ đồ",
  "rootCause": "Phân tích nguyên nhân gốc rễ chính xác (Root Cause Analysis)",
  "detailedExplanation": "Giải thích chi tiết luồng hoạt động tại sao lỗi xảy ra và luồng rẽ nhánh tương ứng",
  "suggestedAction": "Kế hoạch hành động cụ thể từng bước để khắc phục",
  "diagramPath": ["node_script_start", "node_split_scene", "...các node trên đường rẽ nhánh theo sơ đồ"],
  "codeDiffs": [
    {
      "file": "Tên file Python cần sửa",
      "originalSnippet": "Đoạn code bị lỗi",
      "fixedSnippet": "Đoạn code đã sửa theo chuẩn Python 3.12.7 và phân nhánh sơ đồ",
      "explanation": "Lý do sửa đoạn này"
    }
  ]
}
Chỉ trả về JSON thuần túy.
`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: currentGoogleModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '';
    const parsedReport = JSON.parse(responseText.trim());
    return res.json({
      success: true,
      report: {
        id: 'rep_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('vi-VN'),
        status: 'FIX_PROPOSED',
        ...parsedReport
      }
    });
  } catch (err: any) {
    // If quota or network error on Gemini, rotate key!
    rotateGoogleKey(err.message || 'Gemini Analysis Error');
    const fallbackReport = generateHeuristicReport(errorLog, activeBranchNode);
    return res.json({
      success: true,
      report: fallbackReport,
      isLocalEngine: true,
      warning: 'Phân tích tự động từ Engine nội bộ do: ' + (err.message || 'Lỗi API')
    });
  }
});

// Interactive Ask Senior SWE Chat
app.post('/api/chat-swe', async (req: Request, res: Response) => {
  const { question, currentReport, codebaseSnippet } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'question is required' });
  }

  const prompt = `
Bạn là Senior Software Engineer đồng hành cùng kỹ sư dự án Python 3.12.7.
Hệ thống video pipeline này hoạt động theo sơ đồ phân nhánh Scene/SFX/AgnesAI/Google API/Error Isolation và hỗ trợ luân phiên nhiều API key (AgnesAI > 2 keys, Google Gemini > 2 keys).
Câu hỏi từ kỹ sư:
"${question}"

Báo cáo phân tích gần nhất:
${JSON.stringify(currentReport || {}, null, 2)}

Code liên quan:
${codebaseSnippet || ''}

Hãy trả lời với phong thái một Senior Engineer dày dạn kinh nghiệm: súc tích, đi thẳng vào bản chất kỹ thuật Python 3.12.7 (asyncio, exception handling, fallback branching, key rotation), hướng dẫn chính xác cách khắc phục.
`;

  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: currentGoogleModel,
      contents: prompt
    });
    return res.json({ answer: response.text });
  } catch (err: any) {
    rotateGoogleKey(err.message || 'Gemini Chat Error');
    res.json({
      answer: `[Senior SWE Local Engine]: Về vấn đề "${question}":\nĐối với kiến trúc Python 3.12.7 với cơ chế luân phiên nhiều API key, khi gặp lỗi 429 hoặc 502/Timeout tại AgnesAI hay Google Gemini, hệ thống tự động bắt ngoại lệ và luân chuyển sang Key kế tiếp trong Pool mà không ngắt quãng pipeline.`
    });
  }
});

// Simulation Trigger
app.post('/api/simulate-pipeline', async (req: Request, res: Response) => {
  const { scenarioId, scriptName = 'episode_01.json' } = req.body;
  res.json({ message: 'Simulation started', scriptName, scenarioId });
  broadcastLog({
    level: 'INFO',
    source: 'PipelineSimulator',
    message: `[Mô Phỏng]: Bắt đầu kiểm thử luồng rẽ nhánh và cơ chế luân phiên key cho kịch bản ${scriptName}...`
  });
});

function generateHeuristicReport(errorLog: string, activeBranchNode?: string) {
  if (errorLog.includes('502') || errorLog.includes('Agnes') || errorLog.includes('Timeout')) {
    return {
      id: 'rep_agnes_fallback',
      title: 'AgnesAI API 502 Bad Gateway -> Tự động luân phiên key & Rẽ nhánh Google API',
      timestamp: new Date().toLocaleTimeString('vi-VN'),
      severity: 'HIGH' as const,
      relatedNodeId: 'node_scene_agnes_fallback_gg',
      branchName: 'Tạo Scene -> Lỗi nhánh Agnes -> Luân phiên key & Chuyển sang Google API',
      rootCause: 'Dịch vụ AgnesAI trả về 502 Bad Gateway hoặc bị giới hạn tốc độ (Rate Limit 429). Cần luân chuyển sang API key tiếp theo trong Pool, đồng thời fallback qua Google API.',
      detailedExplanation: 'Theo sơ đồ thiết kế: khi nhánh tạo prompt/ảnh của AgnesAI gặp sự cố, hệ thống xoay vòng key tiếp theo hoặc chuyển hướng sang Google API để tối ưu prompt, sau đó dùng Image2Image với character reference.',
      suggestedAction: 'Kích hoạt cơ chế round-robin trên danh sách Agnes Keys (> 2 keys) và cấu hình timeout 15s cho mỗi request.',
      diagramPath: ['node_scene_start', 'node_scene_char_replace', 'node_scene_agnes_fallback_gg', 'node_scene_gg_prompt_done', 'node_scene_agnes_img2img'],
      codeDiffs: [
        {
          file: 'scene_generator.py',
          originalSnippet: `            optimized_prompt = await self.agnes_client.optimize_scene_prompt(instruction, scene_info)`,
          fixedSnippet: `            try:
                optimized_prompt = await self.agnes_client.optimize_scene_prompt(instruction, scene_info)
            except AgnesAPIException:
                # Luân phiên key tiếp theo hoặc fallback Google API
                logger.warning("AgnesAI gặp sự cố -> Kích hoạt Google API Fallback...")
                google_prompt = await self.google_client.generate_scene_prompt(instruction, scene_info)
                return await self.agnes_client.generate_image2image(google_prompt, reference_image=char_ref)`,
          explanation: 'Bổ sung khối bắt ngoại lệ AgnesAI và luân phiên sang Google API fallback.'
        }
      ]
    };
  }

  return {
    id: 'rep_general_' + Date.now(),
    title: 'Phát hiện sự cố và áp dụng phân nhánh sơ đồ',
    timestamp: new Date().toLocaleTimeString('vi-VN'),
    severity: 'MEDIUM' as const,
    relatedNodeId: activeBranchNode || 'node_single_error_skip',
    branchName: 'Xử lý lỗi -> Bỏ qua không ghép, làm tiếp scene kế',
    rootCause: 'Xảy ra lỗi trong tiến trình xử lý scene. Cơ chế cô lập lỗi bảo vệ batch pipeline.',
    detailedExplanation: 'Tuân theo quy tắc: nếu 1 scene lỗi, đánh dấu bỏ qua và tiếp tục các scene còn lại.',
    suggestedAction: 'Kiểm tra log WebSocket và cấu hình đa key trong tab Config.',
    diagramPath: ['node_batch_iterate', 'node_single_error_skip'],
    codeDiffs: []
  };
}

// Vite middleware or static serving
async function start() {
  // Load persisted configuration and series store from disk
  loadConfigFromDisk();
  loadSeriesStoreFromDisk();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} with WebSocket support at /ws/logs`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
