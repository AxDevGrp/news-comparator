import { dailyPulse as mockPulse, xTopStories as mockStories, DailyPulseItem, XTopStory, WarRoomTopic } from '@/lib/data'
import { getBaseUrl } from '@/lib/base-url'
import { TopicCard } from '@/components/TopicCard'
import { XTopStoryCard } from '@/components/XTopStoryCard'
import { Clock, Newspaper, Zap, Radio, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Live Feed — Daily Pulse + Trending Stories | News Comparator',
  description: 'All the news, decomposed. Daily Pulse briefing plus fast-moving trending stories in one view.',
}

async function fetchLiveXStories(): Promise<XTopStory[]> {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/x-stories-live`, { next: { revalidate: 14400 } })
    if (!res.ok) return mockStories
    const data = await res.json()
    return data.stories?.length ? data.stories : mockStories
  } catch {
    return mockStories
  }
}

async function fetchLivePulse(): Promise<{ items: DailyPulseItem[]; topics: WarRoomTopic[] }> {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/topics-live`, { next: { revalidate: 21600 } })
    if (!res.ok) return { items: mockPulse, topics: [] }
    const data = await res.json()
    const topics: WarRoomTopic[] = data.topics ?? []
    if (!topics.length) return { items: mockPulse, topics: [] }
    // Map WarRoomTopic → DailyPulseItem
    const items = topics.map((t, i): DailyPulseItem => {
      const leftNarrative = t.narratives.find((n) => n.bias === 'left' || n.bias === 'centre-left')
      const rightNarrative = t.narratives.find((n) => n.bias === 'right' || n.bias === 'centre-right')
      const intlNarrative = t.narratives.find((n) => n.bias === 'international' || n.bias === 'centre')
      return {
        id: `live-dp-${i + 1}`,
        rank: i + 1,
        topic: t.title,
        slug: t.slug,
        convergence: t.convergence[0]?.text ?? '',
        leftTake: leftNarrative?.summary ?? '',
        rightTake: rightNarrative?.summary ?? '',
        internationalTake: intlNarrative?.summary ?? '',
        blindspot: t.blindspots[0]?.text ?? '',
        isNew: true,
      }
    })
    return { items, topics }
  } catch {
    return { items: mockPulse, topics: [] }
  }
}

export default async function LiveFeedPage() {
  const [xStories, pulseData] = await Promise.all([fetchLiveXStories(), fetchLivePulse()])
  const { items: pulse, topics } = pulseData

  const pulseUpdated = 'Just now'
  const xUpdated = xStories[0]?.lastUpdated
    ? new Date(xStories[0].lastUpdated).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now'

  const breakingCount = xStories.filter((s) => s.isBreaking).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Live Feed</h1>
        <p className="text-neutral-500 mt-2 max-w-2xl">
          Everything in one place. The Daily Pulse for your morning briefing. Trending stories for what's breaking right now.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-5 gap-8">
        {/* LEFT: Daily Pulse (3 cols wide) */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-neutral-700" />
              <h2 className="text-xl font-bold text-neutral-900">Daily Pulse</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Clock className="w-4 h-4" />
              <span>{pulseUpdated}</span>
            </div>
          </div>

          <div className="space-y-6">
            {pulse.map((item, i) => (
              <TopicCard key={item.id} item={item} topic={topics[i]} defaultExpanded />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition"
            >
              View full Daily Pulse <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* RIGHT: Trending Stories (2 cols wide) */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-bold text-neutral-900">Trending Stories</h2>
                {breakingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Radio className="w-3 h-3" />
                    {breakingCount} breaking
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-400">
                <Clock className="w-3 h-3" />
                {xUpdated}
              </div>
            </div>

            <div className="space-y-4">
              {xStories.map((story) => (
                <CompactXStory key={story.id} story={story} />
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/x-top-stories"
                className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition"
              >
                View all Trending Stories <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mini explainer */}
            <div className="mt-6 p-4 bg-neutral-100 rounded-xl">
              <p className="text-xs text-neutral-500 leading-relaxed">
                <span className="font-semibold text-neutral-700">Daily Pulse</span> updates once daily — curated, slower, deeper.
                <br />
                <span className="font-semibold text-neutral-700">Trending Stories</span> are generated from Google News RSS and related source articles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompactXStory({ story }: { story: XTopStory }) {
  const sourceArticles = story.sourceArticles ?? []

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold">
            {story.rank}
          </span>
          <h3 className="text-sm font-semibold text-neutral-900 leading-tight">
            {story.trendingTopic}
          </h3>
        </div>
        {story.isBreaking && (
          <span className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">
            <Radio className="w-2.5 h-2.5" />
            Breaking
          </span>
        )}
      </div>

      <p className="text-xs text-neutral-500 mb-3">{story.viralClaim}</p>

      <div className="space-y-2 text-xs">
        <div className="flex gap-1.5">
          <span className="font-semibold text-blue-700 flex-shrink-0 w-12">Left:</span>
          <span className="text-neutral-600">{story.leftFraming || 'No left-side framing generated yet.'}</span>
        </div>
        <div className="flex gap-1.5">
          <span className="font-semibold text-red-700 flex-shrink-0 w-12">Right:</span>
          <span className="text-neutral-600">{story.rightFraming || 'No right-side framing generated yet.'}</span>
        </div>
      </div>

      {sourceArticles.length > 0 && (
        <div className="mt-3 pt-2 border-t border-neutral-100">
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Sources</span>
          <ul className="mt-1 space-y-1">
            {sourceArticles.slice(0, 3).map((article) => (
              <li key={article.url} className="text-xs">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-800 hover:text-neutral-600 underline underline-offset-2"
                >
                  {article.title}
                </a>
                <span className="ml-1 text-[10px] text-neutral-400">{article.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
        <span>{story.engagementEstimate}</span>
        <span>
          {new Date(story.lastUpdated).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}
