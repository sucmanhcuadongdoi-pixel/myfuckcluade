import React, { useState } from 'react';
import { BookOpen, Terminal, CheckCircle2, AlertTriangle, HelpCircle, ExternalLink, Cpu, Download, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';

export const UserGuideTab: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [pythonDetectState, setPythonDetectState] = useState<{ loading: boolean; result?: string; error?: string }>({
    loading: false
  });

  const handleCopyCmd = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAutoDetectPython = async () => {
    setPythonDetectState({ loading: true });
    try {
      const res = await fetch('/api/system/detect-python');
      const data = await res.json();
      if (res.ok && data.path) {
        setPythonDetectState({
          loading: false,
          result: `✓ Đã phát hiện Python hợp lệ: ${data.path} (Phiên bản: ${data.version || '3.12.x'})`
        });
      } else {
        setPythonDetectState({
          loading: false,
          error: data.message || 'Không tìm thấy Python trong PATH thông thường. Vui lòng xem hướng dẫn bên dưới để thêm vào PATH.'
        });
      }
    } catch {
      setPythonDetectState({
        loading: false,
        error: 'Lỗi khi gọi API kiểm tra Python.'
      });
    }
  };

  return (
    <div id="user-guide-view" className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Sách Hướng Dẫn Vận Hành Hệ Thống (Team Operator Manual)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Tài liệu chuẩn dành cho nhóm sản xuất nội bộ: cài đặt môi trường, tự dò tìm Python, cấu hình Gradio TTS Local và quy trình dựng video.
        </p>
      </div>

      {/* Quick Python Detector Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-indigo-950/30 border border-blue-500/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-xs font-bold text-slate-100">
                Bộ Dò Tìm Môi Trường Python Tự Động (Auto-Detect Python Engine)
              </h3>
              <p className="text-[11px] text-slate-400">
                Tự động kiểm tra các đường dẫn thông thường trên Windows / Mac / Linux và môi trường venv
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={pythonDetectState.loading}
            onClick={handleAutoDetectPython}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shadow-blue-600/20"
          >
            {pythonDetectState.loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
            <span>Tự Động Quét Tìm Python</span>
          </button>
        </div>

        {pythonDetectState.result && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{pythonDetectState.result}</span>
          </div>
        )}

        {pythonDetectState.error && (
          <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{pythonDetectState.error}</span>
          </div>
        )}
      </div>

      {/* Grid: 3 Prerequisites */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Node.js */}
        <div className="p-4 rounded-xl bg-[#141619] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>1. Node.js (Web & API)</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
              v18+ hoặc v20 LTS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Chạy máy chủ điều khiển, proxy luân phiên key và giao diện React Studio.
          </p>
          <div className="pt-2">
            <div className="flex items-center justify-between bg-[#0e0f11] p-1.5 rounded text-[10px] font-mono text-slate-300">
              <span>node -v && npm -v</span>
              <button
                type="button"
                onClick={() => handleCopyCmd('node -v && npm -v', 1)}
                className="text-slate-400 hover:text-white"
              >
                {copiedIndex === 1 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Python */}
        <div className="p-4 rounded-xl bg-[#141619] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>2. Python (TTS & Pipeline)</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-500/30">
              3.10 - 3.12.7
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Dùng cho Kokoro TTS, VALL-E X, xử lý batch audio và kết nối Gradio Client.
          </p>
          <div className="pt-2">
            <div className="flex items-center justify-between bg-[#0e0f11] p-1.5 rounded text-[10px] font-mono text-slate-300">
              <span>python --version</span>
              <button
                type="button"
                onClick={() => handleCopyCmd('python --version', 2)}
                className="text-slate-400 hover:text-white"
              >
                {copiedIndex === 2 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* FFmpeg */}
        <div className="p-4 rounded-xl bg-[#141619] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>3. FFmpeg (Video Render)</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-500/30">
              Bắt buộc
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Ghép ảnh HD, lồng giọng Kokoro TTS + SFX, hòa âm và xuất chuẩn MP4 H.264 24fps.
          </p>
          <div className="pt-2">
            <div className="flex items-center justify-between bg-[#0e0f11] p-1.5 rounded text-[10px] font-mono text-slate-300">
              <span>ffmpeg -version</span>
              <button
                type="button"
                onClick={() => handleCopyCmd('ffmpeg -version', 3)}
                className="text-slate-400 hover:text-white"
              >
                {copiedIndex === 3 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Troubleshooting: How to Find Python Path */}
      <div className="bg-[#141619] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Thao Tác Tự Tìm Path Của Môi Trường Python Nếu Báo Không Thấy</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2 bg-[#1b1e22] p-3.5 rounded-lg border border-slate-800">
            <span className="font-semibold text-blue-300">Trên Hệ Điều Hành Windows:</span>
            <p className="text-slate-400 text-[11px]">
              Mở <strong>Command Prompt (cmd)</strong> hoặc <strong>PowerShell</strong> và gõ lệnh:
            </p>
            <div className="bg-[#0e0f11] p-2 rounded font-mono text-[11px] text-slate-200 flex justify-between items-center">
              <span>where python</span>
              <button
                type="button"
                onClick={() => handleCopyCmd('where python', 4)}
                className="text-slate-400 hover:text-white"
              >
                {copiedIndex === 4 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Đường dẫn thường thấy: <br />
              <code className="text-amber-300 font-mono">C:\Users\&lt;Tên_Bạn&gt;\AppData\Local\Programs\Python\Python312\python.exe</code>
            </p>
          </div>

          <div className="space-y-2 bg-[#1b1e22] p-3.5 rounded-lg border border-slate-800">
            <span className="font-semibold text-purple-300">Trên macOS hoặc Linux:</span>
            <p className="text-slate-400 text-[11px]">
              Mở <strong>Terminal</strong> và gõ lệnh:
            </p>
            <div className="bg-[#0e0f11] p-2 rounded font-mono text-[11px] text-slate-200 flex justify-between items-center">
              <span>which python3</span>
              <button
                type="button"
                onClick={() => handleCopyCmd('which python3', 5)}
                className="text-slate-400 hover:text-white"
              >
                {copiedIndex === 5 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Đường dẫn thường thấy: <br />
              <code className="text-amber-300 font-mono">/usr/local/bin/python3</code> hoặc <code className="text-amber-300 font-mono">/opt/homebrew/bin/python3</code>
            </p>
          </div>
        </div>
      </div>

      {/* Gradio Local TTS Integration */}
      <div className="bg-[#141619] border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Tích Hợp API Gradio TTS Chạy Cục Bộ (Localhost 7768)</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Nếu bạn đang chạy server TTS riêng tại máy của mình (ví dụ VALL-E X hoặc WebUI Extension trên cổng <strong>http://127.0.0.1:7768/</strong>):
        </p>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
          <li>
            Thư viện <strong>@gradio/client</strong> đã được cài đặt sẵn sàng trong hệ thống.
          </li>
          <li>
            Tại thanh bên trái <strong>Studio Sidebar</strong>, bạn có thể chọn TTS Engine: <strong>Local Gradio TTS Server</strong>.
          </li>
          <li>
            Hệ thống hỗ trợ <strong>nghe thử giọng đọc trực tiếp (Audio Preview)</strong> và <strong>thanh trượt điều chỉnh tốc độ đọc (0.5x - 2.0x)</strong> trước khi bắt đầu sinh hàng loạt.
          </li>
        </ul>
      </div>
    </div>
  );
};
