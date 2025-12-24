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

/* 总访问量 - 兼容 Next 16 编译期 */
export async function GET(req: Request) {
  await initTable();
  // 固定备用地址，编译期不会报错
  const fallback = 'https://2025-blog-public.vercel.app/api/neon?type=pv';
  const url = req.url || fallback;
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
