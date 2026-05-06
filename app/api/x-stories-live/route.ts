import { NextResponse } from 'next/server'
import { fetchGoogleNewsSearch } from '@/lib/rss'
import { generateXTopStory } from '@/lib/ai'

export const dynamic = 'force-dynamic'

async function fetchTopTrendingTopics(): Promise<string[]> {
  try {
    // Use Google News Top Stories RSS (Google Trends RSS is deprecated/404)
    const res = await fetch('https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsComparatorBot/1.0)' },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []
    // Extract titles and dedupe into topic-like labels
    const titles = items
      .slice(0, 15)
      .map((item) => {
        const m = item.match(/<title>([\s\S]*?)<\/title>/)
        const raw = m?.[1]?.trim() ?? ''
        // Strip outlet suffix e.g. "Title - AP News" → "Title"
        return raw.replace(/\s[-–]\s[^-–]+$/, '').trim()
      })
      .filter((t) => t.length > 10)
      .slice(0, 5)
    return titles
  } catch {
    return []
  }
}

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ stories: [], error: 'Missing GEMINI_API_KEY' }, { status: 503 })
    }

    const trends = await fetchTopTrendingTopics()
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
