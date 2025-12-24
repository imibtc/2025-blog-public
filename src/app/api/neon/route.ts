import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/* 初始化表 */
async function initTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      time TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function GET() {
  // 直接返回 PV 数据，不检查查询参数
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ pv: 0, success: true });
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT COUNT(*) AS count FROM visits`;
    return Response.json({ pv: Number(result[0]?.count || 0), success: true });
  } catch (error) {
    return Response.json({ pv: 0, success: true });
  }
}

/* 记录访问 */
export async function POST() {
  await initTable();
  await sql`INSERT INTO visits DEFAULT VALUES`;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
