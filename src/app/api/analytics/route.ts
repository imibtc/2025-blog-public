// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const TOKEN   = process.env.CLOUDFLARE_API_TOKEN
  const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID

  if (!TOKEN || !ZONE_ID) return mockResponse()

  /* 1. 正确变量签名  2. 累加 365 天 */
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

    const json = await res.json()
    if (json.errors) throw new Error(JSON.stringify(json.errors))

    const groups = json.data?.viewer?.zones?.[0]?.httpRequests1dGroups
    if (!groups || groups.length === 0) throw new Error('无数据')

    const pageViews = groups.reduce((a: number, g: any) => a + (g.sum.requests || 0), 0)
    const uniqueVisitors = groups.reduce((a: number, g: any) => a + (g.uniq.uniques || 0), 0)

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
