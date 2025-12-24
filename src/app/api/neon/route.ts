// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('=== API开始执行 ===');
  
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL未设置');
    }
    
    console.log('DATABASE_URL前20位:', process.env.DATABASE_URL.substring(0, 20) + '...');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. 先验证数据库连接
    console.log('测试数据库连接...');
    const testResult = await sql`SELECT version() as db_version`;
    console.log('数据库版本:', testResult[0]?.db_version);
    
    // 2. 查看有哪些表
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('数据库表:', tablesResult.map(t => t.table_name));
    
    // 3. 尝试查询24小时数据
    console.log('查询website_event表...');
    const viewsQuery = `
      SELECT COUNT(*) as views
      FROM website_event
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    console.log('执行SQL:', viewsQuery);
    
    const viewsResult = await sql`${sql.raw(viewsQuery)}`;
    console.log('Views结果:', viewsResult[0]?.views);
    
    // 4. 查询session表
    console.log('查询session表...');
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as visitors
      FROM session
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    console.log('Visitors结果:', visitorsResult[0]?.visitors);
    
    return Response.json({ 
      views: Number(viewsResult[0]?.views) || 0,
      visitors: Number(visitorsResult[0]?.visitors) || 0,
      success: true 
    });
    
  } catch (error: any) {
    console.error('❌ 完整错误信息:');
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('错误类型:', error.constructor.name);
    
    return Response.json({ 
      views: 0,
      visitors: 0,
      success: false,
      error_message: error.message,
      error_type: error.constructor.name
    });
  }
}
