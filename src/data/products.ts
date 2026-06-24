/**
 * Product data model and seed data for the auto parts catalog.
 * All text fields (name, description, category labels) support
 * 5 languages: English, Chinese, Russian, Arabic, Korean.
 */

import type { Language } from '../i18n/translations';

/** A string localized into all supported languages. */
export type LocalizedString = Record<Language, string>;

export interface Product {
  id: number;
  name: LocalizedString;
  model: string;
  category: string;
  image: string;
  description: LocalizedString;
}

export interface ProductCategory {
  id: string;
  label: LocalizedString;
}

/** Category filter options displayed as tabs in the Products section. */
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
    id: 'engine',
    label: {
      en: 'Engine Parts',
      zh: '发动机配件',
      ru: 'Детали двигателя',
      ar: 'قطع محرك',
      ko: '엔진 부품',
    },
  },
  {
    id: 'brake',
    label: {
      en: 'Brake System',
      zh: '刹车系统',
      ru: 'Тормозная система',
      ar: 'نظام الفرامل',
      ko: '브레이크 시스템',
    },
  },
  {
    id: 'suspension',
    label: {
      en: 'Suspension',
      zh: '悬挂系统',
      ru: 'Подвеска',
      ar: 'نظام التعليق',
      ko: '서스펜션',
    },
  },
  {
    id: 'electrical',
    label: {
      en: 'Electrical',
      zh: '电气系统',
      ru: 'Электрика',
      ar: 'كهربائي',
      ko: '전기 부품',
    },
  },
  {
    id: 'body',
    label: {
      en: 'Body Parts',
      zh: '车身配件',
      ru: 'Кузовные детали',
      ar: 'قطع غيار الهيكل',
      ko: '차체 부품',
    },
  },
  {
    id: 'filters',
    label: {
      en: 'Filters',
      zh: '滤清器',
      ru: 'Фильтры',
      ar: 'فلاتر',
      ko: '필터',
    },
  },
];

/** Seed product catalog — 16 items across 6 categories. */
export const products: Product[] = [
  {
    id: 1,
    model: 'CHG-2024',
    category: 'engine',
    image: 'https://picsum.photos/seed/engine1/400/300',
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
    category: 'brake',
    image: 'https://picsum.photos/seed/brake1/400/300',
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
    category: 'brake',
    image: 'https://picsum.photos/seed/brake2/400/300',
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
    category: 'brake',
    image: 'https://picsum.photos/seed/brake3/400/300',
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
    category: 'suspension',
    image: 'https://picsum.photos/seed/susp1/400/300',
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
    category: 'suspension',
    image: 'https://picsum.photos/seed/susp2/400/300',
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
    category: 'suspension',
    image: 'https://picsum.photos/seed/susp3/400/300',
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
    category: 'filters',
    image: 'https://picsum.photos/seed/filter1/400/300',
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
    category: 'filters',
    image: 'https://picsum.photos/seed/filter2/400/300',
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
