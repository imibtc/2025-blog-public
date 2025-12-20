// src/app/api/analytics/route.ts  —— 最新调试版
import { NextResponse } from 'next/server'

export async function GET() {
  const TOKEN   = process.env.CLOUDFLARE_API_TOKEN
  const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID

  if (!TOKEN || !ZONE_ID) {
    return debugResponse({ error: '缺少环境变量' }, true)
  }

  const query = `
    query($zoneTag: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          httpRequests1dGroups(limit: 365) {
            sum  { requests }
            uniq { uniques }
          }
        }
      }
    }`

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ query, variables: { zoneTag: ZONE_ID } }),
    })

    const txt = await res.text()
    if (!res.ok) throw new Error(`HTTP ${res.status}  ${txt}`)

    const json = JSON.parse(txt)
    if (json.errors) throw new Error(JSON.stringify(json.errors))

    const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups
    if (!groups || groups.length === 0) throw new Error('CF 返回空数组')

    const pageViews = groups.reduce((a: number, g: any) => a + (g.sum.requests || 0), 0)
    const uniqueVisitors = groups.reduce((a: number, g: any) => a + (g.uniq.uniques || 0), 0)

    return debugResponse({ pageViews, uniqueVisitors }, false)
  } catch (e: any) {
    return debugResponse({ error: e.message }, true)
  }
}

/* 统一返回，带 isMock 标记 */
function debugResponse(obj: any, isMock: boolean) {
  return NextResponse.json(
    { ...obj, isMock, ts: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
