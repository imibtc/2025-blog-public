import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useState, useEffect, useCallback } from 'react'
import { thousandsSeparator } from '@/lib/utils'
import { useSize } from '@/hooks/use-size'

// 使用您的Worker地址
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
	const [pageViews, setPageViews] = useState<number>(34) // 初始值与截图一致
	const [isLoading, setIsLoading] = useState<boolean>(false)

	// 计算位置
	let x, y, cardWidth;

	if (maxSM) {
		cardWidth = hiCardStyles.width;
		const shareX = shareCardStyles.offsetX !== null ? center.x + shareCardStyles.offsetX : center.x - hiCardStyles.width / 2
		const shareY = shareCardStyles.offsetY !== null ? center.y + shareCardStyles.offsetY : 
			center.y + hiCardStyles.height / 2 + CARD_SPACING + cardStyles.socialButtons.height + CARD_SPACING + articleCardStyles.height + CARD_SPACING
		x = shareX;
		y = shareY + shareCardStyles.height + CARD_SPACING;
	} else {
		cardWidth = styles.width;
		x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
		y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
	}

	// 获取统计数据
	const fetchPageViews = useCallback(async () => {
		try {
			const response = await fetch(`${WORKER_URL}/list?slugs=total`)
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

	// 记录访问
	const recordPageView = useCallback(async () => {
		const pageSlug = window.location.pathname.replace(/^\/|\/$/g, '') || 'home'
		
		// 同时记录总访问和页面访问
		await Promise.all([
			fetch(`${WORKER_URL}/pv?slug=total`, { method: 'PUT' }).catch(() => {}),
			fetch(`${WORKER_URL}/pv?slug=page-${encodeURIComponent(pageSlug)}`, { method: 'PUT' }).catch(() => {})
		])
	}, [])

	useEffect(() => {
		const initAnalytics = async () => {
			setIsLoading(true)
			await recordPageView()
			await fetchPageViews()
			setIsLoading(false)
		}

		initAnalytics()
		
		// 每3分钟更新一次显示
		const interval = setInterval(fetchPageViews, 3 * 60 * 1000)
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
