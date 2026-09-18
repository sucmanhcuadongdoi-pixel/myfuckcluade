import React, { useState } from 'react';
import { AnalysisReport } from '../types';
import { Bot, ChevronRight, MessageSquare, Send, Sparkles, User, X } from 'lucide-react';

interface AskSeniorSweDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentReport?: AnalysisReport | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'swe';
  text: string;
  timestamp: string;
}

export const AskSeniorSweDrawer: React.FC<AskSeniorSweDrawerProps> = ({
  isOpen,
  onClose,
  currentReport,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'swe',
      text: 'Chào bạn, tôi là Senior Software Engineer phụ trách kiến trúc pipeline Python 3.12.7 này. Tôi đã nắm rõ sơ đồ phân nhánh (Scene, SFX, AgnesAI, Google API fallback, Error isolation). Bạn cần thảo luận thêm về nguyên nhân lỗi, cơ chế bất đồng bộ AsyncIO, hay cách tối ưu bản vá?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputQuestion.trim() || loading) return;

    const userText = inputQuestion.trim();
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat-swe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userText,
          currentReport: currentReport,
        }),
      });
      const data = await res.json();
      const sweMsg: ChatMessage = {
        id: 'swe_' + Date.now(),
        sender: 'swe',
        text: data.answer || 'Tôi đã tiếp nhận câu hỏi và đang rà soát codebase.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, sweMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: 'swe_err_' + Date.now(),
        sender: 'swe',
        text: 'Có lỗi kết nối khi xử lý câu hỏi. Vui lòng thử lại.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <span>Hỏi Đáp Chuyên Sâu Cùng Senior SWE</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400">Tư vấn kiến trúc & Phân nhánh lỗi</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Report Context Pill if any */}
      {currentReport && (
        <div className="px-4 py-2 bg-indigo-950/40 border-b border-indigo-900/40 text-[11px] text-indigo-300 flex items-center justify-between">
          <span className="truncate">Ngữ cảnh: {currentReport.title}</span>
          <span className="font-mono text-[10px] text-indigo-400 shrink-0">{currentReport.severity}</span>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white ${
                msg.sender === 'user' ? 'bg-cyan-600' : 'bg-slate-800 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
            </div>

            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-slate-800/80 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              <div className="text-[10px] opacity-70 mb-1 flex items-center justify-between gap-4 font-mono">
                <span>{msg.sender === 'user' ? 'Bạn' : 'Senior SWE'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs italic pl-9">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Senior SWE đang phân tích câu hỏi...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Hỏi về cơ chế rẽ nhánh, lỗi AsyncIO, giải thuật..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            className="flex-1 px-3 py-2 bg-slate-950 text-slate-200 placeholder-slate-500 text-xs rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            onClick={handleSend}
            disabled={loading || !inputQuestion.trim()}
            className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
