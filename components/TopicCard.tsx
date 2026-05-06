'use client'

import { useEffect, useState } from 'react'
import { DailyPulseItem, WarRoomTopic } from '@/lib/data'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

type TopicCardProps = {
  item: DailyPulseItem
  topic?: WarRoomTopic
  defaultExpanded?: boolean
}

export function TopicCard({ item, topic, defaultExpanded = false }: TopicCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const headlines = topic?.headlines ?? []

  useEffect(() => {
    setIsExpanded(defaultExpanded)
  }, [defaultExpanded])

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 transition hover:shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="w-full flex items-start justify-between gap-4 text-left"
        aria-expanded={isExpanded}
      >
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
        <span className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition">
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide breakdown
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show breakdown
            </>
          )}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-3 mt-5">
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

          {headlines.length > 0 && (
            <div className="pt-3 border-t border-neutral-100">
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Source Articles</span>
              <ul className="mt-2 space-y-2">
                {headlines.map((h) => (
                  <li key={h.id} className="text-sm">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-neutral-900 hover:text-neutral-600 underline underline-offset-2"
                    >
                      {h.title}
                    </a>
                    <span className="ml-2 text-xs text-neutral-500">
                      {h.source.name} · {h.source.bias}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
