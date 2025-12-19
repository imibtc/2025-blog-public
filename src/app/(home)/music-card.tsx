import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useState, useEffect } from 'react'
import { thousandsSeparator } from '@/lib/utils'

export default function MusicCard() {
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard
	const [pageViews, setPageViews] = useState<number>(59832)

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING

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
		const interval = setInterval(fetchAnalytics, 5 * 60 * 1000)
		return () => clearInterval(interval)
	}, [])

	return (
		<HomeDraggableLayer cardKey='musicCard' x={x} y={y} width={styles.width} height={styles.height}>
			<Card order={styles.order} width={styles.width} height={styles.height} x={x} y={y} className='flex justify-center items-center'>
				<div className='text-center'>
					<div className='text-xs'>Copyright © 2025 伊米博客</div>
					<div className='text-xs mt-1'>访问统计：{thousandsSeparator(pageViews)} 次</div>
				</div>
			</Card>
		</HomeDraggableLayer>
	)
}
