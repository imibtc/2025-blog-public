1. 前言

对于很多开发者而言，部署个人博客或项目展示网站时，常常希望流程简单、成本低廉且访问快速。

本文将详细介绍如何利用 Vercel 结合 Cloudflare 的免费 CDN 和 DNS 服务，实现自定义域名绑定、全球加速及 HTTPS 安全访问，完美解决 Vercel 默认域名在国内可能访问不畅或无法访问的问题。

整个方案除了域名费用外，其他服务均为免费，非常适合个人用户和小流量项目。

---

2. 工具简介与优势

### 2.1 Vercel
https://vercel.com/

- **是什么**：一个专注于前端项目的云部署平台，支持从 Git 仓库（如 GitHub）自动拉取代码并完成构建和部署。
- **核心优势**：
  - 自动化部署：关联 Git 仓库后，每次代码推送可自动触发部署。
  - 免费托管：提供免费的托管服务及 `项目名.vercel.app` 的临时域名。
  - 易于绑定域名：在控制台中可轻松添加自定义域名。

### 2.2 Cloudflare
https://www.cloudflare-cn.com/

- **是什么**：全球知名的内容分发网络（CDN）和安全服务提供商。
- **核心优势（免费版已包含）**：
  - CDN 加速：通过全球节点缓存内容，提升网站访问速度。
  - DNS 解析：提供稳定可靠的域名解析服务。
  - SSL 证书：自动为域名签发 SSL 证书，实现 HTTPS 加密访问。
  - DDoS 防护：提供基础的安全防护能力。

### 2.3 域名注册商（如阿里云、Namesilo、Porkbun）
- 负责购买和管理你的自定义域名（例如本教程中的 `hdxiaoke.top`）。
- 选择国外厂商（如 Namesilo、Porkbun）通常可以免去实名备案的流程。

---

3. 详细操作步骤

### 3.1 阶段一：将域名托管至 Cloudflare
这是最关键的一步，目的是将域名的解析权从域名注册商转移到 Cloudflare。

1. **添加站点到 Cloudflare**
   - 登录 Cloudflare 控制台，点击“添加站点”（Add a Site）。
   - 输入你购买的根域名（例如 `hdxiaoke.top`），选择免费的“Free”计划。

2. **修改域名服务器（Name Servers）**
   - Cloudflare 会提供两个（或多个）专属的域名服务器地址，形如 `dylan.ns.cloudflare.com` 和 `harmony.ns.cloudflare.com`。
   - **关键操作**：登录你的域名注册商（如阿里云）的控制台，找到域名管理页面，将原有的 DNS 服务器地址替换为 Cloudflare 提供的那两个地址。
   - 注意：此更改的全球生效时间可能需要数分钟到 48 小时，请耐心等待。在此期间，Cloudflare 会持续检查，状态变为“Active”即表示成功。

### 3.2 阶段二：在 Cloudflare 配置 DNS 解析
当域名在 Cloudflare 的状态变为“Active”（激活）后，即可进行解析设置。

1. 在 Cloudflare 控制台，进入你的域名，点击左侧的 **“DNS”** 选项。
2. 点击 **“添加记录”**（Add record），添加以下两条 CNAME 记录（这是连接域名与 Vercel 的关键）：

| 记录 | 类型 | 名称 | 目标 | 代理状态 |
|------|------|------|------|----------|
| 一（www） | CNAME | `www` | `cname-china.vercel-dns.com` | 🟠 橙色云朵（已代理） |
| 二（根） | CNAME | `@` | `cname-china.vercel-dns.com` | 🟠 橙色云朵（已代理） |

### 3.3 阶段三：在 Vercel 绑定自定义域名
现在需要告诉 Vercel，当有人访问你的域名时，应该展示哪个网站的内容。

1. 登录 Vercel 控制台，进入你的项目。
2. 点击顶部的 **“Settings”**（设置）选项卡，然后在左侧菜单栏选择 **“Domains”**（域名）。
3. 在输入框中，分别搜索添加你的两个域名并保存：
   - 输入 `www.hdxiaoke.top`，按回车。
   - 输入 `hdxiaoke.top`，按回车。
4. Vercel 会自动验证 DNS 记录。如果配置正确，几分钟后域名状态会显示为绿色的 **“Valid”**（有效）或 **“Proxy Detected”**（已检测到代理），这表示绑定成功。

![](https://www.hdxiaoke.top/blogs/Vercel-Cloudflare/ee227de8c6c8890f.webp)

---

4. 测试与访问

完成以上所有步骤后，你的网站就已经配置好了！请打开浏览器，访问以下网址进行测试：

- https://www.hdxiaoke.top
- https://hdxiaoke.top

如果一切顺利，你现在应该能看到你的网站内容了！
