/**
 * Cloudflare Pages middleware — intercepts all requests and injects
 * SEO meta tags into HTML responses for known page routes.
 *
 * Uses HTMLRewriter (streaming) instead of buffering the entire response,
 * which allows the client to start receiving data immediately.
 */

/** HTML-escape special characters for safe injection into meta tag attributes. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Known old product slugs that were renamed. Maps old slug → new path. */
const SLUG_REDIRECTS: Record<string, string> = {
  'engine-chg-2024': '/products/body-bmw-g06-x6',
  'engine-prs-1850': '/products/body-bmw-g22-4-series',
  'body-bmw-f93-m8-': '/products/body-bmw-f93-m8',
};

/** Category display names for meta tag generation. */
const CATEGORY_NAMES: Record<string, string> = {
  bmw: 'BMW',
  mercedes: 'Mercedes-Benz',
  audi: 'Audi',
  porsche: 'Porsche',
  landrover: 'Land Rover',
  volkswagen: 'Volkswagen',
  volvo: 'Volvo',
  ferrari: 'Ferrari',
  lamborghini: 'Lamborghini',
  bentley: 'Bentley',
  rollsroyce: 'Rolls-Royce',
  lexus: 'Lexus',
  lincoln: 'Lincoln',
  xiaomi: 'Xiaomi',
};

/** Language-specific meta data for static pages. */
const STATIC_PAGE_META: Record<string, Record<string, { title: string; description: string }>> = {
  '/products': {
    en: { title: 'Auto Parts Catalog — Altai Auto Parts', description: 'Browse our complete catalog of OEM auto parts. Engine, chassis, electrical, body parts and more.' },
    zh: { title: '汽车零配件目录 — Altai Auto Parts', description: '浏览我们完整的OEM汽车零配件目录。发动机、底盘、电气、车身零部件等。' },
    ru: { title: 'Каталог автозапчастей — Altai Auto Parts', description: 'Полный каталог OEM автозапчастей. Двигатель, шасси, электрика, детали кузова и другое.' },
    ar: { title: 'كتالوج قطع السيارات — Altai Auto Parts', description: 'تصفح كتالوجنا الكامل لقطع السيارات OEM. محرك، شاسيه، كهرباء، قطع الهيكل والمزيد.' },
    ko: { title: '자동차 부품 카탈로그 — Altai Auto Parts', description: 'OEM 자동차 부품 전체 카탈로그를 살펴보세요. 엔진, 샤시, 전기, 차체 부품 등.' },
  },
  '/about': {
    en: { title: 'About Altai Auto Parts — 15 Years of Excellence', description: 'Altai Auto Parts — 15 years of OEM auto parts manufacturing and export. Quality guaranteed, shipping to 60+ countries.' },
    zh: { title: '关于 Altai Auto Parts — 15年行业深耕', description: 'Altai Auto Parts — 15年OEM汽车零配件制造与出口经验。品质保证，出口至60+国家。' },
    ru: { title: 'О Altai Auto Parts — 15 лет опыта', description: 'Altai Auto Parts — 15 лет производства и экспорта OEM автозапчастей. Гарантия качества, доставка в 60+ стран.' },
    ar: { title: 'عن Altai Auto Parts — 15 عامًا من التميز', description: 'Altai Auto Parts — 15 عامًا من تصنيع وتصدير قطع السيارات OEM. جودة مضمونة، شحن إلى 60+ دول.' },
    ko: { title: 'Altai Auto Parts 소개 — 15년의 노하우', description: 'Altai Auto Parts — 15년 OEM 자동차 부품 제조 및 수출. 품질 보장, 60+ 국가 배송.' },
  },
  '/contact': {
    en: { title: 'Contact Altai Auto Parts — Get a Quote', description: 'Contact Altai Auto Parts for OEM auto parts quotes. WhatsApp, WeChat, email — we respond within 24 hours.' },
    zh: { title: '联系 Altai Auto Parts — 获取报价', description: '联系Altai Auto Parts获取OEM汽车零配件报价。WhatsApp、微信、邮件 — 24小时内回复。' },
    ru: { title: 'Контакты Altai Auto Parts — Запрос цены', description: 'Свяжитесь с Altai Auto Parts для запроса цен на OEM автозапчасти. WhatsApp, WeChat, email — ответ в течение 24 часов.' },
    ar: { title: 'تواصل مع Altai Auto Parts — احصل على عرض سعر', description: 'تواصل مع Altai Auto Parts لطلب أسعار قطع السيارات OEM. WhatsApp، WeChat، البريد — رد خلال 24 ساعة.' },
    ko: { title: 'Altai Auto Parts 연락처 — 견적 받기', description: 'Altai Auto Parts OEM 자동차 부품 견적 요청. WhatsApp, WeChat, 이메일 — 24시간 내 답변.' },
  },
};

/** A simplified product shape returned from KV JSON. */
interface KvProduct {
  category?: string;
  model?: string;
  slug?: string;
  name?: Record<string, string>;
  description?: Record<string, string>;
  metaTitle?: Record<string, string>;
  metaDescription?: Record<string, string>;
  image?: string;
}

/** SEO meta data computed for a specific page route. */
interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

/**
 * Compute page-specific meta data based on URL path.
 * Returns null if the path should not be intercepted (homepage, API, admin).
 */
async function computePageMeta(
  path: string,
  kv: KVNamespace,
): Promise<PageMeta | null> {
  const baseUrl = 'https://www.altai.parts';
  const defaultOgImage = `${baseUrl}/og-image.png`;
  const canonical = `${baseUrl}${path}`;

  // Detect language from URL path: /ru/about → lang=ru, path=/about
  const langMatch = path.match(/^\/(en|zh|ru|ar|ko)(\/.*)?$/);
  const lang: string = langMatch ? langMatch[1] : 'en';
  const realPath: string = langMatch ? (langMatch[2] || '/') : path;

  // Homepage — already has correct meta in index.html
  if (realPath === '/' && lang === 'en') {
    return null;
  }

  // Product detail page: /products/{slug} (or /ru/products/{slug})
  const productMatch = realPath.match(/^\/products\/(?!category)([^/]+)$/);
  if (productMatch) {
    const slug = productMatch[1];

    // Look up product data from KV with 1-hour cache TTL
    const raw = await kv.get('products', { type: 'json', cacheTtl: 3600 });
    if (raw && Array.isArray(raw)) {
      const products: KvProduct[] = raw as KvProduct[];
      const product = products.find((p) => {
        // First try to match by slug field (if it exists)
        if (p.slug && p.slug === slug) return true;
        // Fall back to computed slug from category + model
        const computedSlug = `${p.category}-${p.model}`.toLowerCase().replace(/\s+/g, '-');
        return computedSlug === slug;
      });

      if (product) {
        // Use localized product name for title
        const productName = product.name?.[lang] || product.name?.en || '';
        const title = productName.length > 60
          ? productName.substring(0, 57) + '...'
          : productName;
        // Fall back to metaTitle if name is empty
        const finalTitle = title || (product.metaTitle?.[lang] || product.metaTitle?.en || 'Product');

        const description = escapeHtml(
          (() => {
            const rawDesc =
              product.metaDescription?.[lang] || product.metaDescription?.en || product.description?.[lang] || product.description?.en || '';
            return rawDesc.length > 155
              ? rawDesc.substring(0, 152) + '...'
              : rawDesc;
          })(),
        );

        // OG image must be absolute URL (Facebook/LinkedIn require it)
        const ogImage = product.image
          ? (product.image.startsWith('/') ? `${baseUrl}${product.image}` : product.image)
          : defaultOgImage;

        return {
          title: `${escapeHtml(finalTitle)} | Altai Auto Parts`,
          description,
          canonical,
          ogTitle: `${escapeHtml(finalTitle)} | Altai Auto Parts`,
          ogDescription: description,
          ogImage,
        };
      }
    }

    // Product not found in KV — fall through to SPA handling
    return null;
  }

  // Category page: /products/category/{cat} (or /ru/products/category/{cat})
  const categoryMatch = realPath.match(/^\/products\/category\/([^/]+)$/);
  if (categoryMatch) {
    const cat = categoryMatch[1];
    const catName = CATEGORY_NAMES[cat] || cat;
    const title = `${catName} Parts — Altai Auto Parts`;
    const description = `Browse ${catName} Parts from Altai Auto Parts. OEM quality, competitive pricing, global shipping.`;
    return {
      title: escapeHtml(title),
      description: escapeHtml(description),
      canonical,
      ogTitle: escapeHtml(title),
      ogDescription: escapeHtml(description),
      ogImage: defaultOgImage,
    };
  }

  // Products catalog page: /products (or localized)
  if (realPath === '/products') {
    const meta = STATIC_PAGE_META['/products']?.[lang] || STATIC_PAGE_META['/products']?.en;
    if (meta) {
      return {
        title: escapeHtml(meta.title),
        description: escapeHtml(meta.description),
        canonical,
        ogTitle: escapeHtml(meta.title),
        ogDescription: escapeHtml(meta.description),
        ogImage: defaultOgImage,
      };
    }
  }

  // About page (or localized)
  if (realPath === '/about') {
    const meta = STATIC_PAGE_META['/about']?.[lang] || STATIC_PAGE_META['/about']?.en;
    if (meta) {
      return {
        title: escapeHtml(meta.title),
        description: escapeHtml(meta.description),
        canonical,
        ogTitle: escapeHtml(meta.title),
        ogDescription: escapeHtml(meta.description),
        ogImage: defaultOgImage,
      };
    }
  }

  // Contact page (or localized)
  if (realPath === '/contact') {
    const meta = STATIC_PAGE_META['/contact']?.[lang] || STATIC_PAGE_META['/contact']?.en;
    if (meta) {
      return {
        title: escapeHtml(meta.title),
        description: escapeHtml(meta.description),
        canonical,
        ogTitle: escapeHtml(meta.title),
        ogDescription: escapeHtml(meta.description),
        ogImage: defaultOgImage,
      };
    }
  }

  // Unknown path — let SPA handle it (no meta injection)
  return null;
}

/**
 * Cloudflare Pages middleware — intercepts all requests and injects
 * SEO meta tags into HTML responses using HTMLRewriter (streaming).
 */
export async function onRequest(
  context: {
    request: Request;
    env: { PRODUCTS_DATA: KVNamespace };
    next: () => Promise<Response>;
  },
): Promise<Response> {
  // 1. Get the original response (index.html from Pages asset serving)
  const response = await context.next();

  // 2. Only process HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // 3. Parse URL path
  const url = new URL(context.request.url);
  const path = url.pathname;

  // 4. Skip admin and API paths
  if (path.startsWith('/admin') || path.startsWith('/api')) {
    return response;
  }

  // 5. Compute page-specific meta data
  const meta = await computePageMeta(path, context.env.PRODUCTS_DATA);

  // 5a. Handle product-not-found: redirect known old slugs, 404 for unknown slugs
  const productMatch = path.match(/^\/products\/(?!category)([^/]+)$/);
  if (productMatch && !meta) {
    const slug = productMatch[1];
    // Known old slug → 301 redirect to new URL (preserves SEO authority)
    if (SLUG_REDIRECTS[slug]) {
      const redirectUrl = new URL(SLUG_REDIRECTS[slug], context.request.url);
      return Response.redirect(redirectUrl.toString(), 301);
    }
    // Unknown slug → 404 with noindex (prevents duplicate-content indexing)
    // Use HTMLRewriter for 404 pages as well
    const rewriter = new HTMLRewriter()
      .on('title', {
        element(el: Element) { el.setInnerContent('Page Not Found | Altai Auto Parts'); },
      })
      .on('meta[name="robots"]', {
        element(el: Element) { el.setAttribute('content', 'noindex, follow'); },
      })
      .on('meta[name="title"]', {
        element(el: Element) { el.setAttribute('content', 'Page Not Found | Altai Auto Parts'); },
      })
      .on('link[rel="canonical"]', {
        element(el: Element) { el.setAttribute('href', `https://www.altai.parts${path}`); },
      });

    const transformed = rewriter.transform(response);
    // Copy headers and set status to 404
    const headers = new Headers(transformed.headers);
    return new Response(transformed.body, {
      headers,
      status: 404,
    });
  }

  if (!meta) {
    // No meta injection needed (homepage, unknown non-product path)
    return response;
  }

  // 6. Inject meta tags using HTMLRewriter (streaming — no body buffering)
  const rewriter = new HTMLRewriter()
    .on('title', {
      element(el: Element) { el.setInnerContent(meta.title); },
    })
    .on('meta[name="description"]', {
      element(el: Element) { el.setAttribute('content', meta.description); },
    })
    .on('meta[property="og:title"]', {
      element(el: Element) { el.setAttribute('content', meta.ogTitle); },
    })
    .on('meta[property="og:description"]', {
      element(el: Element) { el.setAttribute('content', meta.ogDescription); },
    })
    .on('meta[property="og:url"]', {
      element(el: Element) { el.setAttribute('content', meta.canonical); },
    })
    .on('meta[property="og:image"]', {
      element(el: Element) { el.setAttribute('content', meta.ogImage); },
    })
    .on('link[rel="canonical"]', {
      element(el: Element) { el.setAttribute('href', meta.canonical); },
    })
    .on('meta[name="twitter:title"]', {
      element(el: Element) { el.setAttribute('content', meta.ogTitle); },
    })
    .on('meta[name="twitter:description"]', {
      element(el: Element) { el.setAttribute('content', meta.ogDescription); },
    })
    .on('meta[name="twitter:image"]', {
      element(el: Element) { el.setAttribute('content', meta.ogImage); },
    })
    .on('meta[name="title"]', {
      element(el: Element) { el.setAttribute('content', meta.title); },
    });

  // 7. Return streaming response — HTMLRewriter.transform() returns a new Response
  //    with the transformed body. We need to copy the body stream and headers separately.
  const transformed = rewriter.transform(response);
  const headers = new Headers(transformed.headers);
  return new Response(transformed.body, {
    headers,
    status: response.status,
  });
}
