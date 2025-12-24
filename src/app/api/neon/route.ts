// /src/app/api/neon/route.ts
export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 从website_event表获取Views
    const viewsResult = await sql`
      SELECT COUNT(*) as views FROM website_event
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    // 从session表获取Visitors
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as visitors FROM session
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    return Response.json({ 
      views: Number(viewsResult[0]?.views) || 0,
      visitors: Number(visitorsResult[0]?.visitors) || 0,
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
