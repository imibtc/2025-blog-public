// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 检查数据库连接配置
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL 环境变量未设置');
      return Response.json({ 
        views: 0,
        visitors: 0,
        success: false,
        error: 'DATABASE_URL_NOT_CONFIGURED'
      });
    }
    
    console.log('🔄 开始查询数据库总统计...');
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. 获取总页面浏览量（Views）- 查询 website_event 表
    console.log('📊 查询总Views...');
    const viewsResult = await sql`
      SELECT COUNT(*) as total_views
      FROM website_event
    `;
    
    const totalViews = Number(viewsResult[0]?.total_views) || 0;
    console.log(`✅ 总Views: ${totalViews}`);
    
    // 2. 获取总独立访客数（Visitors）- 查询 session 表
    console.log('👥 查询总Visitors...');
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as total_visitors
      FROM session
    `;
    
    const totalVisitors = Number(visitorsResult[0]?.total_visitors) || 0;
    console.log(`✅ 总Visitors: ${totalVisitors}`);
    
    
    return Response.json({ 
      views: totalViews,      // 总页面浏览量
      visitors: totalVisitors, // 总独立访客数
      visits: totalVisits,     // 总访问次数
      success: true,
      timestamp: new Date().toISOString(),
      data_type: 'total'       // 标记这是总数据
    });
    
  } catch (error: any) {
    console.error('❌ 数据库查询失败:', error);
    
    // 返回0但包含错误信息
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
