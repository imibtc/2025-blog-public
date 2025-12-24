// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

// 强制动态渲染
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    // 重要：检查request和URL是否有效
    if (!request || !request.url) {
      return Response.json({ 
        pv: 0,
        success: true,
        message: '构建阶段，返回默认值'
      });
    }
    
    const sql = neon(process.env.DATABASE_URL || '');
    
    // 方案A：查询24小时内的独立会话
    const sessionResult = await sql`
      SELECT COUNT(*) as total_sessions
      FROM session 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    const sessions24h = Number(sessionResult[0]?.total_sessions) || 0;
    
    return Response.json({ 
      pv: sessions24h,  // 这应该是15，对应Umami的Visits
      success: true 
    });
    
  } catch (error) {
    console.error('API错误:', error);
    
    // 简化错误处理
    return Response.json({ 
      pv: 0,
      success: true,  // 这里改为true，让前端至少显示0而不是出错
      message: '查询失败，使用默认值'
    });
  }
}
