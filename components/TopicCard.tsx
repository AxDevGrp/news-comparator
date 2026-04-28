import { DailyPulseItem } from '@/lib/data'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function TopicCard({ item }: { item: DailyPulseItem }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 transition hover:shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-bold">
            {item.rank}
          </span>
          <h3 className="text-lg font-semibold text-neutral-900">{item.topic}</h3>
          {item.isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3 h-3" />
              New
            </span>
          )}
        </div>
        <Link
          href={`/war-room/${item.slug}`}
          className="text-sm font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition"
        >
          War Room <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Convergence</span>
          <p className="text-sm text-neutral-700 mt-0.5">{item.convergence}</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Left take</span>
            <p className="text-sm text-neutral-600 mt-0.5">{item.leftTake}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Right take</span>
            <p className="text-sm text-neutral-600 mt-0.5">{item.rightTake}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">International</span>
            <p className="text-sm text-neutral-600 mt-0.5">{item.internationalTake}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Blindspot</span>
          <p className="text-sm text-neutral-600 mt-0.5">{item.blindspot}</p>
        </div>
      </div>
    </div>
  )
}
