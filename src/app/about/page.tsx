'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useMarkdownRender } from '@/hooks/use-markdown-render'
import { pushAbout, type AboutData } from './services/push-about'
import { useAuthStore } from '@/hooks/use-auth'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import LikeButton from '@/components/like-button'
import GithubSVG from '@/svgs/github.svg'
import initialData from './list.json'
// 🎯 新增：导入评论组件
import WalineComments from '@/components/WalineComments'

export default function Page() {
	const [data, setData] = useState<AboutData>(initialData as AboutData)
	const [originalData, setOriginalData] = useState<AboutData>(initialData as AboutData)
	const [isEditMode, setIsEditMode] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [isPreviewMode, setIsPreviewMode] = useState(false)
	const keyInputRef = useRef<HTMLInputElement>(null)

	const { isAuth, setPrivateKey } = useAuthStore()
	const { siteContent } = useConfigStore()
	const { content, loading } = useMarkdownRender(data.content)
	const hideEditButton = siteContent.hideEditButton ?? false

	const handleChoosePrivateKey = async (file: File) => {
		try {
			const text = await file.text()
			setPrivateKey(text)
			await handleSave()
		} catch (error) {
			console.error('Failed to read private key:', error)
			toast.error('读取密钥文件失败')
		}
	}

	const handleSaveClick = () => {
		if (!isAuth) {
			keyInputRef.current?.click()
		} else {
			handleSave()
		}
	}

	const handleEnterEditMode = () => {
		setIsEditMode(true)
		setIsPreviewMode(false)
	}

	const handleSave = async () => {
		setIsSaving(true)

		try {
			await pushAbout(data)

			setOriginalData(data)
			setIsEditMode(false)
			setIsPreviewMode(false)
			toast.success('保存成功！')
		} catch (error: any) {
			console.error('Failed to save:', error)
			toast.error(`保存失败: ${error?.message || '未知错误'}`)
		} finally {
			setIsSaving(false)
		}
	}

	const handleCancel = () => {
		setData(originalData)
		setIsEditMode(false)
		setIsPreviewMode(false)
	}

	const buttonText = isAuth ? '保存' : '导入密钥'

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!isEditMode && (e.ctrlKey || e.metaKey) && e.key === ',') {
				e.preventDefault()
				setIsEditMode(true)
				setIsPreviewMode(false)
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [isEditMode])

	return (
		<>
			{/* 文件上传输入框 */}
			<input
				ref={keyInputRef}
				type='file'
				accept='.pem'
				className='hidden'
				onChange={async e => {
					const f = e.target.files?.[0]
					if (f) await handleChoosePrivateKey(f)
					if (e.currentTarget) e.currentTarget.value = ''
				}}
			/>

			<div className='flex flex-col items-center justify-center px-6 pt-32 pb-12 max-sm:px-0'>
				<div className='w-full max-w-[800px]'>
					{/* 编辑模式 */}
					{isEditMode ? (
						isPreviewMode ? (
							/* 预览模式 */
							<div className='space-y-6'>
								<div className='text-center'>
									<h1 className='mb-4 text-4xl font-bold'>{data.title || '标题预览'}</h1>
									<p className='text-secondary text-lg'>{data.description || '描述预览'}</p>
								</div>

								{loading ? (
									<div className='text-secondary text-center'>预览渲染中...</div>
								) : (
									<div className='card relative p-6'>
										<div className='prose prose-sm max-w-none'>{content}</div>
									</div>
								)}
							</div>
						) : (
							/* 编辑模式 */
							<div className='space-y-6'>
								<div className='space-y-4'>
									<input
										type='text'
										placeholder='标题'
										className='w-full px-4 py-3 text-center text-2xl font-bold'
										value={data.title}
										onChange={e => setData({ ...data, title: e.target.value })}
									/>
									<input
										type='text'
										placeholder='描述'
										className='w-full px-4 py-3 text-center text-lg'
										value={data.description}
										onChange={e => setData({ ...data, description: e.target.value })}
									/>
								</div>

								<div className='card relative'>
									<textarea
										placeholder='Markdown 内容'
										className='min-h-[400px] w-full resize-none text-sm'
										value={data.content}
										onChange={e => setData({ ...data, content: e.target.value })}
									/>
								</div>
							</div>
						)
					) : (
						/* 🔹 正常显示模式 */
						<>
							<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='mb-12 text-center'>
								<h1 className='mb-4 text-4xl font-bold'>{data.title}</h1>
								<p className='text-secondary text-lg'>{data.description}</p>
							</motion.div>

							{loading ? (
								<div className='text-secondary text-center'>加载中...</div>
							) : (
								<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className='card relative p-6'>
									<div className='prose prose-sm max-w-none'>{content}</div>
								</motion.div>
							)}
						</>
					)}

					{/* ============================================
						🔹 评论功能区域开始
					============================================ */}
					
					{/* 图标按钮区域 */}
					<div className='mt-8 flex items-center justify-center gap-6'>
						{/* GitHub 图标 */}
						<motion.a
							href='https://github.com/imibtc/2025-blog-public'
							target='_blank'
							rel='noreferrer'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0 }}
							className='bg-card flex h-[53px] w-[53px] items-center justify-center rounded-full border'>
							<GithubSVG />
						</motion.a>

						{/* 点赞按钮 */}
						<LikeButton slug='open-source' delay={0} />

						{/* 🔹 新增：评论页面链接按钮 */}
						<motion.a
							href='https://comments.hdxiaoke.top/'
							target='_blank'
							rel='noreferrer'
							initial={{ opacity: 0, scale: 0.6 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.1 }}
							className='bg-card flex h-[53px] w-[53px] items-center justify-center rounded-full border'
							title='查看本站评论'>
							{/* 使用💬表情作为评论图标 */}
							<span className='text-lg font-semibold text-gray-700'>💬</span>
						</motion.a>
					</div>

					{/* 🔹 评论框区域（只在非编辑模式显示） */}
					{!isEditMode && (
						<motion.div 
							initial={{ opacity: 0, y: 20 }} 
							animate={{ opacity: 1, y: 0 }} 
							transition={{ delay: 0.3 }}
							className='mt-12'
						>
							{/* 评论区域标题 */}
							<h3 className='mb-6 text-center text-xl font-semibold'>关于本站的讨论</h3>
							
							{/* 🔹 使用 Waline 评论组件
								参数说明：
								- path: '/about' 表示这是"关于本站"页面的评论
								- 路径会与评论数据关联，确保每个页面评论独立
							*/}
							<WalineComments path='/about' />
							
							{/* 补充说明文字 */}
							<div className='mt-4 text-center text-sm text-gray-500'>
								<p>
									您也可以访问完整的{' '}
									<a 
										href='https://comments.hdxiaoke.top/' 
										className='text-blue-500 hover:underline'
										target='_blank'
										rel='noreferrer'
									>
										评论页面
									</a>{' '}
									查看所有讨论
								</p>
							</div>
						</motion.div>
					)}
					{/* ============================================
						🔹 评论功能区域结束
					============================================ */}
				</div>
			</div>

			{/* 页面右上角的操作按钮 */}
			<motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className='fixed top-4 right-6 z-10 flex gap-3 max-sm:hidden'>
				{isEditMode ? (
					/* 编辑模式下的按钮 */
					<>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleCancel}
							disabled={isSaving}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm'>
							取消
						</motion.button>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setIsPreviewMode(prev => !prev)}
							disabled={isSaving}
							className={`rounded-xl border bg-white/60 px-6 py-2 text-sm`}>
							{isPreviewMode ? '继续编辑' : '预览'}
						</motion.button>
						<motion.button 
							whileHover={{ scale: 1.05 }} 
							whileTap={{ scale: 0.95 }} 
							onClick={handleSaveClick} 
							disabled={isSaving} 
							className='brand-btn px-6'
						>
							{isSaving ? '保存中...' : buttonText}
						</motion.button>
					</>
				) : (
					/* 正常模式下的编辑按钮 */
					!hideEditButton && (
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={handleEnterEditMode}
							className='rounded-xl border bg-white/60 px-6 py-2 text-sm backdrop-blur-sm transition-colors hover:bg-white/80'>
							编辑
						</motion.button>
					)
				)}
			</motion.div>
		</>
	)
}
