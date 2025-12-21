import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useState, useEffect } from 'react'
import { thousandsSeparator } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'

export default function MusicCard() {
	const { maxSM } = useSize()
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard
	const shareCardStyles = cardStyles.shareCard
	const articleCardStyles = cardStyles.articleCard
	const [pageViews, setPageViews] = useState<number>(34) // 初始值与界面显示一致
	const [isLoading, setIsLoading] = useState<boolean>(true)

	// 计算位置
	let x, y, cardWidth;

	if (maxSM) {
		// 移动端：在ShareCard下方，与ShareCard对齐
		cardWidth = hiCardStyles.width; // 与其他卡片保持一致的宽度
		
		// 先计算ShareCard的位置
		const shareX = shareCardStyles.offsetX !== null ? center.x + shareCardStyles.offsetX : center.x - hiCardStyles.width / 2
		const shareY = shareCardStyles.offsetY !== null ? center.y + shareCardStyles.offsetY : 
			center.y + hiCardStyles.height / 2 + CARD_SPACING + cardStyles.socialButtons.height + CARD_SPACING + articleCardStyles.height + CARD_SPACING
		
		// 音乐卡片在ShareCard下方
		x = shareX;
		y = shareY + shareCardStyles.height + CARD_SPACING;
	} else {
		// 桌面端：保持原有位置
		cardWidth = styles.width;
		x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
		y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
	}

	useEffect(() => {
		// 获取访问统计数据
		const fetchAnalytics = async () => {
			setIsLoading(true)
			try {
				// 从Cloudflare Worker获取统计数据
				const response = await fetch('https://pageviews.hdxiaoke.workers.dev/list?slugs=total', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					// 缩短缓存时间以便更快看到更新
					cache: 'no-cache'
				})

				if (!response.ok) {
					throw new Error(`Worker请求失败: ${response.status}`)
				}

				const data = await response.json()
				
				// Worker返回格式：{"total": 访问次数}
				if (data.total !== undefined) {
					setPageViews(data.total)
				}
				
				// 记录本次访问（总访问量）
				fetch('https://pageviews.hdxiaoke.workers.dev/pv?slug=total', {
					method: 'PUT',
					mode: 'cors', // 允许跨域
					headers: {
						'Content-Type': 'application/json',
					},
				}).catch(error => {
					// 静默处理错误，不影响页面展示
					console.log('记录总访问量失败（非致命错误）:', error.message)
				})
				
				// 记录当前页面访问
				const pageSlug = window.location.pathname.replace(/^\/|\/$/g, '') || 'home'
				fetch(`https://pageviews.hdxiaoke.workers.dev/pv?slug=page-${encodeURIComponent(pageSlug)}`, {
					method: 'PUT',
					mode: 'cors',
					headers: {
						'Content-Type': 'application/json',
					},
				}).catch(error => {
					// 静默处理错误
					console.log('记录页面访问失败（非致命错误）:', error.message)
				})
				
			} catch (error) {
				console.error('获取访问统计失败:', error)
				// 如果Worker失败，保留当前值不更新
			} finally {
				setIsLoading(false)
			}
		}

		// 页面加载时立即获取
		fetchAnalytics()
		
		// 每60秒更新一次数据（比原30秒长，因为Worker调用更快）
		const interval = setInterval(fetchAnalytics, 60 * 1000)
		
		return () => clearInterval(interval)
	}, [])

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={cardWidth} height={styles.height}>
			<Card order={styles.order} width={cardWidth} height={styles.height} x={x} y={y} className='flex justify-center items-center max-sm:static'>
				<div className='text-center'>
					<div className='text-xs'>Copyright © 2025 伊米博客</div>
					<div className='text-xs mt-1'>
						{isLoading ? (
							<span className="text-gray-400">统计加载中...</span>
						) : (
							<span>访问统计：{thousandsSeparator(pageViews)} 次</span>
						)}
					</div>
					{/* 可选：添加一个小的刷新按钮 */}
					<button 
						onClick={() => {
							setIsLoading(true)
							fetch('https://pageviews.hdxiaoke.workers.dev/list?slugs=total')
								.then(res => res.json())
								.then(data => {
									if (data.total !== undefined) {
										setPageViews(data.total)
									}
								})
								.finally(() => setIsLoading(false))
						}}
						className="text-xs text-blue-400 hover:text-blue-600 mt-1 opacity-70 hover:opacity-100 transition-opacity"
						title="手动刷新统计"
					>
						刷新
					</button>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
