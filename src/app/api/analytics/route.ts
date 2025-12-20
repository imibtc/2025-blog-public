import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 从环境变量获取Cloudflare配置
    const apiToken = process.env.CLOUDFLARE_API_TOKEN
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const zoneId = process.env.CLOUDFLARE_ZONE_ID
    const domain = process.env.NEXT_PUBLIC_DOMAIN

    // 检查是否配置了Cloudflare API所需的所有环境变量
    if (apiToken && accountId && zoneId) {
      try {
        // Cloudflare GraphQL API端点
        const graphqlEndpoint = 'https://api.cloudflare.com/client/v4/graphql'
        
        // 使用变量的GraphQL查询
        const query = `
          query GetPageViews($zoneTag: String!, $date: Date!) {
            viewer {
              zones(filter: { zoneTag: $zoneTag }) {
                httpRequests1dGroups( // 修正：使用正确的字段名 `1d`
                  limit: 1
                  orderBy: [date_DESC]
                  filter: { date_geq: $date }
                ) {
                  sum {
                    pageViews
                  }
                  uniq {
                    uniques
                  }
                  dimensions {
                    date
                  }
                }
              }
            }
          }
        `;

        // 定义GraphQL变量
        const variables = {
          zoneTag: zoneId,
          date: "2025-01-01" // 可以考虑动态生成，例如：new Date().toISOString().split('T')[0]
        };

        // 调用Cloudflare GraphQL API
        const response = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
          },
          body: JSON.stringify({
            query,
            variables // 在请求体中发送变量
          }),
        })

        // ... 其余部分（错误处理、响应解析等）保持不变 ...
        if (!response.ok) {
          const errorBody = await response.text()
          throw new Error(`Cloudflare API请求失败: ${response.status} ${response.statusText} - ${errorBody}`)
        }
        
        const data = await response.json()
        
        if (data.errors) {
          throw new Error(`Cloudflare API错误: ${JSON.stringify(data.errors)}`)
        }
        
        const zones = data?.data?.viewer?.zones
        // ... (数据提取逻辑保持不变) ...

        // 返回真实的访问统计数据
        return NextResponse.json({
          pageViews: pageViews,
          uniqueVisitors: uniqueVisitors,
          timestamp: new Date().toISOString(),
          isMock: false,
          message: '使用真实Cloudflare访问统计数据',
          domain: domain || '未配置'
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
          }
        })

      } catch (apiError) {
        console.error('Cloudflare GraphQL API调用异常:', apiError)
        // 这里可以记录更详细的日志，例如：console.error('API Error for zone:', zoneId, apiError);
      }
    }
    
    // ... 降级到模拟数据的逻辑保持不变 ...
    const randomPageViews = Math.floor(Math.random() * 5000) + 55000
    const randomUniqueVisitors = Math.floor(randomPageViews * 0.9)
    
    return NextResponse.json({
      pageViews: randomPageViews,
      uniqueVisitors: randomUniqueVisitors,
      timestamp: new Date().toISOString(),
      isMock: true,
      message: '未配置Cloudflare API或调用失败 - 显示随机生成的访问量数据',
      domain: domain || '未配置'
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
    
  } catch (error) {
    console.error('获取访问统计失败:', error)
    return NextResponse.json({
      pageViews: 0,
      uniqueVisitors: 0,
      timestamp: new Date().toISOString(),
      isMock: true,
      message: '获取访问统计时发生错误',
      domain: process.env.NEXT_PUBLIC_DOMAIN || '未配置'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
      }
    })
  }
}
