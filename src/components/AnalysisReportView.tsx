import React, { useState } from 'react';
import { AnalysisReport } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  FileCode,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';

interface AnalysisReportViewProps {
  report: AnalysisReport;
  onClose: () => void;
  onApplyFix: (diff: { file: string; fixedSnippet: string; originalSnippet: string }) => void;
  onOpenChatWithSwe: (report: AnalysisReport) => void;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({
  report,
  onClose,
  onApplyFix,
  onOpenChatWithSwe,
}) => {
  const [appliedDiffIndex, setAppliedDiffIndex] = useState<number | null>(null);
  const [copiedDiffIndex, setCopiedDiffIndex] = useState<number | null>(null);

  const handleApply = (idx: number, diff: any) => {
    onApplyFix(diff);
    setAppliedDiffIndex(idx);
    setTimeout(() => setAppliedDiffIndex(null), 3000);
  };

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDiffIndex(idx);
    setTimeout(() => setCopiedDiffIndex(null), 2000);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Báo Cáo Senior SWE • Chẩn Đoán Chi Tiết
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(
                    report.severity
                  )}`}
                >
                  {report.severity}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">{report.title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenChatWithSwe(report)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hỏi Thêm Senior SWE</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Sơ đồ phân nhánh kích hoạt (Breadcrumb Path) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <GitBranch className="w-4 h-4" />
              <span>Nhánh Sơ Đồ Thiết Kế Kích Hoạt:</span>
              <span className="text-white font-mono">{report.branchName}</span>
            </div>
            {report.diagramPath && report.diagramPath.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                {report.diagramPath.map((node, i) => (
                  <React.Fragment key={node}>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {node}
                    </span>
                    {i < report.diagramPath.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-cyan-500 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Root Cause Analysis (Nguyên nhân gốc rễ) */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>1. Phân Tích Nguyên Nhân Gốc Rễ (Root Cause)</span>
            </div>
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-slate-200 leading-relaxed">
              {report.rootCause}
            </div>
          </div>

          {/* Detailed Technical Explanation */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-bold text-cyan-400">
              <Cpu className="w-4 h-4" />
              <span>2. Giải Thích Luồng Thực Thi Kỹ Thuật (Python 3.12.7 Engine)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line">
              {report.detailedExplanation}
            </div>
          </div>

          {/* Proposed Fix Plan */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-bold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>3. Kế Hoạch Khắc Phục Cụ Thể (Action Plan)</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-slate-200 leading-relaxed">
              {report.suggestedAction}
            </div>
          </div>

          {/* Code Diffs & 1-Click Fix */}
          {report.codeDiffs && report.codeDiffs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
                  <Wrench className="w-4 h-4" />
                  <span>4. Bản Vá Mã Nguồn Chi Tiết (Code Diff & Direct Fix)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {report.codeDiffs.length} vị trí cần cập nhật
                </span>
              </div>

              {report.codeDiffs.map((diff, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden space-y-2"
                >
                  <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono font-bold text-white text-xs">{diff.file}</span>
                      <span className="text-slate-400 text-[11px]">• {diff.explanation}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(idx, diff.fixedSnippet)}
                        className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition"
                      >
                        {copiedDiffIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Sao chép fix</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleApply(idx, diff)}
                        className="flex items-center space-x-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
                      >
                        {appliedDiffIndex === idx ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã áp dụng vào file!</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3" />
                            <span>Áp Dụng Bản Vá</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                    {/* Original Code */}
                    <div className="space-y-1.5">
                      <div className="text-rose-400 font-bold flex items-center space-x-1">
                        <span>[-] Mã nguồn hiện tại (Bị lỗi/Thiếu nhánh):</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/50 text-rose-200/90 overflow-x-auto leading-relaxed max-h-64">
                        {diff.originalSnippet}
                      </pre>
                    </div>

                    {/* Fixed Code */}
                    <div className="space-y-1.5">
                      <div className="text-emerald-400 font-bold flex items-center space-x-1">
                        <span>[+] Mã nguồn đề xuất (Senior SWE Fixed):</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-emerald-200/90 overflow-x-auto leading-relaxed max-h-64">
                        {diff.fixedSnippet}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Khuyến nghị: Chạy lại bài test sau khi áp dụng bản vá để kiểm chứng sơ đồ.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Đóng Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
};
