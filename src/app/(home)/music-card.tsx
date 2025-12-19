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
	const [pageViews, setPageViews] = useState<number>(59832)

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
				try {
					const response = await fetch('/api/analytics', {
						cache: 'no-store' // 禁用浏览器缓存，确保每次都获取最新数据
					})
					const data = await response.json()
					if (data.pageViews) {
						setPageViews(data.pageViews)
					}
				} catch (error) {
					console.error('获取访问统计失败:', error)
				}
			}

		fetchAnalytics()
		// 每30秒更新一次数据（缩短轮询间隔以实现更实时的显示）
		const interval = setInterval(fetchAnalytics, 30 * 1000)
		return () => clearInterval(interval)
	}, [])

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={cardWidth} height={styles.height}>
			<Card order={styles.order} width={cardWidth} height={styles.height} x={x} y={y} className='flex justify-center items-center max-sm:static'>
				<div className='text-center'>
					<div className='text-xs'>Copyright © 2025 伊米博客</div>
					<div className='text-xs mt-1'>访问统计：{thousandsSeparator(pageViews)} 次</div>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
