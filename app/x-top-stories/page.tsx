import { xTopStories as mockStories, XTopStory } from '@/lib/data'
import { XTopStoryCard } from '@/components/XTopStoryCard'
import { Clock, RefreshCw, TrendingUp, Zap } from 'lucide-react'

export const revalidate = 14400

export const metadata = {
  title: 'X Top Stories — What\'s Breaking on X Right Now | News Comparator',
  description: 'Trending discourse decomposed. What\'s blowing up on X, how Left/Right are framing it, and what the viral claims are missing. Updated 3x daily.',
}

async function fetchLiveStories(): Promise<XTopStory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/x-stories-live`, {
      next: { revalidate: 14400 },
    })
    if (!res.ok) return mockStories
    const data = await res.json()
    return data.stories?.length ? data.stories : mockStories
  } catch {
    return mockStories
  }
}

export default async function XTopStoriesPage() {
  const stories = await fetchLiveStories()
  const lastUpdated = stories[0]?.lastUpdated

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
          <Clock className="w-4 h-4" />
          <span>
            Updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            }) : 'Just now'}
          </span>
          <RefreshCw className="w-3 h-3 ml-1" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-7 h-7 text-orange-500" />
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            X Top Stories
          </h1>
        </div>
        <p className="text-neutral-500 mt-1 max-w-2xl">
          What's blowing up on X right now — decomposed into Left framing, Right framing, early facts, media lag, and blindspots. Updated 9am, 1pm, 6pm ET.
        </p>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="inline-flex items-center gap-1.5 text-neutral-600">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            5 trending topics
          </span>
          <span className="inline-flex items-center gap-1.5 text-neutral-600">
            <RefreshCw className="w-4 h-4 text-emerald-500" />
            Refreshes 3x daily
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {stories.map((story) => (
          <XTopStoryCard key={story.id} story={story} />
        ))}
      </div>

      <div className="mt-12 p-6 bg-neutral-100 rounded-xl">
        <h2 className="text-lg font-semibold text-neutral-800 mb-2">How X Top Stories works</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-neutral-600">
          <div>
            <span className="font-semibold text-neutral-800">1. Monitor</span>
            <p>We track trending topics on X in real time, focusing on political and news discourse.</p>
          </div>
          <div>
            <span className="font-semibold text-neutral-800">2. Decompose</span>
            <p>AI extracts Left/Right framing, identifies viral claims, and cross-reaches with mainstream media.</p>
          </div>
          <div>
            <span className="font-semibold text-neutral-800">3. Verify</span>
            <p>Human editors check early facts against known sources before publication.</p>
          </div>
          <div>
            <span className="font-semibold text-neutral-800">4. Publish</span>
            <p>Updated at 9am, 1pm, and 6pm ET — or sooner if a major story breaks.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
