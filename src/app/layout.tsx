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
					data-embed-id="62378cb2-cd34-43cc-be41-aeea649afa70"
					data-base-api-url="http://192.168.1.118:3001/api/embed"
					src="http://192.168.1.118:3001/embed/anythingllm-chat-widget.min.js"
				></script>
			</body>
		</html>
	)
}
