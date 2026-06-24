/**
 * Multilingual translation strings for the entire application.
 * Supports 5 languages: English, Chinese, Russian, Arabic, Korean.
 * Accessed via the `useLanguage()` hook's `t(key)` function.
 */

export type Language = 'en' | 'zh' | 'ru' | 'ar' | 'ko';

export interface TranslationMap {
  [key: string]: string;
}

/** Localized display names for each language, shown in the language switcher. */
export const languageNames: Record<Language, string> = {
  en: 'English',
  zh: '中文',
  ru: 'Русский',
  ar: 'العربية',
  ko: '한국어',
};

/** Languages that use right-to-left text direction. */
export const RTL_LANGUAGES: Language[] = ['ar'];

export const translations: Record<Language, TranslationMap> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.about': 'About',
    'nav.contact': 'Contact',

    // Hero
    'hero.badge': 'PREMIUM AUTO PARTS EXPORTER',
    'hero.title': 'Quality Auto Parts for Global Markets',
    'hero.subtitle':
      'OEM-grade automotive components sourced and exported worldwide. Engine parts, brake systems, suspension, and more — delivered with reliability and speed.',
    'hero.ctaWhatsapp': 'Get Quote on WhatsApp',
    'hero.ctaWechat': 'Add WeChat',

    // Products
    'products.badge': 'OUR CATALOG',
    'products.title': 'Explore Our Products',
    'products.subtitle':
      'Browse our comprehensive range of automotive parts, all available for global export with OEM quality assurance.',
    'products.model': 'Model',
    'products.inquire': 'Inquire',

    // Advantages
    'adv.oem.title': 'OEM Quality',
    'adv.oem.desc': 'All parts meet or exceed OEM specifications for reliable performance.',
    'adv.shipping.title': 'Fast Shipping',
    'adv.shipping.desc': 'Worldwide logistics network ensuring timely delivery to your destination.',
    'adv.price.title': 'Competitive Price',
    'adv.price.desc': 'Direct from manufacturer pricing with no middleman markup.',
    'adv.export.title': 'Global Export',
    'adv.export.desc': 'Serving clients in over 60 countries with seamless export services.',

    // About
    'about.badge': 'ABOUT US',
    'about.title': 'Your Trusted Auto Parts Partner',
    'about.desc1':
      'With over 15 years of experience in the automotive parts industry, we have established ourselves as a trusted exporter of premium quality auto parts to clients worldwide. Our extensive catalog covers all major vehicle systems, from engine components to body parts.',
    'about.desc2':
      'We work directly with certified manufacturers, ensuring that every part we export meets the highest quality standards. Our dedicated team handles everything from sourcing to shipping, making global procurement simple and reliable.',
    'about.stat1.label': 'Units Exported Yearly',
    'about.stat2.label': 'Countries Served',
    'about.stat3.label': 'Product Types',
    'about.stat4.label': 'Active Clients',

    // Contact
    'contact.badge': 'GET IN TOUCH',
    'contact.title': 'Contact Us',
    'contact.whatsappBtn': 'Chat on WhatsApp',
    'contact.wechatBtn': 'Add Our WeChat',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.address': 'Address',
    'contact.addressValue': 'Guangzhou, China',
    'contact.formTitle': 'Send an Inquiry',
    'contact.formName': 'Your Name',
    'contact.formEmail': 'Your Email',
    'contact.formMessage': 'Product Requirements',
    'contact.formSubmit': 'Send Inquiry',
    'contact.formSuccess':
      'Thank you! Your inquiry has been sent. We will get back to you within 24 hours.',

    // WeChat Dialog
    'wechat.title': 'Add Our WeChat',
    'wechat.scan': 'Scan to Add on WeChat',
    'wechat.id': 'WeChat ID',

    // Footer
    'footer.desc':
      'Premium auto parts exporter serving clients in over 60 countries with OEM-quality products and reliable global logistics.',
    'footer.quickLinks': 'Quick Links',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved.',
  },

  zh: {
    // Navbar
    'nav.home': '首页',
    'nav.products': '产品中心',
    'nav.about': '关于我们',
    'nav.contact': '联系我们',

    // Hero
    'hero.badge': '优质汽车配件出口商',
    'hero.title': '为全球市场提供优质汽车配件',
    'hero.subtitle':
      'OEM级汽车零部件，面向全球采购出口。发动机配件、制动系统、悬挂系统等——品质可靠，交付迅速。',
    'hero.ctaWhatsapp': 'WhatsApp 获取报价',
    'hero.ctaWechat': '添加微信',

    // Products
    'products.badge': '产品目录',
    'products.title': '浏览我们的产品',
    'products.subtitle': '浏览我们全面的汽车配件系列，均可全球出口，OEM品质保证。',
    'products.model': '型号',
    'products.inquire': '询价',

    // Advantages
    'adv.oem.title': 'OEM品质',
    'adv.oem.desc': '所有配件均达到或超过OEM规格，性能可靠。',
    'adv.shipping.title': '快速发货',
    'adv.shipping.desc': '全球物流网络，确保及时送达您的目的地。',
    'adv.price.title': '价格竞争力',
    'adv.price.desc': '直接从制造商采购，无中间商加价。',
    'adv.export.title': '全球出口',
    'adv.export.desc': '服务超过60个国家的客户，出口流程无缝对接。',

    // About
    'about.badge': '关于我们',
    'about.title': '您值得信赖的汽车配件合作伙伴',
    'about.desc1':
      '凭借在汽车配件行业超过15年的经验，我们已成为全球客户信赖的优质汽车配件出口商。我们丰富的产品目录涵盖所有主要车辆系统，从发动机部件到车身配件。',
    'about.desc2':
      '我们直接与认证制造商合作，确保每一件出口配件都达到最高质量标准。我们的专业团队处理从采购到运输的一切事务，让全球采购变得简单可靠。',
    'about.stat1.label': '年出口量',
    'about.stat2.label': '服务国家',
    'about.stat3.label': '产品种类',
    'about.stat4.label': '活跃客户',

    // Contact
    'contact.badge': '联系我们',
    'contact.title': '联系我们',
    'contact.whatsappBtn': 'WhatsApp 在线沟通',
    'contact.wechatBtn': '添加我们的微信',
    'contact.email': '邮箱',
    'contact.phone': '电话',
    'contact.address': '地址',
    'contact.addressValue': '中国广州',
    'contact.formTitle': '发送询价',
    'contact.formName': '您的姓名',
    'contact.formEmail': '您的邮箱',
    'contact.formMessage': '产品需求',
    'contact.formSubmit': '发送询价',
    'contact.formSuccess': '感谢您！您的询价已发送，我们将在24小时内回复您。',

    // WeChat Dialog
    'wechat.title': '添加我们的微信',
    'wechat.scan': '扫描添加微信',
    'wechat.id': '微信号',

    // Footer
    'footer.desc': '优质汽车配件出口商，服务超过60个国家，提供OEM品质产品和可靠的全球物流。',
    'footer.quickLinks': '快速导航',
    'footer.followUs': '关注我们',
    'footer.rights': '版权所有。',
  },

  ru: {
    // Navbar
    'nav.home': 'Главная',
    'nav.products': 'Продукция',
    'nav.about': 'О нас',
    'nav.contact': 'Контакты',

    // Hero
    'hero.badge': 'ПРЕМИУМ ЭКСПОРТЁР АВТОЗАПЧАСТЕЙ',
    'hero.title': 'Качественные автозапчасти для мировых рынков',
    'hero.subtitle':
      'Автомобильные компоненты класса OEM, поставляемые на экспорт по всему миру. Детали двигателя, тормозные системы, подвеска и многое другое — с надёжностью и скоростью доставки.',
    'hero.ctaWhatsapp': 'Запросить цену в WhatsApp',
    'hero.ctaWechat': 'Добавить WeChat',

    // Products
    'products.badge': 'НАШ КАТАЛОГ',
    'products.title': 'Изучите нашу продукцию',
    'products.subtitle':
      'Просмотрите наш широкий ассортимент автомобильных запчастей, доступных для глобального экспорта с гарантией качества OEM.',
    'products.model': 'Модель',
    'products.inquire': 'Запросить',

    // Advantages
    'adv.oem.title': 'Качество OEM',
    'adv.oem.desc': 'Все детали соответствуют или превышают спецификации OEM для надёжной работы.',
    'adv.shipping.title': 'Быстрая доставка',
    'adv.shipping.desc': 'Глобальная логистическая сеть, обеспечивающая своевременную доставку в ваш регион.',
    'adv.price.title': 'Конкурентные цены',
    'adv.price.desc': 'Цены напрямую от производителя без наценок посредников.',
    'adv.export.title': 'Глобальный экспорт',
    'adv.export.desc': 'Обслуживаем клиентов более чем в 60 странах с бесперебойным экспортным обслуживанием.',

    // About
    'about.badge': 'О НАС',
    'about.title': 'Ваш надёжный партнёр по автозапчастям',
    'about.desc1':
      'Имея более 15 лет опыта в отрасли автозапчастей, мы зарекомендовали себя как надёжный экспортёр высококачественных автозапчастей для клиентов по всему миру. Наш обширный каталог охватывает все основные системы автомобилей — от компонентов двигателя до кузовных деталей.',
    'about.desc2':
      'Мы работаем напрямую с сертифицированными производителями, гарантируя, что каждая экспортируемая деталь соответствует высочайшим стандартам качества. Наша профессиональная команда берёт на себя всё — от закупки до доставки, делая глобальные закупки простыми и надёжными.',
    'about.stat1.label': 'Экспортировано в год',
    'about.stat2.label': 'Стран обслуживания',
    'about.stat3.label': 'Типов продукции',
    'about.stat4.label': 'Активных клиентов',

    // Contact
    'contact.badge': 'СВЯЗАТЬСЯ С НАМИ',
    'contact.title': 'Свяжитесь с нами',
    'contact.whatsappBtn': 'Чат в WhatsApp',
    'contact.wechatBtn': 'Добавить наш WeChat',
    'contact.email': 'Эл. почта',
    'contact.phone': 'Телефон',
    'contact.address': 'Адрес',
    'contact.addressValue': 'Гуанчжоу, Китай',
    'contact.formTitle': 'Отправить запрос',
    'contact.formName': 'Ваше имя',
    'contact.formEmail': 'Ваш email',
    'contact.formMessage': 'Требования к продукции',
    'contact.formSubmit': 'Отправить запрос',
    'contact.formSuccess':
      'Спасибо! Ваш запрос отправлен. Мы свяжемся с вами в течение 24 часов.',

    // WeChat Dialog
    'wechat.title': 'Добавить наш WeChat',
    'wechat.scan': 'Сканируйте, чтобы добавить в WeChat',
    'wechat.id': 'ID WeChat',

    // Footer
    'footer.desc':
      'Премиум-экспортёр автозапчастей, обслуживающий клиентов более чем в 60 странах с продукцией качества OEM и надёжной глобальной логистикой.',
    'footer.quickLinks': 'Быстрые ссылки',
    'footer.followUs': 'Подписывайтесь',
    'footer.rights': 'Все права защищены.',
  },

  ar: {
    // Navbar
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',

    // Hero
    'hero.badge': 'مصدّر قطع غيار سيارات متميّز',
    'hero.title': 'قطع غيار سيارات عالية الجودة للأسواق العالمية',
    'hero.subtitle':
      'مكونات سيارات بمعايير OEM مصدّرة عالمياً. قطع المحرك وأنظمة الفرامل والتعليق وغيرها — بجودة موثوقة وتسليم سريع.',
    'hero.ctaWhatsapp': 'احصل على عرض سعر عبر واتساب',
    'hero.ctaWechat': 'أضف WeChat',

    // Products
    'products.badge': 'كتالوج المنتجات',
    'products.title': 'استكشف منتجاتنا',
    'products.subtitle':
      'تصفح مجموعتنا الشاملة من قطع غيار السيارات، جميعها متاحة للتصدير العالمي بضمان جودة OEM.',
    'products.model': 'الموديل',
    'products.inquire': 'استفسار',

    // Advantages
    'adv.oem.title': 'جودة OEM',
    'adv.oem.desc': 'جميع القطع تفي أو تتجاوز مواصفات OEM لأداء موثوق.',
    'adv.shipping.title': 'شحن سريع',
    'adv.shipping.desc': 'شبكة لوجستية عالمية تضمن التسليم في الوقت المناسب إلى وجهتك.',
    'adv.price.title': 'أسعار تنافسية',
    'adv.price.desc': 'أسعار مباشرة من المصنع دون رسوم وسطاء.',
    'adv.export.title': 'تصدير عالمي',
    'adv.export.desc': 'نخدم العملاء في أكثر من 60 دولة بخدمات تصدير سلسة.',

    // About
    'about.badge': 'من نحن',
    'about.title': 'شريكك الموثوق لقطع غيار السيارات',
    'about.desc1':
      'بخبرة تزيد عن 15 عاماً في صناعة قطع غيار السيارات، رسّخنا مكانتنا كمصدّر موثوق لقطع غيار السيارات عالية الجودة للعملاء حول العالم. يغطّي كتالوجنا الواسع جميع أنظمة المركبات الرئيسية، من مكونات المحرك إلى قطع الهيكل.',
    'about.desc2':
      'نعمل مباشرة مع مصنّعين معتمدين، لنضمن أن كل قطعة نصدرها تلبي أعلى معايير الجودة. يتولّى فريقنا المتخصص كل شيء من الشراء إلى الشحن، مما يجعل المشتريات العالمية بسيطة وموثوقة.',
    'about.stat1.label': 'وحدة مُصدّرة سنوياً',
    'about.stat2.label': 'دولة نخدمها',
    'about.stat3.label': 'نوع منتج',
    'about.stat4.label': 'عميل نشط',

    // Contact
    'contact.badge': 'تواصل معنا',
    'contact.title': 'اتصل بنا',
    'contact.whatsappBtn': 'محادثة عبر واتساب',
    'contact.wechatBtn': 'أضف WeChat الخاص بنا',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'الهاتف',
    'contact.address': 'العنوان',
    'contact.addressValue': 'غوانزو، الصين',
    'contact.formTitle': 'إرسال استفسار',
    'contact.formName': 'اسمك',
    'contact.formEmail': 'بريدك الإلكتروني',
    'contact.formMessage': 'متطلبات المنتج',
    'contact.formSubmit': 'إرسال الاستفسار',
    'contact.formSuccess':
      'شكراً لك! تم إرسال استفسارك. سنتواصل معك خلال 24 ساعة.',

    // WeChat Dialog
    'wechat.title': 'أضف WeChat الخاص بنا',
    'wechat.scan': 'امسح للإضافة على WeChat',
    'wechat.id': 'معرّف WeChat',

    // Footer
    'footer.desc':
      'مصدّر متميّز لقطع غيار السيارات، يخدم العملاء في أكثر من 60 دولة بمنتجات بجودة OEM ولوجستيات عالمية موثوقة.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.followUs': 'تابعنا',
    'footer.rights': 'جميع الحقوق محفوظة.',
  },

  ko: {
    // Navbar
    'nav.home': '홈',
    'nav.products': '제품',
    'nav.about': '회사소개',
    'nav.contact': '문의하기',

    // Hero
    'hero.badge': '프리미엄 자동차 부품 수출업체',
    'hero.title': '글로벌 시장을 위한 고품질 자동차 부품',
    'hero.subtitle':
      'OEM 등급의 자동차 부품을 전 세계로 조달 및 수출합니다. 엔진 부품, 브레이크 시스템, 서스펜션 등 — 신뢰성과 빠른 납기를 보장합니다.',
    'hero.ctaWhatsapp': 'WhatsApp으로 견적 요청',
    'hero.ctaWechat': 'WeChat 추가',

    // Products
    'products.badge': '제품 카탈로그',
    'products.title': '제품 둘러보기',
    'products.subtitle':
      'OEM 품질 보증으로 글로벌 수출이 가능한 포괄적인 자동차 부품 라인업을 확인해 보세요.',
    'products.model': '모델',
    'products.inquire': '문의하기',

    // Advantages
    'adv.oem.title': 'OEM 품질',
    'adv.oem.desc': '모든 부품이 OEM 사양을 충족하거나 능가하여 신뢰할 수 있는 성능을 보장합니다.',
    'adv.shipping.title': '빠른 배송',
    'adv.shipping.desc': '글로벌 물류 네트워크로 목적지까지 적기 납품을 보장합니다.',
    'adv.price.title': '경쟁력 있는 가격',
    'adv.price.desc': '중간 유통 마진 없이 제조사 직접 가격으로 제공합니다.',
    'adv.export.title': '글로벌 수출',
    'adv.export.desc': '60개국 이상의 고객에게 원활한 수출 서비스를 제공합니다.',

    // About
    'about.badge': '회사소개',
    'about.title': '신뢰할 수 있는 자동차 부품 파트너',
    'about.desc1':
      '자동차 부품 산업에서 15년 이상의 경험을 바탕으로, 전 세계 고객에게 고품질 자동차 부품을 수출하는 신뢰받는 업체로 자리매김했습니다. 저희의 방대한 카탈로그는 엔진 부품부터 차체 부품까지 모든 주요 차량 시스템을 아우릅니다.',
    'about.desc2':
      '인증된 제조사와 직접 협력하여 수출되는 모든 부품이 최고 품질 기준을 충족하도록 보장합니다. 전담팀이 조달부터 배송까지 모든 과정을 처리하여 글로벌 구매를 간편하고 신뢰할 수 있게 만듭니다.',
    'about.stat1.label': '연간 수출량',
    'about.stat2.label': '서비스 국가',
    'about.stat3.label': '제품 유형',
    'about.stat4.label': '활성 고객',

    // Contact
    'contact.badge': '문의하기',
    'contact.title': '문의하기',
    'contact.whatsappBtn': 'WhatsApp으로 채팅',
    'contact.wechatBtn': 'WeChat 추가하기',
    'contact.email': '이메일',
    'contact.phone': '전화',
    'contact.address': '주소',
    'contact.addressValue': '광저우, 중국',
    'contact.formTitle': '문의 보내기',
    'contact.formName': '이름',
    'contact.formEmail': '이메일',
    'contact.formMessage': '제품 요구사항',
    'contact.formSubmit': '문의 보내기',
    'contact.formSuccess':
      '감사합니다! 문의가 전송되었습니다. 24시간 이내에 답변드리겠습니다.',

    // WeChat Dialog
    'wechat.title': 'WeChat 추가하기',
    'wechat.scan': '스캔하여 WeChat 추가',
    'wechat.id': 'WeChat ID',

    // Footer
    'footer.desc':
      '60개국 이상의 고객에게 OEM 품질 제품과 신뢰할 수 있는 글로벌 물류를 제공하는 프리미엄 자동차 부품 수출업체입니다.',
    'footer.quickLinks': '빠른 링크',
    'footer.followUs': '팔로우하세요',
    'footer.rights': '모든 권리 보유.',
  },
};
