import Link from 'next/link'
import { iranWarTopic, WarRoomTopic } from '@/lib/data'
import { TrendingUp, ArrowRight, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function fetchLiveTopics(): Promise<WarRoomTopic[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/topics-live`, {
      next: { revalidate: 21600 },
    })
    if (!res.ok) return [iranWarTopic]
    const data = await res.json()
    return data.topics?.length ? data.topics : [iranWarTopic]
  } catch {
    return [iranWarTopic]
  }
}

export default async function TopicsPage() {
  const allTopics = await fetchLiveTopics()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-6 h-6 text-neutral-700" />
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Topics</h1>
        </div>
        <p className="text-neutral-500">
          Stories we are tracking across the spectrum. Click through to see how coverage differs by source.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {allTopics.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="group block bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-neutral-700 transition">
                  {topic.title}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">{topic.subtitle}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {topic.convergence.length} convergence
                  </span>
                  <span>{topic.narratives.length} narratives</span>
                  <span>{topic.blindspots.length} blindspots</span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 transition mt-1" />
            </div>
          </Link>
        ))}
      </div>

      {allTopics.length === 0 && (
        <p className="text-sm text-neutral-400 italic">No topics being tracked yet.</p>
      )}
    </div>
  )
}
