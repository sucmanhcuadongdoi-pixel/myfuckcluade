# 🎬 HƯỚNG DẪN SỬ DỤNG AI VIDEO PIPELINE STUDIO
> **Phiên bản dành cho nhóm sản xuất phim nội bộ (Team Internal Build)**  
> Tự động hóa toàn bộ quy trình: Quét văn xuôi ➔ Phân cảnh ➔ Tạo Character Sheet ➔ Lồng tiếng TTS (Kokoro / Gradio Local) ➔ Sinh ảnh AgnesAI & Gemini ➔ Hòa âm SFX thương mại ➔ Render Video 24fps hoàn chỉnh.

---

## 1. Yêu Cầu Môi Trường Cần Thiết (Prerequisites)

Để hệ thống hoạt động trơn tru và đầy đủ mọi tính năng offline lẫn online, máy tính của bạn cần cài đặt các môi trường sau:

### 1.1. Node.js (Bắt buộc cho giao diện Web & Server API)
- **Phiên bản khuyến nghị:** Node.js **v18.x** hoặc **v20.x LTS** (trở lên).
- **Kiểm tra:** Mở Terminal / CMD / PowerShell và gõ:
  ```bash
  node -v
  npm -v
  ```
- **Nếu chưa có:** Tải bộ cài chính thức tại [nodejs.org](https://nodejs.org/).

---

### 1.2. Python (Dành cho Pipeline TTS Offline, Kokoro & VALL-E X)
- **Phiên bản khuyến nghị:** Python **3.10.x** đến **3.12.7** (Khuyên dùng **3.12.7** 64-bit).
- **Lưu ý quan trọng khi cài trên Windows:** Nhớ tích chọn **☑ Add python.exe to PATH** ở màn hình cài đặt đầu tiên.

---

### 1.3. FFmpeg (Bắt buộc để ghép Audio, SFX và Render Video MP4 24fps)
- **Kiểm tra:**
  ```bash
  ffmpeg -version
  ```
- **Cách cài nhanh nhất:**
  - **Windows (PowerShell Run as Admin):**
    ```powershell
    winget install "Gyan.FFmpeg"
    # Hoặc qua Chocolatey:
    choco install ffmpeg
    ```
  - **macOS:**
    ```bash
    brew install ffmpeg
    ```
  - **Ubuntu / Linux:**
    ```bash
    sudo apt update && sudo apt install -y ffmpeg
    ```

---

## 2. Thao Tác Tự Tìm Path Của Môi Trường Python Nếu Không Thấy

Khi tool báo lỗi *“Không tìm thấy Python executable”* hoặc bạn không biết Python của mình đang nằm ở đâu, hãy làm theo các bước dưới đây:

### Cách 1: Sử dụng công cụ tự quét (Auto-Detect) tích hợp sẵn trong Tool
1. Mở tab **⚙ Cấu Hình (Config)** trong giao diện ứng dụng.
2. Tại mục **Đường dẫn Python (Python Path)**, bấm nút **🔍 Tự động quét tìm Python**.
3. Hệ thống sẽ tự chạy lệnh tìm kiếm và tự động điền đường dẫn chính xác vào cấu hình.

---

### Cách 2: Tìm đường dẫn thủ công bằng dòng lệnh

#### Trên Windows:
Mở **Command Prompt (CMD)** hoặc **PowerShell** và chạy một trong các lệnh sau:
```cmd
where python
```
Hoặc với Python Launcher:
```cmd
py --list-paths
```
**Kết quả mẫu:**
```
C:\Users\<Tên_User>\AppData\Local\Programs\Python\Python312\python.exe
C:\Program Files\Python312\python.exe
```

#### Trên macOS / Linux:
Mở **Terminal** và chạy:
```bash
which python3
# Hoặc:
type -a python3
readlink -f $(which python3)
```
**Kết quả mẫu:**
```
/usr/bin/python3
/usr/local/bin/python3
/opt/homebrew/bin/python3
```

---

### Cách 3: Tìm trong các môi trường ảo (Virtualenv / Conda)
- **Nếu dùng Anaconda / Miniconda:**
  - Windows: `C:\Users\<Tên_User>\anaconda3\python.exe` hoặc `C:\Users\<Tên_User>\miniconda3\python.exe`
- **Nếu dùng venv trong dự án:**
  - Windows: `<Thư_mục_tool>\venv\Scripts\python.exe`
  - Linux/Mac: `<Thư_mục_tool>/venv/bin/python`

---

## 3. Kho Âm Thanh SFX Miễn Phí Dùng Thương Mại (Commercial Free)

Hệ thống được thiết kế để nhóm có thể tự do phát hành video lên YouTube, Facebook, TikTok hoặc các nền tảng thương mại khác mà **không sợ bị gậy bản quyền (Copyright Strike)**.

Dưới đây là các nguồn SFX tốt nhất mà bạn có thể tải về và gắn vào thư mục `source/sfx/`:

| Nguồn SFX | Giấy phép (License) | Mô tả & Cách tải | Dùng Thương Mại? |
|-----------|---------------------|-------------------|------------------|
| **Pixabay Sound Effects** | Pixabay License (Miễn phí 100%) | `https://pixabay.com/sound-effects/`<br>Tải trực tiếp file `.mp3`, không cần tài khoản, miễn phí 100% cho mọi mục đích thương mại, không bắt buộc ghi credit. | ✅ CÓ (Khuyên dùng số 1) |
| **Freesound.org (Bộ lọc CC0)** | Creative Commons 0 (Public Domain) | `https://freesound.org/`<br>Tìm kiếm với bộ lọc **License: Creative Commons 0**. Toàn bộ quyền được từ bỏ cho cộng đồng, sử dụng thương mại không cần ghi công. | ✅ CÓ (Kho phong phú nhất) |
| **ZapSplat** | Standard Free (Có Credit) / Gold | `https://www.zapsplat.com/`<br>Âm thanh chất lượng phòng thu chuẩn điện ảnh. Bản miễn phí chỉ cần ghi công trong phần mô tả video. | ✅ CÓ (Kèm credit) |
| **BBC Sound Effects** | RemArc / Free Commercial via Pro Sound Effects | Kho 16.000+ âm thanh chân thực đời sống, thiên nhiên. | ⚠️ Lưu ý chọn gói dùng thương mại |
| **Meta AudioCraft / AudioGen AI** | MIT / Open Source (Chạy Local) | AI tự tạo hiệu ứng âm thanh theo mô tả văn bản (VD: *"rain moving sideways in ocean wind"*). Chạy trực tiếp trên máy không phụ thuộc website ngoài. | ✅ CÓ (Tự sinh độc quyền) |

---

## 4. Tích Hợp API Gradio TTS Cục Bộ (`http://127.0.0.1:7768`)

Tool hỗ trợ kết nối trực tiếp đến Gradio TTS Server đang chạy trên máy của bạn:

1. **Khởi động server Gradio TTS của bạn:** Đảm bảo server đang lắng nghe tại `http://127.0.0.1:7768/`.
2. **Cấu hình trong Tool:**
   - Trong thanh bên trái (**Studio Sidebar**) hoặc tab **Cấu Hình**: Chọn TTS Engine là **Local Gradio TTS Server (`http://127.0.0.1:7768`)**.
   - Hỗ trợ các endpoint:
     - `/vall_e_x_generate`: Sinh âm thanh với các tham số text, prompt, language, accent, mode, seed.
     - `/minimax_cloud_tts`: Kết nối cloud voice HD nếu có key.
     - `/lambda`: Kiểm tra trạng thái kết nối server.
3. **Nghe thử giọng (Voice Preview):**
   - Bấm nút **🎧 Nghe Thử** cạnh mục chọn giọng để phát một câu mẫu trước khi render toàn bộ tập.
4. **Điều chỉnh tốc độ đọc (Speed Slider):**
   - Có thể điều chỉnh tốc độ từ **0.5x đến 2.0x** (chuẩn điện ảnh tối ưu là **1.0x - 1.05x**).

---

## 5. Quy Trình Sản Xuất Video Chi Tiết (Step-by-Step)

```
[Nhập Văn Xuôi / Kịch Bản]
            ⬇
[Tự Động Quét & Chia Cảnh (Scenes) + Nhận Diện Nhân Vật (Characters)]
            ⬇
[Chọn Phong Cách Hình Ảnh (3 Mục: Điện ảnh/Ma pháp, Đời thường, Trẻ em)]
            ⬇
[Sinh Character Reference Sheets (Đồng bộ nhân vật)]
            ⬇
[Chạy Tập Lẻ hoặc Chạy Hết Script Thư Mục (Batch Run)]
            ⬇
[Hòa Âm TTS + SFX + Render H.264 24fps ➔ File Video Hoàn Chỉnh]
```

### Nguyên tắc Đặt Lại Series (Reset Series):
- Nếu muốn làm lại video bằng phong cách mới hoặc giọng đọc khác: Nhấn nút **⟲ Đặt Lại Series (Giữ Script)**.
- **Quy tắc an toàn tuyệt đối:** Hệ thống sẽ xóa sạch toàn bộ ảnh render, audio tts, video clip và cache tạm, nhưng **bảo toàn 100% toàn bộ kịch bản, lời thoại narration và prompt** để bạn không bao giờ bị mất công sức biên kịch.
