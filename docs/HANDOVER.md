# altai.parts 项目交接文档

> 最后更新: 2026-06-27
> 仓库: https://github.com/sz26655873-dotcom/auto-parts-site.git

---

## 1. 项目概述

**altai.parts** 是阿尔泰供应链管理(广州)有限公司的汽车配件出口独立站，支持 5 种语言（中文/英文/俄语/阿拉伯语/韩语），含完整后台管理系统。

- **域名**: www.altai.parts
- **部署平台**: Cloudflare Pages + Functions + KV + R2 + Workers AI
- **部署分支**: `y`（不是 main！）

## 2. 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | React 18 + TypeScript |
| 构建 | Vite 5 |
| UI | MUI 5 + Tailwind CSS 3 |
| 路由 | React Router v6 |
| 后端 | Cloudflare Pages Functions（TypeScript） |
| 数据库 | Cloudflare KV（产品/公司/联系方式） |
| 图片存储 | Cloudflare R2（bucket: `altai-parts-images`） |
| AI | Workers AI（模型: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`） |
| 测试 | Vitest |

## 3. 本地开发

### 环境要求
- Node.js 22+
- npm

### 安装与运行
```bash
git clone https://github.com/sz26655873-dotcom/auto-parts-site.git
cd auto-parts-site
git checkout y          # 切到部署分支
npm install
npm run dev             # 本地开发，http://localhost:5173
```

### 本地构建
```bash
npm run build           # tsc + vite build + 复制 functions-src/ → functions/
npm run test            # 运行测试
```

### 部署
```bash
# ⚠️ 必须用 --cwd 指定项目根目录，否则 Functions 不会被上传
npx wrangler pages deploy dist \
  --project-name=auto-parts-site \
  --branch=y \
  --commit-dirty=true \
  --cwd /path/to/auto-parts-site
```

> 项目根目录有 `deploy.sh` 可直接执行以上命令。

## 4. Cloudflare 配置

### wrangler.toml（不在 git 中，需手动创建）

`wrangler.toml` 已加入 `.gitignore`，新工程师需要从原工程师处获取或重新创建：

```toml
name = "auto-parts-site"
pages_build_output_dir = "dist"
compatibility_date = "2025-06-01"

[[kv_namespaces]]
binding = "INQUIRIES_KV"
id = "<KV_NAMESPACE_ID_INQUIRIES>"

[[kv_namespaces]]
binding = "PRODUCTS_DATA"
id = "<KV_NAMESPACE_ID_PRODUCTS>"

[[r2_buckets]]
binding = "IMAGES_R2"
bucket_name = "altai-parts-images"

[ai]
binding = "AI"
```

### 需要从原工程师处获取的信息

| 信息 | 说明 |
|------|------|
| Cloudflare 账号 | 需要账号访问权限或 API token |
| wrangler.toml | 含 KV namespace ID（敏感） |
| 后台登录密码 | `/api/auth` 认证用的密码 |
| KV 数据 | 产品/公司信息存储在 KV，需通过 API 或 Cloudflare Dashboard 导出 |

### Cloudflare 服务绑定

| 绑定名 | 类型 | 用途 |
|--------|------|------|
| `PRODUCTS_DATA` | KV | 产品/公司/联系方式数据 |
| `INQUIRIES_KV` | KV | 询盘数据 |
| `IMAGES_R2` | R2 | 产品图片存储 |
| `AI` | Workers AI | AI 生成 SEO + 聊天 |

## 5. 项目架构

### 目录结构

```
auto-parts-site/
├── functions-src/          # Cloudflare Functions 源码（编辑这里）
│   ├── _middleware.ts      # SEO中间件（HTMLRewriter流式注入meta）
│   ├── api/
│   │   ├── _auth.ts        # 认证工具
│   │   ├── auth.ts         # POST /api/auth（登录获取token）
│   │   ├── data/
│   │   │   ├── [key].ts    # GET/PUT /api/data/:key（KV CRUD）
│   │   │   └── bulk.ts     # POST /api/data/bulk（批量写入）
│   │   ├── ai/
│   │   │   ├── generate-seo.ts  # POST /api/ai/generate-seo（4种field）
│   │   │   └── chat.ts          # POST /api/ai/chat（聊天机器人）
│   │   ├── inquiries/      # 询盘 CRUD
│   │   ├── inquiry.ts      # POST /api/inquiry（提交询盘）
│   │   ├── image.ts        # GET /api/image（R2图片代理）
│   │   ├── upload.ts       # POST /api/upload（R2上传）
│   │   └── track.ts        # POST /api/track（访客统计）
│   ├── lib/
│   │   ├── kv.ts           # KV操作工具
│   │   └── seedData.ts     # 种子数据
│   └── env.d.ts            # Workers类型声明
│
├── functions/              # 构建时自动从 functions-src/ 复制（不要手动编辑）
├── dist/                   # 构建输出（gitignore）
│
├── public/                 # 静态资源
│   ├── _headers            # 安全头 + 缓存策略
│   ├── _redirects          # SPA回退规则
│   ├── sitemap.xml         # 站点地图（构建时生成）
│   ├── robots.txt
│   ├── og-image.png        # OG图片（158KB）
│   ├── logo.png            # 站点logo（33KB）
│   └── images/             # 品牌logo等静态图片
│       └── hero/logos/     # 14个品牌logo
│
├── src/
│   ├── App.tsx             # 根路由
│   ├── main.tsx            # 入口 + 版本检测
│   ├── i18n/               # 国际化（5语言翻译表）
│   ├── data/products.ts    # 数据模型 + 14品牌分类定义
│   ├── pages/              # 前端页面
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CategoryPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── components/         # 通用组件
│   │   ├── Layout.tsx      # 布局（Navbar + Outlet + Footer）
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── HeroCarousel.tsx  # 轮播（14品牌logo 7x2网格）
│   │   ├── AiChatWidget.tsx  # AI聊天组件
│   │   ├── FloatingInquiry.tsx
│   │   ├── WhatsAppDialog.tsx
│   │   ├── seo/             # SEO组件
│   │   └── ...
│   ├── admin/              # 后台管理
│   │   ├── AdminApp.tsx    # 后台路由
│   │   ├── AdminLayout.tsx # 侧栏布局
│   │   ├── ProductManager.tsx  # 产品管理（一键同步语言+一键优化SEO）
│   │   ├── BulkUpload.tsx      # 批量上传
│   │   ├── InquiryManager.tsx  # 询盘管理
│   │   ├── AnalyticsManager.tsx # 访客分析
│   │   ├── ContactManager.tsx
│   │   ├── CompanyManager.tsx
│   │   ├── DataManager.tsx     # 数据导入导出
│   │   ├── LocalizedTextField.tsx  # 多语言文本输入
│   │   ├── MultiImageGallery.tsx   # 图片管理（R2上传）
│   │   ├── r2Upload.ts             # R2上传工具
│   │   └── adminStorage.ts         # 认证token管理
│   ├── utils/              # 工具函数
│   └── hooks/
│
├── vite.config.ts          # Vite配置 + functions复制插件
├── wrangler.toml           # Cloudflare配置（gitignore，需手动创建）
├── deploy.sh               # 一键部署脚本
└── package.json
```

### 前端路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 |
| `/products` | 产品目录 |
| `/products/category/:cat` | 品牌分类页 |
| `/products/:slug` | 产品详情 |
| `/about` | 关于我们 |
| `/contact` | 联系我们 |
| `/admin` | 后台登录 |
| `/admin/dashboard` | 控制台 |
| `/admin/products` | 产品管理 |
| `/admin/bulk-upload` | 批量添加 |
| `/admin/inquiries` | 询盘管理 |
| `/admin/contact` | 联系方式管理 |
| `/admin/company` | 公司信息 |
| `/admin/data` | 数据管理 |
| `/admin/analytics` | 访客数据 |

### 数据流

```
前端 (AdminDataContext)
  ├── 在线 → fetch /api/data/:key → Cloudflare KV
  └── 离线 → localStorage 缓存 fallback

后台编辑 → PUT /api/data/:key → KV 更新
询盘提交 → POST /api/inquiry → INQUIRIES_KV
图片上传 → POST /api/upload → R2 bucket
AI生成  → POST /api/ai/generate-seo → Workers AI (70B模型)
AI聊天  → POST /api/ai/chat → Workers AI (70B模型)
```

## 6. 关键约定（务必遵守）

### 6.1 Functions 源码

- **编辑 `functions-src/`，不要编辑 `functions/`**
- 构建时 Vite 插件自动把 `functions-src/` 复制到 `dist/functions/` 和 `functions/`（两个目录都需要）
- 部署时必须用 `--cwd` 指定项目根目录，否则 Functions 不会被上传

### 6.2 AI 模型

- 模型名: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **⚠️ 必须带 `fp8`**，写成 `llama-3.3-70b-instruct-fast` 会报错
- `generate-seo.ts` 支持 4 种 field:
  - `description` — 产品描述
  - `metaTitle` — SEO标题
  - `metaDescription` — Meta描述
  - `applicableModels` — 适用车型（返回 JSON 数组）
- **applicableModels 路径不要调 `cleanOutput()`**（纯文本清理函数会破坏 JSON）
- `cleanOutput()` 会自动清理 11 种占位符模式 + 修正已知错译

### 6.3 SEO 中间件

- `functions-src/_middleware.ts` 用 **HTMLRewriter** 流式注入每页独立 meta
- **不要**用 `response.text()` + 正则替换（会缓冲整个 HTML，导致页面卡顿）
- `HTMLRewriter.transform()` 返回 Response，不要再包 `new Response()`
- 支持 i18n 语言路由（`/ru/about` → 俄语 title）
- 旧 slug 301 重定向（`SLUG_REDIRECTS` 映射表）
- 未知 slug → 404 + noindex
- OG image 必须用绝对 URL（`https://www.altai.parts/...`）

### 6.4 API 缓存

- GET `/api/data/*`: `public, max-age=60, s-maxage=300, stale-while-revalidate=60`
- 其他 API: `no-cache`
- 客户端 **不要**加 cache-busting 参数（如 `_t=${Date.now()}`）
- Cloudflare CDN 不缓存 Pages Functions 响应（`cf-cache-status: DYNAMIC` 是正常的），浏览器缓存仍有效

### 6.5 分类系统

- 按品牌划分，共 14 个品牌：
  BMW → Mercedes-Benz → Audi → Porsche → Land Rover → Volkswagen → Volvo → Ferrari → Lamborghini → Bentley → Rolls-Royce → Lexus → Lincoln → Xiaomi（最后）
- 定义在 `src/data/products.ts` 的 `productCategories` 数组
- 中间件的 `CATEGORY_NAMES` 必须同步更新
- `ProductCategory` 接口有 `logo?: string` 字段

### 6.6 产品编辑 UI

- 所有 `LocalizedTextField` 设 `showActions={false}`（隐藏分散的 AI/翻译按钮）
- 统一两个按钮在编辑表单顶部：
  - **一键同步语言** — 从中文翻译到 en/ru/ar/ko
  - **一键优化SEO** — 并行调 4 个 AI 接口（description + metaTitle + metaDescription + applicableModels）

### 6.7 其他

- 后台认证: Bearer token（base64 `password:expiry`），`/api/auth` 端点
- 版本检测: `__APP_VERSION__`（构建时间戳），`main.tsx` 自动对比+刷新
- Sitemap: 静态文件 `public/sitemap.xml`，构建时生成
- 安全 Headers: 7 个安全响应头在 `public/_headers`，CSP 不含 cloudinary
- WhatsApp 链接: `buildWhatsAppLinkForLang(lang)` 在 `src/utils/whatsapp.ts`
- 聊天转询盘: `sessionStorage('aiChatInquiryMessage')` + `CustomEvent('openInquiryFromChat')`

## 7. KV 数据结构

### 产品数据 (key: `products`)

```typescript
interface Product {
  id: number;
  name: LocalizedString;       // { zh, en, ru, ar, ko }
  model: string;
  category: string;            // 品牌ID，如 "bmw"
  image: string;               // 主图URL
  images?: string[];           // 最多5张
  description: LocalizedString;
  slug: string;
  oemNumber?: string;
  applicableModels?: ApplicableModel[];
  specifications?: Record<string, string>;
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  featured?: boolean;
  sortOrder?: number;
}

interface ApplicableModel {
  brand: string;
  model: string;
  year: string;
  engine?: string;
}
```

### 其他 KV 键

| Key | 内容 |
|-----|------|
| `products` | 产品数组 |
| `contact` | 联系方式 |
| `company` | 公司信息 |

### API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/data/:key` | 读取 KV 数据 |
| PUT | `/api/data/:key` | 写入 KV 数据（需认证） |
| POST | `/api/data/bulk` | 批量写入（需认证） |
| POST | `/api/auth` | 登录获取 token |
| POST | `/api/ai/generate-seo` | AI 生成 SEO 内容 |
| POST | `/api/ai/chat` | AI 聊天 |
| POST | `/api/inquiry` | 提交询盘 |
| GET/POST | `/api/inquiries/*` | 询盘管理 |
| POST | `/api/upload` | R2 图片上传 |
| GET | `/api/image?key=...` | R2 图片代理 |
| POST | `/api/track` | 访客统计 |

## 8. 常见坑点

| 问题 | 原因 | 解决 |
|------|------|------|
| AI 调用报错 | 模型名漏了 `fp8` | 用 `@cf/meta/llama-3.3-70b-instruct-fp8-fast` |
| Functions 不生效 | 部署时没用 `--cwd` | 加 `--cwd /path/to/project` |
| 页面输出 `[object Response]` | `HTMLRewriter.transform()` 结果被包了 `new Response()` | 直接用 `transformed.body` |
| AI 车型 JSON 被破坏 | `cleanOutput()` 对 JSON 运行 | applicableModels 路径跳过 cleanOutput |
| 页面加载慢 | middleware 用 `response.text()` 缓冲 | 用 HTMLRewriter 流式处理 |
| Contact/About 慢 | API 无缓存 + cache-busting | `max-age=60, s-maxage=300` + 去掉 `_t` 参数 |
| 分页标题闪烁 | 中间件 title ≠ 前端 title | 两边保持一致 |

## 9. 已删除的功能（不要加回来）

- 轮播管理后台 (HeroManager.tsx)
- MOQ/Packaging/LeadTime 卡片 (ProductDetailPage)
- 一键抠图功能 (bgRemoval.ts)

## 10. 测试

```bash
npm run test          # 运行全部测试
npm run test:watch    # 监听模式
```

当前约 290 个测试，其中 2 个 `data-key.test.ts` 失败是预存的，与功能无关。

## 11. 联系方式

如有疑问，联系原工程师：张斌

---

*本文档由 WorkBuddy 基于项目记忆自动生成，最后更新于 2026-06-27。*
