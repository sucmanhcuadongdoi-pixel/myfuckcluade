import React, { useState } from 'react';
import { ApiKeyItem, AppConfig } from '../types';
import { Key, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Zap, Server, Volume2, Cpu } from 'lucide-react';

interface ConfigTabProps {
  config: AppConfig;
  onSaveConfig: (updated: AppConfig) => Promise<void>;
  onTestKey: (type: 'agnes' | 'google', keyId: string, key: string) => Promise<{ ok: boolean; message?: string; error?: string }>;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({ config, onSaveConfig, onTestKey }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [testResults, setTestResults] = useState<Record<string, { loading: boolean; ok?: boolean; msg?: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [detectState, setDetectState] = useState<{ loading: boolean; path?: string; version?: string; error?: string }>({
    loading: false
  });

  const handleDetectPython = async () => {
    setDetectState({ loading: true, error: undefined });
    try {
      const res = await fetch('/api/system/detect-python');
      const data = await res.json();
      if (data.ok && data.path) {
        setDetectState({ loading: false, path: data.path, version: data.version });
        setLocalConfig((prev) => ({ ...prev, python_path: data.path }));
      } else {
        setDetectState({ loading: false, error: data.message || 'Không tìm thấy Python' });
      }
    } catch {
      setDetectState({ loading: false, error: 'Lỗi khi gọi API kiểm tra' });
    }
  };

  // Agnes Key Handlers
  const handleAddAgnesKey = () => {
    const newIdx = localConfig.agnes_keys.length + 1;
    const newKey: ApiKeyItem = {
      id: 'agn_' + Date.now(),
      key: '',
      label: `Agnes AI Key #${newIdx} (Dự phòng)`,
      status: 'idle',
      usageCount: 0
    };
    setLocalConfig({
      ...localConfig,
      agnes_keys: [...localConfig.agnes_keys, newKey]
    });
  };

  const handleUpdateAgnesKey = (id: string, field: keyof ApiKeyItem, val: any) => {
    setLocalConfig({
      ...localConfig,
      agnes_keys: localConfig.agnes_keys.map((k) => (k.id === id ? { ...k, [field]: val } : k))
    });
  };

  const handleRemoveAgnesKey = (id: string) => {
    if (localConfig.agnes_keys.length <= 1) {
      alert('Hệ thống yêu cầu duy trì ít nhất 1 API key.');
      return;
    }
    setLocalConfig({
      ...localConfig,
      agnes_keys: localConfig.agnes_keys.filter((k) => k.id !== id)
    });
  };

  // Google Gemini Key Handlers
  const handleAddGoogleKey = () => {
    const newIdx = localConfig.google_keys.length + 1;
    const newKey: ApiKeyItem = {
      id: 'gg_' + Date.now(),
      key: '',
      label: `Google Gemini Key #${newIdx} (Dự phòng)`,
      status: 'idle',
      usageCount: 0
    };
    setLocalConfig({
      ...localConfig,
      google_keys: [...localConfig.google_keys, newKey]
    });
  };

  const handleUpdateGoogleKey = (id: string, field: keyof ApiKeyItem, val: any) => {
    setLocalConfig({
      ...localConfig,
      google_keys: localConfig.google_keys.map((k) => (k.id === id ? { ...k, [field]: val } : k))
    });
  };

  const handleRemoveGoogleKey = (id: string) => {
    if (localConfig.google_keys.length <= 1) {
      alert('Hệ thống yêu cầu duy trì ít nhất 1 API key.');
      return;
    }
    setLocalConfig({
      ...localConfig,
      google_keys: localConfig.google_keys.filter((k) => k.id !== id)
    });
  };

  const handleTestSingleKey = async (type: 'agnes' | 'google', keyItem: ApiKeyItem) => {
    setTestResults((prev) => ({ ...prev, [keyItem.id]: { loading: true } }));
    const res = await onTestKey(type, keyItem.id, keyItem.key);
    setTestResults((prev) => ({
      ...prev,
      [keyItem.id]: { loading: false, ok: res.ok, msg: res.ok ? res.message : res.error }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await onSaveConfig(localConfig);
      setSaveMessage('✓ Cấu hình đã lưu thành công! Cơ chế luân phiên key đã có hiệu lực.');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      setSaveMessage('✗ Lỗi khi lưu cấu hình: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="config-tab-panel" className="max-w-5xl mx-auto space-y-8 p-6 pb-20 text-slate-200">
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Cấu Hình Dịch Vụ & Luân Phiên API Key</h2>
            <p className="text-sm text-slate-400">
              Quản lý danh sách nhiều hơn 2 API key cho AgnesAI và Google Gemini với cơ chế tự động xoay vòng khi gặp Rate Limit hoặc sự cố kết nối.
            </p>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div
          id="config-save-alert"
          className={`p-4 rounded-lg border text-sm flex items-center gap-2 ${
            saveMessage.startsWith('✓')
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          {saveMessage.startsWith('✓') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {saveMessage}
        </div>
      )}

      {/* Rotation Mode Setting */}
      <div className="bg-[#141619] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-slate-200">Cơ chế Luân Phiên Key (Key Rotation Policy)</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Tự động kích hoạt khi 429 Rate Limit / 502 Bad Gateway
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <label className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
            localConfig.rotation_mode === 'on_error'
              ? 'bg-blue-950/30 border-blue-500/50 text-slate-200'
              : 'bg-[#1b1e22] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="radio"
              name="rotation_mode"
              checked={localConfig.rotation_mode === 'on_error'}
              onChange={() => setLocalConfig({ ...localConfig, rotation_mode: 'on_error' })}
              className="mt-1 accent-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-100">Luân phiên khi gặp lỗi (Failover on Error)</div>
              <div className="text-xs text-slate-400 mt-1">
                Dùng key chính. Chỉ khi key bị 429 Rate Limit hoặc lỗi 502/Timeout mới tự động chuyển sang key dự phòng tiếp theo.
              </div>
            </div>
          </label>

          <label className={`p-4 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
            localConfig.rotation_mode === 'round_robin'
              ? 'bg-blue-950/30 border-blue-500/50 text-slate-200'
              : 'bg-[#1b1e22] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}>
            <input
              type="radio"
              name="rotation_mode"
              checked={localConfig.rotation_mode === 'round_robin'}
              onChange={() => setLocalConfig({ ...localConfig, rotation_mode: 'round_robin' })}
              className="mt-1 accent-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-slate-100">Xoay vòng đều từng request (Round-Robin)</div>
              <div className="text-xs text-slate-400 mt-1">
                Mỗi scene hoặc prompt sẽ tuần tự sử dụng Key 1 → Key 2 → Key 3... giúp phân bổ đều hạn ngạch và tránh đạt rate limit.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* AGNES AI MULTI-KEY POOL */}
      <div id="agnes-key-pool-section" className="bg-[#141619] border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
              Ag
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">Pool API Key AgnesAI</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  {localConfig.agnes_keys.length} Keys Đang Quản Lý
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cho phép thêm không giới hạn các API key của AgnesAI để sinh ảnh và render nhân vật song song.
              </p>
            </div>
          </div>
          <button
            id="btn-add-agnes-key"
            type="button"
            onClick={handleAddAgnesKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm Agnes Key ({localConfig.agnes_keys.length + 1})
          </button>
        </div>

        {/* Model selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Model Agnes AI:</label>
            <select
              value={localConfig.agnes_model}
              onChange={(e) => setLocalConfig({ ...localConfig, agnes_model: e.target.value })}
              className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="agnes-image-2.1-flash">agnes-image-2.1-flash (Nhanh & Tối ưu)</option>
              <option value="agnes-image-pro-v3">agnes-image-pro-v3 (Điện ảnh chi tiết cao)</option>
              <option value="custom">-- Model tùy chỉnh --</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Key đang kích hoạt mặc định:</label>
            <div className="px-3 py-2 rounded-lg bg-[#1b1e22] border border-slate-700 text-sm text-purple-300 flex items-center justify-between">
              <span>{localConfig.agnes_keys[localConfig.active_agnes_key_idx]?.label || 'Key #1'}</span>
              <span className="text-xs text-slate-500 font-mono">Tự xoay vòng khi lỗi</span>
            </div>
          </div>
        </div>

        {/* List of Agnes Keys */}
        <div className="space-y-3">
          {localConfig.agnes_keys.map((keyItem, index) => {
            const testInfo = testResults[keyItem.id];
            const isActive = index === localConfig.active_agnes_key_idx;

            return (
              <div
                key={keyItem.id}
                id={`agnes-key-card-${index}`}
                className={`p-4 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-purple-950/10 border-purple-500/40'
                    : 'bg-[#1b1e22] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 sm:w-48 shrink-0">
                    <input
                      type="radio"
                      name="active_agnes_radio"
                      checked={isActive}
                      onChange={() => setLocalConfig({ ...localConfig, active_agnes_key_idx: index })}
                      className="accent-purple-500 cursor-pointer"
                      title="Chọn làm key ưu tiên"
                    />
                    <input
                      type="text"
                      value={keyItem.label}
                      onChange={(e) => handleUpdateAgnesKey(keyItem.id, 'label', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-purple-500 text-xs font-medium text-slate-200 px-1 py-0.5 focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="password"
                      placeholder="sk-agnes-..."
                      value={keyItem.key}
                      onChange={(e) => handleUpdateAgnesKey(keyItem.id, 'key', e.target.value)}
                      className="w-full bg-[#141619] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                      Dùng: {keyItem.usageCount || 0}
                    </span>

                    <button
                      type="button"
                      disabled={testInfo?.loading}
                      onClick={() => handleTestSingleKey('agnes', keyItem)}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      {testInfo?.loading ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-purple-400" />
                      ) : (
                        <Zap className="w-3 h-3 text-purple-400" />
                      )}
                      Kiểm tra
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveAgnesKey(keyItem.id)}
                      className="p-1.5 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Xóa key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {testInfo && (
                  <div
                    className={`mt-2.5 text-xs px-3 py-1.5 rounded border flex items-center gap-1.5 ${
                      testInfo.ok
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testInfo.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {testInfo.msg}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* GOOGLE GEMINI MULTI-KEY POOL */}
      <div id="google-key-pool-section" className="bg-[#141619] border border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              GG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">Pool API Key Google Gemini</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                  {localConfig.google_keys.length} Keys Đang Quản Lý
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Luân phiên qua nhiều API key Google để sửa format kịch bản JSON, viết prompt và dự phòng khi AgnesAI gặp lỗi.
              </p>
            </div>
          </div>
          <button
            id="btn-add-google-key"
            type="button"
            onClick={handleAddGoogleKey}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm Google Key ({localConfig.google_keys.length + 1})
          </button>
        </div>

        {/* Model selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Model Google Gemini:</label>
            <select
              value={localConfig.google_model}
              onChange={(e) => setLocalConfig({ ...localConfig, google_model: e.target.value })}
              className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Tốc độ cao & Chuẩn JSON)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Suy luận sâu)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Key Gemini đang kích hoạt:</label>
            <div className="px-3 py-2 rounded-lg bg-[#1b1e22] border border-slate-700 text-sm text-blue-300 flex items-center justify-between">
              <span>{localConfig.google_keys[localConfig.active_google_key_idx]?.label || 'Key #1'}</span>
              <span className="text-xs text-slate-500 font-mono">Tự xoay vòng khi hết hạn ngạch</span>
            </div>
          </div>
        </div>

        {/* List of Google Keys */}
        <div className="space-y-3">
          {localConfig.google_keys.map((keyItem, index) => {
            const testInfo = testResults[keyItem.id];
            const isActive = index === localConfig.active_google_key_idx;

            return (
              <div
                key={keyItem.id}
                id={`google-key-card-${index}`}
                className={`p-4 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-blue-950/10 border-blue-500/40'
                    : 'bg-[#1b1e22] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 sm:w-48 shrink-0">
                    <input
                      type="radio"
                      name="active_google_radio"
                      checked={isActive}
                      onChange={() => setLocalConfig({ ...localConfig, active_google_key_idx: index })}
                      className="accent-blue-500 cursor-pointer"
                      title="Chọn làm key ưu tiên"
                    />
                    <input
                      type="text"
                      value={keyItem.label}
                      onChange={(e) => handleUpdateGoogleKey(keyItem.id, 'label', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-blue-500 text-xs font-medium text-slate-200 px-1 py-0.5 focus:outline-none w-full"
                    />
                  </div>

                  <div className="flex-1 relative">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={keyItem.key}
                      onChange={(e) => handleUpdateGoogleKey(keyItem.id, 'key', e.target.value)}
                      className="w-full bg-[#141619] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
                      Dùng: {keyItem.usageCount || 0}
                    </span>

                    <button
                      type="button"
                      disabled={testInfo?.loading}
                      onClick={() => handleTestSingleKey('google', keyItem)}
                      className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      {testInfo?.loading ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                      ) : (
                        <Zap className="w-3 h-3 text-blue-400" />
                      )}
                      Kiểm tra
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveGoogleKey(keyItem.id)}
                      className="p-1.5 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Xóa key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {testInfo && (
                  <div
                    className={`mt-2.5 text-xs px-3 py-1.5 rounded border flex items-center gap-1.5 ${
                      testInfo.ok
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {testInfo.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {testInfo.msg}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AUDIO & SYSTEM INTEGRATION (Kokoro, Gradio, Python, Freesound) */}
      <div className="bg-[#141619] border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          Âm Thanh, TTS Local Gradio & Môi Trường Python
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Kokoro TTS Endpoint (Localhost Python):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localConfig.kokoro_url}
                onChange={(e) => setLocalConfig({ ...localConfig, kokoro_url: e.target.value })}
                className="flex-1 bg-[#1b1e22] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="px-2 py-1 bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 rounded text-xs flex items-center">
                ✓ Sẵn sàng
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Gradio Local TTS Endpoint (WebUI / VALL-E X):</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={localConfig.gradio_tts_url || 'http://127.0.0.1:7768'}
                onChange={(e) => setLocalConfig({ ...localConfig, gradio_tts_url: e.target.value })}
                className="flex-1 bg-[#1b1e22] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="px-2 py-1 bg-purple-950/40 text-purple-300 border border-purple-500/30 rounded text-xs flex items-center font-mono">
                Port 7768
              </span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-medium text-slate-400">
              Đường Dẫn Python Executable (Auto-Detect Engine):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="VD: C:\Python312\python.exe hoặc /usr/bin/python3"
                value={localConfig.python_path || ''}
                onChange={(e) => setLocalConfig({ ...localConfig, python_path: e.target.value })}
                className="flex-1 bg-[#1b1e22] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                disabled={detectState.loading}
                onClick={handleDetectPython}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
              >
                {detectState.loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : (
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span>Tự Động Tìm Python PATH</span>
              </button>
            </div>
            {detectState.path && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Tìm thấy: {detectState.path} ({detectState.version || '3.12.x'})</span>
              </p>
            )}
            {detectState.error && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{detectState.error}</span>
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Freesound API Key (Tải SFX tự động):</label>
            <input
              type="password"
              placeholder="Tùy chọn..."
              value={localConfig.freesound_key || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, freesound_key: e.target.value })}
              className="w-full bg-[#1b1e22] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          id="btn-save-config"
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Đang lưu cấu hình...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Lưu Toàn Bộ Cấu Hình & Kích Hoạt Luân Phiên
            </>
          )}
        </button>
      </div>
    </div>
  );
};
