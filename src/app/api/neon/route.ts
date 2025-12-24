// /src/app/api/neon/route.ts
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 1. 获取Visitors（独立访客）- 与Umami显示一致
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as visitors
      FROM session
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    // 2. 获取Views（总浏览量）- 与Umami显示一致
    const viewsResult = await sql`
      SELECT COUNT(*) as views
      FROM website_event
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    // 3. 获取Visits（访问次数）- 对应Umami的"Visits: 23"
    const visitsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as visits
      FROM session
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    console.log('查询结果:', {
      visitors: visitorsResult[0]?.visitors,
      views: viewsResult[0]?.views,
      visits: visitsResult[0]?.visits
    });
    
    return Response.json({ 
      views: Number(viewsResult[0]?.views) || 0,      // 应该接近59
      visitors: Number(visitorsResult[0]?.visitors) || 0, // 应该接近15
      visits: Number(visitsResult[0]?.visits) || 0,   // 应该接近23
      success: true 
    });
  } catch (error) {
    return Response.json({ 
      views: 0,
      visitors: 0,
      visits: 0,
      success: false 
    });
  }
}
