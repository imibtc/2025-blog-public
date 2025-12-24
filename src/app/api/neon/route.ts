// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL未设置');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // 1. 查询总Views（移除24小时条件）
    const viewsResult = await sql`
      SELECT COUNT(*) as views
      FROM website_event
    `;
    
    // 2. 查询总Visitors（移除24小时条件）
    const visitorsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as visitors
      FROM session
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
