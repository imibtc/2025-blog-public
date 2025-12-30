'use client';
import { useEffect, useState } from 'react';
import Card from '@/components/card';
import { useCenterStore } from '@/hooks/use-center';
import { useConfigStore } from './stores/config-store';
import { CARD_SPACING } from '@/consts';
import Link from 'next/link';
import { HomeDraggableLayer } from './home-draggable-layer';
import { useSize } from '@/hooks/use-size';

export default function BeianCard() {
  const center = useCenterStore();
  const { cardStyles, siteContent } = useConfigStore();
  const styles = cardStyles.beianCard;
  const hiCardStyles = cardStyles.hiCard;
  const articleCardStyles = cardStyles.articleCard;
  const { maxSM } = useSize();

  const cardWidth = maxSM ? hiCardStyles.width : styles.width;
  const cardHeight = styles.height;

  const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x + hiCardStyles.width / 2 - cardWidth + 200;
  const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y + hiCardStyles.height / 2 + CARD_SPACING + 180;

  const beian = siteContent.beian;

  if (!beian?.text) {
    return null;
  }

  return (
    <HomeDraggableLayer cardKey='beianCard' x={x} y={y} width={cardWidth} height={cardHeight}>
      <Card 
        order={styles.order} 
        width={cardWidth} 
        height={cardHeight} 
        x={x} 
        y={y} 
        className='flex flex-col items-center justify-center gap-1 max-sm:static'
      >
        {/* 备案文字 */}
        {beian.link ? (
          <Link 
            href={beian.link} 
            target='_blank' 
            rel='noopener noreferrer' 
            className='text-secondary text-xs transition-opacity hover:opacity-80'
          >
            {beian.text}
          </Link>
        ) : (
          <span className='text-secondary text-xs'>{beian.text}</span>
        )}

        {/* 访客统计 + 评论统计 */}
        <VisitorFooter />
      </Card>
    </HomeDraggableLayer>
  );
}

function VisitorFooter() {
  const [views, setViews] = useState(0);
  const [visitors, setVisitors] = useState(0);
  const [comments, setComments] = useState(0); // 新增：评论数状态
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    // 1. 获取访客统计
    fetch('/api/neon')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setViews(data.views || 0);
          setVisitors(data.visitors || 0);
        } else {
          setViews(10000);
          setVisitors(500);
        }
      })
      .catch(() => {
        setViews(10000);
        setVisitors(500);
      });

    // 2. 获取评论总数
    // 调用 Waline 评论总数接口
fetch('https://comments.hdxiaoke.top/api/comment/count')
  .then(r => r.json())
  .then(data => {
    if (data && typeof data === 'number') {
      setComments(data);
    } else if (data && data.data) {
      setComments(data.data);
    }
  })
  .catch((error) => {
    console.warn('获取评论数失败:', error);
    setComments(0);
  });

    // 3. 计算运行天数
    const start = new Date('2025-12-06T00:00:00').getTime();
    const tick = () => {
      const days = Math.floor((Date.now() - start) / 86400000);
      setUptime(`${days} 天`);
    };
    tick();
    const id = setInterval(tick, 3600000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className='text-xs text-secondary/70 mt-1'>
      运行 {uptime} · 浏览 {views} · 访问 {visitors} · 评论 {comments}
    </div>
  );
}
