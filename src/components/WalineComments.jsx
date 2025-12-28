// src/components/WalineComments.tsx
'use client'

import { useEffect, useRef } from 'react'

interface WalineCommentsProps {
  path: string
  serverURL?: string
}

export default function WalineComments({ 
  path, 
  serverURL = 'https://comments.hdxiaoke.top' 
}: WalineCommentsProps) {
  const walineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initWaline = async () => {
      if (!walineRef.current) return
      
      const Waline = (await import('@waline/client')).default
      
      Waline.init({
        el: walineRef.current,
        serverURL: serverURL,
        path: path,
        lang: 'zh-CN',
        dark: 'auto',
        reaction: true,
        login: 'disable',
        requiredMeta: ['nick', 'mail'],
        placeholder: '欢迎留言！支持 Markdown 语法',
        emoji: ['https://unpkg.com/@waline/emojis@1.1.0/weibo'],
      })
    }

    initWaline()
  }, [path, serverURL])

  return (
    <div className="max-w-[840px] mx-auto px-4"> {/* 新增：限制宽度并居中 */}
      <div 
        ref={walineRef} 
        className="mt-12 pt-8 border-t"
      />
    </div>
  )
}
