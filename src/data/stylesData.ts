export interface StylePreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'cinematic_supernatural' | 'slice_of_life_romance' | 'children_kids';
  prompt: string;
  tags: string[];
}

export interface StyleCategory {
  id: 'cinematic_supernatural' | 'slice_of_life_romance' | 'children_kids';
  title: string;
  shortTitle: string;
  description: string;
  accentColor: string;
  presets: StylePreset[];
}

export const STYLE_CATEGORIES: StyleCategory[] = [
  {
    id: 'cinematic_supernatural',
    title: 'Nghệ thuật điện ảnh - Siêu nhiên - Phép thuật',
    shortTitle: 'Điện ảnh & Siêu nhiên',
    description: 'Phong cách huyền bí, kinh dị tâm lý, ánh sáng kịch tính, ma pháp và tiên hiệp giả tưởng kỳ ảo',
    accentColor: 'text-purple-400 border-purple-500/40 bg-purple-950/20',
    presets: [
      {
        id: 'dark-gothic-oil',
        name: 'Dark Gothic Oil Painting',
        subtitle: 'Sơn dầu cổ điển tối màu, ánh trăng lạnh, bóng đổ kịch tính',
        category: 'cinematic_supernatural',
        tags: ['Gothic', 'Oil Texture', 'Dark Fantasy'],
        prompt:
          'painterly oil painting texture, hyperdetailed dark fantasy concept art, deep navy and near-black palette, desaturated muted subjects, cold moonlight blue accent only, hard split lighting, volumetric shadow, no anime, no bright colors, cinematic dark atmosphere, masterpiece 4k'
      },
      {
        id: 'cinematic-sony-fx3',
        name: 'Cinematic Sony FX3 35mm',
        subtitle: 'Điện ảnh chân thực, kịch tính, ống kính 85mm f1.4, khói ma mị',
        category: 'cinematic_supernatural',
        tags: ['Photorealistic', '35mm Film', 'Supernatural'],
        prompt:
          'Cinematic photorealistic drama, 35mm film grain, Sony FX3, 85mm f1.4 lens, dramatic split key lighting, shallow depth of field, atmospheric supernatural fog, cold desaturated color grade, eerie presence, 4k master'
      },
      {
        id: 'mystic-high-fantasy',
        name: 'Huyền Huyễn & Ma Pháp Cổ Đại',
        subtitle: 'Phép thuật ngũ hành, phù chú rực sáng, sương mờ tiên cảnh',
        category: 'cinematic_supernatural',
        tags: ['Tiên Hiệp', 'Magic Aura', 'Unreal Engine 5'],
        prompt:
          'Epic mystic high fantasy, glowing ancient arcane runes, ethereal magical particle aura, floating spell circles, misty celestial mountain temple, hyperdetailed volumetric lighting, unreal engine 5 render style, ethereal glowing colors, dark mystical aura'
      },
      {
        id: 'eldritch-cosmic-horror',
        name: 'Dark Eldritch & Cyber-Occult',
        subtitle: 'Vũ trụ tối Lovecraftian, cổ ngữ rực sáng, kinh dị siêu thực',
        category: 'cinematic_supernatural',
        tags: ['Cosmic Horror', 'Occult', 'Bioluminescence'],
        prompt:
          'Lovecraftian dark fantasy, cosmic occult mystery, eldritch glowing sigils, ominous storm skies, bio-luminescent tendrils, cinematic moody framing, deep contrast shadows, surreal horror concept art, eerie cinematic atmosphere'
      }
    ]
  },
  {
    id: 'slice_of_life_romance',
    title: 'Đời thường - Lãng mạn',
    shortTitle: 'Đời thường & Lãng mạn',
    description: 'Tông màu ấm áp, cảm xúc lắng đọng, phim nhựa hoài niệm, anime hoàng hôn và nhịp sống nhẹ nhàng',
    accentColor: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
    presets: [
      {
        id: 'kdrama-melodrama',
        name: 'K-Drama Melodrama Lãng Mạn',
        subtitle: 'Nắng chiều tà qua rèm cửa, bokeh mềm mại, ấm áp sâu lắng',
        category: 'slice_of_life_romance',
        tags: ['K-Drama', 'Golden Hour', 'Warm Tones'],
        prompt:
          'Korean romance melodrama aesthetic, warm golden hour sunbeams through window sheer curtains, soft bokeh background, gentle emotional expression, pastel earthy tones, clean aesthetic, natural soft skin texture, 35mm lens, romantic cinematic framing'
      },
      {
        id: 'makoto-shinkai-sunset',
        name: 'Anime Makoto Shinkai',
        subtitle: 'Bầu trời hoàng hôn rực rỡ, mây bồng bềnh, giọt mưa phố thị',
        category: 'slice_of_life_romance',
        tags: ['Anime Keyframe', 'Sunset Clouds', 'Vibrant Mood'],
        prompt:
          'Makoto Shinkai style romantic anime keyframe, magnificent sunset clouds with orange and violet gradients, sparkling light reflections in rain puddles, emotive lovers, ultra high-definition anime background art, ethereal romantic vibe, breathtaking lighting'
      },
      {
        id: 'vintage-portra-400',
        name: 'Vintage Kodak Portra 400',
        subtitle: 'Màu phim thập niên 90, quán cà phê phố mưa, hoài niệm dịu êm',
        category: 'slice_of_life_romance',
        tags: ['Kodak Film', '90s Nostalgia', 'Coffee Shop'],
        prompt:
          'Nostalgic 1990s vintage film aesthetic, Kodak Portra 400 colors, gentle grain, rainy city coffee shop interior, warm amber tungsten lamps, quiet intimate atmosphere, candid photography style, tender romance, muted warmth'
      },
      {
        id: 'cozy-urban-slice',
        name: 'Phố Thị Ấm Áp (Warm City)',
        subtitle: 'Đèn đêm dịu mắt, hơi trà bốc khói, nhịp sống bình yên thường nhật',
        category: 'slice_of_life_romance',
        tags: ['Cozy Urban', 'Night Rain', 'Peaceful'],
        prompt:
          'Cozy modern urban life, soft rainy street reflections, warm incandescent storefront lighting, quiet evening bookstore, peaceful and gentle mood, tender slice of life cinematography, warm inviting tones, atmospheric comfort'
      }
    ]
  },
  {
    id: 'children_kids',
    title: 'Dành riêng cho trẻ em',
    shortTitle: 'Dành cho trẻ em',
    description: 'Đồ họa hoạt hình 3D Pixar, tranh minh họa màu nước, đất nặn đáng yêu và thế giới cổ tích nhiệm màu',
    accentColor: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
    presets: [
      {
        id: 'pixar-3d-animation',
        name: 'Hoạt Hình 3D Pixar / Disney',
        subtitle: 'Đồ họa 3D mềm mại, mắt to tròn biểu cảm, màu sắc rực rỡ vui tươi',
        category: 'children_kids',
        tags: ['3D Pixar', 'Cheerful', 'Subsurface Scattering'],
        prompt:
          '3D animated feature film style, Pixar and Disney aesthetic, expressive big eyes, vibrant cheerful colors, soft ray-traced subsurface scattering, warm friendly lighting, whimsical delightful atmosphere, child-safe cute design, ultra-detailed 8k render'
      },
      {
        id: 'storybook-watercolor',
        name: 'Màu Nước Sách Thiếu Nhi',
        subtitle: 'Tranh minh họa cổ tích vẽ tay mộc mạc, nét cọ màu nước pastel',
        category: 'children_kids',
        tags: ['Storybook', 'Hand-drawn', 'Soft Pastel'],
        prompt:
          'Classic children storybook illustration, soft watercolor and delicate colored pencil textures, charming friendly animal characters, dreamy pastel rainbow hues, storybook paper texture, comforting fairytale art, adorable and gentle, bedtime story aesthetic'
      },
      {
        id: 'cute-claymation',
        name: 'Đất Nặn Dễ Thương (Cute Clay)',
        subtitle: 'Tạo hình đất sét stop-motion ngộ nghĩnh, bo tròn vui nhộn',
        category: 'children_kids',
        tags: ['Claymation', 'Stop-motion', 'Miniature'],
        prompt:
          'Whimsical claymation stop-motion aesthetic, smooth plasticine clay textures, rounded cute shapes, handcrafted felt details, bright primary colors, fun miniature diorama set, cheerful sunny atmosphere, playful cartoon world, tactile feel'
      },
      {
        id: 'ghibli-countryside',
        name: 'Studio Ghibli Đồng Quê Cổ Tích',
        subtitle: 'Đồng cỏ xanh ngát đung đưa, mây trắng bồng bềnh, thiên nhiên trong trẻo',
        category: 'children_kids',
        tags: ['Ghibli Anime', 'Nature Tale', 'Whimsical'],
        prompt:
          'Hayao Miyazaki Studio Ghibli style, lush green rolling hills, fluffy white summer cumulus clouds, vibrant wild flowers, bright azure blue sky, nostalgic hand-drawn 2D animation, innocent pure childhood warmth, magical nature spirit, gentle breeze'
      }
    ]
  }
];

export const ALL_STYLE_PRESETS: StylePreset[] = STYLE_CATEGORIES.flatMap((c) => c.presets);
