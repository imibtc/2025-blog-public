import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function initTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS visits (
      id SERIAL PRIMARY KEY,
      time TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function GET(req: Request) {
  await initTable();
  // 兼容 Next 16：req.url 可能为空，给备用地址
  const url = req.url || `https://${process.env.VERCEL_URL || 'localhost'}/api/neon?type=pv`;
  const { searchParams } = new URL(url);
  const [{ count }] = await sql`SELECT COUNT(*) AS count FROM visits`;
  return new Response(JSON.stringify({ pv: Number(count) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST() {
  await initTable();
  await sql`INSERT INTO visits DEFAULT VALUES`;
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
