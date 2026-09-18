import React, { useState } from 'react';
import { EpisodeData, CharacterInfo, ProseAnalysisResult } from '../types';
import { FileText, BookOpen, Sparkles, Upload, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Save, Users, Film } from 'lucide-react';
import { THE_LISTENING_HOUSE_EP01, BLOOD_AND_SILENCE_EP01 } from '../data/sampleSeriesData';

interface ParseTabProps {
  seriesId: string;
  onApplyParsedData: (data: EpisodeData, newCharacters?: CharacterInfo[]) => void;
  onParseWithGemini: (text: string) => Promise<EpisodeData>;
}

const SAMPLE_PROSE_TEXT = `Đêm đó, mưa như trút nước xuống vách đá ven biển. Elise Rowan tắt máy xe hơi, ngồi lặng im trong bóng tối của khoang lái nhìn về phía tòa dinh thự Bellweather cổ kính. Đèn trên cả ba tầng lầu đều tắt ngóm. Cô mang theo hai hộp thiết bị âm thanh cồng kềnh, bước từng bước nặng nhọc trên con đường dốc lầy lội.

Đứng trước cánh cửa sắt han gỉ, Elise bất giác rùng mình. Từ trong bóng tối phía hàng hiên, một bóng người đàn ông cao gầy bước ra. Đó là Silas Wren, người quản gia già với bộ râu hoa râm được tỉa gọn và chùm chìa khóa đồng lủng lẳng bên thắt lưng. Ánh mắt ông ta sắc lạnh, không hề chớp.

"Cô đến muộn hai tiếng, cô Rowan," Silas nói, giọng trầm đục như tiếng đá cọ vào nhau. "Và cô mang theo quá nhiều máy móc. Căn nhà này không thích những thứ ghi âm."

Elise không trả lời ngay. Cô nhìn lướt qua vai Silas, hướng vào đại sảnh tăm tối phía sau. Một cô gái trẻ mặc váy lanh sẫm màu, với gò má nhợt nhạt và đôi mắt thảng thốt—Sera—đang đứng nép sau chân cầu thang bằng gỗ sồi, nhìn chằm chằm về phía Elise như muốn cảnh báo điều gì.`;

export const ParseTab: React.FC<ParseTabProps> = ({ seriesId, onApplyParsedData, onParseWithGemini }) => {
  const [parseMode, setParseMode] = useState<'prose' | 'keyword'>('prose');

  // Prose state
  const [proseInput, setProseInput] = useState<string>(SAMPLE_PROSE_TEXT);
  const [proseResult, setProseResult] = useState<ProseAnalysisResult | null>(null);

  // Keyword script state
  const [rawText, setRawText] = useState<string>(`SERIES: the-listening-house
EPISODE: EP01 - The House Keeps Room Tone

SCENE: Iron Gate
SCRIPT: The road ended at the iron gate. Elise left the engine running while rain blurred the house beyond the windshield. Three floors. No light anywhere. She switched off the car and listened to the sudden size of the weather. Alone.
CHARACTERS: Elise
PROMPT: cinematic wide establishing shot at the iron entrance gate, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers dark raincoat, Bellweather House exterior, cold storm light, painterly hyperdetailed dark gothic atmosphere
FX: coastal wind, rain, distant surf
NOTE: Open with isolation

SCENE: Cliff Path
SCRIPT: Wind pressed rain sideways across the cliff path. Elise carried two equipment cases toward the front steps. The house did not emerge from darkness so much as interrupt it, a heavier shape between ocean and sky. Nothing moved behind it.
CHARACTERS: Elise
PROMPT: wide shot, Elise Rowan carrying equipment cases along coastal cliff path toward unlit stone mansion, ocean storm wind, rain moving sideways, painterly hyperdetailed dark gothic atmosphere
FX: coastal wind, rain, distant surf
NOTE: Exposed movement
`);

  const [parsedResult, setParsedResult] = useState<EpisodeData | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto Prose Scanner
  const handleAnalyzeProse = async () => {
    setIsParsing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/prose/analyze-and-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proseText: proseInput,
          seriesId: seriesId || 'the-listening-house'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.result) {
        throw new Error(data.error || 'Lỗi khi quét văn xuôi');
      }

      const resData: ProseAnalysisResult = data.result;
      setProseResult(resData);
      setSuccessMessage(
        `✓ Quét thành công: Tự động chia thành ${resData.sceneCount} cảnh và phát hiện ${resData.characterCount} nhân vật cần tạo Sheet (${resData.characters.map((c) => c.name).join(', ')})!`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể quét văn xuôi');
    } finally {
      setIsParsing(false);
    }
  };

  // Keyword / JSON parser offline
  const handleParseOffline = () => {
    setIsParsing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

      // Check JSON first
      if (clean.startsWith('{') || clean.startsWith('[')) {
        const parsed = JSON.parse(clean);
        const scenes = Array.isArray(parsed) ? parsed : parsed.scenes || [];
        if (scenes.length > 0) {
          const res: EpisodeData = {
            episode: parsed.episode || 'EP01 - Parsed Episode',
            series: parsed.series || seriesId,
            scenes: scenes.map((s: any, i: number) => ({
              title: s.title || `Scene ${i + 1}`,
              script: s.script || '',
              prompt: s.prompt || '',
              fx: s.fx || '',
              note: s.note || '',
              characters: s.characters || ''
            })),
            _method: 'json'
          };
          setParsedResult(res);
          setSuccessMessage(`Đã parse thành công ${res.scenes.length} cảnh từ định dạng JSON!`);
          setIsParsing(false);
          return;
        }
      }

      // Keyword Parser
      const seriesMatch = clean.match(/^SERIES:\s*(.+)$/im);
      const episodeMatch = clean.match(/^EPISODE:\s*(.+)$/im);
      const series = seriesMatch ? seriesMatch[1].trim() : seriesId;
      const episode = episodeMatch ? episodeMatch[1].trim() : 'EP01 - Parsed Episode';

      const blocks = clean.split(/(?:^|\n)(?:SCENE:|\-\-\-)/i).filter((b) => b.trim().length > 0);
      const scenes: any[] = [];

      for (const block of blocks) {
        if (!/SCRIPT:/i.test(block) && !/PROMPT:/i.test(block)) continue;
        const lines = block.split('\n');
        let title = '';
        let script = '';
        let characters = '';
        let prompt = '';
        let fx = '';
        let note = '';
        let currentField = 'title';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (i === 0 && !line.includes(':')) {
            title = line;
            continue;
          }
          if (/^SCRIPT:/i.test(line)) {
            currentField = 'script';
            script += line.replace(/^SCRIPT:\s*/i, '');
          } else if (/^CHARACTERS:/i.test(line)) {
            currentField = 'characters';
            characters += line.replace(/^CHARACTERS:\s*/i, '');
          } else if (/^PROMPT:/i.test(line)) {
            currentField = 'prompt';
            prompt += line.replace(/^PROMPT:\s*/i, '');
          } else if (/^FX:/i.test(line)) {
            currentField = 'fx';
            fx += line.replace(/^FX:\s*/i, '');
          } else if (/^NOTE:/i.test(line)) {
            currentField = 'note';
            note += line.replace(/^NOTE:\s*/i, '');
          } else if (currentField === 'script') {
            script += (script ? ' ' : '') + line;
          } else if (currentField === 'prompt') {
            prompt += (prompt ? ' ' : '') + line;
          } else if (currentField === 'fx') {
            fx += (fx ? ' ' : '') + line;
          } else if (currentField === 'note') {
            note += (note ? ' ' : '') + line;
          }
        }

        if (script || prompt) {
          scenes.push({
            title: title || `Scene ${scenes.length + 1}`,
            script: script.trim(),
            characters: characters.trim(),
            prompt: prompt.trim(),
            fx: fx.trim(),
            note: note.trim()
          });
        }
      }

      if (scenes.length === 0) {
        throw new Error('Không nhận diện được scene nào theo cấu trúc cú pháp SCRIPT/PROMPT. Hãy thử dùng chế độ "Quét Văn Xuôi".');
      }

      const res: EpisodeData = { episode, series, scenes, _method: 'keyword' };
      setParsedResult(res);
      setSuccessMessage(`Đã parse thành công ${scenes.length} scenes bằng Regex Offline!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi parse kịch bản');
    } finally {
      setIsParsing(false);
    }
  };

  const handleParseGemini = async () => {
    setIsParsing(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const data = await onParseWithGemini(rawText);
      setParsedResult(data);
      setSuccessMessage(`Đã dùng Google Gemini AI parse thành công ${data.scenes.length} scenes chuẩn format!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gemini parse thất bại. Hệ thống đã tự động kích hoạt xoay vòng key.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (parseMode === 'prose') {
        setProseInput(content);
      } else {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="parse-tab-view" className="space-y-6 text-slate-200">
      {/* Header Info with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Nhập & Quét Kịch Bản (Script & Prose Scanner)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hỗ trợ tự động chuyển văn xuôi / truyện chữ thành cảnh quay điện ảnh, báo số nhân vật cần tạo Sheet, hoặc parse kịch bản định dạng từ khóa/JSON.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141619] border border-slate-800 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setParseMode('prose')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              parseMode === 'prose'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Quét Văn Xuôi (Tự chia Scene & Nhân vật)</span>
          </button>

          <button
            type="button"
            onClick={() => setParseMode('keyword')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              parseMode === 'keyword'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Kịch Bản Cú Pháp / JSON</span>
          </button>
        </div>
      </div>

      {/* MODE 1: PROSE SCANNER (VĂN XUÔI) */}
      {parseMode === 'prose' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141619] border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Nội dung mẫu:</span>
              <button
                type="button"
                onClick={() => setProseInput(SAMPLE_PROSE_TEXT)}
                className="px-2.5 py-1 rounded bg-[#1b1e22] hover:bg-slate-800 text-blue-300 border border-slate-700 transition-colors"
              >
                Đoạn văn xuôi tiểu thuyết Gothic (3 nhân vật: Elise, Silas, Sera)
              </button>
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file văn bản (.txt)</span>
              <input type="file" accept=".txt,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dán đoạn văn xuôi / truyện chữ cần chuyển thể:
            </label>
            <textarea
              id="prose-textarea"
              value={proseInput}
              onChange={(e) => setProseInput(e.target.value)}
              rows={9}
              className="w-full bg-[#141619] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner"
              placeholder="Dán toàn bộ đoạn văn xuôi, chương tiểu thuyết hoặc nội dung truyện chữ vào đây..."
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              id="btn-scan-prose"
              type="button"
              disabled={isParsing || !proseInput.trim()}
              onClick={handleAnalyzeProse}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
            >
              {isParsing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-yellow-300" />
              )}
              <span>Tự Động Quét Văn Xuôi & Chia Scene (Báo Nhân Vật)</span>
            </button>

            <span className="text-[11px] text-slate-500 font-mono">
              Sử dụng Google Gemini AI (hoặc Heuristic Offline) để tách nhịp và trích xuất nhân vật
            </span>
          </div>

          {/* Results of Prose Scan */}
          {proseResult && (
            <div className="bg-[#141619] border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
              {/* Report summary banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Kết Quả Quét Văn Xuôi: {proseResult.episode}</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {proseResult.summary}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onApplyParsedData(
                      {
                        episode: proseResult.episode,
                        series: proseResult.series,
                        scenes: proseResult.scenes
                      },
                      proseResult.characters
                    );
                    setSuccessMessage('✓ Đã nạp kịch bản và danh sách nhân vật vào Studio thành công!');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>Áp Dụng Vào Studio (Nạp Scene & Nhân Vật)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Character Sheets Needed Report */}
              <div className="p-4 rounded-lg bg-[#1a1d22] border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    Báo cáo: Phát hiện {proseResult.characterCount} nhân vật cần tạo Character Reference Sheet:
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    {proseResult.characterCount} Sheets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {proseResult.characters.map((char, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-[#121417] border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>{char.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          {char.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono line-clamp-2">
                        {char.prompt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scenes Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-blue-400" />
                    Danh Sách Cảnh Điện Ảnh Đã Tự Động Chia ({proseResult.sceneCount} Scenes):
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                  {proseResult.scenes.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#1b1e22] border border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-semibold text-slate-200">
                        <span>#{idx + 1} - {s.title}</span>
                        {s.characters && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            {s.characters}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-300 text-[11px] leading-relaxed">
                        <strong className="text-slate-400">TTS:</strong> {s.script}
                      </div>
                      <div className="text-[10px] text-purple-300/80 font-mono truncate">
                        Prompt: {s.prompt}
                      </div>
                      {s.fx && (
                        <div className="text-[10px] text-amber-400/90 truncate">
                          SFX: {s.fx}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: KEYWORD SYNTAX & JSON */}
      {parseMode === 'keyword' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141619] border border-slate-800 rounded-lg p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400">Nạp mẫu có sẵn:</span>
              <button
                type="button"
                onClick={() => {
                  setParsedResult(THE_LISTENING_HOUSE_EP01);
                  setSuccessMessage(`Đã nạp mẫu The Listening House EP01 (${THE_LISTENING_HOUSE_EP01.scenes.length} scenes)!`);
                }}
                className="px-2.5 py-1 rounded bg-[#1b1e22] hover:bg-slate-800 text-blue-300 border border-slate-700 transition-colors"
              >
                The Listening House (44 scenes)
              </button>

              <button
                type="button"
                onClick={() => {
                  setParsedResult(BLOOD_AND_SILENCE_EP01);
                  setSuccessMessage(`Đã nạp mẫu Blood and Silence EP01 (${BLOOD_AND_SILENCE_EP01.scenes.length} scenes)!`);
                }}
                className="px-2.5 py-1 rounded bg-[#1b1e22] hover:bg-slate-800 text-purple-300 border border-slate-700 transition-colors"
              >
                The Empty Shop (3 scenes)
              </button>
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải tệp .txt / .json</span>
              <input type="file" accept=".txt,.json,.md" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="space-y-3">
            <textarea
              id="raw-script-textarea"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={12}
              className="w-full bg-[#141619] border border-slate-800 rounded-xl p-4 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500 shadow-inner"
              placeholder="Dán kịch bản cú pháp SERIES:, EPISODE:, SCENE:, SCRIPT:, PROMPT:... hoặc JSON vào đây"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  id="btn-parse-offline"
                  type="button"
                  disabled={isParsing}
                  onClick={handleParseOffline}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nhận diện Cú pháp Offline (Regex)</span>
                </button>

                <button
                  id="btn-parse-gemini"
                  type="button"
                  disabled={isParsing}
                  onClick={handleParseGemini}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {isParsing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  )}
                  <span>Parse bằng Google Gemini (Tự sửa format)</span>
                </button>
              </div>
            </div>
          </div>

          {parsedResult && (
            <div className="bg-[#141619] border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {parsedResult.episode}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Series: <span className="text-blue-400">{parsedResult.series || seriesId}</span> | {parsedResult.scenes.length} Scenes đã trích xuất
                  </div>
                </div>

                <button
                  id="btn-apply-parsed"
                  type="button"
                  onClick={() => {
                    onApplyParsedData(parsedResult);
                    setSuccessMessage('✓ Đã áp dụng kịch bản vào Scenes Studio!');
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Áp dụng vào Scenes Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {parsedResult.scenes.map((s, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#1b1e22] border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>#{idx + 1} - {s.title}</span>
                      {s.characters && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">
                          {s.characters}
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400 text-[11px] line-clamp-2">
                      {s.script}
                    </div>
                    {s.fx && (
                      <div className="text-[10px] text-amber-400/90 truncate">
                        SFX: {s.fx}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
};
