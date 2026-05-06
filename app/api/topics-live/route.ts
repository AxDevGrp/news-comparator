import { NextResponse } from 'next/server'
import { fetchRss } from '@/lib/rss'
import { ALL_FEEDS, OUTLET_BIAS } from '@/lib/bias-map'
import { clusterArticlesIntoTopics, generateWarRoomTopic } from '@/lib/ai'
import { WarRoomTopic } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const revalidate = 21600 // refresh every 6 hours

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ topics: [], error: 'Missing GEMINI_API_KEY' }, { status: 503 })
    }

    // Fetch all outlet RSS feeds in parallel
    const allArticlesNested = await Promise.all(
      ALL_FEEDS.map((feed) => fetchRss(feed.url, feed.name, 8))
    )
    const allArticles = allArticlesNested.flat()

    if (allArticles.length < 10) {
      return NextResponse.json({ topics: [], error: 'Not enough articles fetched' }, { status: 503 })
    }

    // Cluster into topics via AI
    const clusters = await clusterArticlesIntoTopics(allArticles)
    if (!clusters.length) {
      return NextResponse.json({ topics: [], error: 'No AI topic clusters generated' }, { status: 503 })
    }

    // Generate full WarRoomTopic for each cluster
    const topics: WarRoomTopic[] = await Promise.all(
      clusters.slice(0, 6).map(async (cluster) => {
        const clusterArticles = cluster.articleIndices.map((i) => allArticles[i]).filter(Boolean)
        const generated = await generateWarRoomTopic(cluster.topic, clusterArticles)

        const headlines = clusterArticles.slice(0, 6).map((a, i) => ({
          id: `h${i + 1}`,
          source: {
            name: a.source,
            bias: OUTLET_BIAS[a.source] ?? 'centre',
            url: a.url,
          },
          title: a.title,
          url: a.url,
          publishedAt: a.publishedAt,
          excerpt: a.description,
        }))

        return {
          slug: generated.slug ?? '',
          title: generated.title ?? cluster.topic,
          subtitle: generated.subtitle ?? '',
          lastUpdated: generated.lastUpdated ?? new Date().toISOString(),
          status: 'active' as const,
          convergence: generated.convergence ?? [],
          narratives: generated.narratives ?? [],
          blindspots: generated.blindspots ?? [],
          headlines,
        }
      })
    )

    return NextResponse.json({ topics, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[topics-live]', err)
    return NextResponse.json({ topics: [], error: String(err) }, { status: 500 })
  }
}
