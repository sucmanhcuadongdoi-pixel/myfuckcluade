import React from 'react';
import { Play, Sparkles, AlertTriangle, ShieldCheck, Terminal, Cpu, Settings } from 'lucide-react';
import { AppConfig } from '../types';

interface StudioTopbarProps {
  seriesName: string;
  episodeName: string;
  config: AppConfig;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSeniorSweChat: () => void;
}

export const StudioTopbar: React.FC<StudioTopbarProps> = ({
  seriesName,
  episodeName,
  config,
  activeTab,
  onSelectTab,
  onOpenSeniorSweChat
}) => {
  const activeAgnesKey = config.agnes_keys[config.active_agnes_key_idx] || config.agnes_keys[0];
  const activeGoogleKey = config.google_keys[config.active_google_key_idx] || config.google_keys[0];

  return (
    <header id="studio-topbar" className="h-12 bg-[#0e0f11] border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none shrink-0 z-20">
      {/* Brand & Series Pill */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold tracking-wider">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px]">
            ▶
          </div>
          <span>AUDIOBOOK STUDIO</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1e22] border border-slate-700 text-slate-300 font-mono text-[11px]">
          <span className="text-blue-400 font-semibold">{seriesName}</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 truncate max-w-[180px]">{episodeName}</span>
        </div>
      </div>

      {/* Services Status Dots (As per User Template) */}
      <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400">
        {/* Kokoro TTS */}
        <div className="flex items-center gap-1.5" title="Kokoro TTS Local Service">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          <span>Kokoro</span>
        </div>

        {/* Agnes AI with Multi-Key Pool Info */}
        <div
          className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition-colors"
          onClick={() => onSelectTab('config')}
          title={`Agnes AI (${config.agnes_keys.length} keys in pool). Đang dùng: ${activeAgnesKey?.label || 'Key 1'}`}
        >
          <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400/50"></span>
          <span className="font-medium text-slate-300">AgnesAI</span>
          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
            {config.agnes_keys.length} Keys (K{config.active_agnes_key_idx + 1})
          </span>
        </div>

        {/* FFmpeg */}
        <div className="flex items-center gap-1.5" title="FFmpeg H.264 Video Engine">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          <span>FFmpeg</span>
        </div>

        {/* FXsound */}
        <div className="flex items-center gap-1.5" title="Sound Effects & Ambient Engine">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
          <span>FXsound</span>
        </div>

        {/* Image Cache */}
        <div className="flex items-center gap-1.5" title="Cache Images for Fast Pipeline">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Cache: 14</span>
        </div>

        {/* Google Gemini with Multi-Key Pool Info */}
        <div
          className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200 transition-colors"
          onClick={() => onSelectTab('config')}
          title={`Google Gemini (${config.google_keys.length} keys in pool). Đang dùng: ${activeGoogleKey?.label || 'Key 1'}`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></span>
          <span className="font-medium text-slate-300">Gemini</span>
          <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] border border-blue-500/30">
            {config.google_keys.length} Keys (K{config.active_google_key_idx + 1})
          </span>
        </div>
      </div>

      {/* Quick Action: Ask Senior SWE */}
      <div className="flex items-center gap-2">
        <button
          id="btn-senior-swe-quick"
          onClick={onOpenSeniorSweChat}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300 hover:bg-blue-900/60 text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Hỏi Senior SWE</span>
        </button>
      </div>
    </header>
  );
};
