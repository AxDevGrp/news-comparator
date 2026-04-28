import { Headline } from '@/lib/data'

const biasColors: Record<string, string> = {
  left: 'bg-blue-50 border-blue-200 text-blue-900',
  'centre-left': 'bg-blue-50/70 border-blue-100 text-blue-800',
  centre: 'bg-purple-50 border-purple-200 text-purple-900',
  'centre-right': 'bg-red-50/70 border-red-100 text-red-800',
  right: 'bg-red-50 border-red-200 text-red-900',
  international: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  alt: 'bg-amber-50 border-amber-200 text-amber-900',
}

const biasLabels: Record<string, string> = {
  left: 'Left',
  'centre-left': 'Centre-Left',
  centre: 'Centre',
  'centre-right': 'Centre-Right',
  right: 'Right',
  international: 'International',
  alt: 'Alt / Indie',
}

export function SpectrumGrid({ headlines }: { headlines: Headline[] }) {
  const sorted = [...headlines].sort((a, b) => {
    const order = ['left', 'centre-left', 'centre', 'centre-right', 'right', 'international', 'alt']
    return order.indexOf(a.source.bias) - order.indexOf(b.source.bias)
  })

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Spectrum Grid</h2>
        <p className="text-sm text-neutral-500">How outlets are framing the story</p>
        <div className="spectrum-bar mt-3" />
        <div className="flex justify-between text-xs text-neutral-400 mt-1">
          <span>Left</span>
          <span>Centre</span>
          <span>Right</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((h) => (
          <a
            key={h.id}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block p-4 rounded-lg border transition hover:shadow-sm ${biasColors[h.source.bias] || 'bg-neutral-50 border-neutral-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                {biasLabels[h.source.bias] || h.source.bias}
              </span>
              <span className="text-xs opacity-60">{h.source.name}</span>
            </div>
            <h3 className="text-sm font-semibold leading-snug">{h.title}</h3>
            {h.excerpt && (
              <p className="text-xs mt-2 opacity-70 line-clamp-2">{h.excerpt}</p>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
