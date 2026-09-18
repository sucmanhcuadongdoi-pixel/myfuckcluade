import React, { useState } from 'react';
import { DIAGRAM_NODES, DIAGRAM_EDGES, DIAGRAM_SECTIONS, DiagramNodeDef } from '../data/diagramData';
import { AlertTriangle, CheckCircle2, ChevronRight, Eye, Info, Sparkles, Zap } from 'lucide-react';

interface FlowchartViewerProps {
  activeNodeId?: string;
  errorNodeId?: string;
  highlightedPath?: string[];
  onSelectNode: (node: DiagramNodeDef) => void;
  onRunTestForNode?: (nodeId: string) => void;
}

export const FlowchartViewer: React.FC<FlowchartViewerProps> = ({
  activeNodeId,
  errorNodeId,
  highlightedPath = [],
  onSelectNode,
  onRunTestForNode,
}) => {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [activeInspectedNode, setActiveInspectedNode] = useState<DiagramNodeDef | null>(
    DIAGRAM_NODES.find((n) => n.id === 'node_scene_agnes_fallback_gg') || DIAGRAM_NODES[0]
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = DIAGRAM_NODES.filter((n) => {
    const matchSection = selectedSection === 'all' || n.section === selectedSection;
    const matchSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.subtitle && n.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSection && matchSearch;
  });

  const handleNodeClick = (node: DiagramNodeDef) => {
    setActiveInspectedNode(node);
    onSelectNode(node);
  };

  const getNodeBorderAndBg = (node: DiagramNodeDef) => {
    const isError = errorNodeId === node.id;
    const isActive = activeNodeId === node.id;
    const isPath = highlightedPath.includes(node.id);

    if (isError) {
      return 'border-rose-500 bg-rose-950/40 text-rose-100 ring-2 ring-rose-500/60 shadow-lg shadow-rose-950';
    }
    if (isActive) {
      return 'border-amber-400 bg-amber-950/30 text-amber-100 ring-2 ring-amber-400/50 shadow-lg shadow-amber-950';
    }
    if (isPath) {
      return 'border-cyan-400 bg-cyan-950/40 text-cyan-100 ring-1 ring-cyan-400/60';
    }

    switch (node.type) {
      case 'start':
        return 'border-blue-600/70 bg-blue-950/25 text-blue-200 hover:border-blue-400';
      case 'fallback':
        return 'border-amber-600/70 bg-amber-950/20 text-amber-200 hover:border-amber-400';
      case 'constraint':
        return 'border-purple-600/80 bg-purple-950/30 text-purple-200 hover:border-purple-400';
      case 'branch':
        return 'border-indigo-600/70 bg-indigo-950/25 text-indigo-200 hover:border-indigo-400';
      case 'end':
        return 'border-emerald-600/70 bg-emerald-950/25 text-emerald-200 hover:border-emerald-400';
      default:
        return 'border-slate-700 bg-slate-800/60 text-slate-200 hover:border-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100">
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phân đoạn sơ đồ:</span>
          <select
            id="select-diagram-section"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            {DIAGRAM_SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Tìm kiếm khối logic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-lg px-3 py-1.5 border border-slate-700 w-48 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          {/* Legend */}
          <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/80"></span> Luồng chuẩn
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/80"></span> Nhánh Fallback khi lỗi
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-purple-500/80"></span> Ràng buộc Logic
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/80"></span> Phát hiện Lỗi
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Left Diagram Grid, Right Inspector Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
        {/* Left 2 Cols: Interactive Node Canvas & Flow Visualizer */}
        <div className="lg:col-span-2 p-5 overflow-y-auto max-h-[calc(100vh-210px)] space-y-6">
          {/* Section Description Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-3">
            <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-200">
                Sơ đồ phân nhánh & Tự động phục hồi lỗi (Python 3.12.7 Engine)
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Khi bất kỳ module nào gặp sự cố (AgnesAI timeout, cú pháp JSON hỏng, âm thanh SFX thiếu), hệ thống kích hoạt đường rẽ nhánh tương ứng hoặc cô lập scene lỗi để bảo toàn tiến trình batch.
              </p>
            </div>
          </div>

          {/* Group Nodes by Section for Clear Visual Walkthrough */}
          {DIAGRAM_SECTIONS.filter((s) => s.id !== 'all').map((sec) => {
            if (selectedSection !== 'all' && selectedSection !== sec.id) return null;
            const nodesInSection = filteredNodes.filter((n) => n.section === sec.id);
            if (nodesInSection.length === 0) return null;

            return (
              <div key={sec.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <h3 className="text-xs font-bold text-cyan-300 tracking-wide uppercase">
                    {sec.label}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {nodesInSection.length} Khối logic
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {nodesInSection.map((node) => {
                    const isSelected = activeInspectedNode?.id === node.id;
                    const isError = errorNodeId === node.id;
                    const isPath = highlightedPath.includes(node.id);

                    return (
                      <div
                        key={node.id}
                        onClick={() => handleNodeClick(node)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 relative ${getNodeBorderAndBg(
                          node
                        )} ${isSelected ? 'scale-[1.02] shadow-cyan-500/10 shadow-lg' : ''}`}
                      >
                        {/* Top Node Header */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center space-x-1.5">
                            {node.type === 'fallback' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                FALLBACK
                              </span>
                            )}
                            {node.type === 'constraint' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                STRICT LOGIC
                              </span>
                            )}
                            {node.type === 'start' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                ENTRY
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-slate-500">
                              {node.originalDrawioId}
                            </span>
                          </div>

                          {isError && (
                            <span className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>LỖI</span>
                            </span>
                          )}

                          {isPath && !isError && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/20 text-cyan-300">
                              Active Route
                            </span>
                          )}
                        </div>

                        {/* Title & Subtitle */}
                        <h4 className="text-xs font-bold leading-snug">{node.title}</h4>
                        {node.subtitle && (
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{node.subtitle}</p>
                        )}

                        {/* Details */}
                        <p className="text-[11px] text-slate-300/80 mt-2 line-clamp-2">
                          {node.details}
                        </p>

                        {/* Potential Errors Footer */}
                        {node.errorPotential && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center space-x-1 text-[10px] text-amber-300/90">
                            <Zap className="w-3 h-3 text-amber-400 shrink-0" />
                            <span className="truncate">Điểm rủi ro: {node.errorPotential}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Node Inspector & Branching Specification Details */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/50 p-5 overflow-y-auto max-h-[calc(100vh-210px)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Chi tiết Khối Logic Sơ Đồ</span>
            </h3>
            {activeInspectedNode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {activeInspectedNode.originalDrawioId}
              </span>
            )}
          </div>

          {activeInspectedNode ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider">Tên khối:</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeInspectedNode.title}</h4>
                {activeInspectedNode.subtitle && (
                  <p className="text-xs text-cyan-400 font-mono">{activeInspectedNode.subtitle}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-300">Mục đích & Quy tắc hoạt động:</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {activeInspectedNode.details}
                </p>
              </div>

              {/* Module File Mapping in Python 3.12.7 */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Tệp mã nguồn tương ứng:</span>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                  <span>
                    {activeInspectedNode.section === 'script_validation'
                      ? 'script_validator.py'
                      : activeInspectedNode.section === 'sfx_branch'
                      ? 'sfx_manager.py'
                      : activeInspectedNode.section === 'char_gen'
                      ? 'character_gen.py'
                      : activeInspectedNode.section === 'scene_gen'
                      ? 'scene_generator.py'
                      : activeInspectedNode.section === 'error_batch'
                      ? 'video_stitcher.py & pipeline.py'
                      : 'pipeline.py'}
                  </span>
                  <span className="text-[10px] text-slate-500">Python 3.12.7</span>
                </div>
              </div>

              {/* Branching Logic Rules */}
              {activeInspectedNode.type === 'fallback' && (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-200 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-xs text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quy tắc rẽ nhánh phục hồi:</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Khi xảy ra lỗi ở nhánh trước, hệ thống bắt ngoại lệ tại mức độ hàm async, log cảnh báo vào WebSocket và kích hoạt giải pháp thay thế qua Google Gemini API hoặc tải nguồn ngoài.
                  </p>
                </div>
              )}

              {activeInspectedNode.type === 'constraint' && (
                <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-800/60 text-purple-200 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-xs text-purple-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ràng buộc chất lượng bắt buộc:</span>
                  </div>
                  <p className="text-[11px] text-purple-200/90 leading-relaxed">
                    Theo node {activeInspectedNode.originalDrawioId}: Bắt buộc kiểm tra độ chính xác giải phẫu (tứ chi, mắt mũi miệng) hoặc logic tự nhiên gió, nước, ánh sáng, góc nhìn tuyệt đối điện ảnh.
                  </p>
                </div>
              )}

              {/* Test Action */}
              {onRunTestForNode && (
                <button
                  onClick={() => onRunTestForNode(activeInspectedNode.id)}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition flex items-center justify-center space-x-2"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Chạy Test Mô Phỏng Nhánh Này</span>
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Chọn một khối trên sơ đồ để xem thông số chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  );
};
