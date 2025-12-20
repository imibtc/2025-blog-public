// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID   // 留着备用，不累加也先不删
    const zoneId = process.env.CLOUDFLARE_ZONE_ID
    const domain = process.env.NEXT_PUBLIC_DOMAIN

    if (apiToken && zoneId) {
      try {
        const graphqlEndpoint = 'https://api.cloudflare.com/client/v4/graphql'

        /* 1. 取最近 365 天，每天一行；2. 正确字段是 requests / uniques */
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

        const response = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify({ query, variables: { zoneId } }),
        })

        if (!response.ok) {
          const errorBody = await response.text()
          throw new Error(`Cloudflare API请求失败: ${response.status} ${response.statusText} - ${errorBody}`)
        }

        const data = await response.json()
        if (data.errors) throw new Error(`Cloudflare API错误: ${JSON.stringify(data.errors)}`)

        const groups = data?.data?.viewer?.zones?.[0]?.httpRequests1dGroups
        if (!groups || groups.length === 0) throw new Error('Cloudflare 无数据')

        /* 累加 365 天，得到累计值 */
        const pageViews = groups.reduce((a: number, g: any) => a + (g.sum.requests || 0), 0)
        const uniqueVisitors = groups.reduce((a: number, g: any) => a + (g.uniq.uniques || 0), 0)

        return NextResponse.json(
          {
            pageViews,
            uniqueVisitors,
            timestamp: new Date().toISOString(),
            isMock: false,
            message: '使用真实Cloudflare访问统计数据',
            domain: domain || '未配置',
          },
          { headers: { 'Cache-Control': 'no-store' } },
        )
      } catch (apiError) {
        console.error('Cloudflare GraphQL API调用异常:', apiError)
      }
    }

    // 未配置或失败时降级
    const randomPageViews = Math.floor(Math.random() * 5000) + 55000
    const randomUniqueVisitors = Math.floor(randomPageViews * 0.9)
    return NextResponse.json(
      {
        pageViews: randomPageViews,
        uniqueVisitors: randomUniqueVisitors,
        timestamp: new Date().toISOString(),
        isMock: true,
        message: '未配置Cloudflare API或调用失败 - 显示随机生成的访问量数据',
        domain: domain || '未配置',
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('获取访问统计失败:', error)
    return NextResponse.json(
      {
        pageViews: 0,
        uniqueVisitors: 0,
        timestamp: new Date().toISOString(),
        isMock: true,
        message: '获取访问统计时发生错误',
        domain: process.env.NEXT_PUBLIC_DOMAIN || '未配置',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
