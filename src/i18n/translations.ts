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
    'contact.quickInquiry': 'Quick Inquiry',
    'contact.formCancel': 'Cancel',
    'contact.formName': 'Your Name',
    'contact.formPhone': 'Your Phone',
    'contact.formEmail': 'Your Email',
    'contact.formMessage': 'Product Requirements',
    'contact.formSubmit': 'Send Inquiry',
    'contact.formSuccess':
      'Thank you! Your inquiry has been sent. We will get back to you within 24 hours.',
    'contact.formError': 'Submission failed. Please try again or contact us via WhatsApp.',
    'contact.formSending': 'Sending...',

    // AI Chat Assistant
    'aiChat.title': 'AI Assistant',
    'aiChat.welcome': 'Hello! I\'m the AI assistant for Altai Parts. I can help you with product questions, compatibility checks, and pricing guidance. How can I help you today?',
    'aiChat.placeholder': 'Ask about products, pricing, compatibility...',
    'aiChat.send': 'Send',
    'aiChat.quickInquiry': 'Quick Inquiry',
    'aiChat.whatsapp': 'WhatsApp Contact',
    'aiChat.typing': 'Thinking...',
    'aiChat.error': 'Sorry, something went wrong. Please try again.',
    'aiChat.errorRetry': 'Retry',
    'aiChat.preferWhatsapp': 'Prefer WhatsApp?',
    'aiChat.clickToChat': 'Click to Chat',
    'aiChat.fabLabel': '7×24 Online Support',

    // WeChat Dialog
    'wechat.title': 'Add Our WeChat',
    'wechat.scan': 'Scan to Add on WeChat',
    'wechat.id': 'WeChat ID',

    // WhatsApp Dialog
    'whatsapp.title': 'Scan WhatsApp QR',
    'whatsapp.scan': 'Scan to Chat on WhatsApp',
    'whatsapp.chat': 'Or click here to chat directly',

    // Footer
    'footer.desc':
      'Premium auto parts exporter serving clients in over 60 countries with OEM-quality products and reliable global logistics.',
    'footer.quickLinks': 'Quick Links',
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved.',

    // Breadcrumb
    'breadcrumb.home': 'Home',
    'breadcrumb.products': 'Products',
    'breadcrumb.about': 'About',
    'breadcrumb.contact': 'Contact',

    // 404 Not Found
    'notfound.title': 'Page Not Found',
    'notfound.desc': 'The page you are looking for does not exist or has been moved.',
    'notfound.backHome': 'Back to Home',
    'notfound.browseProducts': 'Browse Products',

    // Product Detail
    'productDetail.oemNumber': 'OEM Number',
    'productDetail.applicableModels': 'Applicable Models',
    'productDetail.specifications': 'Specifications',
    'productDetail.moq': 'Minimum Order Quantity',
    'productDetail.packaging': 'Packaging',
    'productDetail.leadTime': 'Lead Time',
    'productDetail.requestQuote': 'Request Quote',
    'productDetail.relatedProducts': 'Related Products',
    'productDetail.brand': 'Brand',
    'productDetail.year': 'Year',
    'productDetail.engine': 'Engine',
    'productDetail.description': 'Description',
    'productDetail.seoTitle': 'SEO Title',
    'productDetail.seoDescription': 'SEO Description',

    // Category Page
    'category.title': 'Category',
    'category.productsCount': 'products',

    // Hero CTAs
    'hero.ctaProducts': 'Browse Products',
    'hero.ctaContact': 'Contact Us',

    // Hero Carousel — Slide 1
    'hero.slide1.tag': 'PREMIUM AUTO PARTS EXPORTER',
    'hero.slide1.title': 'Quality Auto Parts for<br />Global Markets',
    'hero.slide1.desc':
      'OEM-grade automotive components sourced and exported worldwide. Engine parts, brake systems, suspension, and more — delivered with reliability and speed.',
    'hero.slide1.cta': 'OUR CATALOG',
    'hero.slide1.stat1': 'Parts In Stock',
    'hero.slide1.stat2': 'Countries',
    'hero.slide1.stat3': 'Experience',

    // Hero Carousel — Slide 2
    'hero.slide2.tag': 'OUR TEAM',
    'hero.slide2.title': 'Real People,<br />Real Inventory',
    'hero.slide2.desc':
      'Our dedicated sales and operations team works directly from our warehouse, ensuring every order is inspected, packed, and shipped with precision.',
    'hero.slide2.cta': 'CONTACT US',
    'hero.slide2.stat1': 'Team Members',
    'hero.slide2.stat2': 'Dispatch Time',
    'hero.slide2.stat3': 'Inspected',

    // Hero Carousel — Slide 3
    'hero.slide3.tag': 'COMPATIBILITY',
    'hero.slide3.title': 'Parts for Every Major Brand',
    'hero.slide3.desc':
      'OEM-grade components compatible with 40+ vehicle manufacturers — from everyday vehicles to luxury and performance cars.',
    'hero.slide3.stat1': 'Premium Brands',
    'hero.slide3.stat2': 'Part Numbers',
    'hero.slide3.stat3': 'Grade Quality',

    // Hero Carousel — Slide 4
    'hero.slide4.tag': 'QUALITY PARTS',
    'hero.slide4.titleLine1': 'OEM-Grade Parts from',
    'hero.slide4.titleLine2': 'Top Global Suppliers',
    'hero.slide4.desc':
      "We source directly from the world's leading automotive parts manufacturers",
    'hero.slide4.stat1': 'Genuine OEM',
    'hero.slide4.stat2': 'Brand Partners',
    'hero.slide4.stat3': 'Warranty',

    // Hero Carousel — Slide 5
    'hero.slide5.tag': 'GLOBAL REACH',
    'hero.slide5.titleLine1': 'Shipping to',
    'hero.slide5.titleLine2': '60+ Countries',
    'hero.slide5.desc':
      'From our warehouse to your doorstep — reliable delivery across continents with full tracking.',
    'hero.slide5.cta': 'VIEW OUR NETWORK',
    'hero.slide5.stat1': 'Countries',
    'hero.slide5.stat2': 'Clients',
    'hero.slide5.stat3': 'Experience',
    'hero.slide5.hq': 'CHINA HQ',

    // Hero Carousel — Navigation
    'hero.nav.prev': 'Previous slide',
    'hero.nav.next': 'Next slide',

    // Products page extras
    'products.viewAll': 'View All Products',
    'products.featured': 'Featured Products',
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
    'contact.quickInquiry': '快速询价',
    'contact.formCancel': '取消',
    'contact.formName': '您的姓名',
    'contact.formPhone': '您的电话',
    'contact.formEmail': '您的邮箱',
    'contact.formMessage': '产品需求',
    'contact.formSubmit': '发送询价',
    'contact.formSuccess': '感谢您！您的询价已发送，我们将在24小时内回复您。',
    'contact.formError': '提交失败，请重试或通过 WhatsApp 联系我们。',
    'contact.formSending': '发送中...',

    // AI 聊天助手
    'aiChat.title': 'AI 助手',
    'aiChat.welcome': '您好！我是 Altai Parts 的 AI 助手。我可以帮您解答产品问题、确认配件适配性、以及提供价格参考。请问有什么可以帮您的？',
    'aiChat.placeholder': '询问产品、价格、适配性...',
    'aiChat.send': '发送',
    'aiChat.quickInquiry': '快速询价',
    'aiChat.whatsapp': 'WhatsApp 联系',
    'aiChat.typing': '思考中...',
    'aiChat.error': '抱歉，出了点问题，请重试。',
    'aiChat.errorRetry': '重试',
    'aiChat.preferWhatsapp': '更想用 WhatsApp?',
    'aiChat.clickToChat': '点击聊天',
    'aiChat.fabLabel': '7×24小时在线客服',

    // WeChat Dialog
    'wechat.title': '添加我们的微信',
    'wechat.scan': '扫描添加微信',
    'wechat.id': '微信号',

    // WhatsApp Dialog
    'whatsapp.title': '扫描 WhatsApp 二维码',
    'whatsapp.scan': '扫码开始 WhatsApp 聊天',
    'whatsapp.chat': '或点击这里直接聊天',

    // Footer
    'footer.desc': '优质汽车配件出口商，服务超过60个国家，提供OEM品质产品和可靠的全球物流。',
    'footer.quickLinks': '快速导航',
    'footer.followUs': '关注我们',
    'footer.rights': '版权所有。',

    // Breadcrumb
    'breadcrumb.home': '首页',
    'breadcrumb.products': '产品',
    'breadcrumb.about': '关于我们',
    'breadcrumb.contact': '联系我们',

    // 404 Not Found
    'notfound.title': '页面未找到',
    'notfound.desc': '您访问的页面不存在或已被移动。',
    'notfound.backHome': '返回首页',
    'notfound.browseProducts': '浏览产品',

    // Product Detail
    'productDetail.oemNumber': 'OEM编号',
    'productDetail.applicableModels': '适用车型',
    'productDetail.specifications': '规格参数',
    'productDetail.moq': '最小起订量',
    'productDetail.packaging': '包装方式',
    'productDetail.leadTime': '交货周期',
    'productDetail.requestQuote': '询价',
    'productDetail.relatedProducts': '相关产品',
    'productDetail.brand': '品牌',
    'productDetail.year': '年份',
    'productDetail.engine': '发动机',
    'productDetail.description': '产品描述',
    'productDetail.seoTitle': 'SEO 标题',
    'productDetail.seoDescription': 'SEO 描述',

    // Category Page
    'category.title': '分类',
    'category.productsCount': '个产品',

    // Hero CTAs
    'hero.ctaProducts': '浏览产品',
    'hero.ctaContact': '联系我们',

    // Hero Carousel — Slide 1
    'hero.slide1.tag': '优质汽车配件出口商',
    'hero.slide1.title': '面向全球市场的<br />优质汽车配件',
    'hero.slide1.desc':
      'OEM级汽车零部件，面向全球采购出口。发动机配件、制动系统、悬挂系统等——品质可靠，交付迅速。',
    'hero.slide1.cta': '产品目录',
    'hero.slide1.stat1': '现货库存',
    'hero.slide1.stat2': '国家',
    'hero.slide1.stat3': '年经验',

    // Hero Carousel — Slide 2
    'hero.slide2.tag': '我们的团队',
    'hero.slide2.title': '真实团队，<br />真实库存',
    'hero.slide2.desc':
      '我们的专业销售和运营团队直接在仓库工作，确保每一笔订单都经过精密检查、包装和发货。',
    'hero.slide2.cta': '联系我们',
    'hero.slide2.stat1': '团队成员',
    'hero.slide2.stat2': '发货时间',
    'hero.slide2.stat3': '已质检',

    // Hero Carousel — Slide 3
    'hero.slide3.tag': '广泛兼容',
    'hero.slide3.title': '适配各大主流品牌',
    'hero.slide3.desc':
      'OEM级零部件，兼容40+汽车制造商——从日常代步车到豪华性能车。',
    'hero.slide3.stat1': '高端品牌',
    'hero.slide3.stat2': '零件编号',
    'hero.slide3.stat3': 'OEM品质',

    // Hero Carousel — Slide 4
    'hero.slide4.tag': '品质配件',
    'hero.slide4.titleLine1': '来自',
    'hero.slide4.titleLine2': '全球顶级供应商的OEM配件',
    'hero.slide4.desc':
      '我们直接从世界领先的汽车配件制造商采购',
    'hero.slide4.stat1': '正品OEM',
    'hero.slide4.stat2': '品牌合作伙伴',
    'hero.slide4.stat3': '质保',

    // Hero Carousel — Slide 5
    'hero.slide5.tag': '全球覆盖',
    'hero.slide5.titleLine1': '覆盖',
    'hero.slide5.titleLine2': '60+ 国家',
    'hero.slide5.desc':
      '从我们的仓库到您的手中——跨洲可靠配送，全程物流追踪。',
    'hero.slide5.cta': '查看物流网络',
    'hero.slide5.stat1': '国家',
    'hero.slide5.stat2': '客户',
    'hero.slide5.stat3': '年经验',
    'hero.slide5.hq': '中国总部',

    // Hero Carousel — Navigation
    'hero.nav.prev': '上一张',
    'hero.nav.next': '下一张',

    // Products page extras
    'products.viewAll': '查看全部产品',
    'products.featured': '精选产品',
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
    'contact.quickInquiry': 'Быстрый запрос',
    'contact.formCancel': 'Отмена',
    'contact.formName': 'Ваше имя',
    'contact.formPhone': 'Ваш телефон',
    'contact.formEmail': 'Ваш email',
    'contact.formMessage': 'Требования к продукции',
    'contact.formSubmit': 'Отправить запрос',
    'contact.formSuccess':
      'Спасибо! Ваш запрос отправлен. Мы свяжемся с вами в течение 24 часов.',
    'contact.formError': 'Ошибка отправки. Попробуйте снова или напишите в WhatsApp.',
    'contact.formSending': 'Отправка...',

    // AI Чат-помощник
    'aiChat.title': 'AI Помощник',
    'aiChat.welcome': 'Здравствуйте! Я AI-помощник Altai Parts. Я могу помочь с вопросами о продукции, проверкой совместимости и ориентиром по ценам. Чем могу помочь?',
    'aiChat.placeholder': 'Спросите о продукции, ценах, совместимости...',
    'aiChat.send': 'Отправить',
    'aiChat.quickInquiry': 'Быстрый запрос',
    'aiChat.whatsapp': 'WhatsApp контакт',
    'aiChat.typing': 'Обдумываю...',
    'aiChat.error': 'Извините, что-то пошло не так. Попробуйте снова.',
    'aiChat.errorRetry': 'Повторить',
    'aiChat.preferWhatsapp': 'Предпочитаете WhatsApp?',
    'aiChat.clickToChat': 'Нажмите для чата',
    'aiChat.fabLabel': 'Поддержка 24/7',

    // WeChat Dialog
    'wechat.title': 'Добавить наш WeChat',
    'wechat.scan': 'Сканируйте, чтобы добавить в WeChat',
    'wechat.id': 'ID WeChat',

    // WhatsApp Dialog
    'whatsapp.title': 'Сканируйте QR WhatsApp',
    'whatsapp.scan': 'Сканируйте, чтобы начать чат в WhatsApp',
    'whatsapp.chat': 'Или нажмите здесь для прямого чата',

    // Footer
    'footer.desc':
      'Премиум-экспортёр автозапчастей, обслуживающий клиентов более чем в 60 странах с продукцией качества OEM и надёжной глобальной логистикой.',
    'footer.quickLinks': 'Быстрые ссылки',
    'footer.followUs': 'Подписывайтесь',
    'footer.rights': 'Все права защищены.',

    // Breadcrumb
    'breadcrumb.home': 'Главная',
    'breadcrumb.products': 'Продукция',
    'breadcrumb.about': 'О нас',
    'breadcrumb.contact': 'Контакты',

    // 404 Not Found
    'notfound.title': 'Страница не найдена',
    'notfound.desc': 'Запрошенная страница не существует или была перемещена.',
    'notfound.backHome': 'На главную',
    'notfound.browseProducts': 'Просмотреть продукцию',

    // Product Detail
    'productDetail.oemNumber': 'OEM номер',
    'productDetail.applicableModels': 'Совместимые модели',
    'productDetail.specifications': 'Характеристики',
    'productDetail.moq': 'Минимальный заказ',
    'productDetail.packaging': 'Упаковка',
    'productDetail.leadTime': 'Срок поставки',
    'productDetail.requestQuote': 'Запросить цену',
    'productDetail.relatedProducts': 'Сопутствующие товары',
    'productDetail.brand': 'Марка',
    'productDetail.year': 'Год',
    'productDetail.engine': 'Двигатель',
    'productDetail.description': 'Описание',
    'productDetail.seoTitle': 'SEO Заголовок',
    'productDetail.seoDescription': 'SEO Описание',

    // Category Page
    'category.title': 'Категория',
    'category.productsCount': 'товаров',

    // Hero CTAs
    'hero.ctaProducts': 'Просмотреть продукцию',
    'hero.ctaContact': 'Связаться с нами',

    // Hero Carousel — Slide 1
    'hero.slide1.tag': 'ПРЕМИУМ ЭКСПОРТЁР АВТОЗАПЧАСТЕЙ',
    'hero.slide1.title': 'Качественные автозапчасти<br />для мировых рынков',
    'hero.slide1.desc':
      'Автомобильные компоненты класса OEM, поставляемые на экспорт по всему миру. Детали двигателя, тормозные системы, подвеска и многое другое — с надёжностью и скоростью доставки.',
    'hero.slide1.cta': 'НАШ КАТАЛОГ',
    'hero.slide1.stat1': 'Деталей на складе',
    'hero.slide1.stat2': 'Стран',
    'hero.slide1.stat3': 'Опыт',

    // Hero Carousel — Slide 2
    'hero.slide2.tag': 'НАША КОМАНДА',
    'hero.slide2.title': 'Реальные люди,<br />Реальные запасы',
    'hero.slide2.desc':
      'Наша преданная команда продаж и операций работает прямо со склада, гарантируя, что каждый заказ проверен, упакован и отправлен с точностью.',
    'hero.slide2.cta': 'СВЯЗАТЬСЯ С НАМИ',
    'hero.slide2.stat1': 'Сотрудников',
    'hero.slide2.stat2': 'Время отправки',
    'hero.slide2.stat3': 'Проверено',

    // Hero Carousel — Slide 3
    'hero.slide3.tag': 'СОВМЕСТИМОСТЬ',
    'hero.slide3.title': 'Запчасти для всех основных брендов',
    'hero.slide3.desc':
      'Компоненты класса OEM, совместимые с 40+ автопроизводителями — от повседневных автомобилей до люксовых и спортивных.',
    'hero.slide3.stat1': 'Премиум брендов',
    'hero.slide3.stat2': 'Номеров деталей',
    'hero.slide3.stat3': 'Качество OEM',

    // Hero Carousel — Slide 4
    'hero.slide4.tag': 'КАЧЕСТВЕННЫЕ ДЕТАЛИ',
    'hero.slide4.titleLine1': 'Детали класса OEM от',
    'hero.slide4.titleLine2': 'Ведущих мировых поставщиков',
    'hero.slide4.desc':
      'Мы закупаем напрямую у ведущих мировых производителей автозапчастей',
    'hero.slide4.stat1': 'Оригинальный OEM',
    'hero.slide4.stat2': 'Партнёров-брендов',
    'hero.slide4.stat3': 'Гарантия',

    // Hero Carousel — Slide 5
    'hero.slide5.tag': 'ГЛОБАЛЬНЫЙ ОХВАТ',
    'hero.slide5.titleLine1': 'Доставка в',
    'hero.slide5.titleLine2': '60+ Стран',
    'hero.slide5.desc':
      'С нашего склада до вашего порога — надёжная доставка по континентам с полным отслеживанием.',
    'hero.slide5.cta': 'НАША СЕТЬ',
    'hero.slide5.stat1': 'Стран',
    'hero.slide5.stat2': 'Клиентов',
    'hero.slide5.stat3': 'Опыт',
    'hero.slide5.hq': 'ШТАБ-КВАРТИРА',

    // Hero Carousel — Navigation
    'hero.nav.prev': 'Предыдущий слайд',
    'hero.nav.next': 'Следующий слайд',

    // Products page extras
    'products.viewAll': 'Показать все товары',
    'products.featured': 'Рекомендуемые товары',
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
    'contact.quickInquiry': 'استفسار سريع',
    'contact.formCancel': 'إلغاء',
    'contact.formName': 'اسمك',
    'contact.formPhone': 'هاتفك',
    'contact.formEmail': 'بريدك الإلكتروني',
    'contact.formMessage': 'متطلبات المنتج',
    'contact.formSubmit': 'إرسال الاستفسار',
    'contact.formSuccess':
      'شكراً لك! تم إرسال استفسارك. سنتواصل معك خلال 24 ساعة.',
    'contact.formError': 'فشل الإرسال. حاول مرة أخرى أو راسلنا عبر واتساب.',
    'contact.formSending': 'جارٍ الإرسال...',

    // مساعد AI للدردشة
    'aiChat.title': 'مساعد AI',
    'aiChat.welcome': 'مرحباً! أنا مساعد AI لـ Altai Parts. يمكنني مساعدتك في أسئلة المنتجات، التأكد من التوافق، وتقديم إرشادات الأسعار. كيف يمكنني مساعدتك اليوم؟',
    'aiChat.placeholder': 'اسأل عن المنتجات، الأسعار، التوافق...',
    'aiChat.send': 'إرسال',
    'aiChat.quickInquiry': 'استفسار سريع',
    'aiChat.whatsapp': 'تواصل عبر واتساب',
    'aiChat.typing': 'جارٍ التفكير...',
    'aiChat.error': 'عذراً، حدث خطأ ما. حاول مرة أخرى.',
    'aiChat.errorRetry': 'إعادة المحاولة',
    'aiChat.preferWhatsapp': 'تفضل واتساب؟',
    'aiChat.clickToChat': 'اضغط للدردشة',
    'aiChat.fabLabel': 'دعم على مدار الساعة',

    // WeChat Dialog
    'wechat.title': 'أضف WeChat الخاص بنا',
    'wechat.scan': 'امسح للإضافة على WeChat',
    'wechat.id': 'معرّف WeChat',

    // WhatsApp Dialog
    'whatsapp.title': 'امسح رمز واتساب',
    'whatsapp.scan': 'امسح لبدء المحادثة على واتساب',
    'whatsapp.chat': 'أو اضغط هنا للدردشة المباشرة',

    // Footer
    'footer.desc':
      'مصدّر متميّز لقطع غيار السيارات، يخدم العملاء في أكثر من 60 دولة بمنتجات بجودة OEM ولوجستيات عالمية موثوقة.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.followUs': 'تابعنا',
    'footer.rights': 'جميع الحقوق محفوظة.',

    // Breadcrumb
    'breadcrumb.home': 'الرئيسية',
    'breadcrumb.products': 'المنتجات',
    'breadcrumb.about': 'من نحن',
    'breadcrumb.contact': 'اتصل بنا',

    // 404 Not Found
    'notfound.title': 'الصفحة غير موجودة',
    'notfound.desc': 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
    'notfound.backHome': 'العودة للرئيسية',
    'notfound.browseProducts': 'تصفح المنتجات',

    // Product Detail
    'productDetail.oemNumber': 'رقم OEM',
    'productDetail.applicableModels': 'النماذج المتوافقة',
    'productDetail.specifications': 'المواصفات',
    'productDetail.moq': 'الحد الأدنى للطلب',
    'productDetail.packaging': 'التعبئة',
    'productDetail.leadTime': 'مدة التسليم',
    'productDetail.requestQuote': 'طلب عرض سعر',
    'productDetail.relatedProducts': 'منتجات ذات صلة',
    'productDetail.brand': 'العلامة',
    'productDetail.year': 'السنة',
    'productDetail.engine': 'المحرك',
    'productDetail.description': 'الوصف',
    'productDetail.seoTitle': 'عنوان SEO',
    'productDetail.seoDescription': 'وصف SEO',

    // Category Page
    'category.title': 'الفئة',
    'category.productsCount': 'منتجات',

    // Hero CTAs
    'hero.ctaProducts': 'تصفح المنتجات',
    'hero.ctaContact': 'اتصل بنا',

    // Hero Carousel — Slide 1
    'hero.slide1.tag': 'مصدّر قطع غيار سيارات متميّز',
    'hero.slide1.title': 'قطع غيار عالية الجودة<br />للأسواق العالمية',
    'hero.slide1.desc':
      'مكونات سيارات بمعايير OEM مصدّرة عالمياً. قطع المحرك وأنظمة الفرامل والتعليق وغيرها — بجودة موثوقة وتسليم سريع.',
    'hero.slide1.cta': 'كتالوجنا',
    'hero.slide1.stat1': 'قطعة في المخزون',
    'hero.slide1.stat2': 'دولة',
    'hero.slide1.stat3': 'خبرة',

    // Hero Carousel — Slide 2
    'hero.slide2.tag': 'فريقنا',
    'hero.slide2.title': 'أشخاص حقيقيون،<br />مخزون حقيقي',
    'hero.slide2.desc':
      'يعمل فريق المبيعات والعمليات المتفاني لدينا مباشرة من مستودعنا، مما يضمن فحص كل طلب وتعبئته وشحنه بدقة.',
    'hero.slide2.cta': 'اتصل بنا',
    'hero.slide2.stat1': 'أعضاء الفريق',
    'hero.slide2.stat2': 'وقت الشحن',
    'hero.slide2.stat3': 'تم الفحص',

    // Hero Carousel — Slide 3
    'hero.slide3.tag': 'التوافق',
    'hero.slide3.title': 'قطع غيار لكل العلامات التجارية الكبرى',
    'hero.slide3.desc':
      'مكونات بمعايير OEM متوافقة مع أكثر من 40 شركة مصنعة للسيارات — من المركبات اليومية إلى سيارات الفخامة والأداء.',
    'hero.slide3.stat1': 'علامة تجارية فاخرة',
    'hero.slide3.stat2': 'رقم قطعة',
    'hero.slide3.stat3': 'جودة OEM',

    // Hero Carousel — Slide 4
    'hero.slide4.tag': 'قطع غيار عالية الجودة',
    'hero.slide4.titleLine1': 'قطع بمعايير OEM من',
    'hero.slide4.titleLine2': 'أفضل الموردين العالميين',
    'hero.slide4.desc':
      'نحن نستورد مباشرة من أبرز مصنعي قطع غيار السيارات في العالم',
    'hero.slide4.stat1': 'OEM أصلي',
    'hero.slide4.stat2': 'شريك تجاري',
    'hero.slide4.stat3': 'ضمان',

    // Hero Carousel — Slide 5
    'hero.slide5.tag': 'انتشار عالمي',
    'hero.slide5.titleLine1': 'الشحن إلى',
    'hero.slide5.titleLine2': 'أكثر من 60 دولة',
    'hero.slide5.desc':
      'من مستودعنا إلى باب منزلك — توصيل موثوق عبر القارات مع تتبع كامل.',
    'hero.slide5.cta': 'شبكتنا',
    'hero.slide5.stat1': 'دولة',
    'hero.slide5.stat2': 'عميل',
    'hero.slide5.stat3': 'خبرة',
    'hero.slide5.hq': 'المقر الرئيسي',

    // Hero Carousel — Navigation
    'hero.nav.prev': 'الشريحة السابقة',
    'hero.nav.next': 'الشريحة التالية',

    // Products page extras
    'products.viewAll': 'عرض جميع المنتجات',
    'products.featured': 'منتجات مميزة',
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
    'contact.quickInquiry': '빠른 문의',
    'contact.formCancel': '취소',
    'contact.formName': '이름',
    'contact.formPhone': '전화번호',
    'contact.formEmail': '이메일',
    'contact.formMessage': '제품 요구사항',
    'contact.formSubmit': '문의 보내기',
    'contact.formSuccess':
      '감사합니다! 문의가 전송되었습니다. 24시간 이내에 답변드리겠습니다.',
    'contact.formError': '전송 실패. 다시 시도하거나 WhatsApp으로 문의해 주세요.',
    'contact.formSending': '전송 중...',

    // AI 채팅 어시스턴트
    'aiChat.title': 'AI 어시스턴트',
    'aiChat.welcome': '안녕하세요! Altai Parts의 AI 어시스턴트입니다. 제품 문의, 호환성 확인, 가격 가이드를 도와드릴 수 있습니다. 어떻게 도와드릴까요?',
    'aiChat.placeholder': '제품, 가격, 호환성에 대해 물어보세요...',
    'aiChat.send': '전송',
    'aiChat.quickInquiry': '빠른 문의',
    'aiChat.whatsapp': 'WhatsApp 연락',
    'aiChat.typing': '생각 중...',
    'aiChat.error': '죄송합니다, 문제가 발생했습니다. 다시 시도해 주세요.',
    'aiChat.errorRetry': '재시도',
    'aiChat.preferWhatsapp': 'WhatsApp을 원하시나요?',
    'aiChat.clickToChat': '클릭하여 채팅',
    'aiChat.fabLabel': '7×24 온라인 지원',

    // WeChat Dialog
    'wechat.title': 'WeChat 추가하기',
    'wechat.scan': '스캔하여 WeChat 추가',
    'wechat.id': 'WeChat ID',

    // WhatsApp Dialog
    'whatsapp.title': 'WhatsApp QR 스캔',
    'whatsapp.scan': '스캔하여 WhatsApp 채팅 시작',
    'whatsapp.chat': '또는 여기를 클릭하여 직접 채팅',

    // Footer
    'footer.desc':
      '60개국 이상의 고객에게 OEM 품질 제품과 신뢰할 수 있는 글로벌 물류를 제공하는 프리미엄 자동차 부품 수출업체입니다.',
    'footer.quickLinks': '빠른 링크',
    'footer.followUs': '팔로우하세요',
    'footer.rights': '모든 권리 보유.',

    // Breadcrumb
    'breadcrumb.home': '홈',
    'breadcrumb.products': '제품',
    'breadcrumb.about': '회사소개',
    'breadcrumb.contact': '문의하기',

    // 404 Not Found
    'notfound.title': '페이지를 찾을 수 없습니다',
    'notfound.desc': '찾으시는 페이지가 존재하지 않거나 이동되었습니다.',
    'notfound.backHome': '홈으로 돌아가기',
    'notfound.browseProducts': '제품 둘러보기',

    // Product Detail
    'productDetail.oemNumber': 'OEM 번호',
    'productDetail.applicableModels': '적용 차종',
    'productDetail.specifications': '사양',
    'productDetail.moq': '최소 주문 수량',
    'productDetail.packaging': '포장',
    'productDetail.leadTime': '납기',
    'productDetail.requestQuote': '견적 요청',
    'productDetail.relatedProducts': '관련 제품',
    'productDetail.brand': '브랜드',
    'productDetail.year': '연식',
    'productDetail.engine': '엔진',
    'productDetail.description': '상세 설명',
    'productDetail.seoTitle': 'SEO 제목',
    'productDetail.seoDescription': 'SEO 설명',

    // Category Page
    'category.title': '카테고리',
    'category.productsCount': '개 제품',

    // Hero CTAs
    'hero.ctaProducts': '제품 둘러보기',
    'hero.ctaContact': '문의하기',

    // Hero Carousel — Slide 1
    'hero.slide1.tag': '프리미엄 자동차 부품 수출업체',
    'hero.slide1.title': '글로벌 시장을 위한<br />고품질 자동차 부품',
    'hero.slide1.desc':
      'OEM 등급의 자동차 부품을 전 세계로 조달 및 수출합니다. 엔진 부품, 브레이크 시스템, 서스펜션 등 — 신뢰성과 빠른 납기를 보장합니다.',
    'hero.slide1.cta': '제품 카탈로그',
    'hero.slide1.stat1': '재고 부품',
    'hero.slide1.stat2': '국가',
    'hero.slide1.stat3': '경력',

    // Hero Carousel — Slide 2
    'hero.slide2.tag': '우리 팀',
    'hero.slide2.title': '실제 사람들,<br />실제 재고',
    'hero.slide2.desc':
      '우리의 헌신적인 영업 및 운영 팀이 창고에서 직접 작업하며 모든 주문이 정밀하게 검사, 포장 및 배송되도록 합니다.',
    'hero.slide2.cta': '문의하기',
    'hero.slide2.stat1': '팀원',
    'hero.slide2.stat2': '출하 시간',
    'hero.slide2.stat3': '검사 완료',

    // Hero Carousel — Slide 3
    'hero.slide3.tag': '호환성',
    'hero.slide3.title': '모든 주요 브랜드 부품 보유',
    'hero.slide3.desc':
      '40개 이상의 자동차 제조사와 호환되는 OEM 등급 부품 — 일상적인 차량부터 럭셔리 및 고성능 차량까지.',
    'hero.slide3.stat1': '프리미엄 브랜드',
    'hero.slide3.stat2': '부품 번호',
    'hero.slide3.stat3': 'OEM 품질',

    // Hero Carousel — Slide 4
    'hero.slide4.tag': '품질 부품',
    'hero.slide4.titleLine1': 'OEM 등급 부품 —',
    'hero.slide4.titleLine2': '글로벌 최고 공급업체',
    'hero.slide4.desc':
      '세계 최고의 자동차 부품 제조업체에서 직접 소싱합니다',
    'hero.slide4.stat1': '정품 OEM',
    'hero.slide4.stat2': '브랜드 파트너',
    'hero.slide4.stat3': '보증',

    // Hero Carousel — Slide 5
    'hero.slide5.tag': '글로벌 네트워크',
    'hero.slide5.titleLine1': '배송 대상',
    'hero.slide5.titleLine2': '60개국 이상',
    'hero.slide5.desc':
      '당사 창고에서 고객님의 문 앞까지 — 전체 추적이 가능한 대륙 간 안정적인 배송.',
    'hero.slide5.cta': '네트워크 보기',
    'hero.slide5.stat1': '국가',
    'hero.slide5.stat2': '고객사',
    'hero.slide5.stat3': '경력',
    'hero.slide5.hq': '중국 본사',

    // Hero Carousel — Navigation
    'hero.nav.prev': '이전 슬라이드',
    'hero.nav.next': '다음 슬라이드',

    // Products page extras
    'products.viewAll': '전체 제품 보기',
    'products.featured': '추천 제품',
  },
};
