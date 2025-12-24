// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

// 简单的GET处理，不解析request
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      console.log('DATABASE_URL未设置');
      return Response.json({ pv: 0, success: true });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // 直接查询session表
    const result = await sql`
      SELECT COUNT(*) as count
      FROM session 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    const count = Number(result[0]?.count) || 0;
    console.log('查询结果:', count);
    
    return Response.json({ 
      pv: count,
      success: true 
    });
    
  } catch (error: any) {
    console.error('API错误详情:', error.message);
    // 静默失败，返回0
    return Response.json({ 
      pv: 0,
      success: true  // 必须是true，前端才能处理
    });
  }
}
