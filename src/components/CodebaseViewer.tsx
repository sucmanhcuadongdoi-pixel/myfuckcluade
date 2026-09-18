import React, { useState } from 'react';
import { CodeFile } from '../types';
import { Check, Copy, Edit3, FileCode, Plus, RotateCcw, Save } from 'lucide-react';

interface CodebaseViewerProps {
  files: CodeFile[];
  onUpdateFile: (fileId: string, newContent: string) => void;
  highlightSnippet?: string;
}

export const CodebaseViewer: React.FC<CodebaseViewerProps> = ({
  files,
  onUpdateFile,
  highlightSnippet,
}) => {
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleSelectFile = (id: string) => {
    setActiveFileId(id);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditedContent(activeFile?.content || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (activeFile) {
      onUpdateFile(activeFile.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* File Tab Bar */}
      <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-4 py-2 overflow-x-auto">
        <div className="flex items-center space-x-1">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => handleSelectFile(file.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                activeFile?.id === file.id
                  ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-500" />
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 shrink-0 ml-4">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-700/50 transition font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa code</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleSaveEdit}
                className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition font-medium"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu thay đổi</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-1 px-2 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hủy</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Description Header */}
      {activeFile && (
        <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-cyan-400 font-bold">{activeFile.path}</span>
            <span className="text-slate-400">• {activeFile.description}</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Python 3.12.7 Runtime Target</span>
        </div>
      )}

      {/* Code Editor / Code Display Area */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-210px)] font-mono text-xs">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[500px] p-4 bg-slate-950 text-emerald-300 border border-slate-800 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
            spellCheck={false}
          />
        ) : (
          <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden shadow-inner">
            <pre className="p-4 leading-relaxed overflow-x-auto text-slate-300">
              {activeFile?.content.split('\n').map((line, idx) => {
                const lineNum = idx + 1;
                const isComment = line.trim().startsWith('#') || line.trim().startsWith('"""');
                const isImport = line.trim().startsWith('import ') || line.trim().startsWith('from ');
                const isDef = line.trim().startsWith('def ') || line.trim().startsWith('async def ') || line.trim().startsWith('class ');
                const isHighlighted = highlightSnippet && line.includes(highlightSnippet.slice(0, 25));

                return (
                  <div
                    key={idx}
                    className={`flex items-start hover:bg-slate-900/60 px-2 py-0.5 rounded ${
                      isHighlighted ? 'bg-amber-950/40 border-l-2 border-amber-400 text-amber-200' : ''
                    }`}
                  >
                    <span className="w-10 select-none text-slate-600 text-right pr-4 font-mono text-[11px]">
                      {lineNum}
                    </span>
                    <span
                      className={`flex-1 font-mono ${
                        isComment
                          ? 'text-slate-500 italic'
                          : isImport
                          ? 'text-indigo-400'
                          : isDef
                          ? 'text-cyan-400 font-bold'
                          : 'text-slate-200'
                      }`}
                    >
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
