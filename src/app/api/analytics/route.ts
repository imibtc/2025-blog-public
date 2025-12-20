// src/app/api/analytics/route.ts  —— 调试版
import { NextResponse } from 'next/server'

export async function GET() {
  const TOKEN   = process.env.CLOUDFLARE_API_TOKEN
  const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID

  /* ---------- 1. 缺变量直接 mock ---------- */
  if (!TOKEN || !ZONE_ID) {
    return debugResponse({ error: '缺少环境变量' }, 200, true)
  }

  const query = `
    query($zoneId: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
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
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ query, variables: { zoneId: ZONE_ID } })
    })

    const txt = await res.text()          // 先文本，防止非 JSON
    let json: any
    try { json = JSON.parse(txt) } catch {
      return debugResponse({ error: 'CF 返回非 JSON', raw: txt }, 200, true)
    }

    /* 把原始响应带给前端，一眼能看到 */
    const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups
    if (!groups || groups.length === 0) {
      return debugResponse({ error: 'CF 返回空数组', raw: json }, 200, true)
    }

    const pageViews = groups.reduce((a: number, g: any) => a + (g.sum.requests || 0), 0)
    const uniqueVisitors = groups.reduce((a: number, g: any) => a + (g.uniq.uniques || 0), 0)

    return debugResponse({ pageViews, uniqueVisitors, raw: json }, 200, false)
  } catch (e: any) {
    return debugResponse({ error: e.message }, 200, true)
  }
}

/* 统一返回，带 debug 字段 */
function debugResponse(obj: any, status: number, isMock: boolean) {
  return NextResponse.json(
    { ...obj, isMock, ts: new Date().toISOString() },
    { status, headers: { 'Cache-Control': 'no-store' } }
  )
}
