import React from 'react';
import { Activity, Cpu, GitBranch, Play, RefreshCw, Sparkles, Terminal } from 'lucide-react';

interface HeaderProps {
  wsConnected: boolean;
  isSimulating: boolean;
  onRunSimulation: () => void;
  onOpenNewTestModal: () => void;
  activeTab: 'diagram' | 'code' | 'logs' | 'charts';
  setActiveTab: (tab: 'diagram' | 'code' | 'logs' | 'charts') => void;
  activeErrorCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  wsConnected,
  isSimulating,
  onRunSimulation,
  onOpenNewTestModal,
  activeTab,
  setActiveTab,
  activeErrorCount,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                AI Video Pipeline Diagnostics
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Senior SWE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Chẩn đoán luồng xử lý kịch bản, rẽ nhánh theo sơ đồ & WebSockets log
            </p>
          </div>
        </div>

        {/* System Badges */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 font-mono">Python 3.12.7</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
            <span className="text-slate-300">
              {wsConnected ? 'WebSocket Live' : 'WS Reconnecting...'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300">Gemini 3.8 Flash</span>
          </div>

          {activeErrorCount > 0 && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span className="font-semibold">{activeErrorCount} Lỗi đang xử lý</span>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-run-simulation"
            onClick={onRunSimulation}
            disabled={isSimulating}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isSimulating
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
            }`}
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang chạy Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Chạy Mô Phỏng Pipeline</span>
              </>
            )}
          </button>

          <button
            id="btn-inject-test-error"
            onClick={onOpenNewTestModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Nạp Lỗi / Phân Tích</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 border-t border-slate-800/80 pt-1">
        <button
          id="nav-tab-diagram"
          onClick={() => setActiveTab('diagram')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'diagram'
              ? 'border-cyan-400 text-cyan-300 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Sơ Đồ Phân Nhánh (Interactive Diagram)</span>
        </button>

        <button
          id="nav-tab-logs"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'logs'
              ? 'border-cyan-400 text-cyan-300 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Real-time WebSocket Logs</span>
        </button>

        <button
          id="nav-tab-code"
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'code'
              ? 'border-cyan-400 text-cyan-300 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Codebase Python 3.12.7</span>
        </button>

        <button
          id="nav-tab-charts"
          onClick={() => setActiveTab('charts')}
          className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition flex items-center space-x-2 border-b-2 ${
            activeTab === 'charts'
              ? 'border-cyan-400 text-cyan-300 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Biểu Đồ Tiến Độ Khắc Phục</span>
        </button>
      </div>
    </header>
  );
};
