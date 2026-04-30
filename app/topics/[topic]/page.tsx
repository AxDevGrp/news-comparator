import { notFound } from 'next/navigation'
import { getTopicBySlug, iranWarTopic, WarRoomTopic } from '@/lib/data'
import { ConvergenceBar } from '@/components/ConvergenceBar'
import { SpectrumGrid } from '@/components/SpectrumGrid'
import { NarrativeCard } from '@/components/NarrativeCard'
import { AlertTriangle, TrendingUp, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function fetchTopicBySlug(slug: string): Promise<WarRoomTopic | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/topics-live`, {
      next: { revalidate: 21600 },
    })
    if (!res.ok) return getTopicBySlug(slug) ?? null
    const data = await res.json()
    const topics: WarRoomTopic[] = data.topics ?? []
    const found = topics.find((t) => t.slug === slug)
    if (found) return found
    // Fallback to mock data
    return getTopicBySlug(slug) ?? null
  } catch {
    return getTopicBySlug(slug) ?? null
  }
}

export default async function WarRoomPage({ params }: { params: { topic: string } }) {
  const topic = await fetchTopicBySlug(params.topic)
  if (!topic) return notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Daily Pulse
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            topic.status === 'active'
              ? 'bg-red-100 text-red-800'
              : topic.status === 'simmering'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-neutral-100 text-neutral-600'
          }`}>
            {topic.status === 'active' ? 'Active story' : topic.status === 'simmering' ? 'Simmering' : 'Resolved'}
          </span>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Clock className="w-3 h-3" />
            Last updated {new Date(topic.lastUpdated).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">{topic.title}</h1>
        <p className="text-lg text-neutral-500 mt-1">{topic.subtitle}</p>
      </div>

      {/* Market Signal */}
      {topic.marketSignal && (
        <div className="mb-8 p-4 bg-neutral-900 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider">Market Signal</p>
              <p className="text-sm font-medium">{topic.marketSignal.question}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{topic.marketSignal.yesPrice}%</p>
              <p className="text-xs text-neutral-400">Yes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{topic.marketSignal.volume}</p>
              <p className="text-xs text-neutral-400">Volume</p>
            </div>
            <a
              href={topic.marketSignal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-100 transition"
            >
              View on Polymarket
            </a>
          </div>
        </div>
      )}

      {/* Main content grid */}
      <div className="space-y-8">
        <ConvergenceBar points={topic.convergence} />
        <SpectrumGrid headlines={topic.headlines} />

        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Narrative Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {topic.narratives.map((n) => (
              <NarrativeCard key={n.id} narrative={n} />
            ))}
          </div>
        </div>

        {/* Blindspots */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Blindspot Alerts</h2>
          </div>
          <div className="space-y-4">
            {topic.blindspots.map((b) => (
              <div key={b.id} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-neutral-800 font-medium">{b.text}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Notably absent from: {b.missingFrom.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
