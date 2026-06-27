# PRD: localStorage → Cloudflare KV 数据迁移

## 项目信息

- **Language**: 中文
- **Programming Language**: Vite + React 18 + TypeScript + MUI + Tailwind CSS + Cloudflare Pages/Functions
- **Project Name**: `auto-parts-site`
- **域名**: www.altai.parts

### 原始需求复述

将 altai.parts 汽配网站的所有业务数据（产品、联系方式、公司信息、Hero 轮播图、询盘）从浏览器 localStorage 迁移到 Cloudflare KV 服务端存储，通过 API 实现数据的读取与写入，解决跨设备数据不同步、数据持久性差、无法多管理员协作三个核心问题。

---

## 产品定义

### Product Goals

1. **数据一致性**：所有设备访问同一份数据源，任何设备上的管理操作立即生效于全部终端
2. **数据持久化**：业务数据不再依赖浏览器缓存，清除缓存或更换设备不影响数据完整性
3. **多管理员协作**：支持多个管理员同时管理站点数据，具备基本的并发写入保护

### User Stories

1. **As a** 网站管理员, **I want** 在电脑后台编辑的产品数据能在手机端同步显示, **so that** 我随时用任何设备查看和管理产品目录
2. **As a** 网站管理员, **I want** 清除浏览器缓存后网站数据不会丢失, **so that** 我不用担心误操作或浏览器故障导致业务数据丢失
3. **As a** 多人运营团队的管理员, **I want** 其他管理员也能看到和修改我编辑的数据, **so that** 团队成员可以协作维护产品信息
4. **As a** 网站访客, **I want** 前台展示的产品信息始终是管理员最新发布的版本, **so that** 我看到的信息是准确和最新的

---

## 技术规范

### 当前数据结构概览

| 数据类型 | localStorage key | TypeScript 类型 | 默认值来源 |
|---------|------------------|----------------|-----------|
| 产品列表 | `autoparts_products` | `Product[]` | `src/data/products.ts` 种子数据（16 条） |
| 联系方式 | `autoparts_contact_info` | `ContactInfo` | `DEFAULT_CONTACT_INFO` |
| 公司信息 | `autoparts_company_info` | `CompanyInfo` | `DEFAULT_COMPANY_INFO` |
| Hero 轮播 | `autoparts_hero_slides` | `HeroSlidesInfo` | `DEFAULT_HERO_SLIDES` |
| 询盘数据 | 已通过 API 存储 | `Inquiry` (KV) | — |
| 数据版本 | `autoparts_data_version` | `number` | `CURRENT_DATA_VERSION = 1` |

### Requirements Pool

#### P0 — Must Have（核心迁移，必须完成）

1. **KV 存储层搭建**
   - 创建 Cloudflare KV namespace（`PRODUCTS_DATA`）
   - 为每种数据类型定义 KV key 命名规范：`products`, `contact_info`, `company_info`, `hero_slides`, `data_version`
   - 实现 KV 读写辅助函数（`kvGet`, `kvPut`），封装于 `functions/lib/kv.ts`

2. **CRUD API 端点**
   - `GET /api/data/:key` — 读取指定数据类型（公开访问，前台渲染所需）
   - `PUT /api/data/:key` — 更新指定数据类型（需管理员认证）
   - `POST /api/data/bulk` — 批量导入/初始化数据（需管理员认证）
   - API 响应格式统一：`{ success: boolean, data?: T, error?: string }`

3. **前端数据层迁移**
   - 重写 `AdminDataContext`：所有 getter/setter 从 localStorage 切换为 API 调用
   - 初始化流程：`AdminDataProvider` mount 时从 `/api/data/products` 等端点拉取数据，而非读取 localStorage
   - 写入流程：`updateProducts` / `updateContactInfo` / `updateCompanyInfo` / `updateHeroSlides` 调用 `PUT /api/data/:key`，成功后更新本地 React state
   - 保留种子数据作为首次部署时的自动初始化机制

4. **数据迁移脚本**
   - 提供一次性迁移脚本/页面：读取当前 localStorage 数据 → 通过 `POST /api/data/bulk` 写入 KV
   - 迁移完成后自动清除 localStorage 中的旧数据

5. **前台数据加载**
   - 前台页面（产品列表、联系方式、公司信息、Hero 轮播）从 `/api/data/:key` 获取数据
   - 支持 SSR/SSG 场景下的数据预取（Cloudflare Pages Functions 作为 API 层）

#### P1 — Should Have（提升体验，应该完成）

6. **数据版本控制**
   - KV 中存储 `data_version` 和 `last_modified` 元数据
   - 前端定期轮询（如 30 秒）检查 `last_modified`，若发现变化则自动刷新数据（多管理员协作感知）
   - API 响应中附带 `lastModified` 时间戳

7. **离线/网络异常兜底**
   - API 调用失败时 fallback 到 localStorage 缓存（作为离线快照）
   - 网络恢复后自动同步：将本地修改推送至 KV，或从 KV 拉取最新数据
   - 管理界面显示网络状态指示器（在线/离线/同步中）

8. **数据导入导出保留**
   - 保留 Dashboard 中的 JSON 导出/导入功能，但改为基于 KV 数据而非 localStorage
   - 导入功能：解析 JSON → `PUT /api/data/bulk` 写入 KV

9. **乐观锁 / 并发写入保护**
   - KV 写入时附带 `lastModified` 版本号，若服务端版本更新则拒绝写入（返回 409 Conflict）
   - 前端收到 409 后提示用户"数据已被其他人修改"，并刷新展示最新数据

#### P2 — Nice to Have（锦上添花，暂不实现）

10. **实时推送**
    - 使用 Cloudflare Durable Objects 或 WebSocket 实现多管理员实时协同编辑通知
    - 当前用轮询方案（P1-6）替代

11. **数据变更历史**
    - KV 中保存每次修改的 diff/历史版本，支持回滚到任意历史状态
    - 当前仅保留 `last_modified` 时间戳

12. **图片资源迁移**
    - 产品图片从外部 URL（picsum.photos）迁移到 Cloudflare R2 存储
    - 当前不在本次 PRD 范围内，保持现有图片 URL 方式

### UI Design Draft

**迁移入口**：Dashboard 增加"数据迁移"卡片，首次使用时提示管理员将 localStorage 数据迁移到服务端。

- 迁移状态显示：`未迁移` → `迁移中` → `已迁移`
- 迁移按钮点击后弹出确认对话框，展示将迁移的数据条目统计（产品数、联系方式、公司信息、轮播图）
- 迁移成功后自动跳转，localStorage 被清除

**管理界面变化**：
- 所有管理操作（产品 CRUD、联系方式编辑等）不变，底层自动走 API
- 新增网络状态指示器（右上角小图标：在线/离线）
- 数据修改后增加短暂 loading 状态（API 请求期间）

### Open Questions

1. **首次部署初始化**：KV 为空时，前台页面如何获取数据？
   - 方案 A：API 在 KV 为空时自动写入种子数据并返回
   - 方案 B：部署脚本预先将种子数据写入 KV
   - 方案 C：前台 fallback 到代码内嵌种子数据，管理员首次登录后台时触发迁移
   - **建议**：方案 A，最简实现且不需要额外部署步骤

2. **认证机制**：当前管理员认证通过 `sessionStorage` 保存服务端签发的 token。迁移后 API 写入需要认证，但 `GET /api/data/:key` 是否也需要认证？
   - 前台页面需要公开读取产品/公司/联系方式数据用于渲染
   - **建议**：读取公开，写入需认证

3. **数据大小限制**：Cloudflare KV 单个 value 最大 25 MB，产品列表 JSON（16 条 × 含多语言字段）预估 < 100 KB，远低于限制。但产品数量增长到数百条时是否需要分页或分 key 存储？
   - **建议**：当前阶段整体存储为单 key，后续产品超过 100 条时考虑按 category 分 key

4. **询盘数据**：询盘（InquiryManager）已经通过 `/api/inquiries` 使用 KV 存储，本次迁移是否需要重新审视其 API 设计以保持与其他数据类型的一致性？
   - **建议**：保持询盘现有 API 不变，仅迁移 products / contactInfo / companyInfo / heroSlides 四种数据

5. **Cloudflare KV 的最终一致性**：KV 写入后全球节点同步有约 60 秒延迟。管理员在不同地区修改数据后，其他地区访客可能短暂看到旧数据。
   - **建议**：前台页面可接受短暂延迟；管理员界面通过 `last_modified` 轮询确保看到最新数据
