// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL 未设置');
      return Response.json({ 
        views: 0,
        visitors: 0,
        success: false,
        error: 'DATABASE_URL_NOT_CONFIGURED'
      });
    }
    
    console.log('🔄 开始查询数据库总统计...');
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. 获取总页面浏览量（Views）
    console.log('📊 查询总Views...');
    const viewsResult = await sql`
      SELECT COUNT(*) as total_views
      FROM website_event
    `;
    
    const totalViews = Number(viewsResult[0]?.total_views) || 0;
    console.log(`✅ 总Views: ${totalViews}`);
    
    // 2. 获取总独立访客数（Visitors）
    console.log('👥 查询总Visitors...');
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as total_visitors
      FROM session
    `;
    
    const totalVisitors = Number(visitorsResult[0]?.total_visitors) || 0;
    console.log(`✅ 总Visitors: ${totalVisitors}`);
    
    // 3. 获取总访问次数（Visits）- 从图片看，session表没有visit_id
    // 使用 session 表行数作为近似值
    console.log('🔢 查询总Visits...');
    const visitsResult = await sql`
      SELECT COUNT(*) as total_visits
      FROM session
    `;
    
    const totalVisits = Number(visitsResult[0]?.total_visits) || 0;
    console.log(`✅ 总Visits: ${totalVisits}`);
    
    return Response.json({ 
      views: totalViews,      // 总页面浏览量
      visitors: totalVisitors, // 总独立访客数
      visits: totalVisits,     // 总访问次数
      success: true,
      timestamp: new Date().toISOString(),
      data_type: 'total'
    });
    
  } catch (error: any) {
    console.error('❌ 数据库查询失败:', error);
    
    return Response.json({ 
      views: 0,
      visitors: 0,
      visits: 0,
      success: false,
      error: error.message,
      error_type: error.constructor.name,
      timestamp: new Date().toISOString()
    });
  }
}
