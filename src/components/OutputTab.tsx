import React, { useState } from 'react';
import { Play, Pause, Download, Film, Volume2, CheckCircle2, RotateCcw } from 'lucide-react';
import { ScriptScene } from '../types';

interface OutputTabProps {
  seriesName: string;
  episodeName: string;
  scenes: ScriptScene[];
  videoPath?: string;
  isCompleted: boolean;
}

export const OutputTab: React.FC<OutputTabProps> = ({
  seriesName,
  episodeName,
  scenes,
  videoPath,
  isCompleted
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipIndex, setSelectedClipIndex] = useState<number>(0);

  const doneScenes = scenes.filter((s) => s.clip_status === 'done');

  return (
    <div id="output-tab-view" className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-400" />
            <span>Output Video & Scene Clips ({episodeName})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Đã hoàn tất ghép {doneScenes.length}/{scenes.length} cảnh với âm thanh Kokoro TTS và nhạc nền SFX.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert(`Bắt đầu tải video hoàn chỉnh: ${videoPath || '/output/final.mp4'}`)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Tải Video Tập Hoàn Chỉnh (.mp4)</span>
        </button>
      </div>

      {/* Main Player & Clips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Video Player Box */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-black border border-slate-800 rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center relative shadow-2xl group">
            {/* Cinematic Placeholder / Player Mock */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 pointer-events-none"></div>

            {/* Poster Image */}
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&h=720&fit=crop"
              alt="Episode Still"
              className="w-full h-full object-cover opacity-75"
            />

            {/* Play Button Overlay */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute z-20 w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-600/50 hover:scale-105 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1 fill-current" />}
            </button>

            {/* Player Control Bar */}
            <div className="absolute bottom-0 inset-x-0 p-4 z-20 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-300">01:42 / 14:38</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-300 font-medium truncate max-w-xs">
                  {scenes[selectedClipIndex]?.title || 'Iron Gate'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/30 text-blue-200 font-mono border border-blue-500/40">
                  1080p H.264
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#141619] border border-slate-800 rounded-lg text-xs flex items-center justify-between text-slate-400 font-mono">
            <span>Tệp xuất bản: {videoPath || `/output/${seriesName}/final.mp4`}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã kiểm tra FFmpeg chuẩn 24fps
            </span>
          </div>
        </div>

        {/* Right: Scene Clips Playlist */}
        <div className="bg-[#141619] border border-slate-800 rounded-xl p-4 flex flex-col h-[480px]">
          <h3 className="text-sm font-semibold text-slate-100 border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
            <span>Danh sách Clip Cảnh</span>
            <span className="text-xs text-slate-400 font-mono">{scenes.length} Clips</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {scenes.map((sc, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedClipIndex(idx)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  selectedClipIndex === idx
                    ? 'bg-blue-950/40 border-blue-500/60 text-slate-100'
                    : 'bg-[#1b1e22] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center font-mono text-[11px] text-slate-400 shrink-0">
                    {idx + 1}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{sc.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{sc.script.slice(0, 35)}...</div>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-mono ${
                    sc.clip_status === 'done'
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {sc.clip_status === 'done' ? 'Clip OK' : 'Chờ'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
