import React, { useState, useRef } from 'react';
import { Volume2, Play, Pause, Download, ExternalLink, Sparkles, Check, Music, ShieldCheck, Info, Search, Filter } from 'lucide-react';
import { FREE_COMMERCIAL_SFX, SFX_CATEGORIES, COMMERCIAL_SFX_SOURCES } from '../data/sfxData';
import { SfxItem } from '../types';

interface SfxLibraryTabProps {
  onAssignToScene?: (sfxTag: string) => void;
}

export const SfxLibraryTab: React.FC<SfxLibraryTabProps> = ({ onAssignToScene }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayToggle = (item: SfxItem) => {
    if (playingId === item.id) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setPlayingId(null);
        audioRef.current.onerror = () => {
          setPlayingId(null);
          alert('Không thể phát trước âm thanh từ máy chủ preview.');
        };
      }
      audioRef.current.src = item.preview_url;
      audioRef.current.play().catch(() => {
        setPlayingId(null);
      });
      setPlayingId(item.id);
    }
  };

  const handleCopyTag = (item: SfxItem) => {
    navigator.clipboard.writeText(item.name.toLowerCase());
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
    if (onAssignToScene) {
      onAssignToScene(item.name);
    }
  };

  const filteredItems = FREE_COMMERCIAL_SFX.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div id="sfx-library-view" className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <span>Kho Hiệu Ứng Âm Thanh SFX Miễn Phí Thương Mại (Commercial Free)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Được cấp phép <strong>CC0 Public Domain</strong> và <strong>Pixabay License</strong>. Nhóm của bạn có thể tự do kiếm tiền, phát hành video YouTube, phim ảnh mà không sợ bị khiếu nại bản quyền.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Free Commercial
          </span>
        </div>
      </div>

      {/* Sources & AI Generators Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {COMMERCIAL_SFX_SOURCES.map((source, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-[#141619] border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-2 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100">{source.name}</h4>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Mở trang web nguồn"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{source.note}</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
              <span className="text-emerald-400 font-mono">{source.format}</span>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-0.5"
              >
                Khám phá &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#141619] border border-slate-800 p-2.5 rounded-xl">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'bg-[#1b1e22] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tất cả ({FREE_COMMERCIAL_SFX.length})
          </button>
          {SFX_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-[#1b1e22] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tiếng mưa, bước chân, sấm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* SFX Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const isPlaying = playingId === item.id;
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                isPlaying
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-600/10'
                  : 'bg-[#141619] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayToggle(item)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-emerald-600 text-white scale-105'
                          : 'bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white'
                      }`}
                      title={isPlaying ? 'Dừng phát' : 'Nghe thử âm thanh'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
                    </button>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {item.duration && (
                          <span className="text-[10px] text-slate-500 font-mono">({item.duration})</span>
                        )}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {item.license}
                      </span>
                    </div>
                  </div>

                  <a
                    href={item.download_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="p-1.5 rounded bg-[#1b1e22] hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    title="Tải file âm thanh về máy (.mp3)"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed pl-11">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs pl-11">
                <span className="text-[10px] text-slate-500 font-mono">Thẻ Scene SFX:</span>
                <button
                  type="button"
                  onClick={() => handleCopyTag(item)}
                  className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-all ${
                    isCopied
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title="Sao chép tên âm thanh vào cảnh của bạn"
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Music className="w-3 h-3 text-emerald-400" />}
                  <span>{isCopied ? 'Đã sao chép!' : 'Chèn vào Scene FX'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
