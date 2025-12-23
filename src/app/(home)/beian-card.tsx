import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import Link from 'next/link'
import { HomeDraggableLayer } from './home-draggable-layer'
import { useSize } from '@/hooks/use-size'

export default function BeianCard() {
	const center = useCenterStore()
	const { cardStyles, siteContent } = useConfigStore()
	const styles = cardStyles.beianCard
	const hiCardStyles = cardStyles.hiCard
	const articleCardStyles = cardStyles.articleCard
	const { maxSM } = useSize()

	// 移动端使用与hiCard相同的宽度
	const cardWidth = maxSM ? hiCardStyles.width : styles.width
	const cardHeight = styles.height

	const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - cardWidth + 200
	const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING + 180

	const beian = siteContent.beian

	if (!beian?.text) {
		return null
	}

	return (
		<HomeDraggableLayer cardKey='beianCard' x={x} y={y} width={cardWidth} height={cardHeight}>
			<Card order={styles.order} width={cardWidth} height={cardHeight} x={x} y={y} className='flex items-center justify-center max-sm:static'>
				{beian.link ? (
					<Link href={beian.link} target='_blank' rel='noopener noreferrer' className='text-secondary text-xs transition-opacity hover:opacity-80'>
						{beian.text}
					</Link>
				) : (
					<span className='text-secondary text-xs'>{beian.text}</span>
				)}
			</Card>
		</HomeDraggableLayer>
	)
}
