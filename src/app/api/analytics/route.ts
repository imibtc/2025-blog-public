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
        
        // 构造GraphQL查询 - 获取总页面访问量
        const query = `
          query GetPageViews {
            viewer {
              zones(filter: { zoneTag: "${zoneId}" }) {
                httpRequests1dGroups(limit: 1, orderBy: [date_DESC]) {
                  sum {
                    pageViews
                  }
                  dimensions {
                    date
                  }
                }
              }
            }
          }
        `
        
        // 调用Cloudflare GraphQL API
        const response = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
          },
          body: JSON.stringify({ query }),
        })
        
        // 检查API响应状态
        if (!response.ok) {
          throw new Error(`Cloudflare API请求失败: ${response.status} ${response.statusText}`)
        }
        
        // 解析API响应
        const data = await response.json()
        
        // 检查API响应结构
        if (data.errors) {
          throw new Error(`Cloudflare API错误: ${JSON.stringify(data.errors)}`)
        }
        
        // 提取页面访问量数据
        const zones = data?.data?.viewer?.zones
        if (zones && zones.length > 0) {
          const httpRequests = zones[0]?.httpRequests1dGroups
          if (httpRequests && httpRequests.length > 0) {
            const pageViews = httpRequests[0]?.sum?.pageViews || 0
            
            // 返回真实的访问统计数据
            return NextResponse.json({
              pageViews: pageViews,
              timestamp: new Date().toISOString(),
              isMock: false,
              message: '使用真实Cloudflare访问统计数据',
              domain: domain || '未配置'
            })
          }
        }
        
        throw new Error('Cloudflare API响应结构不符合预期')
      } catch (apiError) {
        console.error('Cloudflare GraphQL API调用异常:', apiError)
      }
    }
    
    // 如果未配置Cloudflare API或调用失败，使用随机数作为备用
    const randomPageViews = Math.floor(Math.random() * 5000) + 55000
    
    return NextResponse.json({
      pageViews: randomPageViews,
      timestamp: new Date().toISOString(),
      isMock: true,
      message: '未配置Cloudflare API或调用失败 - 显示随机生成的访问量数据',
      domain: domain || '未配置'
    })
  } catch (error) {
    console.error('获取访问统计失败:', error)
    
    // 返回错误状态的响应
    return NextResponse.json({
      pageViews: 0,
      timestamp: new Date().toISOString(),
      isMock: true,
      message: '获取访问统计时发生错误',
      domain: process.env.NEXT_PUBLIC_DOMAIN || '未配置'
    }, { status: 500 })
  }
}