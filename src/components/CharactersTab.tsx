import React, { useState } from 'react';
import { CharacterInfo } from '../types';
import { Sparkles, Plus, Image as ImageIcon, CheckCircle2, User, RefreshCw, Layers } from 'lucide-react';

interface CharactersTabProps {
  characters: CharacterInfo[];
  onGenerateAllSheets: () => Promise<void>;
  onAddCharacter: (char: CharacterInfo) => void;
  onUpdateCharacter: (name: string, updated: Partial<CharacterInfo>) => void;
}

export const CharactersTab: React.FC<CharactersTabProps> = ({
  characters,
  onGenerateAllSheets,
  onAddCharacter,
  onUpdateCharacter
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChar, setNewChar] = useState<{ name: string; role: string; prompt: string }>({
    name: '',
    role: 'main',
    prompt: ''
  });

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    try {
      await onGenerateAllSheets();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveNew = () => {
    if (!newChar.name.trim()) return;
    onAddCharacter({
      name: newChar.name.trim(),
      role: newChar.role,
      prompt: newChar.prompt || `character reference sheet, ${newChar.name}, neutral pose, plain studio background, 1024x1024`,
      has_sheet: false
    });
    setNewChar({ name: '', role: 'main', prompt: '' });
    setShowAddModal(false);
  };

  return (
    <div id="characters-tab-view" className="space-y-6 text-slate-200">
      {/* Header Info & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🎭 Character Sheets & Multi-Image Reference</span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
              {characters.length} Nhân vật
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mỗi nhân vật được lưu làm Character Reference Sheet để đảm bảo tính nhất quán (face/hair/clothes) xuyên suốt 44 cảnh của tập.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-lg bg-[#1b1e22] hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Thêm Nhân Vật</span>
          </button>

          <button
            id="btn-generate-all-characters"
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateAll}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            )}
            <span>Sinh toàn bộ Character Sheets</span>
          </button>
        </div>
      </div>

      {/* Characters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char) => (
          <div
            key={char.name}
            className="bg-[#141619] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {char.image_url ? (
                      <img
                        src={char.image_url}
                        alt={char.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold">
                        {char.name[0]}
                      </div>
                    )}
                    {char.has_sheet && (
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#141619] flex items-center justify-center text-white text-[9px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{char.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono tracking-wider">
                      {char.role}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    char.has_sheet
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {char.has_sheet ? 'Sheet OK' : 'Chưa có Sheet'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Character Reference Prompt:
                </label>
                <textarea
                  value={char.prompt}
                  onChange={(e) => onUpdateCharacter(char.name, { prompt: e.target.value })}
                  rows={4}
                  className="w-full bg-[#1b1e22] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono leading-relaxed focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="px-4 py-2.5 bg-[#0e0f11] border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Định dạng: 1024x1024 Sheet</span>
              <span className="text-purple-400 font-mono text-[11px]">AgnesAI / Google API</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#141619] border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Thêm Nhân Vật Mới</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tên nhân vật:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Silas Wren"
                  value={newChar.name}
                  onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                  className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Vai trò:</label>
                <select
                  value={newChar.role}
                  onChange={(e) => setNewChar({ ...newChar, role: e.target.value })}
                  className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="main">Nhân vật chính (Main)</option>
                  <option value="supporting">Nhân vật phụ (Supporting)</option>
                  <option value="extra">Quần chúng (Extra)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mô tả diện mạo / Prompt:</label>
                <textarea
                  placeholder="character reference sheet, man 60s, weathered face..."
                  value={newChar.prompt}
                  onChange={(e) => setNewChar({ ...newChar, prompt: e.target.value })}
                  rows={4}
                  className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg p-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveNew}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
              >
                Lưu Nhân Vật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
