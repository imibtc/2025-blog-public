![](/blogs/Mobile/5b0d37e7ce299031.jpg)

## 1，统一组件缩进格式

为了提高代码可读性和维护性，我们首先统一`page.tsx`文件中所有组件的缩进格式。

### 修改文件

`src/app/(home)/page.tsx`

### 修改内容

```typescript
// 原代码（缩进不一致）
      <div>
        {cardStyles.artCard?.enabled !== false && <ArtCard />}
        {cardStyles.hiCard?.enabled !== false && <HiCard />}
        {cardStyles.clockCard?.enabled !== false && <ClockCard />}
        {cardStyles.calendarCard?.enabled !== false && <CalendarCard />}
        {cardStyles.musicCard?.enabled !== false && <MusicCard />}
        {cardStyles.socialButtons?.enabled !== false && <SocialButtons />}
        {cardStyles.articleCard?.enabled !== false && <ArticleCard />}
        {cardStyles.shareCard?.enabled !== false && <ShareCard />}
        {cardStyles.writeButtons?.enabled !== false && <WriteButtons />}
        {cardStyles.likePosition?.enabled !== false && <LikePosition />}
        {cardStyles.hatCard?.enabled !== false && <HatCard />}
        {cardStyles.beianCard?.enabled !== false && <BeianCard />}
      </div>

// 修改后（缩进统一）
      <div>
		{cardStyles.artCard?.enabled !== false && <ArtCard />}
		{cardStyles.hiCard?.enabled !== false && <HiCard />}
		{cardStyles.clockCard?.enabled !== false && <ClockCard />}
		{cardStyles.calendarCard?.enabled !== false && <CalendarCard />}
		{cardStyles.musicCard?.enabled !== false && <MusicCard />}
		{cardStyles.socialButtons?.enabled !== false && <SocialButtons />}
		{cardStyles.articleCard?.enabled !== false && <ArticleCard />}
		{cardStyles.shareCard?.enabled !== false && <ShareCard />}
		{cardStyles.writeButtons?.enabled !== false && <WriteButtons />}
		{cardStyles.hatCard?.enabled !== false && <HatCard />}
		{cardStyles.likePosition?.enabled !== false && <LikePosition />}
		{cardStyles.beianCard?.enabled !== false && <BeianCard />}
      </div>
```


## 2，调整移动端卡片顺序

在移动端将备案卡片(BeianCard)和红心点赞卡片(LikePosition)互换位置。

### 修改文件

`src/app/(home)/page.tsx`

### 修改内容

```typescript
// 原代码（卡片顺序）
		{cardStyles.hatCard?.enabled !== false && <HatCard />}
		{cardStyles.likePosition?.enabled !== false && <LikePosition />}
		{cardStyles.beianCard?.enabled !== false && <BeianCard />}

// 修改后（调整顺序）
		{cardStyles.hatCard?.enabled !== false && <HatCard />}
		{cardStyles.beianCard?.enabled !== false && <BeianCard />}
		{cardStyles.likePosition?.enabled !== false && <LikePosition />}
```


## 3，解决备案卡片宽度对齐问题

移动端备案卡片与上方卡片宽度不一致，修改备案卡片的宽度配置，使其与上方卡片保持一致。

###  修改备案卡片组件

我们需要修改备案卡片组件，使其在移动端时使用与上方HiCard相同的宽度。

#### 修改文件

`src/app/(home)/beian-card.tsx`

#### 修改内容

```typescript
// 1. 导入useSize钩子
import { useSize } from "@/hooks/use-size";

// 2. 在组件中添加移动端检测和宽度计算
const BeianCard = () => {
  // ... 现有代码 ...
  
  const { maxSM } = useSize();
  
  const cardWidth = maxSM ? hiCardStyles.width : styles.width;
  const cardHeight = maxSM ? hiCardStyles.height : styles.height;

  return (
    <>
      {/* 3. 更新HomeDraggableLayer的width和height */}
      <HomeDraggableLayer
        id="beianCard"
        x={hiCardStyles.x + (hiCardStyles.width - cardWidth) / 2}
        y={hiCardStyles.y + hiCardStyles.height + styles.marginTop}
        zIndex={10}
        width={cardWidth}
        height={cardHeight}
      >
        {/* 4. 更新Card组件的width和height */}
        <Card
          title="备案信息"
          description={"工信部备案信息"}
          width={cardWidth}
          height={cardHeight}
          theme={cardTheme}
          transparent={false}
          id="beianCard"
        >
          {/* ... 现有代码 ... */}
        </Card>
      </HomeDraggableLayer>
    </>
  );
};

export default BeianCard;
```


## 4，总结

通过以上三个步骤，我们完成了对个人博客移动端界面的优化：

1. 统一了组件缩进格式，提高了代码可读性
2. 调整了移动端卡片顺序，优化了用户体验
3. 解决了备案卡片宽度对齐问题，提升了界面美观度

这些修改都是针对移动端视图进行的，桌面端布局不受影响。
