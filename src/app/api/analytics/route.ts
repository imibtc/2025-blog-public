// src/app/api/analytics/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID!
  const TOKEN   = process.env.CLOUDFLARE_API_TOKEN!

  const query = `
    query($zoneId: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneId }) {
          httpRequests1dGroups(limit: 1) {
            sum { requests }
          }
        }
      }
    }`

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables: { zoneId: ZONE_ID } }),
      next: { revalidate: 3600 }
    })

    if (!res.ok) throw new Error('GraphQL 失败')
    const json = await res.json()

    const pageViews: number =
      json.data?.viewer?.zones?.[0]?.httpRequests1dGroups?.[0]?.sum?.requests ?? 0

    return NextResponse.json({ pageViews, isMock: false })
  } catch {
    return NextResponse.json({
      pageViews: Math.floor(Math.random() * 5000) + 120000,
      isMock: true
    })
  }
}
