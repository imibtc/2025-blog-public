import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useState, useEffect, useCallback } from 'react'
import { thousandsSeparator } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'

// Cloudflare Worker URL - 直接从图片中的Worker地址获取
const WORKER_URL = 'https://pageviews.hdxiaoke.workers.dev'

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
	const [pageViews, setPageViews] = useState<number>(34) // 与界面显示一致
	const [isLoading, setIsLoading] = useState<boolean>(false)

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

	// 获取统计数据的函数
	const fetchPageViews = useCallback(async () => {
		try {
			// 从Worker获取总访问量
			const response = await fetch(`${WORKER_URL}/list?slugs=total`, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
				cache: 'no-store'
			})

			if (response.ok) {
				const data = await response.json()
				if (data.total !== undefined) {
					setPageViews(data.total)
				}
			}
		} catch (error) {
			console.error('获取访问统计失败:', error)
		}
	}, [])

	// 记录访问的函数
	const recordPageView = useCallback(async () => {
		try {
			// 记录总访问量
			await fetch(`${WORKER_URL}/pv?slug=total`, {
				method: 'PUT',
				mode: 'cors',
				headers: { 'Content-Type': 'application/json' }
			})
			
			// 记录当前页面访问
			const pageSlug = window.location.pathname.replace(/^\/|\/$/g, '') || 'home'
			await fetch(`${WORKER_URL}/pv?slug=page-${encodeURIComponent(pageSlug)}`, {
				method: 'PUT',
				mode: 'cors',
				headers: { 'Content-Type': 'application/json' }
			})
		} catch (error) {
			// 静默失败，不影响用户体验
			console.log('记录访问失败（不影响展示）:', error.message)
		}
	}, [])

	useEffect(() => {
		// 页面加载时：记录本次访问 + 获取最新数据
		const initAnalytics = async () => {
			setIsLoading(true)
			
			// 先记录本次访问
			await recordPageView()
			
			// 然后获取最新数据
			await fetchPageViews()
			
			setIsLoading(false)
		}

		initAnalytics()
		
		// 每2分钟更新一次显示（不需要频繁更新）
		const interval = setInterval(fetchPageViews, 2 * 60 * 1000)
		
		return () => clearInterval(interval)
	}, [fetchPageViews, recordPageView])

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={cardWidth} height={styles.height}>
			<Card order={styles.order} width={cardWidth} height={styles.height} x={x} y={y} className='flex justify-center items-center max-sm:static'>
				<div className='text-center'>
					<div className='text-xs'>Copyright © 2025 伊米博客</div>
					<div className='text-xs mt-1'>
						{isLoading ? (
							<span className="text-gray-400">统计中...</span>
						) : (
							<span>访问统计: {thousandsSeparator(pageViews)}次</span>
						)}
					</div>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
