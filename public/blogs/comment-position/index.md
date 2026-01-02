![](/blogs/comment-position/cc631df5da7038b2.webp)


## 实现步骤

### 步骤1：创建评论按钮组件

1. **创建组件文件**
   - 在 `src/app/(home)/` 目录下创建 `comment-position.tsx` 文件
   - 该组件将负责在首页显示评论按钮

2. **编写组件代码**

```
   import { ANIMATION_DELAY, CARD_SPACING } from '@/consts'
   import { motion } from 'motion/react'
   import { useCenterStore } from '@/hooks/use-center'
   import { useConfigStore } from './stores/config-store'
   import { HomeDraggableLayer } from './home-draggable-layer'
   
   export default function CommentPosition() {
   	const center = useCenterStore()
   	const { cardStyles, siteContent } = useConfigStore()
   	const styles = cardStyles.commentPosition
   	const hiCardStyles = cardStyles.hiCard
   	const socialButtonsStyles = cardStyles.socialButtons
   	const musicCardStyles = cardStyles.musicCard
   	const shareCardStyles = cardStyles.shareCard
   	const likePositionStyles = cardStyles.likePosition

   	// 计算评论按钮的位置
   	const x = 
    		styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - socialButtonsStyles.width + shareCardStyles.width + CARD_SPACING * 2 + likePositionStyles.width
    	const y = 
    		styles.offsetY !== null 
    			? center.y + styles.offsetY 
    			: center.y + hiCardStyles.height / 2 + CARD_SPACING + socialButtonsStyles.height + CARD_SPACING + musicCardStyles.height + CARD_SPACING

   	return (
    		<HomeDraggableLayer cardKey='commentPosition' x={x} y={y} width={styles.width} height={styles.height}>
    			<motion.div className='absolute max-sm:static' initial={{ left: x, top: y }} animate={{ left: x, top: y }}>
    				{siteContent.enableChristmas && (
    					<>
    						<img
    							src='/images/christmas/snow-13.webp'
    							alt='Christmas decoration'
    							className='pointer-events-none absolute'
    							style={{ width: 40, left: -4, top: -4, opacity: 0.9 }}
    						/>
    					</>
    				)}

    				<motion.a
    					href='https://comments.hdxiaoke.top/'
    					target='_blank'
    					rel='noreferrer'
    					initial={{ opacity: 0, scale: 0.6 }}
    					animate={{ opacity: 1, scale: 1 }}
    					whileHover={{ scale: 1.05 }}
    					whileTap={{ scale: 0.95 }}
    					title='查看本站评论'
    					className='card relative overflow-visible rounded-full p-3 bg-card flex h-[53px] w-[53px] items-center justify-center border hover:bg-gray-50 transition-colors'>
    						<span className='text-lg'>💬</span>
    				</motion.a>
    			</motion.div>
    		</HomeDraggableLayer>
    	)
   }
   ```

### 步骤2：更新配置文件

1. **更新默认配置**
   - 打开 `src/config/card-styles-default.json`
   - 在文件中添加评论按钮的默认配置
 
  ```json
   "commentPosition": {
    "width": 54,
    "height": 54,
    "order": 8,
    "offsetX": null,
    "offsetY": null,
    "enabled": true
   },
```

2. **更新实际配置**
   - 打开 `src/config/card-styles.json`
   - 在文件中添加评论按钮的实际配置
   
```json
   "commentPosition": {
    "width": 54,
    "height": 54,
    "order": 8,
    "offsetX": 581,
    "offsetY": 282,
    "enabled": true
   },

```

### 步骤3：集成到首页

1. **导入组件**
   - 打开 `src/app/(home)/page.tsx`
   - 在文件顶部导入 `CommentPosition` 组件
   
```
   import CommentPosition from './comment-position'
   
```

2. **添加到首页**
   - 在 `Home` 组件的返回部分，将 `CommentPosition` 组件添加到卡片列表中
   
```
   {cardStyles.commentPosition?.enabled !== false && <CommentPosition />}
   
```

### 步骤4：测试和调整

完成