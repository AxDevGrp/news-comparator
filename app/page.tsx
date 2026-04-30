import { dailyPulse, DailyPulseItem, WarRoomTopic } from '@/lib/data'
import { TopicCard } from '@/components/TopicCard'
import { Clock, RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'

type TopicsLiveResponse = {
  topics?: WarRoomTopic[]
}

function mapTopicsToDailyPulse(topics: WarRoomTopic[]): DailyPulseItem[] {
  return topics.map((t, i): DailyPulseItem => ({
    id: `live-dp-${i + 1}`,
    rank: i + 1,
    topic: t.title,
    slug: t.slug,
    convergence: t.convergence[0]?.text ?? '',
    leftTake: t.narratives.find(n => n.bias === 'left' || n.bias === 'centre-left')?.summary ?? '',
    rightTake: t.narratives.find(n => n.bias === 'right' || n.bias === 'centre-right')?.summary ?? '',
    internationalTake: t.narratives.find(n => n.bias === 'international' || n.bias === 'centre')?.summary ?? '',
    blindspot: t.blindspots[0]?.text ?? '',
    isNew: true,
  }))
}

async function getDailyPulse(): Promise<{ items: DailyPulseItem[]; topics: WarRoomTopic[] }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/topics-live`, { cache: 'no-store' })

    if (!res.ok) throw new Error(`topics-live HTTP ${res.status}`)

    const data = (await res.json()) as TopicsLiveResponse
    const topics = data.topics ?? []

    if (!topics.length) {
      return { items: dailyPulse, topics: [] }
    }

    return { items: mapTopicsToDailyPulse(topics), topics }
  } catch (err) {
    console.error('[DailyPulsePage] falling back to mock data:', err)
    return { items: dailyPulse, topics: [] }
  }
}

export default async function DailyPulsePage() {
  const { items, topics } = await getDailyPulse()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
          <Clock className="w-4 h-4" />
          <span>Updated: 28 April 2026, 12:00 BST</span>
          <RefreshCw className="w-3 h-3 ml-1" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Daily Pulse
        </h1>
        <p className="text-neutral-500 mt-2">
          The top stories of the day, decomposed into what everyone agrees on — and where they diverge.
        </p>
      </div>

      <div className="space-y-6">
        {items.map((item, i) => (
          <TopicCard key={item.id} item={item} topic={topics[i]} />
        ))}
      </div>

      <div className="mt-12 p-6 bg-neutral-100 rounded-xl text-center">
        <h2 className="text-lg font-semibold text-neutral-800 mb-2">
          How this works
        </h2>
        <p className="text-sm text-neutral-600 max-w-2xl mx-auto">
          We scan 20+ news sources across the political spectrum. AI extracts narratives, 
          identifies points of convergence, and flags blindspots. Human editors review 
          before publication. We do not add opinion — we map the opinions that already exist.
        </p>
      </div>
    </div>
  )
}
