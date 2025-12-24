// /src/app/api/neon/route.ts
import { neon } from '@neondatabase/serverless';

// 强制动态渲染，防止构建时错误
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 方案A：查询 session 表获取独立会话数（对应Visitors）
    const sessionResult = await sql`
      SELECT COUNT(*) as total_sessions
      FROM session 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    const sessions24h = Number(sessionResult[0]?.total_sessions) || 0;
    
    // 方案B：查询 website_event 表获取总事件数（对应Pageviews）
    const eventResult = await sql`
      SELECT COUNT(*) as total_events
      FROM website_event 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `;
    
    const events24h = Number(eventResult[0]?.total_events) || 0;
    
    // 方案C：查询网站信息，获取网站ID
    const websiteResult = await sql`
      SELECT website_id, name 
      FROM website 
      LIMIT 1
    `;
    
    const websiteId = websiteResult[0]?.website_id;
    
    // 返回数据
    // 您可以根据Umami后台显示的数据决定用哪个：
    // - 如果Umami显示"Visits: 15"，用 sessions24h
    // - 如果Umami显示"Views: 27"，用 events24h
    return Response.json({ 
      pv: sessions24h,  // 24小时独立访问次数
      // pv: events24h,  // 24小时总事件数
      website_id: websiteId,
      sessions_24h: sessions24h,
      events_24h: events24h,
      success: true 
    });
    
  } catch (error) {
    console.error('数据库查询错误:', error);
    
    // 即使出错，也尝试记录一次访问
    try {
      const sql = neon(process.env.DATABASE_URL!);
      // 尝试插入到session表
      await sql`
        INSERT INTO session (
          session_id, 
          website_id, 
          created_at
        ) VALUES (
          gen_random_uuid(),
          (SELECT website_id FROM website LIMIT 1),
          NOW()
        )
      `;
    } catch (e) {
      // 静默失败
    }
    
    return Response.json({ 
      pv: 0,
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}

// 记录新的访问
export async function POST() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // 1. 获取网站ID
    const websiteResult = await sql`
      SELECT website_id FROM website LIMIT 1
    `;
    const websiteId = websiteResult[0]?.website_id;
    
    if (!websiteId) {
      return Response.json({ 
        ok: false, 
        error: '未找到网站配置' 
      });
    }
    
    // 2. 记录到session表
    await sql`
      INSERT INTO session (
        session_id, 
        website_id, 
        created_at
      ) VALUES (
        gen_random_uuid(),
        ${websiteId},
        NOW()
      )
    `;
    
    // 3. 记录到website_event表
    await sql`
      INSERT INTO website_event (
        website_id,
        session_id,
        created_at
      ) VALUES (
        ${websiteId},
        gen_random_uuid(),
        NOW()
      )
    `;
    
    return Response.json({ 
      ok: true,
      message: '访问记录成功'
    });
    
  } catch (error) {
    console.error('记录访问失败:', error);
    return Response.json({ 
      ok: false,
      error: '记录失败'
    });
  }
}
