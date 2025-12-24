export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 查询总Views（不加时间限制）
    const viewsResult = await sql`
      SELECT COUNT(*) as views
      FROM website_event
    `;
    
    // 查询总Visitors（不加时间限制）
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as visitors
      FROM session
    `;
    
    return Response.json({ 
      views: Number(viewsResult[0]?.views) || 0,  // 总浏览量
      visitors: Number(visitorsResult[0]?.visitors) || 0, // 总独立访客
      success: true 
    });
  } catch (error) {
    return Response.json({ 
      views: 0,
      visitors: 0,
      success: false 
    });
  }
}
