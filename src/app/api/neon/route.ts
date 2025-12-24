// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL未设置');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. 测试连接
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log('数据库连接成功');
    
    // 2. 查询 Views（来自 website_event 表）
    const viewsResult = await sql`
      SELECT COUNT(*) as views
      FROM website_event
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    // 3. 查询 Visitors（来自 session 表）
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as visitors
      FROM session
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    return Response.json({ 
      views: Number(viewsResult[0]?.views) || 0,
      visitors: Number(visitorsResult[0]?.visitors) || 0,
      success: true 
    });
    
  } catch (error: any) {
    console.error('API错误:', error);
    
    return Response.json({ 
      views: 0,
      visitors: 0,
      success: false,
      error_message: error.message,
      error_type: error.constructor.name
    });
  }
}
