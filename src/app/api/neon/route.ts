import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// 初始化表（没有就建）
async function initTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      time TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function GET(request: Request) {
  await initTable();
  const { searchParams } = new URL(request.url);

  // 总访问量
  if (searchParams.get('type') === 'pv') {
    const [{ count }] = await sql`SELECT COUNT(*) AS count FROM visits`;
    return Response.json({ pv: Number(count) });
  }

  // 默认也返回 pv
  const [{ count }] = await sql`SELECT COUNT(*) AS count FROM visits`;
  return Response.json({ pv: Number(count) });
}

export async function POST() {
  await initTable();
  await sql`INSERT INTO visits DEFAULT VALUES`;
  return Response.json({ ok: true });
}
