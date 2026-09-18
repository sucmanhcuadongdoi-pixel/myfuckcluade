import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { ProgressMetric, SceneStatus } from '../types';
import { Activity, CheckCircle, Clock, GitFork, ShieldAlert } from 'lucide-react';

interface ProgressChartsProps {
  metrics: ProgressMetric[];
  scenes: SceneStatus[];
}

const BRANCH_DISTRIBUTION_DATA = [
  { branch: 'Kịch bản (Script Format)', errors: 5, fixed: 5, fallback: 4 },
  { branch: 'SFX Library / Update', errors: 3, fixed: 3, fallback: 2 },
  { branch: 'Nhân vật (Char Logic)', errors: 4, fixed: 4, fallback: 3 },
  { branch: 'AgnesAI 502 / Fallback', errors: 7, fixed: 6, fallback: 6 },
  { branch: 'Google API Prompt', errors: 2, fixed: 2, fallback: 2 },
  { branch: 'Cô lập Scene (Isolation)', errors: 3, fixed: 2, fallback: 1 },
];

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ metrics, scenes }) => {
  const latestMetric = metrics[metrics.length - 1] || {
    detected: 0,
    inProgress: 0,
    fallbackHandled: 0,
    resolved: 0,
    successRate: 0,
  };

  return (
    <div className="p-6 bg-slate-950 text-slate-100 overflow-y-auto max-h-[calc(100vh-140px)] space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{latestMetric.detected}</div>
            <div className="text-xs text-slate-400">Tổng lỗi phát hiện</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-300">{latestMetric.fallbackHandled}</div>
            <div className="text-xs text-slate-400">Tự rẽ nhánh Fallback</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{latestMetric.resolved}</div>
            <div className="text-xs text-slate-400">Đã sửa & Vượt qua</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">{latestMetric.successRate}%</div>
            <div className="text-xs text-slate-400">Tỷ lệ thành công Pipeline</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-300">1.8s</div>
            <div className="text-xs text-slate-400">Thời gian phục hồi TB (MTTR)</div>
          </div>
        </div>
      </div>

      {/* Main Charts: 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Progress over time */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Tiến Độ Khắc Phục Lỗi Theo Thời Gian</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Thời gian thực (Live Stream)</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorFallback" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorDetected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="detected"
                  name="Phát hiện"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorDetected)"
                />
                <Area
                  type="monotone"
                  dataKey="fallbackHandled"
                  name="Rẽ nhánh fallback"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorFallback)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Đã khắc phục hoàn tất"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-around pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Lỗi mới phát hiện</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Xử lý qua nhánh dự phòng</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Đã khắc phục & Chạy ổn định</span>
          </div>
        </div>

        {/* Chart 2: Branch Error Distribution */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <GitFork className="w-4 h-4 text-amber-400" />
              <span>Phân Bố Lỗi & Phục Hồi Theo Từng Nhánh Sơ Đồ</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Thống kê tích lũy</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={BRANCH_DISTRIBUTION_DATA}
                margin={{ top: 10, right: 15, left: -15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis
                  dataKey="branch"
                  stroke="#94a3b8"
                  fontSize={10}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="errors" name="Tổng lỗi" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fallback" name="Kích hoạt Fallback" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fixed" name="Đã giải quyết" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3 & Scene Quality Tracking Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Success Rate Trend */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Tỷ Lệ Thành Công (%)</span>
            </h3>
            <span className="text-xs font-bold text-emerald-400 font-mono">Target &gt; 90%</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="successRate"
                  name="Tỷ lệ thành công (%)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scene Execution Status Tracker */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Theo Dõi Trạng Thái Từng Scene Trong Kịch Bản Hiện Tại</span>
            </h3>
            <span className="text-[11px] text-slate-400">Theo quy tắc rẽ nhánh</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-2 px-3">Scene #</th>
                  <th className="py-2 px-3">Tiêu đề cảnh</th>
                  <th className="py-2 px-3">Trạng thái</th>
                  <th className="py-2 px-3">Nhánh thực thi</th>
                  <th className="py-2 px-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scenes.map((sc) => (
                  <tr key={sc.sceneId} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                      #{sc.sceneId}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">{sc.title}</td>
                    <td className="py-2.5 px-3">
                      {sc.status === 'SUCCESS' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" /> Thành công
                        </span>
                      )}
                      {sc.status === 'FALLBACK_RESOLVED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <GitFork className="w-3 h-3" /> Rẽ nhánh Fallback
                        </span>
                      )}
                      {sc.status === 'ERROR_SKIPPED' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <ShieldAlert className="w-3 h-3" /> Bỏ qua (Tự sửa)
                        </span>
                      )}
                      {sc.status === 'RUNNING' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                          Đang chạy...
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {sc.currentBranch || 'Chính'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {(sc.durationMs / 1000).toFixed(1)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
