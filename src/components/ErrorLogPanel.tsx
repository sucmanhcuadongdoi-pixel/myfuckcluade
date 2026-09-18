import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { SAMPLE_ERROR_SCENARIOS } from '../data/mockPipelineCode';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
  Trash2,
} from 'lucide-react';

interface ErrorLogPanelProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onAnalyzeError: (errorText: string, branchHint?: string) => void;
  onTriggerScenario: (scenarioId: string) => void;
  isAnalyzing: boolean;
  selectedLogId?: string;
  onSelectLog?: (log: LogEntry) => void;
}

export const ErrorLogPanel: React.FC<ErrorLogPanelProps> = ({
  logs,
  onClearLogs,
  onAnalyzeError,
  onTriggerScenario,
  isAnalyzing,
  selectedLogId,
  onSelectLog,
}) => {
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [customErrorInput, setCustomErrorInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    const matchLevel = levelFilter === 'ALL' || log.level === levelFilter;
    const matchSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.stackTrace && log.stackTrace.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchLevel && matchSearch;
  });

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
      case 'FATAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'WARN':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'INFO':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'DEBUG':
        return 'bg-slate-700/50 text-slate-400 border-slate-600/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const handleRunCustomAnalysis = () => {
    if (customErrorInput.trim()) {
      onAnalyzeError(customErrorInput);
      setCustomErrorInput('');
      setShowCustomInput(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Toolbar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Level Filters */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-medium">Lọc log:</span>
          {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                levelFilter === lvl
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Tìm kiếm log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-lg pl-8 pr-2.5 py-1 border border-slate-700 w-44 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <label className="flex items-center space-x-1 text-slate-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span>Tự cuộn</span>
          </label>

          <button
            onClick={onClearLogs}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Xóa danh sách log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Scenarios Launcher Banner */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto gap-3 text-xs">
        <div className="flex items-center space-x-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-slate-300">Kịch bản lỗi mẫu theo sơ đồ:</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {SAMPLE_ERROR_SCENARIOS.map((scen, idx) => (
            <button
              key={scen.id}
              onClick={() => onTriggerScenario(scen.id)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition text-xs whitespace-nowrap flex items-center space-x-1.5"
            >
              <Play className="w-3 h-3 text-cyan-400 fill-current" />
              <span>Bài test #{idx + 1}: {scen.title.split('(')[0]}</span>
            </button>
          ))}

          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-2.5 py-1 rounded bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-700/60 text-indigo-300 text-xs font-semibold whitespace-nowrap"
          >
            + Dán log riêng
          </button>
        </div>
      </div>

      {/* Custom Error Input Modal / Drawer */}
      {showCustomInput && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200">
              Nhập mã lỗi / Log Python 3.12.7 hoặc mô tả sự cố để Senior SWE chẩn đoán:
            </span>
            <button
              onClick={() => setShowCustomInput(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Đóng
            </button>
          </div>
          <textarea
            value={customErrorInput}
            onChange={(e) => setCustomErrorInput(e.target.value)}
            placeholder="Dán traceback, log lỗi hoặc mô tả hành vi sai lệch theo sơ đồ..."
            rows={4}
            className="w-full p-2.5 bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleRunCustomAnalysis}
              disabled={isAnalyzing || !customErrorInput.trim()}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chẩn Đoán Với Senior SWE AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Logs Terminal View */}
      <div
        ref={logContainerRef}
        className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-250px)] font-mono text-xs space-y-1.5"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 opacity-40" />
            <p>Chưa có dòng log nào. Bấm "Chạy Mô Phỏng Pipeline" hoặc chọn bài test mẫu ở trên.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.level === 'ERROR' || log.level === 'FATAL';
            const isWarn = log.level === 'WARN';

            return (
              <div
                key={log.id}
                onClick={() => onSelectLog?.(log)}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  selectedLogId === log.id
                    ? 'border-cyan-500 bg-cyan-950/20'
                    : isError
                    ? 'border-rose-900/60 bg-rose-950/15 hover:bg-rose-950/30'
                    : isWarn
                    ? 'border-amber-900/50 bg-amber-950/10 hover:bg-amber-950/20'
                    : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 text-[11px] font-mono">{log.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getLevelBadge(
                        log.level
                      )}`}
                    >
                      {log.level}
                    </span>
                    <span className="text-cyan-400 font-semibold">[{log.source}]</span>
                    {log.sceneId && (
                      <span className="text-purple-400 text-[11px]">Scene #{log.sceneId}</span>
                    )}
                    {log.branchId && (
                      <span className="text-amber-400 text-[11px] font-sans">
                        (Nhánh: {log.branchId})
                      </span>
                    )}
                  </div>

                  {isError && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalyzeError(
                          log.stackTrace ? `${log.message}\n${log.stackTrace}` : log.message,
                          log.branchId
                        );
                      }}
                      disabled={isAnalyzing}
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white transition flex items-center space-x-1 shrink-0"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isAnalyzing ? 'Đang phân tích...' : 'Phân Tích Sửa Chi Tiết'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-1 text-slate-200 leading-relaxed break-all">
                  {log.message}
                </div>

                {log.stackTrace && (
                  <pre className="mt-1.5 p-2 rounded bg-slate-950/80 text-rose-300/90 text-[11px] overflow-x-auto border border-rose-950">
                    {log.stackTrace}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
