import { SfxItem } from '../types';

export interface SfxCategory {
  id: string;
  name: string;
  description: string;
}

export const SFX_CATEGORIES: SfxCategory[] = [
  { id: 'weather', name: 'Thời Tiết & Thiên Nhiên', description: 'Mưa bão, sấm chớp, gió biển, sóng vỗ vách đá' },
  { id: 'interior', name: 'Nội Thất & Tòa Nhà', description: 'Cửa gỗ kẽo kẹt, sàn nhà cót két, đồng hồ tích tắc' },
  { id: 'mystery', name: 'Kinh Dị & Siêu Nhiên', description: 'Tiếng thì thầm bí ẩn, drone rùng rợn, âm thanh ma ảo' },
  { id: 'actions', name: 'Hành Động & Bước Chân', description: 'Bước chân trên sỏi/bùn, tiếng tra chìa khóa đồng, lật trang sách' },
  { id: 'cinematic', name: 'Điện Ảnh & Hiệu Ứng', description: 'Whoosh chuyển cảnh, âm trầm kịch tính (Sub Boom)' }
];

export const FREE_COMMERCIAL_SFX: SfxItem[] = [
  {
    id: 'sfx_rain_cliff',
    name: 'Mưa Bão Ven Biển (Coastal Storm Rain)',
    category: 'weather',
    description: 'Tiếng mưa rơi dày hạt kết hợp gió rít tạt ngang qua vách đá và sóng biển xa xăm.',
    license: 'CC0 Public Domain (Miễn phí thương mại 100%)',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/518/518888_6142149-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/518/518888_6142149-lq.mp3',
    duration: '0:35'
  },
  {
    id: 'sfx_wind_howl',
    name: 'Gió Rít Đêm Tối (Cold Wind Howl)',
    category: 'weather',
    description: 'Tiếng gió thổi qua khe cửa sổ gỗ lạnh lẽo, âm vực trầm mang sắc thái cô độc.',
    license: 'Pixabay Free Commercial License',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/467/467144_9497060-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/467/467144_9497060-lq.mp3',
    duration: '0:28'
  },
  {
    id: 'sfx_thunder_distant',
    name: 'Sấm Rền Vang Xa (Distant Thunder Rolling)',
    category: 'weather',
    description: 'Tiếng sấm gầm trầm thấp từ chân trời vọng lại qua lớp sương mù dày đặc.',
    license: 'CC0 Public Domain',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/442/442943_9159316-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/442/442943_9159316-lq.mp3',
    duration: '0:14'
  },
  {
    id: 'sfx_creaky_door',
    name: 'Cánh Cửa Sắt Han Gỉ Mở (Rusty Iron Gate)',
    category: 'interior',
    description: 'Tiếng rít kim loại han gỉ của cánh cổng sắt lâu năm cọ vào bản lề ẩm ướt.',
    license: 'CC0 Public Domain',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3',
    duration: '0:07'
  },
  {
    id: 'sfx_wood_floor',
    name: 'Bước Chân Sàn Gỗ Cũ Kỹ (Creaking Wood Floorboards)',
    category: 'interior',
    description: 'Âm thanh ván gỗ sồi chịu sức nặng kêu răng rắc khi có người bước qua hành lang tối.',
    license: 'Pixabay Free Commercial License',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/415/415079_5121236-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/415/415079_5121236-lq.mp3',
    duration: '0:12'
  },
  {
    id: 'sfx_antique_clock',
    name: 'Đồng Hồ Quả Lắc Cổ Tích Tắc (Grandfather Clock Ticking)',
    category: 'interior',
    description: 'Nhịp đập đều đặn, đanh gọn của đồng hồ cổ tạo sự căng thẳng và hồi hộp trong gian phòng vắng.',
    license: 'CC0 Public Domain',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/404/404557_5121236-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/404/404557_5121236-lq.mp3',
    duration: '0:20'
  },
  {
    id: 'sfx_brass_keys',
    name: 'Chùm Chìa Khóa Đồng Va Đập (Brass Key Ring Clinking)',
    category: 'actions',
    description: 'Tiếng kim loại đồng vang nhẹ bên thắt lưng người quản gia Silas Wren khi bước đi.',
    license: 'CC0 Public Domain',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/448/448080_9159316-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/448/448080_9159316-lq.mp3',
    duration: '0:05'
  },
  {
    id: 'sfx_footsteps_mud',
    name: 'Bước Chân Trên Đường Dốc Bùn Lầy (Footsteps in Wet Mud)',
    category: 'actions',
    description: 'Tiếng ủng cao su dẫm xuống đất nhão và sỏi ướt dưới cơn mưa tầm tã.',
    license: 'Pixabay Free Commercial License',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/428/428859_5121236-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/428/428859_5121236-lq.mp3',
    duration: '0:10'
  },
  {
    id: 'sfx_eerie_drone',
    name: 'Âm Hưởng Rùng Rợn Huyền Bí (Dark Ambient Drone)',
    category: 'mystery',
    description: 'Nền âm thanh u ám bí hiểm gợi cảm giác căn nhà đang thở và quan sát nhân vật.',
    license: 'CC0 Public Domain',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/415/415804_5121236-lq.mp3',
    duration: '0:30'
  },
  {
    id: 'sfx_cinematic_sub_boom',
    name: 'Cú Đánh Trầm Điện Ảnh (Cinematic Deep Sub Hit)',
    category: 'cinematic',
    description: 'Âm trầm sub-bass chấn động đánh dấu khoảnh khắc giật mình hoặc phát hiện bí mật.',
    license: 'Pixabay Free Commercial License',
    commercial_free: true,
    preview_url: 'https://cdn.freesound.org/previews/566/566436_11861866-lq.mp3',
    download_url: 'https://cdn.freesound.org/previews/566/566436_11861866-lq.mp3',
    duration: '0:06'
  }
];

export const COMMERCIAL_SFX_SOURCES = [
  {
    name: 'Pixabay Sound Effects',
    url: 'https://pixabay.com/sound-effects/',
    license: 'Pixabay License (Hoàn toàn miễn phí thương mại, không bản quyền, không cần ghi công)',
    format: 'MP3 320kbps / WAV',
    note: 'Kho âm thanh phong phú nhất, tải trực tiếp không cần đăng ký tài khoản.'
  },
  {
    name: 'Freesound.org (Bộ lọc CC0)',
    url: 'https://freesound.org/search/?q=&f=license%3A%22Creative+Commons+0%22',
    license: 'Creative Commons 0 - Public Domain',
    format: 'WAV / FLAC / MP3',
    note: 'Hơn 100.000 âm thanh thực tế do cộng đồng âm thanh toàn cầu đóng góp tự do.'
  },
  {
    name: 'ZapSplat Community',
    url: 'https://www.zapsplat.com/',
    license: 'Standard Commercial (Ghi credit) hoặc Gold License',
    format: 'WAV 96kHz / MP3',
    note: 'Âm thanh tiêu chuẩn điện ảnh Hollywood, cập nhật hàng tuần.'
  },
  {
    name: 'AudioCraft / AudioGen (Meta AI)',
    url: 'https://github.com/facebookresearch/audiocraft',
    license: 'MIT / Open Source (Chạy local trên Python)',
    format: 'WAV 32kHz',
    note: 'Tạo hiệu ứng âm thanh bằng câu lệnh văn bản prompt trực tiếp trên GPU máy tính.'
  }
];
