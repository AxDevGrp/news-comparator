import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 86400 // cache tweet embed for 24h

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url param' }, { status: 400 })

  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true&theme=light&dnt=true&maxwidth=550`
    const res = await fetch(oembedUrl, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`oEmbed HTTP ${res.status}`)
    const data = await res.json()
    return NextResponse.json({ html: data.html })
  } catch (err) {
    console.error('[/api/tweet-embed] failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
