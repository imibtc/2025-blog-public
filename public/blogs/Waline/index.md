
## 一、准备工作

官方参考教程：
https://waline.js.org/guide/get-started/

本博客添加评论前提条件：

已正常部署：Verce+2025-blog-public+Cloudflare+neon(数据库)

neon创建Waline数据表：
https://github.com/walinejs/waline/blob/main/assets/waline.pgsql

1. 登录 Neon Console
2. 选择您的项目（如 neon-red-umbrella）
3. 点击左侧菜单的 "SQL Editor"
4. 在编辑器中，复制粘贴 waline.pgsql的全部内容
5. 点击 "Run"​ 按钮执行


## 二、Vercel 部署服务端

### 2.1 创建 Waline 项目
访问官方部署链接：
```
https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample
```

1. 点击"GitHub"，创建私有仓库
2. 输入项目名称（如 `waline-comments`）
3. 等待自动创建完成（约2-3分钟）

### 2.2 配置环境变量（这个很重要关系到是否成功部署）
在 Vercel 项目控制台：
1. 点击 **Settings** → **Environment Variables**
2. 添加以下环境变量：

![](/blogs/Waline/961e8daff27e521d.webp)

3. 点击 **Save** 保存

### 2.3 重新部署
1. 点击 **Deployments**
2. 选择最新部署，点击 **...** → **Redeploy**
3. 等待部署完成（状态变为 Ready）

### 2.4 绑定自定义域名（可选）
1. 点击 **Settings** → **Domains**
2. 输入你的域名（如 `comments.yourdomain.com`）
3. 在域名服务商Cloudflare添加 CNAME 解析：
   - 类型：CNAME
   - 名称：comments
   - 值：cname-china.vercel-dns.com

以上，评论测试成功后再做下面的步骤。

## 三、博客集成配置

### 3.1  博客配置

添加依赖：

![](/blogs/Waline/85c2cbbbaf34bf2d.webp)

### 3.2 创建评论组件

` src/components/WalineComments.jsx`

```
// src/components/WalineComments.jsx
'use client';
import { useEffect, useRef } from 'react';
import { init } from '@waline/client';
import '@waline/client/style';

export default function WalineComments({ path }) {
  const walineInstanceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // 销毁之前的实例
    if (walineInstanceRef.current) {
      walineInstanceRef.current.destroy();
    }

    // 初始化 Waline
    walineInstanceRef.current = init({
      el: containerRef.current,
      serverURL: 'https://comments.hdxiaoke.top', // 您的 Waline 服务地址
      path: path || window.location.pathname, // 文章路径
      lang: 'zh-CN', // 语言
      dark: 'auto', // 暗色模式跟随系统
      reaction: false, // 启用表情反应
      search: false, // 禁用搜索（简化版）
      login: 'disable', // 完全禁用登录，纯匿名评论
      
      // 匿名评论配置
      anonymous: true, // 允许匿名评论
      requiredMeta: ['nick', 'mail'], // 必填字段：昵称和邮箱
      
      // 自定义配置
      placeholder: '欢迎留言！支持 Markdown 语法哦~',
      avatar: 'mp', // 头像生成方式
      meta: ['nick', 'mail', 'link'], // 显示的表单字段
      pageSize: 10, // 每页评论数
    });

    return () => {
      if (walineInstanceRef.current) {
        walineInstanceRef.current.destroy();
      }
    };
  }, [path]); // 路径变化时重新初始化

  return (
    <div className="waline-comments mt-12 pt-8 border-t">
      <div ref={containerRef} />
    </div>
  );
}
```
### 3.3样式优化

`src/styles/waline.css`

```
/* src/styles/waline.css */
.waline-comments {
  /* 确保 Waline 容器有合适的最小高度 */
  min-height: 300px;
}

/* 自定义 Waline 样式以匹配您的博客主题 */
:root {
  --waline-theme-color: #3b82f6;
  --waline-active-color: #1d4ed8;
  --waline-bgcolor: #ffffff;
  --waline-bgcolor-light: #f8fafc;
  --waline-border-color: #e5e7eb;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --waline-bgcolor: #1f2937;
    --waline-bgcolor-light: #374151;
    --waline-border-color: #4b5563;
  }
}
```
### 3.4在博客页面中使用
`src/app/blog/[id]/page.tsx`

```
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { BlogPreview } from '@/components/blog-preview'
import { loadBlog, type BlogConfig } from '@/lib/load-blog'
import { useReadArticles } from '@/hooks/use-read-articles'
import LiquidGrass from '@/components/liquid-grass'

export default function Page() {
	const params = useParams() as { id?: string | string[] }
	const slug = Array.isArray(params?.id) ? params.id[0] : params?.id || ''
	const router = useRouter()
	const { markAsRead } = useReadArticles()

	const [blog, setBlog] = useState<{ config: BlogConfig; markdown: string; cover?: string } | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		let cancelled = false
		async function run() {
			if (!slug) return
			try {
				setLoading(true)
				const blogData = await loadBlog(slug)

				if (!cancelled) {
					setBlog(blogData)
					setError(null)
					markAsRead(slug)
				}
			} catch (e: any) {
				if (!cancelled) setError(e?.message || '加载失败')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		run()
		return () => {
			cancelled = true
		}
	}, [slug, markAsRead])

	const title = useMemo(() => (blog?.config.title ? blog.config.title : slug), [blog?.config.title, slug])
	const date = useMemo(() => dayjs(blog?.config.date).format('YYYY年 M月 D日'), [blog?.config.date])
	const tags = blog?.config.tags || []

	const handleEdit = () => {
		router.push(`/write/${slug}`)
	}

	if (!slug) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>无效的链接</div>
	}

	if (loading) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>加载中...</div>
	}

	if (error) {
		return <div className='flex h-full items-center justify-center text-sm text-red-500'>{error}</div>
	}

	if (!blog) {
		return <div className='text-secondary flex h-full items-center justify-center text-sm'>文章不存在</div>
	}

	return (
		<>
			<BlogPreview
				markdown={blog.markdown}
				title={title}
				tags={tags}
				date={date}
				summary={blog.config.summary}
				cover={blog.cover ? `${origin}${blog.cover}` : undefined}
				slug={slug}
			/>

			<motion.button
				initial={{ opacity: 0, scale: 0.6 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				onClick={handleEdit}
				className='absolute top-4 right-6 rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80 max-sm:hidden'>
				编辑
			</motion.button>

			{slug === 'liquid-grass' && <LiquidGrass />}
			
		</>
	)
}
```
### 3.6全局布局集成
`src/app/layout.tsx`

```
import '@/styles/globals.css'

import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'
import siteContent from '@/config/site-content.json'

const {
	meta: { title, description },
	theme
} = siteContent

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}

const htmlStyle = {
	cursor: 'url(/images/cursor.svg) 2 1, auto',
	'--color-brand': theme.colorBrand,
	'--color-primary': theme.colorPrimary,
	'--color-secondary': theme.colorSecondary,
	'--color-brand-secondary': theme.colorBrandSecondary,
	'--color-bg': theme.colorBg,
	'--color-border': theme.colorBorder,
	'--color-card': theme.colorCard,
	'--color-article': theme.colorArticle
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' suppressHydrationWarning style={htmlStyle}>
			<Head />
			
			<body>
				<script defer src="https://umami.hdxiaoke.top/script.js" data-website-id="1cc38107-c89e-4b33-9ec2-e1ef333293dc"></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
					if (/windows|win32/i.test(navigator.userAgent)) {
						document.documentElement.classList.add('windows');
					}
		      `
					}}
				/>

				<Layout>{children}</Layout>
			</body>
		</html>
	)
}
```


## 四、管理后台设置

### 4.1 注册管理员账号
1. 访问你的 Waline 管理后台：
   ```
   https://your-waline-domain.vercel.app/ui
   ```
2. 点击"注册"，填写邮箱、用户名、密码
3. **第一个注册的用户自动成为管理员**

### 4.2 管理功能
- **评论管理**：审核、回复、删除评论
- **用户管理**：查看用户信息，设置标签
- **数据导出**：导出评论数据为 CSV 格式

## 五、高级配置

### 5.1 邮件通知
在 Vercel 环境变量中添加：
```env
# 邮件服务提供商
SMTP_SERVICE=QQ

# QQ邮箱SMTP服务器配置
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true

# QQ邮箱账号信息
SMTP_USER=您的QQ邮箱地址@qq.com
SMTP_PASS=您的QQ邮箱授权码

# 网站信息
SITE_NAME=您的博客名称
SITE_URL=https://www.yysuni.com
AUTHOR_EMAIL=您的接收通知邮箱@qq.com
```

### 5.2 社交登录
添加环境变量启用社交登录：
```env
# GitHub 登录
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# 微信登录
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret
```

### 5.3 自定义样式
在博客 CSS 中添加：
```css
:root {
  --waline-theme-color: #27ae60;
  --waline-active-color: #2ecc71;
  --waline-font-size: 14px;
}
```

如有任何问题，可以访问 Waline 官方文档或留言：https://waline.js.org