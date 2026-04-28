import Link from 'next/link'
import { iranWarTopic } from '@/lib/data'
import { ArrowRight, Radio, Archive } from 'lucide-react'

const activeTopics = [iranWarTopic]
const archivedTopics: typeof activeTopics = []

export default function WarRoomIndex() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">War Room</h1>
        <p className="text-neutral-500 mt-2">
          Deep-dive living pages for major ongoing stories. Updated every 4-6 hours when active.
        </p>
      </div>

      {/* Active */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Radio className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-neutral-900">Active Stories</h2>
        </div>
        <div className="space-y-4">
          {activeTopics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/war-room/${topic.slug}`}
              className="block bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Active
                    </span>
                    <span className="text-xs text-neutral-400">
                      Updated {new Date(topic.lastUpdated).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">{topic.title}</h3>
                  <p className="text-neutral-500 mt-1">{topic.subtitle}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
                    <span>{topic.convergence.length} convergence points</span>
                    <span>{topic.narratives.length} narratives mapped</span>
                    <span>{topic.blindspots.length} blindspots flagged</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Archived */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Archive className="w-5 h-5 text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900">Resolved / Archived</h2>
        </div>
        {archivedTopics.length === 0 ? (
          <p className="text-sm text-neutral-400 italic">No archived stories yet.</p>
        ) : (
          <div className="space-y-3">
            {archivedTopics.map((topic) => (
              <Link
                key={topic.slug}
                href={`/war-room/${topic.slug}`}
                className="block bg-neutral-50 rounded-lg border border-neutral-200 p-4 hover:shadow-sm transition"
              >
                <h3 className="font-medium text-neutral-700">{topic.title}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
