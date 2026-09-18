import { EpisodeData, SeriesInfo, CharacterInfo, ApiKeyItem } from '../types';

export const INITIAL_SERIES: SeriesInfo[] = [
  {
    series_id: 'the-listening-house',
    name: 'The Listening House',
    voice: 'af_bella',
    visual_style: 'painterly oil painting texture, hyperdetailed dark fantasy concept art, deep navy and near-black palette, desaturated muted subjects, cold moonlight blue accent only, hard split lighting, volumetric shadow, no anime, no bright colors, no photorealistic, cinematic dark atmosphere',
    episodes: [
      {
        ep_id: 'ep01',
        file: 'ep01.json',
        title: 'EP01 - The House Keeps Room Tone',
        scenes: 44,
        status: 'new'
      },
      {
        ep_id: 'ep02',
        file: 'ep02.json',
        title: 'EP02 - Behind The North Wall',
        scenes: 12,
        status: 'new'
      }
    ]
  },
  {
    series_id: 'blood-and-silence',
    name: 'Blood and Silence',
    voice: 'af_sarah',
    visual_style: 'Cinematic photorealistic drama, Sony FX3, dramatic lighting, gothic atmosphere',
    episodes: [
      {
        ep_id: 'ep01',
        file: 'ep01.json',
        title: 'EP01 - The Empty Shop',
        scenes: 3,
        status: 'done',
        ran_at: 'Hôm nay',
        final: '/output/blood-and-silence/ep01_final.mp4'
      }
    ]
  }
];

export const THE_LISTENING_HOUSE_EP01: EpisodeData = {
  episode: 'EP01 - The House Keeps Room Tone',
  series: 'the-listening-house',
  scenes: [
    {
      title: 'Iron Gate',
      script: 'The road ended at the iron gate. Elise left the engine running while rain blurred the house beyond the windshield. Three floors. No light anywhere. She switched off the car and listened to the sudden size of the weather. Alone.',
      characters: 'Elise',
      prompt: 'cinematic wide establishing shot at the iron entrance gate, exactly one visible person total: Elise Rowan, standing beside her recently parked car and facing the Bellweather House beyond the gate; the car, iron gate and entire three-story house must all be clearly recognizable in the composition, no other people, no duplicate Elise, no cast lineup, Elise woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers dark raincoat old studio headphones around neck, Bellweather House exterior: isolated coastal Maine mansion black Atlantic cliffs wind-bent grass three-story dark stone house all windows unlit rain moving sideways in ocean wind distant lighthouse glow barely visible no neighboring buildings, cold storm light, isolation and controlled arrival, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: coastal wind | texture: rain, distant surf | event:',
      note: ''
    },
    {
      title: 'Cliff Path',
      script: 'Wind pressed rain sideways across the cliff path. Elise carried two equipment cases toward the front steps. The house did not emerge from darkness so much as interrupt it, a heavier shape between ocean and sky. Nothing moved behind it.',
      characters: 'Elise',
      prompt: 'wide shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather House exterior: isolated coastal Maine mansion black Atlantic cliffs wind-bent grass three-story dark stone house most windows unlit rain moving sideways in ocean wind distant lighthouse glow barely visible no neighboring buildings, single cold pewter moonlight, house scale and exposed movement, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: coastal wind | texture: rain, distant surf | event:',
      note: ''
    },
    {
      title: 'Open Door',
      script: 'Silas opened the door before she knocked. Water shone on his work coat. He took one case without greeting, turned into the unlit hall, and left the door open behind him for her to follow. Rain entered across the threshold.',
      characters: 'Elise, Silas',
      prompt: 'medium shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Silas Wren man 61 weathered narrow face short iron-gray hair gray beard kept close heavy dark work coat worn boots old brass key ring at belt expression patient but never relaxed, Bellweather House exterior: isolated coastal Maine mansion black Atlantic cliffs wind-bent grass three-story dark stone house most windows unlit rain moving sideways in ocean wind distant lighthouse glow barely visible no neighboring buildings, single cold pewter moonlight, guarded threshold and professional restraint, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: coastal wind | texture: rain at doorway | event:',
      note: ''
    },
    {
      title: 'Stored Cold',
      script: 'The west staircase held the cold differently from outside. Elise stopped beneath the carved banister and removed one glove. Her fingers tightened once around the recorder. Wind pressed against the upper windows, then released. The runner stayed perfectly still beneath.',
      characters: 'Elise',
      prompt: 'low angle looking up, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather west staircase: broad dark wooden staircase worn runner carpet tall carved banister landing disappearing into unlit second floor faded portraits turned toward stairs high ceiling long vertical shadows, single muted amber practical light, first bodily awareness of the interior, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: soft stair resonance | texture: wind against upper windows | event:',
      note: ''
    },
    {
      title: 'Numbered Boxes',
      script: 'Silas led her to the archive room. One reading lamp burned over the restoration table. Thirty-four numbered boxes waited beneath it. Elise counted them before setting down her case, then counted them again without explaining why. The lamp remained steady.',
      characters: 'Elise',
      prompt: 'wide shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, single muted amber practical light, methodical inventory before unease, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: rain on glass | texture: subtle tape hiss, wooden settling | event:',
      note: ''
    },
    {
      title: 'Room Tone',
      script: 'She checked humidity, wall temperature, outlet stability, and table vibration. Every reading fell within workable limits. The room microphone showed a low continuous floor. Rain. Tape hiss. Occasional timber movement. Nothing she could not name. Her pencil kept moving steadily.',
      characters: 'Elise',
      prompt: 'medium shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, single muted amber practical light, technical calm and attentive listening, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: subtle tape hiss | texture: rain on glass | event:',
      note: ''
    },
    {
      title: 'Written Timestamps',
      script: 'Silas placed the brass keys beside her notebook. Elise asked whether previous contractors had reported equipment faults. He said no. She asked about unusual sounds. He looked toward the hall and told her to keep written timestamps. Then he waited.',
      characters: 'Elise, Silas',
      prompt: 'medium shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Silas Wren man 61 weathered narrow face short iron-gray hair gray beard kept close heavy dark work coat worn boots old brass key ring at belt expression patient but never relaxed, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, single muted amber practical light, guarded exchange with withheld context, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: rain on glass | texture: soft coat fabric, wooden settling | event:',
      note: ''
    },
    {
      title: 'Amber Circle',
      script: 'At nine seventeen, Elise began the room tone capture. She sat motionless beside the restoration table. The lamp made a small amber island around her hands. Beyond it, the walnut walls disappeared before reaching the corners. Her breathing slowed deliberately.',
      characters: 'Elise',
      prompt: 'wide shot, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, single muted amber practical light, patient listening inside a small pool of light, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: subtle tape hiss | texture: reduce rain to near-silence | event:',
      note: ''
    },
    {
      title: 'First Settle',
      script: 'A single board compressed above her. The sound held for two seconds, then released. Elise lifted one headphone cup from her ear. She wrote 9:19:08, upper floor timber, probable thermal contraction, then replaced the headphone. She kept writing.',
      characters: 'Elise',
      prompt: 'close-up, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, hard shadow split one side desaturated opposite near-black, first acoustic irregularity and controlled attention, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: rain on glass | texture: reduce to near-silence | event: single wood settle then brief silence',
      note: ''
    },
    {
      title: 'Sleeve B',
      script: 'She opened Box One. Six brown wax cylinders lay in cotton sleeves, each marked in faded pencil. The labels listed dates, surnames, and room names. One sleeve carried only a neat capital B and no date. The cotton smelled dry.',
      characters: 'Elise',
      prompt: 'extreme close-up, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, single muted amber practical light, archival curiosity with one unexplained label, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: subtle tape hiss | texture: cotton sleeve rustle | event:',
      note: ''
    },
    {
      title: 'Piano Practice',
      script: 'The first cylinder contained a woman practicing scales at a piano. Her voice entered occasionally, counting under her breath. Elise reduced surface noise, corrected speed drift, and marked a recurring scrape beneath the final three notes. She marked its time.',
      characters: 'Elise',
      prompt: 'close-up, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, single muted amber practical light, professional restoration and ordinary human residue, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: subtle tape hiss | texture: wax surface noise | event: archival piano playback low',
      note: ''
    },
    {
      title: 'Dry Scrape',
      script: 'The scrape returned on the second pass. It was short, dry, and close to the recording horn. Elise isolated the frequency band, replayed it twice, and found no speech hidden beneath it. She moved on. The room gave nothing back.',
      characters: 'Elise',
      prompt: 'close-up, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers old studio headphones usually resting around neck small silver field recorder in one hand calm posture masking hyperawareness, Bellweather archive room: large abandoned music room dark walnut walls tall rain-covered windows long wooden restoration table wax cylinders arranged numbered boxes old reel equipment modern field recorder one reading lamp empty corners swallowed by shadow Atlantic darkness beyond glass, hard shadow split one side desaturated opposite near-black, focused uncertainty around a small recorded scrape, painterly hyperdetailed dark gothic atmosphere',
      fx: 'foundation: subtle tape hiss | texture: reduce ambience | event: dry scrape from cylinder',
      note: ''
    }
  ]
};

export const BLOOD_AND_SILENCE_EP01: EpisodeData = {
  episode: 'EP01 - The Empty Shop',
  series: 'blood-and-silence',
  scenes: [
    {
      title: 'The Empty Shop',
      script: 'Sera knew because she had been listening to it the way you listen to something you expect to go wrong. The shop was empty. Not just of customers, but of the small sounds that made emptiness bearable.',
      prompt: 'Close-up pale young woman face, sharp cheekbones, dark eyes scanning the room, gothic shop interior, candlelight from the left, shadow cutting across her cheek',
      fx: 'dark ambient wind, old building creak',
      tts_status: 'done',
      img_status: 'done',
      sfx_status: 'done',
      clip_status: 'done',
      audio_path: 's1_audio.mp3',
      image_path: 's1_image.png',
      clip_path: 's1_clip.mp4'
    },
    {
      title: 'The Symbol',
      script: 'It was carved into the wood of the counter. Deep and deliberate. The kind of mark that does not happen by accident. She pressed one finger to the edge of it and felt the grain of the wood, still raw.',
      prompt: 'Ancient carved symbol on dark wooden counter, candlelight flickering, shadows pooling around the edges, gothic horror atmosphere, extreme close detail',
      fx: 'heartbeat slow, candle flicker, silence tension',
      tts_status: 'done',
      img_status: 'done',
      sfx_status: 'done',
      clip_status: 'done',
      audio_path: 's2_audio.mp3',
      image_path: 's2_image.png',
      clip_path: 's2_clip.mp4'
    },
    {
      title: 'Something Behind Her',
      script: 'She did not hear him. That was the thing she would remember later, in the small hours when sleep refused to come. There had been no sound. No footstep, no breath. And yet when she turned, he was standing three feet away.',
      prompt: 'Extreme close-up woman face, eyes wide, pale skin, terror expression, dark gothic background, dramatic split lighting, moonlight from above',
      fx: 'heartbeat intense, thunder distant',
      tts_status: 'done',
      img_status: 'done',
      sfx_status: 'done',
      clip_status: 'done',
      audio_path: 's3_audio.mp3',
      image_path: 's3_image.png',
      clip_path: 's3_clip.mp4'
    }
  ]
};

export const INITIAL_CHARACTERS: CharacterInfo[] = [
  {
    name: 'Elise Rowan',
    role: 'main',
    prompt: 'character reference sheet, Elise Rowan woman 33 straight ash-brown hair cut just below jaw pale hazel eyes tired intelligent face narrow build charcoal wool sweater faded black trousers dark raincoat studio headphones around neck, neutral pose facing camera, plain dark background, hyperdetailed dark gothic painterly oil texture, no anime, no photorealism, 1024x1024',
    has_sheet: true,
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=faces'
  },
  {
    name: 'Silas Wren',
    role: 'supporting',
    prompt: 'character reference sheet, Silas Wren man 61 weathered narrow face short iron-gray hair gray beard kept close heavy dark work coat worn boots old brass key ring at belt expression patient but never relaxed, neutral pose facing camera, plain dark background, hyperdetailed dark gothic painterly oil texture, no anime, no photorealism, 1024x1024',
    has_sheet: true,
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=faces'
  },
  {
    name: 'Sera',
    role: 'main',
    prompt: 'character reference sheet, Sera young woman 22 pale sharp cheekbones dark piercing eyes gothic dark linen shirt candlelight rim, neutral pose, plain dark studio background, cinematic dark fantasy concept art, 1024x1024',
    has_sheet: true,
    image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=faces'
  }
];

export const INITIAL_AGNES_KEYS: ApiKeyItem[] = [
  {
    id: 'agn_1',
    key: 'sk-agnes-prod-alpha-9921',
    label: 'Agnes AI #1 (Primary)',
    status: 'valid',
    usageCount: 142,
    lastUsed: 'Vừa xong'
  },
  {
    id: 'agn_2',
    key: 'sk-agnes-fast-backup-4412',
    label: 'Agnes AI #2 (Backup Pool)',
    status: 'valid',
    usageCount: 88,
    lastUsed: '2 phút trước'
  },
  {
    id: 'agn_3',
    key: 'sk-agnes-nightly-cluster-7719',
    label: 'Agnes AI #3 (High Concurrency)',
    status: 'idle',
    usageCount: 24,
    lastUsed: '15 phút trước'
  }
];

export const INITIAL_GOOGLE_KEYS: ApiKeyItem[] = [
  {
    id: 'gg_1',
    key: 'AIzaSyDemoKeyPrimaryForGemini38Flash01',
    label: 'Google Gemini #1 (Main Quota)',
    status: 'valid',
    usageCount: 231,
    lastUsed: 'Vừa xong'
  },
  {
    id: 'gg_2',
    key: 'AIzaSyDemoKeyBackupFailoverGemini02',
    label: 'Google Gemini #2 (Failover / Prompt Repair)',
    status: 'valid',
    usageCount: 95,
    lastUsed: '5 phút trước'
  },
  {
    id: 'gg_3',
    key: 'AIzaSyDemoKeyFreeTierBurstGemini03',
    label: 'Google Gemini #3 (Burst Queue)',
    status: 'idle',
    usageCount: 42,
    lastUsed: '30 phút trước'
  }
];
