/**
 * Product data model and seed data for the auto parts catalog.
 * All text fields (name, description, category labels) support
 * 5 languages: English, Chinese, Russian, Arabic, Korean.
 */

import type { Language } from '../i18n/translations';
import { generateSlug } from '../utils/slug';

/** A string localized into all supported languages. */
export type LocalizedString = Record<Language, string>;

/** A vehicle model that a product is applicable to. */
export interface ApplicableModel {
  /** Vehicle brand (e.g. "Toyota", "BMW"). */
  brand: string;
  /** Vehicle model (e.g. "Camry", "X5"). */
  model: string;
  /** Year range or single year (e.g. "2018-2023"). */
  year: string;
  /** Optional engine specification (e.g. "2.0L Turbo"). */
  engine?: string;
}

export interface Product {
  id: number;
  name: LocalizedString;
  model: string;
  category: string;
  image: string;
  description: LocalizedString;
  /** URL-friendly slug for routing (e.g. "engine-chg-2024"). */
  slug: string;
  /** OEM part number for cross-reference. */
  oemNumber?: string;
  /** Additional product images (gallery). Falls back to [image] if absent. */
  images?: string[];
  /** Vehicle models this product fits. */
  applicableModels?: ApplicableModel[];
  /** Key-value specification pairs (e.g. { Material: "Steel" }). */
  specifications?: Record<string, string>;
  /** Minimum order quantity. */
  moq?: number;
  /** Packaging description. */
  packaging?: string;
  /** Lead time description. */
  leadTime?: string;
  /** Custom SEO meta title (localized). Falls back to name + model if absent. */
  metaTitle?: LocalizedString;
  /** Custom SEO meta description (localized). Falls back to description.en if absent. */
  metaDescription?: LocalizedString;
  /** Whether the product is featured on the homepage. */
  featured?: boolean;
  /** Display order on the homepage (lower = first). Managed via admin up/down arrows. */
  sortOrder?: number;
}

export interface ProductCategory {
  id: string;
  label: LocalizedString;
  /** Brand logo image path (the "all" category does not need a logo). */
  logo?: string;
}

/** Brand filter options displayed as tabs in the Products section. */
export const productCategories: ProductCategory[] = [
  {
    id: 'all',
    label: {
      en: 'All Products',
      zh: '全部产品',
      ru: 'Все товары',
      ar: 'كل المنتجات',
      ko: '전체 제품',
    },
  },
  {
    id: 'bmw',
    logo: '/images/hero/logos/bmw.png',
    label: {
      en: 'BMW',
      zh: '宝马',
      ru: 'BMW',
      ar: 'بي إم دبليو',
      ko: 'BMW',
    },
  },
  {
    id: 'mercedes',
    logo: '/images/hero/logos/mercedes-benz.png',
    label: {
      en: 'Mercedes-Benz',
      zh: '奔驰',
      ru: 'Mercedes-Benz',
      ar: 'مرسيدس بنز',
      ko: '메르세데스 벤츠',
    },
  },
  {
    id: 'audi',
    logo: '/images/hero/logos/audi.png',
    label: {
      en: 'Audi',
      zh: '奥迪',
      ru: 'Audi',
      ar: 'أودي',
      ko: '아우디',
    },
  },
  {
    id: 'porsche',
    logo: '/images/hero/logos/porsche.png',
    label: {
      en: 'Porsche',
      zh: '保时捷',
      ru: 'Porsche',
      ar: 'بورش',
      ko: '포르쉐',
    },
  },
  {
    id: 'landrover',
    logo: '/images/hero/logos/landrover.svg',
    label: {
      en: 'Land Rover',
      zh: '路虎',
      ru: 'Land Rover',
      ar: 'لاند روفر',
      ko: '랜드 로버',
    },
  },
  {
    id: 'volkswagen',
    logo: '/images/hero/logos/volkswagen.png',
    label: {
      en: 'Volkswagen',
      zh: '大众',
      ru: 'Volkswagen',
      ar: 'فولكس فاغن',
      ko: '폭스바겐',
    },
  },
  {
    id: 'volvo',
    logo: '/images/hero/logos/volvo.png',
    label: {
      en: 'Volvo',
      zh: '沃尔沃',
      ru: 'Volvo',
      ar: 'فولفو',
      ko: '볼보',
    },
  },
  {
    id: 'ferrari',
    logo: '/images/hero/logos/ferrari.png',
    label: {
      en: 'Ferrari',
      zh: '法拉利',
      ru: 'Ferrari',
      ar: 'فيراري',
      ko: '페라리',
    },
  },
  {
    id: 'lamborghini',
    logo: '/images/hero/logos/lamborghini.png',
    label: {
      en: 'Lamborghini',
      zh: '兰博基尼',
      ru: 'Lamborghini',
      ar: 'لامبورغيني',
      ko: '람보르기니',
    },
  },
  {
    id: 'bentley',
    logo: '/images/hero/logos/bentley.png',
    label: {
      en: 'Bentley',
      zh: '宾利',
      ru: 'Bentley',
      ar: 'بينتلي',
      ko: '벤틀리',
    },
  },
  {
    id: 'rollsroyce',
    logo: '/images/hero/logos/rolls-royce.png',
    label: {
      en: 'Rolls-Royce',
      zh: '劳斯莱斯',
      ru: 'Rolls-Royce',
      ar: 'رويز رويس',
      ko: '롤스로이스',
    },
  },
  {
    id: 'lexus',
    logo: '/images/hero/logos/lexus.png',
    label: {
      en: 'Lexus',
      zh: '雷克萨斯',
      ru: 'Lexus',
      ar: 'لكزس',
      ko: '렉서스',
    },
  },
  {
    id: 'lincoln',
    logo: '/images/hero/logos/lincoln.png',
    label: {
      en: 'Lincoln',
      zh: '林肯',
      ru: 'Lincoln',
      ar: 'لنكولن',
      ko: '링컨',
    },
  },
  {
    id: 'xiaomi',
    logo: '/images/hero/logos/xiaomi-logo.jpeg',
    label: {
      en: 'Xiaomi',
      zh: '小米',
      ru: 'Xiaomi',
      ar: 'شاومي',
      ko: '샤오미',
    },
  },
];

/** Seed product catalog — 16 items across 6 categories. */
export const products: Product[] = [
  {
    id: 1,
    model: 'CHG-2024',
    category: 'bmw',
    image: 'https://picsum.photos/seed/engine1/400/300',
    slug: generateSlug('engine', 'CHG-2024'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/engine2/400/300',
    slug: generateSlug('engine', 'PRS-1850'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/engine3/400/300',
    slug: generateSlug('engine', 'ETB-3000'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/brake1/400/300',
    slug: generateSlug('chassis', 'BPS-4400'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/brake2/400/300',
    slug: generateSlug('chassis', 'BDR-5500'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/brake3/400/300',
    slug: generateSlug('chassis', 'BC-6600'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/susp1/400/300',
    slug: generateSlug('chassis', 'SA-7700'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/susp2/400/300',
    slug: generateSlug('chassis', 'CS-8800'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/susp3/400/300',
    slug: generateSlug('chassis', 'CA-9900'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/elec1/400/300',
    slug: generateSlug('electrical', 'ALT-1100'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/elec2/400/300',
    slug: generateSlug('electrical', 'SM-2200'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/elec3/400/300',
    slug: generateSlug('electrical', 'IC-3300'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/body1/400/300',
    slug: generateSlug('body', 'FB-4400'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/body2/400/300',
    slug: generateSlug('body', 'SM-5500'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/filter1/400/300',
    slug: generateSlug('engine', 'OF-6600'),
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
    category: 'bmw',
    image: 'https://picsum.photos/seed/filter2/400/300',
    slug: generateSlug('engine', 'AF-7700'),
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
