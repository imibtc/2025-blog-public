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

/* 总访问量 */
export async function GET() {
  await initTable();
  const [{ count }] = await sql`SELECT COUNT(*) AS count FROM visits`;
  return new Response(JSON.stringify({ pv: Number(count) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
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
