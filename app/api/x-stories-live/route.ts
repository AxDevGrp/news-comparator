import { NextResponse } from 'next/server'
import { fetchGoogleNewsSearch } from '@/lib/rss'
import { generateXTopStory } from '@/lib/ai'

export const revalidate = 14400 // refresh every 4 hours

async function fetchGoogleTrends(): Promise<string[]> {
  try {
    const res = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US', {
      next: { revalidate: 3600 },
    })
    const xml = await res.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []
    return items
      .slice(0, 5)
      .map((item) => {
        const m = item.match(/<title>([\s\S]*?)<\/title>/)
        return m?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() ?? ''
      })
      .filter(Boolean)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const trends = await fetchGoogleTrends()
    if (!trends.length) {
      return NextResponse.json({ stories: [], error: 'No trends available' }, { status: 503 })
    }

    const stories = await Promise.all(
      trends.map(async (topic, i) => {
        const articles = await fetchGoogleNewsSearch(topic, 10)
        const story = await generateXTopStory(i + 1, topic, articles)
        return { id: `live-${i + 1}`, ...story }
      })
    )

    return NextResponse.json({ stories, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[x-stories-live]', err)
    return NextResponse.json({ stories: [], error: String(err) }, { status: 500 })
  }
}
