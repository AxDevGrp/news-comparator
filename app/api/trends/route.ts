import { NextResponse } from 'next/server'

export const revalidate = 3600 // refresh every hour

interface GoogleTrend {
  title: string
  traffic: string
  link: string
  newsItems: { title: string; url: string; source: string }[]
}

export async function GET() {
  try {
    const res = await fetch(
      'https://trends.google.com/trends/trendingsearches/daily/rss?geo=US',
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()

    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || []

    const trends: GoogleTrend[] = itemMatches.slice(0, 15).map((item) => {
      const title = decodeHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '')
      const traffic = item.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/)?.[1] ?? ''
      const link = item.match(/<link\s*\/?>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? ''

      const newsMatches = [...item.matchAll(/<ht:news_item>([\s\S]*?)<\/ht:news_item>/g)]
      const newsItems = newsMatches.slice(0, 3).map((m) => {
        const block = m[1]
        return {
          title: decodeHtml(block.match(/<ht:news_item_title>([\s\S]*?)<\/ht:news_item_title>/)?.[1] ?? ''),
          url: block.match(/<ht:news_item_url>([\s\S]*?)<\/ht:news_item_url>/)?.[1]?.trim() ?? '',
          source: block.match(/<ht:news_item_source>([\s\S]*?)<\/ht:news_item_source>/)?.[1] ?? '',
        }
      })

      return { title, traffic, link, newsItems }
    })

    return NextResponse.json({ trends, fetchedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[/api/trends] failed:', err)
    return NextResponse.json({ trends: [], error: String(err) }, { status: 500 })
  }
}

function decodeHtml(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim()
}
