/**
 * Seed data module for the PRODUCTS_DATA KV namespace.
 *
 * These functions return default data that is written to KV when a key
 * is empty on first access. The data is hardcoded as plain JS objects
 * because server-side Cloudflare Functions cannot import frontend TS
 * modules (different build/bundler environment).
 *
 * The values are manually extracted from:
 *   - src/data/products.ts (16 seed products)
 *   - src/admin/adminStorage.ts (DEFAULT_CONTACT_INFO, DEFAULT_COMPANY_INFO)
 */

// ---------------------------------------------------------------------------
// Types (minimal inline definitions — no frontend imports)
// ---------------------------------------------------------------------------

interface LocalizedString {
  en: string;
  zh: string;
  ru: string;
  ar: string;
  ko: string;
}

interface ApplicableModel {
  brand: string;
  model: string;
  year: string;
  engine?: string;
}

interface Product {
  id: number;
  name: LocalizedString;
  model: string;
  category: string;
  image: string;
  description: LocalizedString;
  slug: string;
  oemNumber?: string;
  images?: string[];
  applicableModels?: ApplicableModel[];
  specifications?: Record<string, string>;
  moq?: number;
  packaging?: string;
  leadTime?: string;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
}

interface ContactInfo {
  whatsapp: string;
  email: string;
  phone: string;
  address: LocalizedString;
  wechatId: string;
  wechatQrImage: string;
  whatsappQrImage: string;
}

interface AdvantageInfo {
  title: LocalizedString;
  desc: LocalizedString;
}

interface CompanyInfo {
  name: LocalizedString;
  title: LocalizedString;
  description1: LocalizedString;
  description2: LocalizedString;
  stats: { stat1: string; stat2: string; stat3: string; stat4: string };
  advantages: {
    oem: AdvantageInfo;
    shipping: AdvantageInfo;
    price: AdvantageInfo;
    exportAdv: AdvantageInfo;
  };
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Generate a URL-friendly slug from category + model. */
function makeSlug(category: string, model: string): string {
  return `${category}-${model}`.toLowerCase().replace(/\s+/g, '-');
}

// ---------------------------------------------------------------------------
// Seed Products (16 items — mirrors src/data/products.ts)
// ---------------------------------------------------------------------------

export function getSeedProducts(): Product[] {
  return [
    {
      id: 1,
      model: 'CHG-2024',
      category: 'engine',
      image: 'https://picsum.photos/seed/engine1/400/300',
      slug: makeSlug('engine', 'CHG-2024'),
      oemNumber: 'OEM-90919-02231',
      specifications: { Material: 'MLS Steel', Thickness: '1.2mm', Temperature: '-40°C to 250°C' },
      moq: 100,
      packaging: 'Carton box, 50 pcs/carton',
      leadTime: '15-30 days',
      featured: true,
      applicableModels: [
        { brand: 'Toyota', model: 'Camry', year: '2018-2023', engine: '2.5L' },
        { brand: 'Toyota', model: 'RAV4', year: '2019-2023', engine: '2.5L' },
      ],
      name: {
        en: 'Cylinder Head Gasket',
        zh: '气缸盖垫片',
        ru: 'Прокладка головки блока цилиндров',
        ar: 'جوان كتلة أسطوانات الرأس',
        ko: '실린더 헤드 가스켓',
      },
      description: {
        en: 'Premium OEM-grade cylinder head gasket',
        zh: '优质OEM级气缸盖垫片',
        ru: 'Прокладка ГБЦ премиум-класса OEM',
        ar: 'جوان رأس أسطوانات بجودة OEM متميزة',
        ko: '프리미엄 OEM급 실린더 헤드 가스켓',
      },
    },
    {
      id: 2,
      model: 'PRS-1850',
      category: 'engine',
      image: 'https://picsum.photos/seed/engine2/400/300',
      slug: makeSlug('engine', 'PRS-1850'),
      oemNumber: 'OEM-13011-2A000',
      specifications: { Material: 'Chrome Steel', 'Ring Count': '3 per piston', 'Top Ring Width': '1.5mm' },
      moq: 200,
      packaging: 'Carton box, 100 sets/carton',
      leadTime: '15-30 days',
      featured: true,
      name: {
        en: 'Piston Ring Set',
        zh: '活塞环组',
        ru: 'Комплект поршневых колец',
        ar: 'طقم حلقات المكبس',
        ko: '피스톤 링 세트',
      },
      description: {
        en: 'High-performance piston ring set',
        zh: '高性能活塞环组',
        ru: 'Комплект поршневых колец высокой производительности',
        ar: 'طقم حلقات مكبس عالية الأداء',
        ko: '고성능 피스톤 링 세트',
      },
    },
    {
      id: 3,
      model: 'ETB-3000',
      category: 'engine',
      image: 'https://picsum.photos/seed/engine3/400/300',
      slug: makeSlug('engine', 'ETB-3000'),
      oemNumber: 'OEM-13540-0T010',
      specifications: { Material: 'Rubber + Kevlar', Teeth: '153', Width: '25mm' },
      moq: 50,
      packaging: 'Individual box',
      leadTime: '15-30 days',
      name: {
        en: 'Engine Timing Belt',
        zh: '发动机正时皮带',
        ru: 'Ремень ГРМ двигателя',
        ar: 'حزام توقيت المحرك',
        ko: '엔진 타이밍 벨트',
      },
      description: {
        en: 'Durable timing belt for precise engine timing',
        zh: '耐用正时皮带，确保发动机精准正时',
        ru: 'Прочный ремень ГРМ для точной синхронизации двигателя',
        ar: 'حزام توقيت متين لتوقيت محرك دقيق',
        ko: '정밀한 엔진 타이밍을 위한 내구성 있는 타이밍 벨트',
      },
    },
    {
      id: 4,
      model: 'BPS-4400',
      category: 'chassis',
      image: 'https://picsum.photos/seed/brake1/400/300',
      slug: makeSlug('chassis', 'BPS-4400'),
      oemNumber: 'OEM-04465-0E020',
      specifications: { Material: 'Ceramic Compound', 'Friction Coeff': '0.42', 'Operating Temp': '-40°C to 600°C' },
      moq: 100,
      packaging: 'Carton box, 20 sets/carton',
      leadTime: '10-25 days',
      featured: true,
      applicableModels: [
        { brand: 'Honda', model: 'Civic', year: '2016-2021', engine: '1.5L Turbo' },
        { brand: 'Honda', model: 'Accord', year: '2018-2022', engine: '1.5L Turbo' },
      ],
      name: {
        en: 'Brake Pad Set',
        zh: '刹车片组',
        ru: 'Комплект тормозных колодок',
        ar: 'طقم فحمات الفرامل',
        ko: '브레이크 패드 세트',
      },
      description: {
        en: 'Ceramic brake pads for superior stopping power',
        zh: '陶瓷刹车片，提供卓越制动性能',
        ru: 'Керамические тормозные колодки с превосходной тормозной силой',
        ar: 'فحمات فرامل سيراميكية لقوة كبح فائقة',
        ko: '우수한 제동력을 위한 세라믹 브레이크 패드',
      },
    },
    {
      id: 5,
      model: 'BDR-5500',
      category: 'chassis',
      image: 'https://picsum.photos/seed/brake2/400/300',
      slug: makeSlug('chassis', 'BDR-5500'),
      oemNumber: 'OEM-43512-0W010',
      specifications: { Material: 'Cast Iron', Diameter: '280mm', 'Vented': 'Yes' },
      moq: 50,
      packaging: 'Individual box with rust protection',
      leadTime: '10-25 days',
      name: {
        en: 'Brake Disc Rotor',
        zh: '刹车盘',
        ru: 'Тормозной диск',
        ar: 'قرص الفرامل',
        ko: '브레이크 디스크 로터',
      },
      description: {
        en: 'Ventilated brake disc rotor',
        zh: '通风式刹车盘',
        ru: 'Вентилируемый тормозной диск',
        ar: 'قرص فرامل مهوّى',
        ko: '통풍형 브레이크 디스크 로터',
      },
    },
    {
      id: 6,
      model: 'BC-6600',
      category: 'chassis',
      image: 'https://picsum.photos/seed/brake3/400/300',
      slug: makeSlug('chassis', 'BC-6600'),
      oemNumber: 'OEM-19-B2620-0A',
      specifications: { Material: 'Aluminum Alloy', Piston: '4-piston', 'Mount Type': 'Bracket mount' },
      moq: 30,
      packaging: 'Individual box',
      leadTime: '20-35 days',
      name: {
        en: 'Brake Caliper',
        zh: '刹车卡钳',
        ru: 'Тормозной суппорт',
        ar: 'مقبض الفرامل',
        ko: '브레이크 캘리퍼',
      },
      description: {
        en: 'Heavy-duty brake caliper assembly',
        zh: '重型刹车卡钳总成',
        ru: 'Суппорт тормозной усиленной конструкции',
        ar: 'تجميعة مقبض فرامل ثقيل',
        ko: '중부하용 브레이크 캘리퍼 어셈블리',
      },
    },
    {
      id: 7,
      model: 'SA-7700',
      category: 'chassis',
      image: 'https://picsum.photos/seed/susp1/400/300',
      slug: makeSlug('chassis', 'SA-7700'),
      oemNumber: 'OEM-48530-09K90',
      specifications: { Type: 'Gas-charged', 'Stroke Length': '200mm', 'Mount Type': 'Eye/Pin' },
      moq: 50,
      packaging: 'Individual box',
      leadTime: '15-30 days',
      featured: true,
      applicableModels: [
        { brand: 'Nissan', model: 'Altima', year: '2013-2019', engine: '2.5L' },
        { brand: 'Nissan', model: 'Sentra', year: '2014-2019', engine: '1.8L' },
      ],
      name: {
        en: 'Shock Absorber',
        zh: '减震器',
        ru: 'Амортизатор',
        ar: 'ممتص الصدمات',
        ko: '쇼크 업소버',
      },
      description: {
        en: 'Gas-charged shock absorber for smooth ride',
        zh: '充气减震器，确保平顺驾乘',
        ru: 'Газонаполненный амортизатор для плавного хода',
        ar: 'ممتص صدمات يعمل بالغاز لقيادة سلسة',
        ko: '부드러운 승차감을 위한 가스 충전식 쇼크 업소버',
      },
    },
    {
      id: 8,
      model: 'CS-8800',
      category: 'chassis',
      image: 'https://picsum.photos/seed/susp2/400/300',
      slug: makeSlug('chassis', 'CS-8800'),
      oemNumber: 'OEM-54041-1JA0A',
      specifications: { Material: 'Spring Steel', 'Wire Diameter': '14mm', 'Free Length': '350mm' },
      moq: 50,
      packaging: 'Bundle, 10 pcs/bundle',
      leadTime: '15-30 days',
      name: {
        en: 'Coil Spring',
        zh: '螺旋弹簧',
        ru: 'Винтовая пружина',
        ar: 'نابض حلزوني',
        ko: '코일 스프링',
      },
      description: {
        en: 'Heavy-duty coil spring',
        zh: '重型螺旋弹簧',
        ru: 'Винтовая пружина усиленной конструкции',
        ar: 'نابض حلزوني ثقيل',
        ko: '중부하용 코일 스프링',
      },
    },
    {
      id: 9,
      model: 'CA-9900',
      category: 'chassis',
      image: 'https://picsum.photos/seed/susp3/400/300',
      slug: makeSlug('chassis', 'CA-9900'),
      oemNumber: 'OEM-54500-2A000',
      specifications: { Material: 'Forged Steel', Type: 'Lower control arm', Bushings: 'Included' },
      moq: 30,
      packaging: 'Individual box',
      leadTime: '20-35 days',
      name: {
        en: 'Control Arm',
        zh: '控制臂',
        ru: 'Рычаг подвески',
        ar: 'ذراع التحكم',
        ko: '컨트롤 암',
      },
      description: {
        en: 'Precision-engineered control arm',
        zh: '精密设计控制臂',
        ru: 'Рычаг подвески прецизионного исполнения',
        ar: 'ذراع تحكم مصمم بدقة',
        ko: '정밀 설계 컨트롤 암',
      },
    },
    {
      id: 10,
      model: 'ALT-1100',
      category: 'electrical',
      image: 'https://picsum.photos/seed/elec1/400/300',
      slug: makeSlug('electrical', 'ALT-1100'),
      oemNumber: 'OEM-27060-0V100',
      specifications: { Output: '150A', Voltage: '12V', Type: 'Internal fan cooled' },
      moq: 30,
      packaging: 'Individual box with foam protection',
      leadTime: '15-30 days',
      featured: true,
      applicableModels: [
        { brand: 'Hyundai', model: 'Elantra', year: '2017-2022', engine: '1.6L' },
        { brand: 'Kia', model: 'Forte', year: '2017-2022', engine: '1.6L' },
      ],
      name: {
        en: 'Alternator',
        zh: '发电机',
        ru: 'Генератор',
        ar: 'المولد الكهربائي',
        ko: '발전기',
      },
      description: {
        en: 'High-output alternator',
        zh: '大功率发电机',
        ru: 'Генератор повышенной мощности',
        ar: 'مولد كهربائي عالي الإنتاج',
        ko: '고출력 발전기',
      },
    },
    {
      id: 11,
      model: 'SM-2200',
      category: 'electrical',
      image: 'https://picsum.photos/seed/elec2/400/300',
      slug: makeSlug('electrical', 'SM-2200'),
      oemNumber: 'OEM-28100-0T100',
      specifications: { Voltage: '12V', Power: '1.4kW', Teeth: '10T' },
      moq: 30,
      packaging: 'Individual box',
      leadTime: '15-30 days',
      name: {
        en: 'Starter Motor',
        zh: '起动机',
        ru: 'Стартер',
        ar: 'محرك البدء',
        ko: '스타터 모터',
      },
      description: {
        en: 'Reliable starter motor',
        zh: '可靠起动机',
        ru: 'Надёжный стартер',
        ar: 'محرك بدء موثوق',
        ko: '신뢰할 수 있는 스타터 모터',
      },
    },
    {
      id: 12,
      model: 'IC-3300',
      category: 'electrical',
      image: 'https://picsum.photos/seed/elec3/400/300',
      slug: makeSlug('electrical', 'IC-3300'),
      oemNumber: 'OEM-27300-0T010',
      specifications: { Type: 'Ignition Coil', 'Primary Resistance': '0.5Ω', 'Secondary Resistance': '8.5kΩ' },
      moq: 100,
      packaging: 'Carton box, 50 pcs/carton',
      leadTime: '10-25 days',
      featured: true,
      name: {
        en: 'Ignition Coil',
        zh: '点火线圈',
        ru: 'Катушка зажигания',
        ar: 'ملف الإشعال',
        ko: '점화 코일',
      },
      description: {
        en: 'High-energy ignition coil',
        zh: '高能点火线圈',
        ru: 'Высоковольтная катушка зажигания',
        ar: 'ملف إشعال عالي الطاقة',
        ko: '고에너지 점화 코일',
      },
    },
    {
      id: 13,
      model: 'FB-4400',
      category: 'body',
      image: 'https://picsum.photos/seed/body1/400/300',
      slug: makeSlug('body', 'FB-4400'),
      oemNumber: 'OEM-52119-1AA00',
      specifications: { Material: 'ABS Plastic + Steel Reinforcement', Finish: 'Primed', 'Mount Type': 'Bolt-on' },
      moq: 20,
      packaging: 'Wooden crate with foam',
      leadTime: '20-40 days',
      name: {
        en: 'Front Bumper',
        zh: '前保险杠',
        ru: 'Передний бампер',
        ar: 'صدام أمامي',
        ko: '전면 범퍼',
      },
      description: {
        en: 'OEM front bumper assembly',
        zh: 'OEM前保险杠总成',
        ru: 'Передний бампер в сборе OEM',
        ar: 'تجميعة صدام أمامي OEM',
        ko: 'OEM 전면 범퍼 어셈블리',
      },
    },
    {
      id: 14,
      model: 'SM-5500',
      category: 'body',
      image: 'https://picsum.photos/seed/body2/400/300',
      slug: makeSlug('body', 'SM-5500'),
      oemNumber: 'OEM-87910-1AA00',
      specifications: { Type: 'Electric with turn signal', 'Mirror Color': 'Paintable', Adjustment: 'Power' },
      moq: 30,
      packaging: 'Individual box with foam',
      leadTime: '20-35 days',
      featured: true,
      name: {
        en: 'Side Mirror',
        zh: '后视镜',
        ru: 'Боковое зеркало',
        ar: 'مرآة جانبية',
        ko: '사이드 미러',
      },
      description: {
        en: 'Electric side mirror with turn signal',
        zh: '电动后视镜，带转向灯',
        ru: 'Электрическое боковое зеркало с указателем поворота',
        ar: 'مرآة جانبية كهربائية بإشارة انعطاف',
        ko: '방향 지시등이 있는 전동 사이드 미러',
      },
    },
    {
      id: 15,
      model: 'OF-6600',
      category: 'engine',
      image: 'https://picsum.photos/seed/filter1/400/300',
      slug: makeSlug('engine', 'OF-6600'),
      oemNumber: 'OEM-90915-YZZD4',
      specifications: { Type: 'Spin-on oil filter', 'Thread Size': 'M20x1.5', 'Bypass Valve': '13 PSI' },
      moq: 200,
      packaging: 'Carton box, 100 pcs/carton',
      leadTime: '7-20 days',
      featured: true,
      name: {
        en: 'Oil Filter',
        zh: '机油滤清器',
        ru: 'Масляный фильтр',
        ar: 'فلتر الزيت',
        ko: '오일 필터',
      },
      description: {
        en: 'High-efficiency oil filter',
        zh: '高效机油滤清器',
        ru: 'Высокоэффективный масляный фильтр',
        ar: 'فلتر زيت عالي الكفاءة',
        ko: '고효율 오일 필터',
      },
    },
    {
      id: 16,
      model: 'AF-7700',
      category: 'engine',
      image: 'https://picsum.photos/seed/filter2/400/300',
      slug: makeSlug('engine', 'AF-7700'),
      oemNumber: 'OEM-17801-0H050',
      specifications: { Type: 'Panel air filter', 'Filter Area': '1200 cm²', 'Efficiency': '99.5%' },
      moq: 200,
      packaging: 'Carton box, 100 pcs/carton',
      leadTime: '7-20 days',
      featured: true,
      name: {
        en: 'Air Filter',
        zh: '空气滤清器',
        ru: 'Воздушный фильтр',
        ar: 'فلتر الهواء',
        ko: '에어 필터',
      },
      description: {
        en: 'Premium air filter element',
        zh: '优质空气滤清器滤芯',
        ru: 'Премиальный фильтрующий элемент воздуха',
        ar: 'عنصر فلتر هواء متميز',
        ko: '프리미엄 에어 필터 엘리먼트',
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Seed Contact Info (mirrors adminStorage.ts DEFAULT_CONTACT_INFO)
// ---------------------------------------------------------------------------

export function getSeedContactInfo(): ContactInfo {
  return {
    whatsapp: '8615711970362',
    email: 'sz26655873@gmail.com',
    phone: '+86 157 1197 0362',
    address: {
      en: 'Guangzhou, China',
      zh: '中国广州',
      ru: 'Гуанчжоу, Китай',
      ar: 'غوانزو، الصين',
      ko: '광저우, 중국',
    },
    wechatId: '15711970362',
    wechatQrImage: 'https://picsum.photos/seed/wechatqr/300/300',
    whatsappQrImage: '',
  };
}

// ---------------------------------------------------------------------------
// Seed Company Info (mirrors adminStorage.ts DEFAULT_COMPANY_INFO)
// ---------------------------------------------------------------------------

export function getSeedCompanyInfo(): CompanyInfo {
  return {
    name: {
      en: 'Altai Auto Parts',
      zh: 'Altai Auto Parts',
      ru: 'Altai Auto Parts',
      ar: 'Altai Auto Parts',
      ko: 'Altai Auto Parts',
    },
    title: {
      en: 'Your Trusted Auto Parts Partner',
      zh: '您值得信赖的汽配合作伙伴',
      ru: 'Ваш надежный партнер по автозапчастям',
      ar: 'شريكك الموثوق في قطع الغيار',
      ko: '신뢰할 수 있는 자동차 부품 파트너',
    },
    description1: {
      en: 'With over 15 years of experience in the automotive parts industry, we have established ourselves as a trusted exporter of premium quality auto parts to clients worldwide. Our extensive catalog covers all major vehicle systems, from engine components to body parts.',
      zh: '凭借在汽配行业超过15年的经验，我们已成为向全球客户出口优质汽配的信赖供应商。我们丰富的产品目录涵盖所有主要车辆系统，从发动机部件到车身部件。',
      ru: 'С более чем 15-летним опытом в отрасли автозапчастей, мы зарекомендовали себя как надежный экспортер премиальных автозапчастей для клиентов по всему миру. Наш обширный каталог охватывает все основные системы автомобиля, от компонентов двигателя до деталей кузова.',
      ar: 'بأكثر من 15 عامًا من الخبرة في صناعة قطع الغيار، أصبحنا مصدرًا موثوقًا لقطع غيار السيارات عالية الجودة لعملاء حول العالم. يغطي كتالوجنا الشامل جميع أنظمة المركبات الرئيسية، من مكونات المحرك إلى أجزاء الهيكل.',
      ko: '자동차 부품 산업에서 15년 이상의 경험을 바탕으로, 우리는 전 세계 고객에게 최고급 자동차 부품을 수출하는 신뢰할 수 있는 파트너로 자리매김했습니다. 우리의 광범위한 카탈로그는 엔진 구성 요소부터 차체 부품까지 모든 주요 차량 시스템을 다룹니다.',
    },
    description2: {
      en: 'We work directly with certified manufacturers, ensuring that every part we export meets the highest quality standards. Our dedicated team handles everything from sourcing to shipping, making global procurement simple and reliable.',
      zh: '我们直接与认证制造商合作，确保出口的每个部件都符合最高质量标准。我们的专业团队负责从采购到运输的所有环节，让全球采购简单可靠。',
      ru: 'Мы работаем напрямую с сертифицированными производителями, гарантируя, что каждая экспортируемая деталь соответствует самым высоким стандартам качества. Наша преданная команда управляет всем процессом от закупки до доставки, делая глобальные закупки простыми и надежными.',
      ar: 'نعمل مباشرة مع مصنعين معتمدين، مما يضمن أن كل جزء نexportه يلبي أعلى معايير الجودة. يتولى فريقنا المتخصص كل شيء من الشراء إلى الشحن، مما يجعل Procurement العالمي بسيطًا وموثوقًا.',
      ko: '인증된 제조업체와 직접 협력하여 수출하는 모든 부품이 최고 품질标准을 충족하도록 보장합니다. 전담팀이 소싱부터 배송까지 모든 것을 처리하여 글로벌 조달을 간편하고 신뢰할 수 있게 만듭니다.',
    },
    stats: {
      stat1: '500K+',
      stat2: '60+',
      stat3: '2,000+',
      stat4: '800+',
    },
    advantages: {
      oem: {
        title: {
          en: 'OEM Quality',
          zh: 'OEM品质',
          ru: 'Качество OEM',
          ar: 'جودة OEM',
          ko: 'OEM 품질',
        },
        desc: {
          en: 'All parts meet or exceed OEM specifications for reliable performance.',
          zh: '所有部件均达到或超过 OEM 规格，确保可靠性能。',
          ru: 'Все детали соответствуют или превышают спецификации OEM для надежной работы.',
          ar: 'جميع القطع تفي أو تفوق مواصفات OEM لأداء موثوق.',
          ko: '모든 부품은 신뢰할 수 있는 성능을 위해 OEM 사양을 충족하거나 초과합니다.',
        },
      },
      shipping: {
        title: {
          en: 'Fast Shipping',
          zh: '快速发货',
          ru: 'Быстрая доставка',
          ar: 'شحن سريع',
          ko: '빠른 배송',
        },
        desc: {
          en: 'Worldwide logistics network ensuring timely delivery to your destination.',
          zh: '全球物流网络确保及时送达您的目的地。',
          ru: 'Мировая логистическая сеть, гарантирующая своевременную доставку до вашего пункта назначения.',
          ar: 'شبكة لوجستية عالمية تضمن التسليم في الوقت المحدد إلى وجهتك.',
          ko: '전 세계 물류 네트워크로 목적지에 시기적절하게 배송을 보장합니다.',
        },
      },
      price: {
        title: {
          en: 'Competitive Price',
          zh: '价格优势',
          ru: 'Конкурентная цена',
          ar: 'سعر تنافسي',
          ko: '경쟁력 있는 가격',
        },
        desc: {
          en: 'Direct from manufacturer pricing with no middleman markup.',
          zh: '直接从制造商定价，无中间商加价。',
          ru: 'Цены напрямую от производителя без наценки посредников.',
          ar: 'أسعار مباشرة من المصنع بدون زيادة وسطاء.',
          ko: '중간업체 마진 없이 제조업체 직접 가격.',
        },
      },
      exportAdv: {
        title: {
          en: 'Global Export',
          zh: '全球出口',
          ru: 'Глобальный экспорт',
          ar: 'تصدير عالمي',
          ko: '글로벌 수출',
        },
        desc: {
          en: 'Serving clients in over 60 countries with seamless export services.',
          zh: '为超过60个国家的客户提供无缝出口服务。',
          ru: ' обслуживаем клиентов в более чем 60 странах с бесперебойными экспортными услугами.',
          ar: 'خدمة العملاء في أكثر من 60 دولة مع خدمات تصدير سلسة.',
          ko: '60개국 이상의 고객에게 원활한 수출 서비스 제공.',
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// getAllSeeds — map of key → seed function
// ---------------------------------------------------------------------------

export function getAllSeeds(): Record<string, () => any> {
  return {
    products: getSeedProducts,
    contact_info: getSeedContactInfo,
    company_info: getSeedCompanyInfo,
  };
}
