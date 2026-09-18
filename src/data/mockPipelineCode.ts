import { CodeFile, LogEntry, AnalysisReport, SceneStatus, ProgressMetric } from '../types';

export const DEFAULT_PYTHON_CODEBASE: CodeFile[] = [
  {
    id: 'pipeline_py',
    name: 'pipeline.py',
    path: 'pipeline.py',
    language: 'python',
    description: 'Bộ điều phối luồng xử lý chính Python 3.12.7 cho toàn bộ kịch bản & scene',
    content: `"""
AI Video Generation Pipeline - Python 3.12.7
Architecture follows the Scene Splitting & Branching Diagram.
"""
import os
import sys
import asyncio
import logging
from dataclasses import dataclass
from typing import List, Optional

from script_validator import ScriptValidator
from character_gen import CharacterGenerator
from scene_generator import SceneGenerator
from sfx_manager import SFXManager
from tts_manager import TTSManager
from video_stitcher import VideoStitcher

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [%(name)s] %(message)s'
)
logger = logging.getLogger("PipelineOrchestrator")

@dataclass
class SceneResult:
    scene_id: int
    success: bool
    image_path: Optional[str] = None
    audio_path: Optional[str] = None
    sfx_path: Optional[str] = None
    branch_used: str = "primary"
    error_msg: Optional[str] = None

class VideoPipeline:
    def __init__(self, script_path: str, output_dir: str = "./output"):
        self.script_path = script_path
        self.output_dir = output_dir
        self.validator = ScriptValidator()
        self.char_gen = CharacterGenerator()
        self.scene_gen = SceneGenerator()
        self.sfx_mgr = SFXManager()
        self.tts_mgr = TTSManager()
        self.stitcher = VideoStitcher()

    async def execute_batch(self, script_paths: List[str]):
        """Xử lý danh sách nhiều kịch bản (multi-script) lần lượt từ 1 đến hết"""
        logger.info(f"Khởi động tiến trình xử lý {len(script_paths)} kịch bản tập...")
        for idx, script in enumerate(script_paths, 1):
            logger.info(f"=== BẮT ĐẦU XỬ LÝ TẬP/KỊCH BẢN #{idx}: {script} ===")
            try:
                success = await self.run_single_script(script)
                if not success:
                    logger.warning(f"Kịch bản #{idx} có lỗi scene, bỏ qua ghép clip dài, chuyển sang tập tiếp theo!")
            except Exception as e:
                logger.error(f"Lỗi ngoài dự tính ở kịch bản #{idx}: {str(e)}", exc_info=True)
                logger.info("Tiếp tục chuyển sang tập tiếp theo...")

    async def run_single_script(self, script_file: str) -> bool:
        # Bước 1: Kiểm tra format kịch bản & chuẩn hóa qua Google API nếu sai format
        script_data = await self.validator.validate_and_format(script_file)
        if not script_data:
            logger.error("Không thể phân tích kịch bản sau khi thử nhánh dự phòng!")
            return False

        scenes = script_data.get("scenes", [])
        characters = script_data.get("characters", [])
        logger.info(f"Kịch bản hợp lệ. Tổng số scenes: {len(scenes)}, nhân vật: {len(characters)}")

        # Bước 2: Tạo danh sách nhân vật hoàn chỉnh
        created_characters = {}
        for char in characters:
            logger.info(f"Đang sinh nhân vật: {char.get('name')}")
            char_res = await self.char_gen.create_character(char)
            created_characters[char.get("name")] = char_res

        # Bước 3: Lặp xử lý từng scene
        completed_scenes: List[SceneResult] = []
        has_scene_failure = False

        for scene in scenes:
            scene_id = scene.get("id")
            logger.info(f"-- Đang xử lý Scene #{scene_id} --")
            try:
                # Chạy song song: TTS, SFX, Scene Visual
                tts_task = asyncio.create_task(self.tts_mgr.generate_tts(scene.get("dialogue", "")))
                sfx_task = asyncio.create_task(self.sfx_mgr.resolve_sfx(scene.get("sfx_keyword")))
                visual_task = asyncio.create_task(self.scene_gen.generate_scene_visual(scene, created_characters))

                tts_res, sfx_res, visual_res = await asyncio.gather(
                    tts_task, sfx_task, visual_task, return_exceptions=True
                )

                # Kiểm tra lỗi ở 1 trong các công đoạn
                if isinstance(visual_res, Exception) or not visual_res:
                    err_msg = str(visual_res) if isinstance(visual_res, Exception) else "Visual gen failed"
                    logger.error(f"LỖI TẠI SCENE #{scene_id}: {err_msg}")
                    logger.warning(f"-> Áp dụng quy tắc: Bỏ qua không ghép scene #{scene_id}, làm tiếp scene kế!")
                    has_scene_failure = True
                    completed_scenes.append(SceneResult(scene_id=scene_id, success=False, error_msg=err_msg))
                    continue

                logger.info(f"Hoàn thành Scene #{scene_id} qua nhánh: {visual_res.get('branch')}")
                completed_scenes.append(SceneResult(
                    scene_id=scene_id,
                    success=True,
                    image_path=visual_res.get("image_path"),
                    audio_path=tts_res if isinstance(tts_res, str) else None,
                    sfx_path=sfx_res if isinstance(sfx_res, str) else None,
                    branch_used=visual_res.get("branch", "primary")
                ))

            except Exception as e:
                logger.error(f"Ngoại lệ xử lý Scene #{scene_id}: {e}", exc_info=True)
                has_scene_failure = True
                continue

        # Bước 4: Nối các đoạn scene lại (Video Stitching)
        if has_scene_failure:
            logger.warning("CẢNH BÁO: Kịch bản có ít nhất 1 scene bị lỗi. Theo sơ đồ thiết kế: KHÔNG GHÉP CLIP DÀI! Lưu để người dùng tự sửa.")
            return False
        else:
            logger.info("Tất cả các scene thành công! Bắt đầu nối video hoàn chỉnh...")
            stitched_path = await self.stitcher.stitch(completed_scenes, self.output_dir)
            logger.info(f"Video đã hoàn thành xuất sắc: {stitched_path}")
            return True
`
  },
  {
    id: 'script_validator_py',
    name: 'script_validator.py',
    path: 'script_validator.py',
    language: 'python',
    description: 'Xác thực format kịch bản & phân nhánh qua Google Gemini API khi sai format',
    content: `"""
Script Validator & Formatter Module - Python 3.12.7
Diagram Branch:
  kịch bản -> đúng format chạy bình thường
           -> sai format -> sử dụng api gg chỉnh lại
"""
import json
import logging
from typing import Optional, Dict, Any
from google_genai_client import call_google_genai_format_script

logger = logging.getLogger("ScriptValidator")

class ScriptValidator:
    def __init__(self):
        pass

    async def validate_and_format(self, script_path: str) -> Optional[Dict[str, Any]]:
        logger.info(f"Đọc tệp kịch bản: {script_path}")
        try:
            with open(script_path, "r", encoding="utf-8") as f:
                raw_content = f.read()
        except FileNotFoundError:
            logger.error(f"Tệp kịch bản không tồn tại: {script_path}")
            return None

        # Kiểm tra đúng format json
        try:
            parsed = json.loads(raw_content)
            if self._is_valid_schema(parsed):
                logger.info("[NHÁNH CHÍNH]: Kịch bản đúng format -> Chạy bình thường.")
                return parsed
            else:
                logger.warning("[RẼ NHÁNH]: Kịch bản thiếu trường bắt buộc (scenes/characters).")
                return await self._fallback_google_api(raw_content)
        except json.JSONDecodeError as json_err:
            logger.warning(f"[RẼ NHÁNH LỖI]: JSON syntax error: {json_err}. Sử dụng API Google để chỉnh lại format.")
            return await self._fallback_google_api(raw_content)

    def _is_valid_schema(self, data: Dict[str, Any]) -> bool:
        return isinstance(data, dict) and "scenes" in data and isinstance(data["scenes"], list)

    async def _fallback_google_api(self, raw_text: str) -> Optional[Dict[str, Any]]:
        logger.info("Gọi Google Gemini API (gemini-3.8-flash) để sửa format kịch bản...")
        try:
            formatted_json_str = await call_google_genai_format_script(raw_text)
            parsed = json.loads(formatted_json_str)
            logger.info("Khôi phục format kịch bản thành công qua API Google!")
            return parsed
        except Exception as e:
            logger.error(f"Nhánh phục hồi qua Google API thất bại: {e}")
            return None
`
  },
  {
    id: 'character_gen_py',
    name: 'character_gen.py',
    path: 'character_gen.py',
    language: 'python',
    description: 'Sinh nhân vật: Tối ưu prompt AgnesAI hoặc API Google viết prompt, kiểm tra logic',
    content: `"""
Character Generation Module - Python 3.12.7
Diagram Branch:
  tạo nhân vật:
    - prompt có sẵn -> qua api AgnesAI -> tối ưu theo phong cách -> gửi lên Agnes lấy ảnh về
    - chưa có prompt -> yêu cầu api gg đọc và viết prompt -> gửi lên AgnesAI tạo ảnh
  Ràng buộc logic: tuổi, giới tính, tứ chi, gương mặt, mắt mũi miệng, đúng phong cách
"""
import logging
from typing import Dict, Any
from agnes_client import AgnesAIClient
from google_genai_client import call_google_genai_character_prompt

logger = logging.getLogger("CharacterGenerator")

class CharacterGenerator:
    def __init__(self):
        self.agnes_client = AgnesAIClient()

    async def create_character(self, char_info: Dict[str, Any]) -> Dict[str, Any]:
        char_name = char_info.get("name", "Unknown")
        prompt = char_info.get("prompt")
        style = char_info.get("style", "cinematic_anime")

        # Rẽ nhánh theo sơ đồ:
        if prompt and len(prompt.strip()) > 0:
            logger.info(f"[NHÁNH A]: Nhân vật '{char_name}' có prompt sẵn. Gửi qua AgnesAI text API tối ưu...")
            optimized_prompt = await self.agnes_client.optimize_character_prompt(prompt, style)
        else:
            logger.info(f"[NHÁNH B]: Chưa có prompt cho '{char_name}'. Yêu cầu API Google viết prompt...")
            optimized_prompt = await call_google_genai_character_prompt(char_info, style)

        # Ràng buộc logic bắt buộc
        optimized_prompt = self._enforce_character_logic(optimized_prompt, char_info)

        # Gửi lên AgnesAI để lấy ảnh về
        logger.info(f"Gửi prompt lên AgnesAI Image Generation...")
        image_result = await self.agnes_client.generate_image(optimized_prompt)

        return {
            "name": char_name,
            "prompt": optimized_prompt,
            "image_url": image_result.get("url"),
            "status": "nhân vật hoàn chỉnh"
        }

    def _enforce_character_logic(self, prompt: str, char_info: Dict[str, Any]) -> str:
        """Đảm bảo logic: tuổi, giới tính, tứ chi, gương mặt, mắt mũi miệng chuẩn, đúng phong cách"""
        logic_suffix = (
            ", anatomically correct limbs, perfect symmetrical facial features, clear eyes and mouth, "
            f"consistent age {char_info.get('age', 'young adult')}, gender {char_info.get('gender', 'neutral')}, masterwork lighting"
        )
        return prompt + logic_suffix
`
  },
  {
    id: 'scene_generator_py',
    name: 'scene_generator.py',
    path: 'scene_generator.py',
    language: 'python',
    description: 'Sinh hình ảnh cảnh (Scene): Xử lý prompt thế nhân vật, phân nhánh fallback AgnesAI & Google API',
    content: `"""
Scene Generator Module - Python 3.12.7
Diagram Branch:
  tạo scene: nhân vật đang ở ...
  Trường hợp 1 (Có nhân vật đã tạo):
    - Thay mô tả nhân vật bằng 'hãy thêm nhân vật vào bối cảnh...' bằng tiếng Anh phù hợp thời trang
    - Xử lý bằng AgnesAI Text API -> Nhận prompt -> Gửi AgnesAI tạo ảnh
    - NẾU LỖI: Thử lại tương tự với API Google -> Nhận prompt -> Gửi AgnesAI image2image/multi-image
  Trường hợp 2 (Không có nhân vật xuất hiện):
    - Text2Image -> AgnesAI mô tả tối ưu -> Gửi tạo ảnh
    - NẾU LỖI: Quay trở lại API Google tối ưu theo script -> Gửi AgnesAI tạo ảnh
  RÀNG BUỘC: Logic tự nhiên (gió, nước, ánh sáng), góc nhìn điện ảnh, góc nhìn khán giả.
"""
import logging
from typing import Dict, Any
from agnes_client import AgnesAIClient, AgnesAPIException
from google_genai_client import call_google_genai_scene_prompt

logger = logging.getLogger("SceneGenerator")

class SceneGenerator:
    def __init__(self):
        self.agnes_client = AgnesAIClient()

    async def generate_scene_visual(self, scene_info: Dict[str, Any], created_characters: Dict[str, Any]) -> Dict[str, Any]:
        scene_id = scene_info.get("id")
        raw_prompt = scene_info.get("prompt", "")
        chars_present = scene_info.get("characters_present", [])

        # Kiểm tra sự xuất hiện của nhân vật
        if chars_present and len(chars_present) > 0:
            return await self._handle_scene_with_character(scene_id, scene_info, chars_present, created_characters)
        else:
            return await self._handle_scene_without_character(scene_id, scene_info)

    async def _handle_scene_with_character(self, scene_id: int, scene_info: Dict[str, Any], chars_present: list, created_characters: dict):
        char_name = chars_present[0]
        setting_desc = scene_info.get("setting", scene_info.get("prompt"))
        logger.info(f"Scene #{scene_id}: Xuất hiện nhân vật '{char_name}'. Chuẩn bị prompt thay thế.")

        # Câu lệnh chuẩn theo sơ đồ: 'hãy thêm nhân vật vào bối cảnh...' bằng tiếng Anh với phong cách thời trang phù hợp
        instruction = f"Please add character '{char_name}' into the setting '{setting_desc}' with fashion style perfectly matching the environment."

        try:
            logger.info("[NHÁNH 1A]: Xử lý bằng AgnesAI Text API...")
            optimized_prompt = await self.agnes_client.optimize_scene_prompt(instruction, scene_info)
            optimized_prompt = self._enforce_cinematic_natural_logic(optimized_prompt)
            
            logger.info("Gửi prompt lên AgnesAI để tạo ảnh...")
            img_res = await self.agnes_client.generate_image(optimized_prompt)
            return {"image_path": img_res["url"], "branch": "AgnesAI_Direct_Text2Img", "prompt": optimized_prompt}

        except (AgnesAPIException, Exception) as agnes_err:
            # NHÁNH RẼ THEO SƠ ĐỒ KHI LỖI:
            logger.warning(f"[RẼ NHÁNH FALLBACK]: AgnesAI Text API lỗi ({agnes_err})! Thử lại với API Google...")
            try:
                google_prompt = await call_google_genai_scene_prompt(instruction, scene_info)
                google_prompt = self._enforce_cinematic_natural_logic(google_prompt)
                
                logger.info("Nhận prompt từ Google API. Gửi lên AgnesAI (image2image / multi-image)...")
                char_ref_img = created_characters.get(char_name, {}).get("image_url")
                img_res = await self.agnes_client.generate_image2image(google_prompt, reference_image=char_ref_img)
                return {"image_path": img_res["url"], "branch": "Google_API_Fallback_Image2Image", "prompt": google_prompt}
            except Exception as gg_err:
                logger.error(f"Cả 2 nhánh AgnesAI và Google API đều thất bại tại Scene #{scene_id}: {gg_err}")
                raise

    async def _handle_scene_without_character(self, scene_id: int, scene_info: Dict[str, Any]):
        raw_prompt = scene_info.get("prompt", "")
        logger.info(f"Scene #{scene_id}: Không có nhân vật. Sử dụng Text2Image thuần cảnh.")
        try:
            logger.info("[NHÁNH 2A]: Yêu cầu Agnes mô tả đúng kịch bản và tối ưu...")
            optimized_prompt = await self.agnes_client.optimize_text2image_prompt(raw_prompt)
            optimized_prompt = self._enforce_cinematic_natural_logic(optimized_prompt)
            img_res = await self.agnes_client.generate_image(optimized_prompt)
            return {"image_path": img_res["url"], "branch": "AgnesAI_Text2Image_Environment", "prompt": optimized_prompt}
        except Exception as e:
            # RẼ NHÁNH KHI GẶP LỖI
            logger.warning(f"[RẼ NHÁNH LỖI 2B]: Gặp lỗi! Trở lại API Google để tối ưu theo script: {e}")
            google_prompt = await call_google_genai_scene_prompt(raw_prompt, scene_info)
            google_prompt = self._enforce_cinematic_natural_logic(google_prompt)
            img_res = await self.agnes_client.generate_image(google_prompt)
            return {"image_path": img_res["url"], "branch": "Google_API_Fallback_Landscape", "prompt": google_prompt}

    def _enforce_cinematic_natural_logic(self, prompt: str) -> str:
        """
        Ràng buộc theo diagram:
        - Bắt buộc đúng logic tự nhiên gió, nước, ánh sáng
        - Chọn góc nhìn hoặc chụp tuyệt đối điện ảnh
        - Đúng phong cách người dùng chọn từ UI
        - Đúng logic người thường hoặc phép thuật
        - Đúng góc nhìn khán giả
        """
        cinematic_enhancement = (
            ", physically accurate atmospheric natural physics (wind, water, dynamic ambient lighting), "
            "ultra cinematic camera perspective, master shot composition, audience immersion POV"
        )
        return prompt + cinematic_enhancement
`
  },
  {
    id: 'sfx_manager_py',
    name: 'sfx_manager.py',
    path: 'sfx_manager.py',
    language: 'python',
    description: 'Quản lý âm thanh hiệu ứng (SFX): Ưu tiên thư viện -> Thư mục UPDATE -> Tải nguồn ngoài',
    content: `"""
SFX Manager Module - Python 3.12.7
Diagram Branch:
  chọn SFX nếu có:
    - lấy từ thư viện ưu tiên
    - tìm trong thư mục UPDATE
    - tìm nguồn ngoài nếu có tải về sử dụng, lưu vào thư mục UPDATE
"""
import os
import logging
from typing import Optional

logger = logging.getLogger("SFXManager")

class SFXManager:
    def __init__(self, lib_dir="./sfx_library", update_dir="./UPDATE"):
        self.lib_dir = lib_dir
        self.update_dir = update_dir
        os.makedirs(self.update_dir, exist_ok=True)

    async def resolve_sfx(self, keyword: Optional[str]) -> Optional[str]:
        if not keyword:
            return None

        # 1. Lấy từ thư viện ưu tiên
        lib_path = os.path.join(self.lib_dir, f"{keyword}.mp3")
        if os.path.exists(lib_path):
            logger.info(f"[SFX NHÁNH 1]: Tìm thấy âm thanh '{keyword}' trong thư viện ưu tiên.")
            return lib_path

        # 2. Tìm trong thư mục UPDATE
        update_path = os.path.join(self.update_dir, f"{keyword}.mp3")
        if os.path.exists(update_path):
            logger.info(f"[SFX NHÁNH 2]: Tìm thấy âm thanh '{keyword}' trong thư mục UPDATE.")
            return update_path

        # 3. Tìm nguồn ngoài nếu có, tải về sử dụng và lưu vào thư mục UPDATE
        logger.info(f"[SFX NHÁNH 3]: '{keyword}' không có sẵn -> Tải từ nguồn bên ngoài và lưu vào {self.update_dir}...")
        downloaded = await self._download_external_sfx(keyword)
        return downloaded

    async def _download_external_sfx(self, keyword: str) -> str:
        dest_path = os.path.join(self.update_dir, f"{keyword}.mp3")
        # Giả lập download
        with open(dest_path, "w") as f:
            f.write("# dummy sfx binary data")
        logger.info(f"Đã lưu SFX tải về vào: {dest_path}")
        return dest_path
`
  },
  {
    id: 'video_stitcher_py',
    name: 'video_stitcher.py',
    path: 'video_stitcher.py',
    language: 'python',
    description: 'Ghép video: Nối các đoạn scene lại, áp dụng quy tắc dừng khi có scene lỗi',
    content: `"""
Video Stitcher Module - Python 3.12.7
Diagram Branch:
  hoàn thành scene -> tiếp tục lặp lại đến hết -> nối các đoạn scene lại
  QUY TẮC BẮT BUỘC:
  - Nếu lỗi 1 trong các công đoạn: bỏ qua không ghép, làm tiếp scene kế -> người dùng tự sửa
  - Có lỗi scene: KHÔNG GHÉP CLIP DÀI -> làm tập tiếp theo
"""
import logging
from typing import List

logger = logging.getLogger("VideoStitcher")

class VideoStitcher:
    async def stitch(self, completed_scenes: List[Any], output_dir: str) -> str:
        # Kiểm tra an toàn trước khi ghép
        for sc in completed_scenes:
            if not getattr(sc, 'success', True):
                raise ValueError(f"Không thể ghép clip dài vì Scene #{sc.scene_id} bị lỗi!")

        output_file = f"{output_dir}/final_rendered_episode.mp4"
        logger.info(f"Ghép thành công {len(completed_scenes)} cảnh thành video dài: {output_file}")
        return output_file
`
  }
];

export const SAMPLE_ERROR_SCENARIOS = [
  {
    id: 'scen_1',
    title: 'AgnesAI Text API 502 Bad Gateway (Cần kích hoạt nhánh Fallback Google API)',
    branchId: 'node_agnes_scene_error',
    errorLog: `2026-09-17 09:12:04 [INFO] [PipelineOrchestrator] -- Đang xử lý Scene #2 --
2026-09-17 09:12:04 [INFO] [SceneGenerator] Scene #2: Xuất hiện nhân vật 'Aiko'. Chuẩn bị prompt thay thế.
2026-09-17 09:12:04 [INFO] [SceneGenerator] [NHÁNH 1A]: Xử lý bằng AgnesAI Text API...
2026-09-17 09:12:07 [ERROR] [AgnesAIClient] HTTP 502 Bad Gateway - Cloudflare Gateway Time-out for api.agnesai.internal/v1/prompt-optimize
Traceback (most recent call last):
  File "scene_generator.py", line 47, in _handle_scene_with_character
    optimized_prompt = await self.agnes_client.optimize_scene_prompt(instruction, scene_info)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "agnes_client.py", line 32, in optimize_scene_prompt
    raise AgnesAPIException("AgnesAI upstream server 502 Bad Gateway - Connection refused")
agnes_client.AgnesAPIException: AgnesAI upstream server 502 Bad Gateway - Connection refused
2026-09-17 09:12:07 [CRITICAL] [PipelineOrchestrator] Scene #2 failed unexpectedly. Pipeline halted without branching!`,
    expectedBranch: 'node_gg_scene_fallback',
    explanation: 'Scene #2 gặp lỗi 502 từ AgnesAI Text API. Nhưng mã nguồn cũ chưa bắt đúng exception AgnesAPIException và chưa tự động phân nhánh sang Google API theo sơ đồ thiết kế. Cần bổ sung xử lý fallback sang nhánh Google API -> AgnesAI Image2Image.'
  },
  {
    id: 'scen_2',
    title: 'Kịch bản JSON sai format (Cần phân nhánh sang Google Gemini API sửa format)',
    branchId: 'node_script_bad_format',
    errorLog: `2026-09-17 09:15:20 [INFO] [PipelineOrchestrator] === BẮT ĐẦU XỬ LÝ TẬP/KỊCH BẢN #1: episode_01.json ===
2026-09-17 09:15:20 [INFO] [ScriptValidator] Đọc tệp kịch bản: episode_01.json
2026-09-17 09:15:20 [WARNING] [ScriptValidator] [RẼ NHÁNH LỖI]: JSON syntax error: Expecting property name enclosed in double quotes: line 14 column 5 (char 428).
Traceback (most recent call last):
  File "pipeline.py", line 45, in run_single_script
    script_data = await self.validator.validate_and_format(script_file)
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "script_validator.py", line 38, in validate_and_format
    return await self._fallback_google_api(raw_content)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "script_validator.py", line 48, in _fallback_google_api
    raise NotImplementedError("Google GenAI client format hook is not wired correctly")
NotImplementedError: Google GenAI client format hook is not wired correctly
2026-09-17 09:15:21 [ERROR] [PipelineOrchestrator] Không thể phân tích kịch bản sau khi thử nhánh dự phòng!`,
    expectedBranch: 'node_gg_script_fix',
    explanation: 'Kịch bản đầu vào có lỗi dấu phẩy thừa hoặc cú pháp JSON không chuẩn. Mã hiện tại bị NotImplementedError ở hàm gọi Google API để chuẩn hóa lại kịch bản. Cần triển khai đầy đủ adapter gọi Gemini để parse lại script theo đúng cấu trúc.'
  },
  {
    id: 'scen_3',
    title: 'Vi phạm logic tự nhiên & góc nhìn điện ảnh trong Scene Generator',
    branchId: 'node_logic_constraint',
    errorLog: `2026-09-17 09:18:40 [INFO] [SceneGenerator] Scene #3: Không có nhân vật. Sử dụng Text2Image thuần cảnh.
2026-09-17 09:18:41 [WARNING] [SceneAuditor] Logic check FAILED: Prompt sinh cảnh thiếu ràng buộc vật lý tự nhiên (gió, nước, ánh sáng) và góc nhìn khán giả!
Prompt: 'A magical castle floating in the sky'
Traceback (most recent call last):
  File "scene_generator.py", line 75, in _handle_scene_without_character
    assert "cinematic" in prompt and "lighting" in prompt, "Missing natural/cinematic constraints"
AssertionError: Missing natural/cinematic constraints as mandated by Diagram Node lqeOELplXSleSpO8RsCG-91!
2026-09-17 09:18:41 [ERROR] [PipelineOrchestrator] LỖI TẠI SCENE #3: Missing natural/cinematic constraints`,
    expectedBranch: 'node_logic_constraint',
    explanation: 'Prompt sinh cảnh không đáp ứng khối ràng buộc nghiêm ngặt trong sơ đồ: Bắt buộc đúng logic tự nhiên gió, nước, ánh sáng; chọn góc nhìn hoặc chụp tuyệt đối điện ảnh; đúng góc nhìn khán giả.'
  }
];

export const INITIAL_TIMELINE_METRICS: ProgressMetric[] = [
  { timestamp: '09:00', detected: 8, inProgress: 6, fallbackHandled: 2, resolved: 0, successRate: 25 },
  { timestamp: '09:05', detected: 11, inProgress: 5, fallbackHandled: 4, resolved: 2, successRate: 40 },
  { timestamp: '09:10', detected: 12, inProgress: 4, fallbackHandled: 6, resolved: 5, successRate: 58 },
  { timestamp: '09:15', detected: 14, inProgress: 3, fallbackHandled: 9, resolved: 8, successRate: 72 },
  { timestamp: '09:20', detected: 14, inProgress: 2, fallbackHandled: 11, resolved: 11, successRate: 85 },
  { timestamp: '09:25', detected: 15, inProgress: 1, fallbackHandled: 13, resolved: 14, successRate: 93 },
];

export const INITIAL_SCENES_STATUS: SceneStatus[] = [
  { sceneId: 1, title: 'Cảnh mở đầu (Kịch bản chuẩn)', status: 'SUCCESS', currentBranch: 'Nhánh chính', errorCount: 0, durationMs: 2400 },
  { sceneId: 2, title: 'Gặp gỡ nhân vật chính (Agnes 502 -> Google API Fallback)', status: 'FALLBACK_RESOLVED', currentBranch: 'Google API Fallback (Image2Image)', errorCount: 1, durationMs: 4100 },
  { sceneId: 3, title: 'Bối cảnh hoàng hôn ven hồ (Ràng buộc điện ảnh & vật lý)', status: 'FALLBACK_RESOLVED', currentBranch: 'AgnesAI Text2Image', errorCount: 0, durationMs: 2900 },
  { sceneId: 4, title: 'Đoạn hội thoại có SFX (UPDATE Folder Fallback)', status: 'SUCCESS', currentBranch: 'SFX UPDATE Library', errorCount: 0, durationMs: 1800 },
  { sceneId: 5, title: 'Cảnh chiến đấu cao trào (Lỗi bỏ qua, tiếp tục cảnh 6)', status: 'ERROR_SKIPPED', currentBranch: 'Skipped - User Fix Required', errorCount: 1, durationMs: 1200 },
  { sceneId: 6, title: 'Kết thúc tập phim', status: 'SUCCESS', currentBranch: 'Nhánh chính', errorCount: 0, durationMs: 2600 }
];
