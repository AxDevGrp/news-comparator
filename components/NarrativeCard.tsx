import { Narrative } from '@/lib/data'
import { MessageSquare } from 'lucide-react'

const biasTitles: Record<string, string> = {
  left: 'US Liberal / Centre-Left Narrative',
  right: 'US Conservative / Right Narrative',
  international: 'International / Regional Narrative',
  alt: 'Alt / Independent Narrative',
}

export function NarrativeCard({ narrative }: { narrative: Narrative }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-neutral-500" />
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
          {biasTitles[narrative.bias] || narrative.bias}
        </h3>
      </div>
      <p className="text-neutral-800 leading-relaxed mb-4">{narrative.summary}</p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Key headlines</p>
        {narrative.keyHeadlines.map((hl, i) => (
          <div key={i} className="text-sm text-neutral-600 pl-3 border-l-2 border-neutral-200">
            {hl}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <p className="text-xs text-neutral-500">
          <span className="font-semibold">Framing:</span> {narrative.framing}
        </p>
      </div>
    </div>
  )
}
