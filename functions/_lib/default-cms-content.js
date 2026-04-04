export const TRANSLATION_FIELD_GROUPS = [
  {
    id: 'hero',
    title: '首頁與自介',
    fields: [
      { key: 'hero.lead', label: 'Hero 自介', type: 'textarea', rows: 6 },
      { key: 'about.p1', label: 'About 第一段', type: 'textarea', rows: 3 },
      { key: 'about.p2', label: 'About 第二段', type: 'textarea', rows: 6 },
    ],
  },
  {
    id: 'snapshot',
    title: 'Profile Snapshot',
    fields: [
      { key: 'about.list.1.desc', label: 'Academic Background', type: 'textarea', rows: 3 },
      { key: 'about.list.2.desc', label: 'Current Direction', type: 'textarea', rows: 3 },
      { key: 'about.list.3.desc', label: 'Long-term Vision', type: 'textarea', rows: 3 },
      { key: 'about.list.4.desc', label: 'Beyond the Lab', type: 'textarea', rows: 6 },
    ],
  },
  {
    id: 'focus',
    title: 'Focus 與聯絡區',
    fields: [
      { key: 'focus.list.1.desc', label: '六足機器人控制', type: 'textarea', rows: 4 },
      { key: 'focus.list.2.desc', label: '數學與工程建模', type: 'textarea', rows: 4 },
      { key: 'focus.list.3.desc', label: '熱流與跨域整合', type: 'textarea', rows: 4 },
      { key: 'contact.desc', label: 'Contact 說明', type: 'textarea', rows: 4 },
      { key: 'footer.motto', label: 'Footer Motto', type: 'text' },
    ],
  },
];

export const PRIVATE_PROFILE_TRANSLATION_GROUPS = [
  {
    id: 'intro',
    title: '熟客模式首頁與 About',
    fields: [
      { key: 'hero.lead', label: 'Hero 自介', type: 'textarea', rows: 5 },
      { key: 'about.p1', label: 'About 第一段', type: 'textarea', rows: 3 },
      { key: 'about.p2', label: 'About 第二段', type: 'textarea', rows: 5 },
    ],
  },
  {
    id: 'identity',
    title: '熟客模式顯示文字',
    fields: [
      { key: 'about.profile.title', label: 'Profile 標題', type: 'text' },
      { key: 'about.list.1.desc', label: 'Academic Background', type: 'textarea', rows: 3 },
      { key: 'about.list.2.desc', label: 'Current Direction', type: 'textarea', rows: 3 },
      { key: 'about.tl.3.p', label: '現在在做的事', type: 'textarea', rows: 5 },
      { key: 'bg.lead', label: '學經歷導言', type: 'textarea', rows: 4 },
    ],
  },
  {
    id: 'education',
    title: '學經歷區塊',
    fields: [
      { key: 'bg.tl.1.year', label: '學經歷 1 標題', type: 'text' },
      { key: 'bg.tl.1.p', label: '學經歷 1 內容', type: 'text' },
      { key: 'bg.tl.2.year', label: '學經歷 2 標題', type: 'text' },
      { key: 'bg.tl.2.p', label: '學經歷 2 內容', type: 'text' },
      { key: 'bg.tl.3.year', label: '學經歷 3 標題', type: 'text' },
      { key: 'bg.tl.3.p', label: '學經歷 3 內容', type: 'text' },
      { key: 'bg.tl.4.year', label: '學經歷 4 標題', type: 'text' },
      { key: 'bg.tl.4.p', label: '學經歷 4 內容', type: 'text' },
    ],
  },
  {
    id: 'research',
    title: '研究與方向描述',
    fields: [
      { key: 'focus.list.1.desc', label: '六足機器人控制', type: 'textarea', rows: 4 },
      { key: 'research.pub1.desc', label: 'Research 卡片 1', type: 'textarea', rows: 4 },
      { key: 'research.pub2.desc', label: 'Research 卡片 2', type: 'textarea', rows: 4 },
    ],
  },
];

export const DEFAULT_PUBLIC_TRANSLATIONS = {
  zh: {
    'hero.lead': '我是 Jason Liao，持續投入數學、控制與機器人開發。 我喜歡理論推導，也喜歡把抽象模型一步一步做成能驗證、能實作、能真正派上用場的系統。 我始終相信：真正有力量的技術，不只是能算、能做，更要能被理解、被傳遞，最後真的為世界帶來一點改變。',
    'about.p1': '我來自台灣，目前在工程與數理領域持續學習與研究。',
    'about.p2': '我喜歡推導，也喜歡把抽象模型轉化成可驗證、可模擬、可部署的系統。從流體力學、熱流、應用數學，到控制理論、機器人與強化學習，這些年我一直在找一條夢想之路：讓自己真正喜歡的理論，最後能在工程裡落地，變成能被使用、也能對世界有幫助的東西。',
    'about.list.1.desc': '持續在工程、數學與控制導向的問題之間來回工作。',
    'about.list.2.desc': '目前的核心工作聚焦在機器人控制、學習式方法，以及和傳統方法的嚴謹比較。',
    'about.list.3.desc': '希望未來能把理論、工程與真實世界接得更近，做出既紮實又真正有用的研究。',
    'about.list.4.desc': '學業以外，我最熱愛還是棒球。我是中華隊的忠實球迷，也是中信兄弟球迷；對我來說，棒球從來不只是比賽，而是一種很台灣、很熱血，也很真誠的情感連結。我很喜歡那種全場一起應援、全台灣人為同一件事團結起來、替場上拚搏的球員撐到最後一刻的氛圍。日本職棒我喜歡讀賣巨人，美國職棒我喜歡紐約洋基。除此之外，我也打 Valorant，喜歡競爭、節奏與臨場判斷帶來的快感。',
    'focus.list.1.desc': '我現在的工作主題是六足機器人 RHex 的控制。最主要的方向，是用強化學習來控制機器人，並和傳統控制方法做比較，看看在穩定性、適應性和效果上，能不能找到更好的解法。',
    'focus.list.2.desc': '我一直很重視推導與建模。對我來說，數學不是附屬工具，而是幫助我把問題看清楚、把系統定義清楚、把方法站穩的根本。',
    'focus.list.3.desc': '雖然現在的主軸在控制與機器人，但我對熱流、數理與跨領域整合依然很有興趣。未來如果能把這些看似分散的東西慢慢接起來，我會很期待。',
    'contact.desc': '直接聯絡資訊與較完整的個人檔案只在熟客模式中開放。公開版本中，GitHub 仍然是最適合的聯絡入口。',
    'footer.motto': '以理性立身，以熱血行路。',
  },
  en: {
    'hero.lead': "I'm Jason Liao. I keep working across mathematics, control systems, and robotics. I enjoy theoretical derivation, and I love turning abstract models step by step into systems that can be verified, implemented, and put to real use. I've always believed that truly powerful technology isn't just about computing or building — it must also be understood, shared, and ultimately make a difference in the world.",
    'about.p1': "I'm from Taiwan, and I continue to study and work across engineering and the mathematical sciences.",
    'about.p2': "I love derivation, and I love transforming abstract models into systems that can be verified, simulated, and deployed. From fluid mechanics and thermodynamics to applied mathematics, control theory, robotics, and reinforcement learning — I've been searching for a path where the theories I truly care about can land in engineering and become something useful to the world.",
    'about.list.1.desc': 'Working across engineering, mathematics, and control-oriented problem solving.',
    'about.list.2.desc': 'Current work centers on robot control, learning-based methods, and rigorous comparison with classical approaches.',
    'about.list.3.desc': 'I hope to bridge theory, engineering, and the real world more closely — producing research that is both rigorous and genuinely useful.',
    'about.list.4.desc': "Outside academics, baseball is my greatest passion. I'm a devoted fan of Chinese Taipei and the CTBC Brothers. For me, baseball has never been just a game — it's a deeply Taiwanese, passionate, and sincere emotional connection. I love the atmosphere of an entire stadium cheering together, the whole nation united behind the players fighting until the very last moment. In NPB I follow the Yomiuri Giants, and in MLB the New York Yankees. I also play Valorant — I enjoy the thrill of competition, rhythm, and split-second decision-making.",
    'focus.list.1.desc': 'I am currently focused on hexapod robot control. The main direction is using reinforcement learning and comparing it with classical control methods to look for better results in stability, adaptability, and overall effectiveness.',
    'focus.list.2.desc': "I've always valued derivation and modeling. For me, mathematics isn't an auxiliary tool — it's the foundation that helps me see problems clearly, define systems precisely, and validate methods rigorously.",
    'focus.list.3.desc': "While my current focus is on control and robotics, I remain deeply interested in thermofluids and cross-disciplinary integration. If I can gradually connect these seemingly separate fields in the future, that would be truly exciting.",
    'contact.desc': 'Direct contact details and the fuller personal profile are available only in Acquaintance Mode. Publicly, GitHub remains the best place to reach me.',
    'footer.motto': 'Stand on reason, walk with passion.',
  },
};

export const DEFAULT_PRIVATE_PROFILE = {
  translations: {
    zh: {
      'hero.lead': '我是 Jason Liao。更完整的個人背景與學經歷只在熟客模式中顯示。',
      'about.p1': '我來自台灣，目前持續在工程與數理領域學習與研究。較完整的學歷資訊只在熟客模式顯示。',
      'about.p2': '我喜歡推導，也喜歡把抽象模型轉化成可驗證、可模擬、可部署的系統。更具體的學術背景與研究脈絡會在熟客模式中補充。',
      'about.profile.title': 'Jason Liao',
      'about.list.1.desc': '較完整的學術背景只在熟客模式中開放。',
      'about.list.2.desc': '較完整的研究方向與實驗室脈絡只在熟客模式中開放。',
      'about.tl.3.p': '目前的研究內容與所屬脈絡，會在熟客模式中提供較完整版本。',
      'bg.lead': '較完整的學經歷與照片只在熟客模式中開放。公開版本先保留較概括的輪廓。',
      'bg.tl.1.year': '國小',
      'bg.tl.1.p': '在台北建立最早期的學習基礎',
      'bg.tl.2.year': '國中',
      'bg.tl.2.p': '持續在數學與物理上累積興趣',
      'bg.tl.3.year': '高中',
      'bg.tl.3.p': '在科學與工程之間逐漸確認方向',
      'bg.tl.4.year': '大學',
      'bg.tl.4.p': '目前的工作核心放在控制、建模與機器人研究',
      'focus.list.1.desc': '更完整的研究單位與題目描述，只在熟客模式中顯示。',
      'research.pub1.desc': '更完整的研究脈絡與目前所在單位，只在熟客模式中顯示。',
      'research.pub2.desc': '更完整的學術底子與跨域背景，只在熟客模式中顯示。',
    },
    en: {
      'hero.lead': 'I am Jason Liao. A fuller version of my background and academic profile is shown only in Acquaintance Mode.',
      'about.p1': 'I am from Taiwan and continue to work across engineering and the mathematical sciences. The fuller academic version is shown only in Acquaintance Mode.',
      'about.p2': 'I love derivation, and I love turning abstract models into systems that can be verified, simulated, and deployed. A more detailed academic and research narrative appears only in Acquaintance Mode.',
      'about.profile.title': 'Jason Liao',
      'about.list.1.desc': 'A fuller academic background is shown only in Acquaintance Mode.',
      'about.list.2.desc': 'A fuller description of my current research direction is shown only in Acquaintance Mode.',
      'about.tl.3.p': 'A more complete version of my current research direction is available only in Acquaintance Mode.',
      'bg.lead': 'The fuller version of my academic background and portraits is shared only in Acquaintance Mode. The public version keeps things intentionally broad.',
      'bg.tl.1.year': 'Elementary',
      'bg.tl.1.p': 'An early academic foundation built in Taipei',
      'bg.tl.2.year': 'Middle School',
      'bg.tl.2.p': 'A continued interest in mathematics and physics',
      'bg.tl.3.year': 'High School',
      'bg.tl.3.p': 'A period of committing more fully to science and engineering',
      'bg.tl.4.year': 'University',
      'bg.tl.4.p': 'Current work centered on control, modeling, and robotics',
      'focus.list.1.desc': 'The fuller lab and research description is available only in Acquaintance Mode.',
      'research.pub1.desc': 'The fuller research context and institution are shown only in Acquaintance Mode.',
      'research.pub2.desc': 'The fuller academic foundation and cross-disciplinary path are shown only in Acquaintance Mode.',
    },
  },
  fields: {
    email: '',
    emailHref: '',
    phone: '',
    instagram: '',
    instagramHref: '',
  },
  images: {
    primary: {
      dataUrl: '',
      alt: { zh: 'Portrait', en: 'Portrait' },
      caption: { zh: '', en: '' },
    },
    secondary: {
      dataUrl: '',
      alt: { zh: 'Portrait', en: 'Portrait' },
      caption: { zh: '', en: '' },
    },
  },
};

export const DEFAULT_UPDATES = [];
export const DEFAULT_POSTS = [];
