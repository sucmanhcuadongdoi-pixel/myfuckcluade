import React, { useState } from 'react';
import { SeriesInfo } from '../types';
import { Play, Pause, RotateCcw, Square, RefreshCw, FolderOpen, Mic, Palette, Zap, AlertTriangle, CheckCircle2, Sparkles, Heart, Smile, ChevronRight, Info } from 'lucide-react';
import { STYLE_CATEGORIES, ALL_STYLE_PRESETS, StyleCategory, StylePreset } from '../data/stylesData';

interface StudioSidebarProps {
  seriesList: SeriesInfo[];
  currentSeriesId: string;
  onSelectSeries: (id: string) => void;
  voice: string;
  onChangeVoice: (v: string) => void;
  visualStyle: string;
  onChangeVisualStyle: (s: string) => void;
  ttsEngine?: 'kokoro' | 'gradio_local' | 'valle_x';
  onChangeTtsEngine?: (eng: 'kokoro' | 'gradio_local' | 'valle_x') => void;
  ttsSpeed?: number;
  onChangeTtsSpeed?: (spd: number) => void;
  gradioUrl?: string;
  isRunning: boolean;
  isPaused: boolean;
  onRunEpisode: () => void;
  onBatchRunAll: () => void;
  onPauseResume: () => void;
  onRestart: () => void;
  onReset: () => void;
  onResetSeriesAllExceptScript: () => void;
  onStop: () => void;
}

const VOICES = [
  { id: 'af_bella', label: 'af_bella (Nữ - Truyền cảm, bí ẩn)' },
  { id: 'af_sarah', label: 'af_sarah (Nữ - Trầm ấm, điện ảnh)' },
  { id: 'am_adam', label: 'am_adam (Nam - Trầm sâu, kinh dị)' },
  { id: 'am_michael', label: 'am_michael (Nam - Tự nhiên, phiêu lưu)' },
  { id: 'bf_emma', label: 'bf_emma (Anh-Anh - Quý phái, cổ kính)' }
];

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  seriesList,
  currentSeriesId,
  onSelectSeries,
  voice,
  onChangeVoice,
  visualStyle,
  onChangeVisualStyle,
  ttsEngine = 'kokoro',
  onChangeTtsEngine,
  ttsSpeed = 1.0,
  onChangeTtsSpeed,
  gradioUrl = 'http://127.0.0.1:7768',
  isRunning,
  isPaused,
  onRunEpisode,
  onBatchRunAll,
  onPauseResume,
  onRestart,
  onReset,
  onResetSeriesAllExceptScript,
  onStop
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<'cinematic_supernatural' | 'slice_of_life_romance' | 'children_kids'>('cinematic_supernatural');
  const [showAllStylesModal, setShowAllStylesModal] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const audioPreviewRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePreviewVoice = async () => {
    if (isPlayingPreview && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
      return;
    }

    setPreviewLoading(true);
    try {
      const res = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice,
          speed: ttsSpeed,
          engine: ttsEngine,
          gradioUrl
        })
      });
      const data = await res.json();
      if (data.ok && data.audio_url) {
        if (!audioPreviewRef.current) {
          audioPreviewRef.current = new Audio();
          audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
          audioPreviewRef.current.onerror = () => setIsPlayingPreview(false);
        }
        audioPreviewRef.current.src = data.audio_url;
        audioPreviewRef.current.playbackRate = ttsSpeed;
        await audioPreviewRef.current.play();
        setIsPlayingPreview(true);
      }
    } catch {
      // ignore
    } finally {
      setPreviewLoading(false);
    }
  };

  const currentSeries = seriesList.find((s) => s.series_id === currentSeriesId) || seriesList[0];
  const activeCategory = STYLE_CATEGORIES.find((c) => c.id === selectedCategoryId) || STYLE_CATEGORIES[0];

  return (
    <aside id="studio-sidebar" className="w-64 bg-[#141619] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-4 space-y-4 text-xs">
        {/* Series Selection */}
        <div>
          <label className="flex items-center gap-1.5 text-slate-400 font-semibold mb-2">
            <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
            SERIES DỰ ÁN
          </label>
          <select
            id="series-select"
            value={currentSeriesId}
            onChange={(e) => onSelectSeries(e.target.value)}
            className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
          >
            {seriesList.map((s) => (
              <option key={s.series_id} value={s.series_id}>
                {s.name} ({s.episodes.length} tập)
              </option>
            ))}
          </select>
        </div>

        {/* TTS Engine & Voice Selection */}
        <div className="space-y-2.5 bg-[#0e0f11] p-2.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px]">
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              <span>CẤU HÌNH GIỌNG ĐỌC TTS</span>
            </label>
            <span className="text-[10px] text-emerald-400 font-mono">
              {ttsEngine === 'gradio_local' ? 'Gradio 7768' : 'Kokoro'}
            </span>
          </div>

          {/* Engine Selector */}
          <div className="grid grid-cols-2 gap-1 bg-[#1b1e22] p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => onChangeTtsEngine && onChangeTtsEngine('kokoro')}
              className={`py-1 rounded text-[10px] font-medium transition-colors ${
                ttsEngine === 'kokoro'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kokoro TTS
            </button>
            <button
              type="button"
              onClick={() => onChangeTtsEngine && onChangeTtsEngine('gradio_local')}
              className={`py-1 rounded text-[10px] font-medium transition-colors ${
                ttsEngine === 'gradio_local'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gradio Local
            </button>
          </div>

          {/* Voice Dropdown */}
          <div>
            <select
              id="voice-select"
              value={voice}
              onChange={(e) => onChangeVoice(e.target.value)}
              className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speed adjustment slider (0.5x - 2.0x) */}
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Tốc độ đọc:</span>
              <span className="text-emerald-400 font-mono font-semibold">{ttsSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={ttsSpeed}
              onChange={(e) => onChangeTtsSpeed && onChangeTtsSpeed(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>0.5x (Chậm)</span>
              <span>1.0x (Chuẩn)</span>
              <span>2.0x (Nhanh)</span>
            </div>
          </div>

          {/* Audio Preview Button */}
          <button
            type="button"
            disabled={previewLoading}
            onClick={handlePreviewVoice}
            className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              isPlayingPreview
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-[#1b1e22] hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {previewLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : isPlayingPreview ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
            )}
            <span>{isPlayingPreview ? 'Đang phát thử...' : 'Nghe Thử Giọng Này'}</span>
          </button>
        </div>

        {/* Visual Style Selection (Chia thành 3 mục) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>PHONG CÁCH HÌNH ẢNH (3 MỤC)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAllStylesModal(true)}
              className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 hover:underline"
            >
              <span>Xem cả 12</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3 Categories Pills */}
          <div className="grid grid-cols-3 gap-1 mb-2 bg-[#0e0f11] p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('cinematic_supernatural')}
              title="Nghệ thuật điện ảnh - Siêu nhiên - Phép thuật"
              className={`py-1.5 px-1 rounded text-[10px] font-semibold transition-all flex flex-col items-center gap-0.5 text-center leading-tight ${
                selectedCategoryId === 'cinematic_supernatural'
                  ? 'bg-purple-950/70 text-purple-200 border border-purple-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="truncate w-full">Điện Ảnh</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategoryId('slice_of_life_romance')}
              title="Đời thường - Lãng mạn"
              className={`py-1.5 px-1 rounded text-[10px] font-semibold transition-all flex flex-col items-center gap-0.5 text-center leading-tight ${
                selectedCategoryId === 'slice_of_life_romance'
                  ? 'bg-rose-950/70 text-rose-200 border border-rose-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Heart className="w-3 h-3 text-rose-400" />
              <span className="truncate w-full">Đời Thường</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategoryId('children_kids')}
              title="Dành riêng cho trẻ em"
              className={`py-1.5 px-1 rounded text-[10px] font-semibold transition-all flex flex-col items-center gap-0.5 text-center leading-tight ${
                selectedCategoryId === 'children_kids'
                  ? 'bg-amber-950/70 text-amber-200 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Smile className="w-3 h-3 text-amber-400" />
              <span className="truncate w-full">Trẻ Em</span>
            </button>
          </div>

          {/* Category Active Header */}
          <div className="mb-2 px-1">
            <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
              <span>{activeCategory.title}</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
              {activeCategory.description}
            </div>
          </div>

          {/* Presets in this Category */}
          <div className="space-y-1.5 mb-2 max-h-48 overflow-y-auto pr-0.5">
            {activeCategory.presets.map((p) => {
              const isSelected = visualStyle.trim() === p.prompt.trim() || visualStyle.includes(p.prompt.slice(0, 35));
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChangeVisualStyle(p.prompt)}
                  className={`w-full text-left p-2 rounded-lg text-[11px] border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 shadow-sm shadow-purple-500/10'
                      : 'bg-[#1b1e22] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-slate-200 truncate">{p.name}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-1">
                    {p.subtitle}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <label className="text-[10px] text-slate-400 flex items-center justify-between mb-1">
              <span>Prompt phong cách (Tùy chỉnh):</span>
            </label>
            <textarea
              value={visualStyle}
              onChange={(e) => onChangeVisualStyle(e.target.value)}
              rows={2}
              className="w-full bg-[#1b1e22] border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 font-mono focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              placeholder="Mô tả phong cách ảnh chi tiết..."
            />
          </div>
        </div>
      </div>

      {/* Pipeline Control Buttons & Actions */}
      <div className="p-4 border-t border-slate-800 bg-[#0e0f11]/60 space-y-2">
        {/* Batch Run All Episodes Sequentially */}
        <button
          id="btn-batch-run-all"
          type="button"
          onClick={onBatchRunAll}
          disabled={isRunning}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
          title="Tự động chạy toàn bộ các tập kịch bản trong thư mục lần lượt từng cái"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>⚡ Chạy Hết Script Thư Mục</span>
        </button>

        {/* Single Episode Run */}
        <button
          id="btn-run-episode"
          type="button"
          onClick={onRunEpisode}
          disabled={isRunning && !isPaused}
          className="w-full py-2.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isRunning ? 'Đang chạy Pipeline...' : '▶ Chạy Tập Hiện Tại'}
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            id="btn-pause-pipeline"
            type="button"
            onClick={onPauseResume}
            disabled={!isRunning}
            className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          </button>

          <button
            id="btn-stop-pipeline"
            type="button"
            onClick={onStop}
            disabled={!isRunning}
            className="py-1.5 px-2 rounded bg-rose-950/40 hover:bg-rose-900/40 disabled:opacity-40 text-rose-300 text-xs font-medium border border-rose-800/40 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Square className="w-3 h-3 fill-current" />
            Dừng
          </button>
        </div>

        {/* Reset Actions */}
        <div className="pt-1 space-y-1">
          {/* Strict Series Reset Button */}
          <button
            id="btn-reset-series-except-script"
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-1.5 px-2 rounded bg-slate-900 hover:bg-amber-950/40 text-amber-300 hover:text-amber-200 text-[11px] font-medium border border-amber-900/40 hover:border-amber-600/60 flex items-center justify-center gap-1.5 transition-colors"
            title="Xóa sạch toàn bộ ảnh, audio, video render, GIỮ NGUYÊN kịch bản"
          >
            <RotateCcw className="w-3 h-3" />
            <span>⟲ Đặt Lại Series (Giữ Script)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset Series: All Except Script */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141619] border border-amber-500/40 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-100">
                Xác Nhận Đặt Lại Series: {currentSeries.name}
              </h3>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed bg-[#1b1e22] p-3.5 rounded-lg border border-slate-800">
              <p className="font-semibold text-amber-300">
                ⚠️ Nguyên tắc đặt lại (Reset Rule):
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li><strong className="text-rose-400">XÓA SẠCH:</strong> Mọi file audio TTS đã tạo, ảnh đã render từ Agnes/Gemini, clip video MP4 và bộ nhớ đệm (cache).</li>
                <li><strong className="text-emerald-400">BẢO TOÀN 100%:</strong> Toàn bộ KỊCH BẢN (Scripts), lời thoại narration, prompt sinh ảnh và thông tin nhân vật được giữ nguyên vẹn để bạn dựng lại từ đầu.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetSeriesAllExceptScript();
                }}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md shadow-amber-600/20"
              >
                Xác Nhận Đặt Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xem toàn bộ 12 Phong cách phân chia theo 3 mục */}
      {showAllStylesModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141619] border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#101214]">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Kho Phong Cách Hình Ảnh (3 Danh Mục Chuyên Biệt)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Chọn phong cách phù hợp với thể loại truyện của bạn để AgnesAI và Google Gemini tối ưu hóa hình ảnh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllStylesModal(false)}
                className="text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium"
              >
                Đóng
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {STYLE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-800">
                    <span className="font-bold text-sm text-slate-200">{cat.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({cat.presets.length} phong cách)</span>
                  </div>
                  <p className="text-xs text-slate-400">{cat.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.presets.map((preset) => {
                      const isSelected = visualStyle.trim() === preset.prompt.trim() || visualStyle.includes(preset.prompt.slice(0, 35));
                      return (
                        <div
                          key={preset.id}
                          onClick={() => {
                            onChangeVisualStyle(preset.prompt);
                            setSelectedCategoryId(cat.id);
                            setShowAllStylesModal(false);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-500/30'
                              : 'bg-[#1b1e22] border-slate-800 hover:border-slate-600 hover:bg-[#202429]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <h4 className="font-semibold text-xs text-slate-100">{preset.name}</h4>
                              {isSelected && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 font-medium">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{preset.subtitle}</p>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {preset.tags.map((t) => (
                                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                                  #{t}
                                </span>
                              ))}
                            </div>
                            <span className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">
                              Áp dụng &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
