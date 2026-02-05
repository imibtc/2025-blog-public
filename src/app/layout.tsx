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

				{/* AnythingLLM 智能问答机器人 */}
				<script
					data-embed-id="22773bee-ae69-4a59-ba4c-39283aa92732"
					  data-button-color="#000000"
  data-user-bg-color="#4b5563"
  data-assistant-bg-color="#f0fdf4"
  data-button-color="#f97326"
  data-chat-icon="support"
  data-position="bottom-left"
  data-send-message-text= "输入消息..."
  data-default-messages="介绍下自己,2025-blog 怎么同步上游,2025-blog 怎么代理加速"
  data-window-height="550px"
  data-window-width="330px"
  data-text-size="14"
  data-language="zh"
  data-reset-chat-text="清空对话"
  data-assistant-name="小助手"
  data-greeting="你好，有什么可以帮你的吗？"
  data-no-sponsor="true"
					data-base-api-url="https://anythingllm.hdxiaoke.workers.dev/api/embed"
					src="https://anythingllm.hdxiaoke.workers.dev/embed/anythingllm-chat-widget.min.js"
				></script>
				
			</body>
		</html>
	)
}
