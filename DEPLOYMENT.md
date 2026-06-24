# 汽车配件独立站 — 部署指南

> 本指南基于 Cloudflare Pages（免费、全球 CDN、自动 HTTPS、无限带宽）

---

## 前置准备

- [x] Git 仓库已初始化（已完成）
- [ ] GitHub 账号（如果没有，去 https://github.com 注册）
- [ ] Cloudflare 账号（如果没有，去 https://cloudflare.com 注册）
- [ ] 你的域名（已购买）

---

## 第一步：上传代码到 GitHub（约 5 分钟）

### 1.1 创建 GitHub 仓库

1. 打开 https://github.com/new
2. Repository name 填 `auto-parts-site`
3. 选择 **Private**（私有仓库）
4. **不要**勾选 "Add a README file"
5. 点击 **Create repository**

### 1.2 推送代码

在终端执行以下命令（替换 `你的用户名` 为你的 GitHub 用户名）：

```bash
cd /Users/zhangbin/WorkBuddy/2026-06-24-12-39-35/auto-parts-site

# 添加远程仓库
git remote add origin https://github.com/你的用户名/auto-parts-site.git

# 推送代码
git push -u origin main
```

如果提示输入账号密码，使用 GitHub Personal Access Token（不是登录密码）：
- 访问 https://github.com/settings/tokens
- 点击 "Generate new token (classic)"
- 勾选 `repo` 权限
- 复制生成的 token，在终端粘贴即可

---

## 第二步：在 Cloudflare Pages 创建项目（约 5 分钟）

### 2.1 进入 Cloudflare Pages

1. 打开 https://dash.cloudflare.com
2. 登录后，左侧菜单点击 **Workers & Pages**
3. 点击 **Create** → **Pages** → **Connect to Git**

### 2.2 连接 GitHub

1. 选择 **Connect GitHub**
2. 授权 Cloudflare 访问你的 GitHub
3. 选择 `auto-parts-site` 仓库
4. 点击 **Begin setup**

### 2.3 配置构建设置

填写以下信息：

| 配置项 | 值 |
|--------|-----|
| Project name | `auto-parts-site` |
| Production branch | `main` |
| Framework preset | `Vite` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | (留空) |
| Environment variables | `NODE_VERSION` = `20` |

点击 **Save and Deploy**。

### 2.4 等待构建

- 首次构建约 1-2 分钟
- 构建成功后，Cloudflare 会分配一个 `xxx.pages.dev` 的临时域名
- 此时网站已经可以访问了！

---

## 第三步：绑定你的域名（约 10-20 分钟）

### 3.1 添加自定义域名

1. 在 Cloudflare Pages 项目页面，点击 **Custom domains** 标签
2. 点击 **Set up a custom domain**
3. 输入你的域名（如 `www.yourdomain.com` 或 `yourdomain.com`）
4. 点击 **Continue**

### 3.2 配置 DNS 解析

Cloudflare 会告诉你需要添加的 DNS 记录。有两种情况：

#### 情况 A：域名在 Cloudflare 管理（推荐）

如果你把域名的 DNS 托管到 Cloudflare：
- Cloudflare 会自动添加 CNAME 记录
- 无需手动操作，直接生效

#### 情况 B：域名在其他注册商（阿里云/腾讯云/GoDaddy 等）

你需要在域名注册商的 DNS 管理面板手动添加记录：

**添加 CNAME 记录：**

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| CNAME | www | `auto-parts-site.pages.dev` |

**添加 A 记录（可选，用于根域名访问）：**

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | @ | `192.0.2.1` |

> 具体记录值以 Cloudflare Pages 页面显示的为准。

### 3.3 等待 DNS 生效

- DNS 传播通常需要 10-30 分钟
- 在 Cloudflare Pages 的 Custom domains 页面可以看到状态变为 **Active**
- HTTPS 证书会自动签发，无需手动操作

---

## 第四步：验证部署

1. 打开你的域名 `https://www.yourdomain.com`
2. 检查网站是否正常显示
3. 打开 `https://www.yourdomain.com/admin`（密码 `admin2024`）
4. 测试多语言切换、Admin 后台编辑功能

---

## 日常更新网站内容

部署完成后，你有两种方式更新内容：

### 方式 1：通过 Admin 后台（日常推荐）
- 直接在 `https://www.yourdomain.com/admin` 编辑
- 修改保存在浏览器 localStorage 中
- 适合日常更新产品、联系方式等

### 方式 2：通过 Git 推送代码（重大更新）
- 修改代码后推送：`git push origin main`
- Cloudflare 自动检测到推送，自动重新构建部署
- 适合修改默认产品数据、界面布局等

---

## 常见问题

### Q: 网站打开是空白页？
检查 Cloudflare Pages 构建日志是否有报错。常见原因是构建失败。

### Q: Admin 后台修改的内容，换设备就看不到了？
Admin 后台使用 localStorage，数据存在浏览器本地。如果需要多设备同步，需要后续接入数据库后端。

### Q: 翻译功能在部署后还能用吗？
能用。翻译调用的是 MyMemory 公共 API，不受部署环境影响。

### Q: 如何修改 Admin 密码？
修改 `src/admin/adminStorage.ts` 文件中的 `ADMIN_PASSWORD` 常量，然后 `git push` 即可。

---

## 其他部署平台（备选）

如果 Cloudflare 不合适，也可以用以下平台：

| 平台 | 免费额度 | 特点 |
|------|---------|------|
| **Vercel** | 100GB/月流量 | 配置更简单，一键部署 |
| **Netlify** | 100GB/月流量 | 类似 Vercel |
| **GitHub Pages** | 无限 | 仅支持静态站，配置稍复杂 |

推荐优先使用 Cloudflare Pages，全球 CDN 性能最好，特别是对海外客户访问速度优。
