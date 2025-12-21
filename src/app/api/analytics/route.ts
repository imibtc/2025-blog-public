// app/api/analytics/route.ts
import { NextResponse } from 'next/server'

// 使用您的实际域名
const WORKER_URL = 'https://pageviews.hdxiaoke.workers.dev'
const YOUR_DOMAIN = 'www.hdxiaoke.top'

export async function GET() {
  try {
    const response = await fetch(`${WORKER_URL}/list?slugs=total`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Worker响应失败: ${response.status}`)
    }

    const data = await response.json()
    const totalViews = data.total || 34

    return NextResponse.json({
      pageViews: totalViews,
      uniqueVisitors: Math.floor(totalViews * 0.7),
      timestamp: new Date().toISOString(),
      source: 'cloudflare-worker',
      domain: YOUR_DOMAIN
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })

  } catch (error) {
    // 完全失败时返回当前显示值
    return NextResponse.json({
      pageViews: 34,
      uniqueVisitors: 24,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      domain: YOUR_DOMAIN
    })
  }
}
