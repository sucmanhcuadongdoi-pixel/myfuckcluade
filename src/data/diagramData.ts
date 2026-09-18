export interface DiagramNodeDef {
  id: string;
  originalDrawioId: string;
  title: string;
  subtitle?: string;
  section: 'main_pipeline' | 'script_validation' | 'sfx_branch' | 'char_gen' | 'scene_gen' | 'error_batch';
  type: 'start' | 'process' | 'branch' | 'fallback' | 'constraint' | 'end';
  x: number;
  y: number;
  width: number;
  height: number;
  details: string;
  errorPotential?: string;
}

export interface DiagramEdgeDef {
  id: string;
  source: string;
  target: string;
  label?: string;
  isFallback?: boolean;
}

export const DIAGRAM_SECTIONS = [
  { id: 'all', label: 'Toàn bộ sơ đồ (Full Architecture)' },
  { id: 'main_pipeline', label: '1. Luồng chính (Core Orchestrator)' },
  { id: 'script_validation', label: '2. Kịch bản & API Google (Format Validation)' },
  { id: 'sfx_branch', label: '3. Phân nhánh SFX (Library -> Update -> Download)' },
  { id: 'char_gen', label: '4. Tạo nhân vật & Ràng buộc Logic' },
  { id: 'scene_gen', label: '5. Tạo Scene & Rẽ nhánh Fallback AgnesAI / Google' },
  { id: 'error_batch', label: '6. Xử lý lỗi & Multi-Script (Skip Scene / Next Ep)' }
];

export const DIAGRAM_NODES: DiagramNodeDef[] = [
  // SECTION 1: CORE PIPELINE
  {
    id: 'node_script_start',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-1',
    title: 'Kịch bản đầu vào',
    subtitle: 'Input script data',
    section: 'main_pipeline',
    type: 'start',
    x: 40,
    y: 50,
    width: 140,
    height: 55,
    details: 'Đọc kịch bản phân cảnh ban đầu từ file JSON hoặc đầu vào text.'
  },
  {
    id: 'node_split_scene',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-2',
    title: 'Chia scene & Lấy nhân vật',
    subtitle: 'Parse scenes & cast characters',
    section: 'main_pipeline',
    type: 'process',
    x: 230,
    y: 50,
    width: 180,
    height: 55,
    details: 'Phân rã kịch bản thành danh sách Scene và bóc tách các thực thể nhân vật.'
  },
  {
    id: 'node_tts',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-6',
    title: 'Tạo TTS (Giọng đọc)',
    subtitle: 'Text-to-Speech audio',
    section: 'main_pipeline',
    type: 'process',
    x: 470,
    y: 10,
    width: 150,
    height: 50,
    details: 'Chuyển lời thoại của scene thành giọng đọc lồng tiếng audio.'
  },
  {
    id: 'node_sfx_core',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-11',
    title: 'Chọn SFX nếu có',
    subtitle: 'Sound FX resolution',
    section: 'main_pipeline',
    type: 'process',
    x: 470,
    y: 70,
    width: 150,
    height: 50,
    details: 'Tìm kiếm hiệu ứng âm thanh tương ứng trong thư viện/UPDATE.'
  },
  {
    id: 'node_scene_visual_core',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-8',
    title: 'Tạo Scene: Nhân vật đang ở...',
    subtitle: 'Visual scene rendering',
    section: 'main_pipeline',
    type: 'process',
    x: 470,
    y: 130,
    width: 180,
    height: 50,
    details: 'Sinh hình ảnh cảnh với bối cảnh và tương tác nhân vật.'
  },
  {
    id: 'node_char_core',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-4',
    title: 'Tạo nhân vật',
    subtitle: 'Character consistency',
    section: 'main_pipeline',
    type: 'process',
    x: 470,
    y: 190,
    width: 150,
    height: 50,
    details: 'Tạo hình ảnh và phong cách nhân vật nhất quán trước khi đưa vào cảnh.'
  },
  {
    id: 'node_scene_complete',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-13',
    title: 'Hoàn thành Scene',
    subtitle: 'Combine scene assets',
    section: 'main_pipeline',
    type: 'process',
    x: 710,
    y: 90,
    width: 150,
    height: 55,
    details: 'Đã tập hợp đủ Audio TTS, SFX và Ảnh visual của cảnh hiện tại.'
  },
  {
    id: 'node_repeat_scenes',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-17',
    title: 'Tiếp tục lặp lại đến hết',
    subtitle: 'Iterate all scenes',
    section: 'main_pipeline',
    type: 'process',
    x: 910,
    y: 90,
    width: 160,
    height: 55,
    details: 'Lặp lại tiến trình sinh cho toàn bộ danh sách scene trong kịch bản.'
  },
  {
    id: 'node_stitch_video',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-19',
    title: 'Nối các đoạn scene lại',
    subtitle: 'Final video stitching',
    section: 'main_pipeline',
    type: 'end',
    x: 1120,
    y: 90,
    width: 160,
    height: 55,
    details: 'Ghép nối tất cả các clip scene thành video dài hoàn chỉnh.'
  },

  // SECTION 2: SCRIPT VALIDATION & GOOGLE API FALLBACK
  {
    id: 'node_script_val_start',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-21',
    title: 'Kịch bản đầu vào',
    subtitle: 'Format Checker',
    section: 'script_validation',
    type: 'start',
    x: 40,
    y: 300,
    width: 140,
    height: 55,
    details: 'Kiểm tra cú pháp JSON và trường thông tin scenes/characters.'
  },
  {
    id: 'node_script_ok',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-22',
    title: 'Đúng format: Chạy bình thường',
    subtitle: 'Valid JSON Schema',
    section: 'script_validation',
    type: 'process',
    x: 240,
    y: 260,
    width: 180,
    height: 55,
    details: 'Kịch bản chuẩn cấu trúc, tiếp tục chuyển sang bước chia scene.'
  },
  {
    id: 'node_script_bad_format',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-24',
    title: 'Sai format -> Gọi API Google chỉnh lại',
    subtitle: 'Fallback to Gemini Formatter',
    section: 'script_validation',
    type: 'fallback',
    x: 240,
    y: 350,
    width: 220,
    height: 60,
    details: 'Sử dụng Google Gemini API (gemini-3.8-flash) để đọc hiểu văn bản thô và sửa lại thành JSON chuẩn.',
    errorPotential: 'JSON syntax error, missing scenes array, invalid quote escaping.'
  },

  // SECTION 3: SFX RESOLUTION BRANCH
  {
    id: 'node_sfx_decision',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-27',
    title: 'Chọn SFX nếu có',
    subtitle: 'Audio matching logic',
    section: 'sfx_branch',
    type: 'branch',
    x: 40,
    y: 470,
    width: 160,
    height: 55,
    details: 'Kiểm tra xem scene có từ khóa sfx_keyword không để rẽ nhánh.'
  },
  {
    id: 'node_sfx_library',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-28',
    title: 'Lấy từ thư viện (Ưu tiên số 1)',
    subtitle: 'sfx_library directory',
    section: 'sfx_branch',
    type: 'process',
    x: 260,
    y: 440,
    width: 190,
    height: 50,
    details: 'Kiểm tra kho âm thanh có sẵn nội bộ.'
  },
  {
    id: 'node_sfx_update_dir',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-33',
    title: 'Tìm trong thư mục UPDATE',
    subtitle: 'Fallback to ./UPDATE',
    section: 'sfx_branch',
    type: 'fallback',
    x: 260,
    y: 500,
    width: 190,
    height: 50,
    details: 'Tìm trong kho cache UPDATE đã tải trước đó.'
  },
  {
    id: 'node_sfx_external_dl',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-30',
    title: 'Tìm nguồn ngoài -> Tải về lưu UPDATE',
    subtitle: 'Web Audio Fetch & Cache',
    section: 'sfx_branch',
    type: 'fallback',
    x: 260,
    y: 560,
    width: 220,
    height: 55,
    details: 'Tìm trên mạng nếu thiếu, tải file về và lưu vào ./UPDATE để tái sử dụng.'
  },

  // SECTION 4: CHARACTER GENERATION & LOGIC
  {
    id: 'node_char_start',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-35',
    title: 'Tạo nhân vật',
    subtitle: 'Character Orchestration',
    section: 'char_gen',
    type: 'branch',
    x: 40,
    y: 670,
    width: 150,
    height: 55,
    details: 'Kiểm tra thông tin nhân vật có sẵn prompt hay chưa.'
  },
  {
    id: 'node_char_has_prompt',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-38',
    title: 'Prompt có sẵn -> Qua API AgnesAI tối ưu theo style UI',
    subtitle: 'AgnesAI Prompt Enhancement',
    section: 'char_gen',
    type: 'process',
    x: 250,
    y: 630,
    width: 240,
    height: 60,
    details: 'Đưa prompt sẵn qua AgnesAI text API tối ưu theo style anime/cinematic.'
  },
  {
    id: 'node_char_agnes_fetch',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-40',
    title: 'Gửi lên Agnes lấy ảnh về',
    subtitle: 'AgnesAI Image Generation',
    section: 'char_gen',
    type: 'process',
    x: 530,
    y: 630,
    width: 170,
    height: 55,
    details: 'Gọi API tạo ảnh và lưu URL/file nhân vật.'
  },
  {
    id: 'node_char_no_prompt',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-42',
    title: 'Chưa có prompt -> Gọi API Google đọc & viết prompt',
    subtitle: 'Google Gemini Prompt Synthesizer',
    section: 'char_gen',
    type: 'fallback',
    x: 250,
    y: 720,
    width: 240,
    height: 60,
    details: 'Google Gemini phân tích thông tin nhân vật (tuổi, tính cách, vai trò) để tự viết prompt chi tiết.'
  },
  {
    id: 'node_char_agnes_from_gg',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-44',
    title: 'Gửi prompt Google lên AgnesAI tạo ảnh',
    subtitle: 'Image from Gemini Prompt',
    section: 'char_gen',
    type: 'process',
    x: 530,
    y: 720,
    width: 200,
    height: 55,
    details: 'Chuyển prompt của Google sang AgnesAI tạo ảnh.'
  },
  {
    id: 'node_char_complete',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-46',
    title: 'Nhân vật hoàn chỉnh',
    subtitle: 'Ready Character Model',
    section: 'char_gen',
    type: 'end',
    x: 780,
    y: 670,
    width: 160,
    height: 55,
    details: 'Nhân vật đạt chuẩn, sẵn sàng đưa vào các cảnh quay tiếp theo.'
  },
  {
    id: 'node_char_logic_rule',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-49',
    title: 'RÀNG BUỘC LOGIC NHÂN VẬT',
    subtitle: 'Tuổi, giới tính, tứ chi, gương mặt mắt mũi miệng chuẩn',
    section: 'char_gen',
    type: 'constraint',
    x: 350,
    y: 795,
    width: 320,
    height: 55,
    details: 'Bắt buộc: Không được dị dạng tứ chi, mắt mũi miệng cân đối, đúng phong cách đã chọn.'
  },

  // SECTION 5: SCENE VISUAL & AGNES/GOOGLE FALLBACK BRANCH
  {
    id: 'node_scene_start',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-50',
    title: 'Tạo Scene: Nhân vật đang ở...',
    subtitle: 'Scene Prompt Routing',
    section: 'scene_gen',
    type: 'branch',
    x: 40,
    y: 910,
    width: 180,
    height: 60,
    details: 'Kiểm tra cảnh có nhân vật xuất hiện hay chỉ là phong cảnh thuần túy.'
  },
  {
    id: 'node_scene_char_replace',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-51',
    title: 'Thay mô tả = "hãy thêm nhân vật vào bối cảnh..." (AgnesAI Text)',
    subtitle: 'English Prompt Substitution & Fashion matching',
    section: 'scene_gen',
    type: 'process',
    x: 270,
    y: 870,
    width: 300,
    height: 65,
    details: 'Bỏ mô tả nhân vật, thay bằng câu tiếng Anh phối trang phục phù hợp với bối cảnh bằng AgnesAI Text API.'
  },
  {
    id: 'node_scene_char_prompt_done',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-53',
    title: 'Nhận Prompt hoàn chỉnh',
    subtitle: 'Agnes Processed Prompt',
    section: 'scene_gen',
    type: 'process',
    x: 620,
    y: 875,
    width: 170,
    height: 55,
    details: 'Nhận câu prompt hoàn chỉnh đã tối ưu từ AgnesAI.'
  },
  {
    id: 'node_scene_agnes_img',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-55',
    title: 'Đưa lên AgnesAI tạo ảnh',
    subtitle: 'AgnesAI Text2Image',
    section: 'scene_gen',
    type: 'process',
    x: 830,
    y: 875,
    width: 170,
    height: 55,
    details: 'Sinh hình ảnh bối cảnh chứa nhân vật.'
  },
  {
    id: 'node_scene_agnes_fallback_gg',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-57',
    title: 'NẾU NHÁNH ĐÓ LỖI -> Thử lại tương tự với API Google',
    subtitle: 'Fallback to Gemini Vision Engine',
    section: 'scene_gen',
    type: 'fallback',
    x: 270,
    y: 960,
    width: 300,
    height: 65,
    details: 'Nếu AgnesAI Text API bị 500/502/Timeout, tự động chuyển sang Google Gemini API để tạo prompt thế nhân vật.',
    errorPotential: 'AgnesAI upstream 502/504 Bad Gateway, Rate Limiting.'
  },
  {
    id: 'node_scene_gg_prompt_done',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-59',
    title: 'Nhận Prompt từ Google',
    subtitle: 'Gemini Processed Prompt',
    section: 'scene_gen',
    type: 'fallback',
    x: 620,
    y: 965,
    width: 170,
    height: 55,
    details: 'Nhận prompt hoàn chỉnh được tạo từ Google API.'
  },
  {
    id: 'node_scene_agnes_img2img',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-61',
    title: 'Đưa lên AgnesAI Image2Image / Multi-image',
    subtitle: 'Reference Character Image2Image',
    section: 'scene_gen',
    type: 'fallback',
    x: 830,
    y: 965,
    width: 200,
    height: 55,
    details: 'Dùng ảnh nhân vật gốc làm reference truyền vào AgnesAI Image2Image để giữ độ đồng nhất.'
  },
  {
    id: 'node_scene_no_char',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-64',
    title: 'Không có nhân vật -> Dùng Text2Image thuần cảnh',
    subtitle: 'Landscape / Environment pure prompt',
    section: 'scene_gen',
    type: 'branch',
    x: 270,
    y: 1050,
    width: 280,
    height: 60,
    details: 'Cảnh phong cảnh hoặc đồ vật, không cần đưa nhân vật vào.'
  },
  {
    id: 'node_scene_no_char_agnes',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-66',
    title: 'Yêu cầu Agnes mô tả đúng kịch bản & tối ưu',
    subtitle: 'Agnes Text Optimization',
    section: 'scene_gen',
    type: 'process',
    x: 590,
    y: 1045,
    width: 200,
    height: 55,
    details: 'Tối ưu mô tả phong cảnh bằng Agnes.'
  },
  {
    id: 'node_scene_no_char_agnes_img',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-68',
    title: 'Gửi lên Agnes tạo ảnh cảnh',
    subtitle: 'Agnes Landscape Render',
    section: 'scene_gen',
    type: 'process',
    x: 830,
    y: 1045,
    width: 170,
    height: 55,
    details: 'Tạo ảnh phong cảnh không có nhân vật.'
  },
  {
    id: 'node_scene_no_char_error_gg',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-72',
    title: 'Gặp lỗi -> Quay lại API Google tối ưu theo script',
    subtitle: 'Fallback to Gemini for Landscape',
    section: 'scene_gen',
    type: 'fallback',
    x: 590,
    y: 1115,
    width: 210,
    height: 60,
    details: 'Khi sinh cảnh thuần bị lỗi, quay sang Google API để tái tạo prompt cảnh.'
  },
  {
    id: 'node_scene_no_char_gg_img',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-74',
    title: 'Gửi lên AgnesAI tạo ảnh',
    subtitle: 'Render with Google Prompt',
    section: 'scene_gen',
    type: 'fallback',
    x: 830,
    y: 1115,
    width: 170,
    height: 55,
    details: 'Đưa prompt Google tạo vào AgnesAI để lấy ảnh phong cảnh.'
  },
  {
    id: 'node_scene_logic_master',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-91',
    title: 'QUY TẮC ĐIỆN ẢNH & LOGIC TỰ NHIÊN BẮT BUỘC',
    subtitle: 'Gió, nước, ánh sáng, góc nhìn tuyệt đối điện ảnh, đúng góc nhìn khán giả',
    section: 'scene_gen',
    type: 'constraint',
    x: 1070,
    y: 950,
    width: 230,
    height: 120,
    details: 'Mọi ảnh cảnh phải qua thẩm định: đúng logic gió nước ánh sáng, góc quay chuẩn điện ảnh, góc nhìn khán giả.'
  },

  // SECTION 6: ERROR HANDLING & BATCH PIPELINE
  {
    id: 'node_batch_iterate',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-76',
    title: 'Tiếp tục lặp lại đến hết',
    subtitle: 'Batch Loop Orchestrator',
    section: 'error_batch',
    type: 'start',
    x: 40,
    y: 1250,
    width: 170,
    height: 55,
    details: 'Điều phối vòng lặp xử lý các scene trong 1 hoặc nhiều kịch bản.'
  },
  {
    id: 'node_single_error_skip',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-77',
    title: 'Lỗi 1 công đoạn -> BỎ QUA KHÔNG GHÉP, làm tiếp scene kế',
    subtitle: 'Fault-Tolerant Scene Isolation',
    section: 'error_batch',
    type: 'fallback',
    x: 270,
    y: 1220,
    width: 290,
    height: 60,
    details: 'Nếu 1 scene bị lỗi bất kỳ bước nào, cô lập scene đó và tiếp tục làm scene tiếp theo.',
    errorPotential: 'Scene rendering crashed, TTS failed.'
  },
  {
    id: 'node_user_manual_fix',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-79',
    title: 'Lưu lại để Người dùng tự sửa',
    subtitle: 'Manual User Review / Hotfix',
    section: 'error_batch',
    type: 'end',
    x: 620,
    y: 1220,
    width: 190,
    height: 60,
    details: 'Scene lỗi được gắn cờ (flagged) để Senior SWE / User tự kiểm tra và chỉnh sửa thủ công.'
  },
  {
    id: 'node_multi_script_check',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-81',
    title: 'Nếu có nhiều kịch bản (Multi-Script)',
    subtitle: 'Multi-Episode Queue',
    section: 'error_batch',
    type: 'branch',
    x: 270,
    y: 1300,
    width: 220,
    height: 55,
    details: 'Xử lý hàng đợi tập phim / kịch bản dài.'
  },
  {
    id: 'node_batch_seq',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-83',
    title: 'Tạo lần lượt từ 1 đến hết',
    subtitle: 'Sequential batch execution',
    section: 'error_batch',
    type: 'process',
    x: 520,
    y: 1300,
    width: 180,
    height: 55,
    details: 'Chạy tuần tự từng kịch bản.'
  },
  {
    id: 'node_batch_skip_scene',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-85',
    title: 'Lỗi bỏ qua, tạo scene kế',
    subtitle: 'Continuous Execution Mode',
    section: 'error_batch',
    type: 'fallback',
    x: 730,
    y: 1300,
    width: 170,
    height: 55,
    details: 'Không dừng toàn bộ batch khi 1 scene lỗi.'
  },
  {
    id: 'node_batch_no_stitch_on_err',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-87',
    title: 'CÓ LỖI SCENE: KHÔNG GHÉP CLIP DÀI',
    subtitle: 'Strict Quality Gatekeeper',
    section: 'error_batch',
    type: 'constraint',
    x: 930,
    y: 1300,
    width: 210,
    height: 55,
    details: 'Quy tắc an toàn: Không bao giờ nối video dài nếu còn scene lỗi chưa được sửa.'
  },
  {
    id: 'node_batch_next_ep',
    originalDrawioId: 'lqeOELplXSleSpO8RsCG-89',
    title: 'Làm tập tiếp theo',
    subtitle: 'Advance to next episode',
    section: 'error_batch',
    type: 'end',
    x: 1170,
    y: 1300,
    width: 140,
    height: 55,
    details: 'Bỏ qua video dài của tập lỗi, tiến hành làm kịch bản tập tiếp theo trong danh sách.'
  }
];

export const DIAGRAM_EDGES: DiagramEdgeDef[] = [
  // Flow 1
  { id: 'e1', source: 'node_script_start', target: 'node_split_scene' },
  { id: 'e2', source: 'node_split_scene', target: 'node_tts' },
  { id: 'e3', source: 'node_split_scene', target: 'node_sfx_core' },
  { id: 'e4', source: 'node_split_scene', target: 'node_scene_visual_core' },
  { id: 'e5', source: 'node_split_scene', target: 'node_char_core' },
  { id: 'e6', source: 'node_tts', target: 'node_scene_complete' },
  { id: 'e7', source: 'node_sfx_core', target: 'node_scene_complete' },
  { id: 'e8', source: 'node_scene_visual_core', target: 'node_scene_complete' },
  { id: 'e9', source: 'node_scene_complete', target: 'node_repeat_scenes' },
  { id: 'e10', source: 'node_repeat_scenes', target: 'node_stitch_video' },

  // Flow 2: Script Validation
  { id: 'e11', source: 'node_script_val_start', target: 'node_script_ok', label: 'Đúng format' },
  { id: 'e12', source: 'node_script_val_start', target: 'node_script_bad_format', label: 'Sai format (Fallback)', isFallback: true },

  // Flow 3: SFX
  { id: 'e13', source: 'node_sfx_decision', target: 'node_sfx_library', label: 'Ưu tiên 1' },
  { id: 'e14', source: 'node_sfx_decision', target: 'node_sfx_update_dir', label: 'Ưu tiên 2', isFallback: true },
  { id: 'e15', source: 'node_sfx_decision', target: 'node_sfx_external_dl', label: 'Nguồn ngoài', isFallback: true },

  // Flow 4: Character
  { id: 'e16', source: 'node_char_start', target: 'node_char_has_prompt', label: 'Có prompt' },
  { id: 'e17', source: 'node_char_has_prompt', target: 'node_char_agnes_fetch' },
  { id: 'e18', source: 'node_char_agnes_fetch', target: 'node_char_complete' },
  { id: 'e19', source: 'node_char_start', target: 'node_char_no_prompt', label: 'Chưa có prompt', isFallback: true },
  { id: 'e20', source: 'node_char_no_prompt', target: 'node_char_agnes_from_gg' },
  { id: 'e21', source: 'node_char_agnes_from_gg', target: 'node_char_complete' },

  // Flow 5: Scene Generation & Fallback
  { id: 'e22', source: 'node_scene_start', target: 'node_scene_char_replace', label: 'Có nhân vật' },
  { id: 'e23', source: 'node_scene_char_replace', target: 'node_scene_char_prompt_done' },
  { id: 'e24', source: 'node_scene_char_prompt_done', target: 'node_scene_agnes_img' },
  { id: 'e25', source: 'node_scene_agnes_img', target: 'node_scene_logic_master' },

  // Fallback branch if AgnesAI text fails
  { id: 'e26', source: 'node_scene_start', target: 'node_scene_agnes_fallback_gg', label: 'Agnes lỗi -> Google API', isFallback: true },
  { id: 'e27', source: 'node_scene_agnes_fallback_gg', target: 'node_scene_gg_prompt_done' },
  { id: 'e28', source: 'node_scene_gg_prompt_done', target: 'node_scene_agnes_img2img' },
  { id: 'e29', source: 'node_scene_agnes_img2img', target: 'node_scene_logic_master' },

  // No character branch
  { id: 'e30', source: 'node_scene_start', target: 'node_scene_no_char', label: 'Không nhân vật' },
  { id: 'e31', source: 'node_scene_no_char', target: 'node_scene_no_char_agnes' },
  { id: 'e32', source: 'node_scene_no_char_agnes', target: 'node_scene_no_char_agnes_img' },
  { id: 'e33', source: 'node_scene_no_char_agnes_img', target: 'node_scene_logic_master' },
  // No char fallback
  { id: 'e34', source: 'node_scene_no_char', target: 'node_scene_no_char_error_gg', label: 'Lỗi -> Quay lại Google', isFallback: true },
  { id: 'e35', source: 'node_scene_no_char_error_gg', target: 'node_scene_no_char_gg_img' },
  { id: 'e36', source: 'node_scene_no_char_gg_img', target: 'node_scene_logic_master' },

  // Flow 6: Error & Batch
  { id: 'e37', source: 'node_batch_iterate', target: 'node_single_error_skip', label: 'Lỗi công đoạn' },
  { id: 'e38', source: 'node_single_error_skip', target: 'node_user_manual_fix' },
  { id: 'e39', source: 'node_batch_iterate', target: 'node_multi_script_check', label: 'Nhiều script' },
  { id: 'e40', source: 'node_multi_script_check', target: 'node_batch_seq' },
  { id: 'e41', source: 'node_batch_seq', target: 'node_batch_skip_scene' },
  { id: 'e42', source: 'node_batch_skip_scene', target: 'node_batch_no_stitch_on_err' },
  { id: 'e43', source: 'node_batch_no_stitch_on_err', target: 'node_batch_next_ep' }
];
