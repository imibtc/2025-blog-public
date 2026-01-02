![](/blogs/HomeDraggableLayer/bcfb49c8af7ad582.webp)

**教程前提是：已添加 评论按钮卡片 ，方法见前文。**

###  1，修改首页评论卡片
**修改文件**：`src/app/(home)/page.tsx`

**操作**：在文件中找到卡片渲染的位置（大约在90-110行）

**修改前**：

```
{cardStyles.beianCard?.enabled !== false && <BeianCard />}
{cardStyles.likePosition?.enabled !== false && <LikePosition />}
{cardStyles.commentPosition?.enabled !== false && <CommentPosition />}

```

**修改后**：

```
{cardStyles.beianCard?.enabled !== false && <BeianCard />}
// ▼▼▼ 新增：将点赞和评论卡片包装在移动端水平排列容器中 ▼▼▼
<div className='max-sm:flex max-sm:flex-row max-sm:gap-6'>
  {cardStyles.likePosition?.enabled !== false && <LikePosition />}
  {cardStyles.commentPosition?.enabled !== false && <CommentPosition />}
</div>
// ▲▲▲ 新增结束 ▲▲▲

```

### 2， 修改点赞卡片组件
**修改文件**：`src/app/(home)/like-position.tsx`

**操作**：在 `HomeDraggableLayer` 组件内部添加移动端内联样式

**修改前**：

```
<HomeDraggableLayer cardKey='likePosition' x={x} y={y} width={styles.width} height={styles.height}>
  <motion.div className='absolute' initial={{ left: x, top: y }} animate={{ left: x, top: y }}>
    {/* 组件内容 */}
  </motion.div>
</HomeDraggableLayer>

```

**修改后**：

```
<HomeDraggableLayer cardKey='likePosition' x={x} y={y} width={styles.width} height={styles.height}>
  // ▼▼▼ 新增：添加移动端内联样式容器 ▼▼▼
  <div className='max-sm:inline-block'>
    <motion.div className='absolute max-sm:static' initial={{ left: x, top: y }} animate={{ left: x, top: y }}>
      {/* 组件内容 */}
    </motion.div>
  </div>
  // ▲▲▲ 新增结束 ▲▲▲
</HomeDraggableLayer>

```

### 3， 修改评论卡片组件
**修改文件**：`src/app/(home)/comment-position.tsx`

**操作**：在 `HomeDraggableLayer` 组件内部添加移动端内联样式

**修改前**：

```
<HomeDraggableLayer cardKey='commentPosition' x={x} y={y} width={styles.width} height={styles.height}>
  <motion.div className='absolute' initial={{ left: x, top: y }} animate={{ left: x, top: y }}>
    {/* 组件内容 */}
  </motion.div>
</HomeDraggableLayer>

```

**修改后**：

```
<HomeDraggableLayer cardKey='commentPosition' x={x} y={y} width={styles.width} height={styles.height}>
  // ▼▼▼ 新增：添加移动端内联样式容器 ▼▼▼
  <div className='max-sm:inline-block'>
    <motion.div className='absolute max-sm:static' initial={{ left: x, top: y }} animate={{ left: x, top: y }}>
      {/* 组件内容 */}
    </motion.div>
  </div>
  // ▲▲▲ 新增结束 ▲▲▲
</HomeDraggableLayer>

```


这样修改后，在移动端设备上，点赞卡片和评论卡片将水平排列在同一行。