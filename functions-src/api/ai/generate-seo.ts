/**
 * /api/ai/generate-seo — POST endpoint for AI-powered SEO copy generation.
 *
 * Uses Workers AI (@cf/meta/llama-3.3-70b-instruct) for high-quality output.
 * Generates product descriptions, meta titles, and meta descriptions in 5 languages.
 *
 * Key accuracy improvements over previous version:
 * - 70B model (was 8B) — dramatically better domain knowledge
 * - Brand-based category labels (was old part-type categories)
 * - Strict anti-hallucination rules — no fake phone/email/vehicle data
 * - Post-processing validation strips template placeholders and bad content
 * - Enforced SEO title format — no brand repetition, proper length
 */

import { isAuthenticated, unauthorizedResponse } from '../_auth';

/** All supported languages. */
const ALL_LANGS = ['zh', 'en', 'ru', 'ar', 'ko'] as const;

/** Brand category labels matching the actual productCategories in products.ts */
const CATEGORY_LABELS: Record<string, string> = {
  bmw: 'BMW Parts',
  mercedes: 'Mercedes-Benz Parts',
  audi: 'Audi Parts',
  porsche: 'Porsche Parts',
  landrover: 'Land Rover Parts',
  volkswagen: 'Volkswagen (VW) Parts',
  volvo: 'Volvo Parts',
  ferrari: 'Ferrari Parts',
  lamborghini: 'Lamborghini Parts',
  bentley: 'Bentley Parts',
  rollsroyce: 'Rolls-Royce Parts',
  lexus: 'Lexus Parts',
  lincoln: 'Lincoln Parts',
  xiaomi: 'Xiaomi Auto Parts',
};

/**
 * Builds a structured product brief from available info.
 * Only includes facts — no templates, no guesses.
 */
function buildProductBrief(info: any): string {
  const parts: string[] = [];

  const nameEn = info.name?.en || '';
  const nameZh = info.name?.zh || '';
  const model = info.model || '';
  const category = info.category || '';
  const categoryLabel = CATEGORY_LABELS[category] || category || 'Auto Parts';
  const oem = info.oemNumber || '';

  parts.push(`Product Name (EN): ${nameEn}`);
  if (nameZh) parts.push(`Product Name (ZH): ${nameZh}`);
  parts.push(`Vehicle Model Code: ${model}`);
  parts.push(`Category: ${categoryLabel}`);
  if (oem) parts.push(`OEM Part Number: ${oem}`);

  // Specifications — only real data
  if (info.specifications && typeof info.specifications === 'object') {
    const specEntries = Object.entries(info.specifications).filter(([, v]) => v);
    if (specEntries.length > 0) {
      const specStr = specEntries.map(([k, v]) => `  - ${k}: ${v}`).join('\n');
      parts.push(`Specifications:\n${specStr}`);
    }
  }

  // Applicable vehicles — only real data, warn AI not to add more
  if (Array.isArray(info.applicableModels) && info.applicableModels.length > 0) {
    const modelStrs = info.applicableModels.map((m: any) => {
      if (typeof m === 'string') return m;
      const brand = m.brand || m.make || '';
      const model = m.model || '';
      const year = m.year || m.years || '';
      return [brand, model, year].filter(Boolean).join(' ');
    }).filter(Boolean);
    if (modelStrs.length > 0) {
      parts.push(`Compatible Vehicles (ONLY these, do NOT add others): ${modelStrs.join(', ')}`);
    }
  } else {
    // Explicitly tell AI there is NO vehicle compatibility data
    parts.push(`Compatible Vehicles: [NOT PROVIDED — do NOT guess or list any vehicle models]`);
  }

  return parts.join('\n');
}

// ─── System Prompts ──────────────────────────────────────────────
// Each language gets its own prompt IN that language.
// Core rule: NEVER fabricate anything not in the product brief.

function buildSystemPrompt(_field: string, langCode: string): string {
  const baseRules = [
    'CRITICAL RULES — violations will produce unusable content:',
    '',
    'ABSOLUTE PROHIBITIONS:',
    '- NEVER include phone numbers, email addresses, websites, or contact info',
    '- NEVER include placeholder text like "[Support Email]", "400-XXX-XXXX", "[Live Chat]"',
    '- NEVER invent vehicle engine sizes, year ranges, or model codes not listed above',
    '- NEVER invent warranty terms ("3-year warranty"), delivery times, or return policies',
    '- NEVER use consumer marketing language ("limited time offer", "buy now")',
    '- NEVER repeat the brand name unnecessarily in titles (once is enough)',
    '- NEVER translate auto parts terminology literally — use industry-standard terms:',
    '  * Bumper = 保险杠 / бампер / مصد / 범퍼  (NOT bucket/cask holder/water bucket)',
    '  * Tail light / Rear lamp = 后尾灯 / задние фонаري / المصباح الخلفي / 후미등',
    '  * Headlight = 大灯 / фара / المصباح الأمامي / 전조등',
    '  * Assembly = 总成 / сборка / مجموعة / 어셈블리',
    '  * OEM = Original Equipment Manufacturer quality standard',
    '',
    'OUTPUT FORMAT:',
    '- Plain text only — NO Markdown (**, ##, -, bullet points)',
    '- Output ONLY the requested content, no prefixes like "Output:"',
    '- For descriptions: professional B2B wholesale tone, concise factual style',
    '- For metaTitle: format "{Product Name} | Altai Parts" — max 60 chars, brand appears ONCE',
    '- For metaDescription: max 155 chars, include product + category + one key benefit',
  ];

  if (langCode === 'zh') {
    return [
      '你是 Altai Parts（阿尔泰汽配）的专业汽配文案写手。',
      '公司：中国专业汽配出口商，主营OEM品质汽车配件批发出口。',
      '',
      ...baseRules,
      '',
      '语言要求：使用简体中文，专业B2B批发语气。不要用"亲"、"爆款"等电商话术。',
    ].join('\n');
  }
  if (langCode === 'en') {
    return [
      'You are a professional auto parts copywriter for Altai Parts.',
      'Company: China-based auto parts exporter specializing in OEM-quality parts wholesale.',
      '',
      ...baseRules,
      '',
      'Language requirement: Professional B2B wholesale tone. No retail/consumer marketing language.',
    ].join('\n');
  }
  if (langCode === 'ru') {
    return [
      'Вы профессиональный копирайтер по автозапчастям для Altai Parts.',
      'Компания: Китайский экспортёр автозапчастей качества OEM, оптовые поставки.',
      '',
      ...baseRules,
      '',
      'Требование к языку: профессиональный B2B тон. Без розничного маркетинга.',
    ].join('\n');
  }
  if (langCode === 'ar') {
    return [
      'أنت كاتب محترف لقطع غيار السيارات في شركة Altai Parts.',
      'الشركة: مصدّر صيني متخصص في قطع غيار السيارات بجودة OEM، بيع بالجملة.',
      '',
      ...baseRules,
      '',
      'متطلب اللغة: نبرة B2B احترافية. بدون لغة تسويق التجزئة.',
    ].join('\n');
  }
  if (langCode === 'ko') {
    return [
      '당신은 Altai Parts의 전문 자동차 부품 카피라이터입니다.',
      '회사: 중국 기반의 OEM 품질 자동차 부품 수출 도매업체.',
      '',
      ...baseRules,
      '',
      '언어 요구사항: 전문 B2B 도매 톤. 소매 마케팅 언어 금지.',
    ].join('\n');
  }

  return buildSystemPrompt(_field, 'en');
}

// ─── User Prompts ────────────────────────────────────────────────

function buildUserPrompt(field: string, langCode: string, brief: string): string {
  if (field === 'metaTitle') {
    const examples: Record<string, string> = {
      zh: '格式示例:\n产品: BMW X5 尾灯总成 → 输出: BMW X5 G05 OLED尾门尾灯总成 | Altai Parts\n产品: 奔驰GLC前保险杠 → 输出: 奔驰 GLC X253 前保险杠总成 | Altai Parts\n\n规则：品牌名只出现一次，控制在60字符内，包含车型代号和零件名。',
      en: 'Format examples:\nProduct: BMW X5 Tail Light → Output: BMW X5 G05 Tail Light Assembly OEM | Altai Parts\nProduct: Mercedes GLC Front Bumper → Output: Mercedes GLC X253 Front Bumper Assembly | Altai Parts\n\nRules: Brand name appears exactly once, max 60 chars, include model code + part name.',
      ru: 'Примеры формата:\nПродукт: Задние фонари BMW X5 → Вывод: Задние фонари BMW X5 (G05) OEM | Altai Parts\nПравила: Название бренда один раз, max 60 символов, код модели + название запчасти.',
      ar: 'أمثلة التنسيق:\nالمنتج: مصابح خلفية BMW X5 → المخرجات: مصابح خلفية BMW X5 (G05) OEM | Altai Parts\nالقواعد: اسم العلامة مرة واحدة فقط، 60 حرفاً كحد أقصى.',
      ko: '형식 예시:\n제품: BMW X5 후미등 → 출력: BMW X5 (G05) 후미등 총성 OEM | Altai Parts\n규칙: 브랜드명 1회만, 최대 60자, 모델 코드+부품명 포함.',
    };

    return [
      langCode === 'zh' ? '为以下产品生成SEO Meta Title。' :
        langCode === 'ru' ? 'Создайте SEO Meta Title для следующего продукта:' :
          langCode === 'ar' ? 'أنشئ عنوان Meta لـ SEO للمنتج التالي:' :
            langCode === 'ko' ? '다음 제품의 SEO Meta Title을 생성하세요.' :
              'Generate an SEO Meta Title for the following product:',
      '',
      examples[langCode] || examples.en,
      '',
      '产品信息 / Product info:',
      brief,
    ].join('\n');
  }

  if (field === 'metaDescription') {
    const examples: Record<string, string> = {
      zh: '格式示例（120-155字符）:\n输出: BMW X5 G05尾灯总成，原厂品质替换件。精准适配G05车型，阿尔泰汽配出口，全球批发供应。',
      en: 'Example (120-155 chars):\nOutput: BMW X5 G05 tail light assembly, factory-quality replacement. Fits G05 models precisely. Altai Parts — global wholesale export.',
      ru: 'Пример (120-155 символов):\nВывод: Задние фонари BMW X5 (G05), замена заводского качества. Точная совместимость с G01/G05. Altai Parts — мировой оптовый экспорт.',
      ar: 'مثال (120-155 حرفاً):\nالمخرجات: مصابح خلفية BMW X5 (G05)، قطعة بجودة المصنع. توافق دقيق مع G05. Altai Parts — تصدير جملة عالمي.',
      ko: '예시(120-155자):\n출력: BMW X5 (G05) 후미등 총성, 공장 품질 교체 부품. G05 모델 정확한 호환. Altai Parts — 글로벌 도매 수출.',
    };

    return [
      langCode === 'zh' ? '生成SEO Meta Description（120-155字符）。' :
        langCode === 'ru' ? 'Создайте SEO Meta Description (120-155 символов):' :
          langCode === 'ar' ? 'أنشئ وصف Meta لـ SEO (120-155 حرفاً):' :
            langCode === 'ko' ? 'SEO Meta Description(120-155자)을 생성하세요.' :
              'Generate an SEO Meta Description (120-155 characters):',
      '',
      examples[langCode] || examples.en,
      '',
      '产品信息 / Product info:',
      brief,
    ].join('\n');
  }

  // description field
  const examples: Record<string, string> = {
    zh: '参考示例（150-250字，纯文本）：\n输出: 该产品为BMW X5(G05)车型专用的后尾灯总成替换件。采用与原厂相同的材质和工艺制造，确保外观、尺寸及安装孔位完全一致。直接替换原车部件，无需任何改装或调整。产品经过出厂前的功能检测和防水密封测试，保证在各种天气条件下的正常工作。适用于2023年至今生产的X5(G05)标准轴距版和长轴距版。\n\n注意：以上示例仅作格式参考，请根据实际产品信息撰写，不要套用上述内容中的具体参数。',
    en: 'Example (150-250 words, plain text):\nOutput: This tail light assembly is designed as a direct replacement part for BMW X5 (G05) vehicles. Manufactured using materials and processes matching original equipment standards, it ensures identical appearance, dimensions, and mounting points. Direct bolt-on replacement with no modifications required. Each unit undergoes pre-shipment functional testing and water-seal verification for reliable operation in all weather conditions.\n\nNote: This example shows format only. Write based on ACTUAL product info above — do not reuse specific specs from this example.',
    ru: 'Пример (150-250 слов):\nВывод: Данные задние фонари являются заменяющей деталью для BMW X5 (G05). Изготовлены из материалов и по технологиям, соответствующим оригинальному оборудованию. Прямая замена без доработок. Каждая единица проходит функциональное тестирование и проверку герметичности.\n\nПримечание: пример только для формата. Пишите на основе РЕАЛЬНЫХ данных выше.',
    ar: 'مثال (150-250 كلمة):\nالمخرجات: هذه المصابح الخلفية هي قطعة استبدال مباشر لـ BMW X5 (G05). مصنوعة من مواد ومواصفات مطابقة للمعدات الأصلية. استبدال مباشر بدون تعديلات. كل وحدة تخضع لاختبار وظيفي وفحص مانع تسرب.\n\nملاحظة: المثال للتنسيق فقط. اكتب بناءً على البيانات الفعلية أعلاه.',
    ko: '예시(150-250단어):\n출력: 이 후미등은 BMW X5 (G05)용 직접 교체 부품입니다. 원본 장비와 동일한 소재와 공정으로 제작되어 외관, 치수, 장착 지점이 완벽히 일치합니다. 수정 없이 직접 볼트온 교체 가능. 모든 유닛 출하 전 기능 테스트와 방수 검증 완료.\n\n참고: 예시는 형식만 참고하세요. 실제 제품 정보에 기반하여 작성.',
  };

  return [
    langCode === 'zh' ? '撰写专业的产品描述（150-250字）。' :
      langCode === 'ru' ? 'Напишите профессиональное описание продукта (150-250 слов):' :
        langCode === 'ar' ? 'اكتب وصفاً احترافياً للمنتج (150-250 كلمة):' :
          langCode === 'ko' ? '전문적인 제품 설명(150-250단어)을 작성하세요.' :
            'Write a professional product description (150-250 words):',
    '',
    examples[langCode] || examples.en,
    '',
    '产品信息 / Product info:',
    brief,
  ].join('\n');
}

// ─── Post-Processing Validation ──────────────────────────────────
// Catches issues that slip past even a 70B model's instructions.

const PLACEHOLDER_PATTERNS = [
  // Phone numbers
  /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
  /\+\d{1,3}[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{4}/g,
  // Bracketed placeholders
  /\[[\w\s@.-]+\]/g,
  // Template text patterns
  /\[Support\s+(Email|Phone|URL)\]/gi,
  /\[Live\s+Chat\s*(URL)?\]/gi,
  /\[Your\s+(Email|Phone|Website)\]/gi,
  /(Phone|Tel|Email|WhatsApp|WeChat)\s*[:：]\s*\S+/gi,
  // Common hallucinated warranty/delivery phrases
  /\d+\s*-(year|month|day)\s*warranty/gi,
  /\d+-day\s*(return|money.?back)/gi,
  /(free\s*shipping|24.?hour.*delivery|express.*shipping)/gi,
];

const BAD_TRANSLATIONS: [RegExp, string][] = [
  // Fix common mistranslations of auto parts terms
  [/front\s+bucket\s+assembly/gi, 'front bumper assembly'],
  [/cask\s+holder\s+assembly/gi, 'bumper mount bracket'],
  [/cask\s+holder/gi, 'bumper mount'],
  [/weight.?loss\s+design/gi, 'lightweight design'],
  [/efficient\s+weight/gi, 'lightweight'],
];

function cleanOutput(text: string): string {
  let cleaned = text;

  // 1. Strip markdown formatting
  cleaned = cleaned.replace(/\*\*\*(.*?)\*\*\*/g, '$1');
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/(?<!\*)\*(?!\s)(.*?)(?<!\s)\*(?!\*)/g, '$1');
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/^[\s]*[-•·]\s+/gm, '');
  cleaned = cleaned.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // 2. Remove leading/trailing quotes
  cleaned = cleaned.replace(/^["'""''「」『』]+|["'""''「」『』]+$/g, '');

  // 3. Remove "Output:" prefix in any language
  cleaned = cleaned.replace(/^(Output|输出|Вывود|المخرجات|출력)\s*[:：]\s*/i, '');

  // 4. Strip placeholder/template content
  for (const pattern of PLACEHOLDER_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 5. Fix known bad translations (English only)
  for (const [bad, good] of BAD_TRANSLATIONS) {
    cleaned = cleaned.replace(bad, good);
  }

  // 6. Collapse multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 7. Clean up double spaces left after stripping
  cleaned = cleaned.replace(/  +/g, ' ');

  return cleaned.trim();
}

/** Validate and fix SEO title format. */
function cleanMetaTitle(title: string, productName?: string): string {
  let t = title.trim();

  // Remove duplicate "Altai Parts" or "Altai Auto Parts"
  t = t.replace(/\|\s*Altai\s+(Auto\s+)?Parts.*?\|\s*Altai\s+(Auto\s+)?Parts/i, '| Altai Parts');

  // If title exceeds 80 chars, truncate at last space before position 75
  if (t.length > 80) {
    const truncated = t.substring(0, 75);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 30) {
      t = truncated.substring(0, lastSpace);
    } else {
      t = t.substring(0, 77) + '...';
    }
  }

  // Ensure title doesn't end with comma, pipe, or hyphen
  t = t.replace(/[,\-|:]\s*$/, '');
  t = t.trim();

  // Ensure we have something meaningful
  if (t.length < 10 && productName) {
    t = `${productName} | Altai Parts`;
  }

  return t;
}

/** Validate meta description length. */
function cleanMetaDescription(desc: string): string {
  let d = desc.trim();

  // If way too long, truncate at sentence boundary near 160 chars
  if (d.length > 170) {
    const truncated = d.substring(0, 158);
    // Try to end at sentence boundary
    const lastPeriod = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('。'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('！'),
    );
    if (lastPeriod > 60) {
      d = truncated.substring(0, lastPeriod + 1);
    } else {
      d = truncated;
    }
  }

  return d.trim();
}

// ─── Applicable Models Generation ─────────────────────────────────
// Dedicated handler for AI-powered vehicle compatibility lookup.
// Returns a JSON array of {brand, model, year, engine} objects.

/** Known brand → common chassis codes for accuracy. */
const BRAND_CHASSIS_CODES: Record<string, Record<string, string>> = {
  bmw: {
    '3 Series': 'E90/E91/F30/F31/G20/G21',
    '4 Series': 'F32/F33/F36/G22/G23/G26',
    '5 Series': 'E60/E61/F10/F11/G30/G31',
    '7 Series': 'F01/F02/G11/G12',
    'X1': 'E84/F48/U11',
    'X3': 'E83/F25/G01',
    'X5': 'E53/F15/G05',
    'X6': 'E71/F16/G06',
    'X7': 'G07',
    'M3': 'E90/F80/G80',
    'M4': 'F82/F83/G82/G83',
    'M5': 'F90',
    'M8': 'F91/F92/F93',
    'Z4': 'E89/G29',
  },
  mercedes: {
    'C-Class': 'W204/W205/W206',
    'E-Class': 'W212/W213/W214',
    'S-Class': 'W221/W222/W223',
    'GLC': 'X253/X254',
    'GLE': 'W166/V167',
    'GLS': 'X166/V167',
    'A-Class': 'W176/W177',
    'CLA': 'C117/C118',
  },
  audi: {
    'A3': '8L/8P/8V',
    'A4': 'B5/B6/B7/B8/B9',
    'A5': 'B8/B9',
    'A6': 'C4/C5/C6/C7/C8',
    'A7': 'C7/C8',
    'Q3': '8U/F3',
    'Q5': '8R/FY',
    'Q7': '4M',
    'Q8': '4M',
  },
  porsche: {
    '911': '991/992',
    'Cayenne': '955/957/92A/9YA',
    'Macan': '95B',
    'Panamera': '970/971',
    'Cayman': '981/718',
    'Boxster': '981/718',
  },
  landrover: {
    'Range Rover': 'L322/L405/L460',
    'Range Rover Sport': 'L320/L494',
    'Discovery': 'L319/L462',
    'Defender': 'L663',
    'Evoque': 'L538/L551',
  },
  volkswagen: {
    'Golf': 'Mk5/Mk6/Mk7/Mk8',
    'Passat': 'B6/B7/B8',
    'Tiguan': '5N/AD1',
    'Touareg': '7L/7P/CR',
    'Jetta': 'A5/A6',
    'Atlas': 'AN',
  },
  volvo: {
    'XC60': 'I/V216',
    'XC90': 'I/V266',
    'S60': 'P3/V514',
    'V60': 'P3/V215',
    'S90': 'V515',
  },
  ferrari: {
    'F430': 'F430',
    '458': '458 Italia/Speciale',
    '488': '488 GTB/Spider',
    'F8': 'F8 Tributo/Spider',
    'Roma': 'Roma',
    'SF90': 'SF90 Stradale',
  },
  lamborghini: {
    'Huracán': 'Huracán LP610/Spyder/Evo',
    'Urus': 'Urus',
    'Aventador': 'Aventador LP700/S/SVJ',
  },
  bentley: {
    'Continental GT': 'CGT/CGT3',
    'Flying Spur': 'FS/FS3',
    'Mulsanne': 'Mulsanne',
    'Bentayga': 'Bentayga',
  },
  rollsroyce: {
    'Ghost': 'RR01/RR11',
    'Phantom': 'RR1/RR3',
    'Wraith': 'RR2',
    'Dawn': 'RR5',
    'Cullinan': 'RR6',
  },
  lexus: {
    'ES': 'XV60/XV70',
    'IS': 'XE10/XE20/XE30',
    'NX': 'AZ10',
    'RX': 'AL10/AL20/GL10/GL15',
    'LS': 'XF10/XF40/XF50',
  },
  lincoln: {
    'Navigator': 'UN173/UN582',
    'Aviator': 'U611',
    'Corsair': 'U586',
    'MKC': 'U586',
    'MKX': 'U587',
  },
  xiaomi: {
    'SU7': 'SU7',
  },
};

function buildApplicableModelsPrompt(productInfo: any): string {
  const nameEn = productInfo.name?.en || '';
  const nameZh = productInfo.name?.zh || '';
  const model = productInfo.model || '';
  const category = productInfo.category || '';
  const brandName = CATEGORY_LABELS[category]?.replace(' Parts', '').replace(' Auto Parts', '') || '';
  const chassisInfo = BRAND_CHASSIS_CODES[category];

  return [
    'Generate a JSON array of compatible vehicle models for this auto part.',
    '',
    'PRODUCT INFO:',
    `- Name (EN): ${nameEn}`,
    nameZh ? `- Name (ZH): ${nameZh}` : null,
    `- Model Code: ${model}`,
    `- Brand/Category: ${brandName}`,
    chassisInfo ? ['', `KNOWN CHASSIS CODES for ${brandName} (use these — do NOT invent codes not listed):`, ...Object.entries(chassisInfo).map(([m, c]) => `  ${m}: ${c}`)] : null,
    '',
    'RULES:',
    '- Return ONLY a valid JSON array, no other text, no explanation',
    '- Each element: { "brand": string, "model": string, "year": string, "engine": string }',
    '- "brand": exact brand name (BMW, Mercedes-Benz, Audi, etc.)',
    '- "model": include chassis code if known (e.g. "X5 (G05)", "5 Series (G30)")',
    '- "year": accurate year range for that chassis generation',
    '- "engine": accurate engine specs for that variant (e.g. "3.0L Twin-Turbo I6", "2.0L Turbo I4")',
    '- Include ALL compatible sub-models/engines (e.g. xDrive40i AND xDrive50i for X5 G05)',
    '- Do NOT include incompatible models — only confirmed matches',
    '- If uncertain about compatibility, return empty array []',
    '- Maximum 15 entries',
    '',
    'RESPONSE FORMAT EXAMPLE:',
    '[{"brand":"BMW","model":"X5 (G05)","year":"2019-2024","engine":"3.0L Twin-Turbo I6 xDrive40i"}]',
  ].filter(Boolean).join('\n');
}

/** Parse AI response into ApplicableModel array. Strips non-JSON text and validates entries. */
function parseApplicableModels(raw: string, category: string): any[] {
  // 1. Try to extract JSON array from the response
  // AI sometimes wraps the array in text like "Here are the models: [...]"
  let jsonStr = raw;

  // Find the first [...] block
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    jsonStr = arrayMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return [];

    // Validate and clean each entry
    return parsed.filter((entry: any) => {
      // Must have at least brand and model
      if (!entry.brand || !entry.model) return false;
      // Brand should match the product category (but allow slight variations)
      return true;
    }).map((entry: any) => ({
      brand: String(entry.brand || '').trim(),
      model: String(entry.model || '').trim(),
      year: String(entry.year || '').trim(),
      engine: String(entry.engine || '').trim() || '',
    }));
  } catch {
    // JSON parse failed — try to extract individual model entries from text
    // Fallback: look for patterns like "BMW X5 (G05) 2019-2024 3.0L"
    const models: any[] = [];
    const brandName = CATEGORY_LABELS[category]?.replace(' Parts', '').replace(' Auto Parts', '') || '';

    // Match patterns: Brand Model (Code) Year-Year Engine
    const pattern = /(\w[\w\s-]*?)\s+([\w\s]+(?:\([\w]+\))?)\s+(\d{4}[-–]\d{4}|\d{4})\s+([\d.L\s]+\w+)/g;
    let match;
    while ((match = pattern.exec(raw)) !== null) {
      models.push({
        brand: match[1].trim() || brandName,
        model: match[2].trim(),
        year: match[3].trim(),
        engine: match[4].trim(),
      });
    }

    return models;
  }
}



export async function onRequestPost(context: any): Promise<Response> {
  if (!isAuthenticated(context.request, context.env)) {
    return unauthorizedResponse();
  }

  if (!context.env.AI) {
    return new Response(JSON.stringify({ error: 'AI binding not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { field, productInfo, lang } = body;

  if (!['description', 'metaTitle', 'metaDescription', 'applicableModels'].includes(field)) {
    return new Response(JSON.stringify({ error: 'Invalid field. Must be: description, metaTitle, metaDescription, or applicableModels' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!productInfo) {
    return new Response(JSON.stringify({ error: 'Missing productInfo' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const brief = buildProductBrief(productInfo);

  // ─── Applicable Models: special handler (JSON output, not localized text) ────
  if (field === 'applicableModels') {
    const prompt = buildApplicableModelsPrompt(productInfo);
    const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

    let lastError: string | null = null;
    
    // Retry up to 2 times (total 3 attempts) — Cloudflare AI can return transient IntermediateError
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const aiResult: any = await context.env.AI.run(MODEL, {
          messages: [
            {
              role: 'system',
              content: 'You are an automotive compatibility database. Return ONLY a valid JSON array of vehicle models. No explanations, no markdown, no text outside the JSON array.',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1024,
        });

        let raw = (aiResult?.response || '').trim();
        // Strip markdown code fences if present
        raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        // Do NOT run cleanOutput on JSON — it's designed for text fields and would corrupt JSON

        const models = parseApplicableModels(raw, productInfo.category || '');

        return new Response(JSON.stringify({ models }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (aiErr: any) {
        lastError = aiErr?.message || aiErr?.toString() || String(aiErr);
        console.error(`[AI SEO] applicableModels AI error (attempt ${attempt + 1}/3):`, lastError);
        
        // Don't retry on validation errors, only on transient network/AI errors
        if (lastError.includes('validation') || lastError.includes('invalid')) break;
        
        // Brief wait before retry (only after first attempt)
        if (attempt < 2) await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
      }
    }

    return new Response(JSON.stringify({ error: `AI车型识别失败: ${lastError}`, models: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** Run single AI generation for one language with post-processing validation. */
  const generateForLang = async (
    fieldType: string,
    langCode: string,
  ): Promise<string> => {
    const systemPrompt = buildSystemPrompt(fieldType, langCode);
    const userPrompt = buildUserPrompt(fieldType, langCode, brief);

    const aiResult: any = await context.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: fieldType === 'metaTitle' ? 128 : 512,
        temperature: 0.2, // Very low temperature for maximum accuracy
      },
    );

    let raw = (aiResult?.response || '').trim();
    raw = cleanOutput(raw);

    // Field-specific post-processing
    if (fieldType === 'metaTitle') {
      raw = cleanMetaTitle(raw, productInfo?.name?.en);
    } else if (fieldType === 'metaDescription') {
      raw = cleanMetaDescription(raw);
    }

    return raw;
  };

  try {
    if (lang && !ALL_LANGS.includes(lang)) {
      return new Response(JSON.stringify({ error: 'Invalid language' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (lang) {
      const text = await generateForLang(field, lang);
      if (!text) {
        return new Response(JSON.stringify({ error: 'AI generated empty response' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ text }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Multi-language mode: generate all 5 languages in parallel
    const results = await Promise.all(
      ALL_LANGS.map(async (langCode) => {
        const text = await generateForLang(field, langCode);
        return [langCode, text] as [string, string];
      }),
    );

    const localizedText: Record<string, string> = {};
    for (const [langCode, text] of results) {
      localizedText[langCode] = text;
      if (!text) {
        console.warn(`[AI SEO] Empty response for language: ${langCode}`);
      }
    }

    const hasAnyContent = Object.values(localizedText).some((t) => t.length > 0);
    if (!hasAnyContent) {
      return new Response(JSON.stringify({ error: 'AI generated empty responses for all languages' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ text: localizedText }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[AI SEO] Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'AI generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
