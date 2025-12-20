// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const TOKEN   = process.env.CLOUDFLARE_API_TOKEN
  const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID

  if (!TOKEN || !ZONE_ID) return mockResponse()

  /* 取最近 365 天汇总（CF 只保留 365 天，这就是“累计”上限） */
  const now   = Math.floor(Date.now() / 1000)
  const since = now - 365 * 86400
  const url   = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/analytics/dashboard?since=${since}&until=${now}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    const pageViews      = json.result?.totals?.requests?.all ?? 0
    const uniqueVisitors = json.result?.totals?.uniques?.all   ?? 0

    return NextResponse.json({
      pageViews,
      uniqueVisitors,
      isMock: false,
      ts: new Date().toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    console.error(e)
    return mockResponse()
  }
}

function mockResponse() {
  const pv = Math.floor(Math.random() * 5000) + 120000
  return NextResponse.json({
    pageViews: pv,
    uniqueVisitors: Math.floor(pv * 0.9),
    isMock: true,
    ts: new Date().toISOString(),
  }, { headers: { 'Cache-Control': 'no-store' } })
}
