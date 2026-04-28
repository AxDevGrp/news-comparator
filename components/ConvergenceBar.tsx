import { ConvergencePoint } from '@/lib/data'
import { CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'

function ConfidenceIcon({ level }: { level: ConvergencePoint['confidence'] }) {
  if (level === 'high') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
  if (level === 'medium') return <AlertCircle className="w-4 h-4 text-amber-600" />
  return <HelpCircle className="w-4 h-4 text-neutral-400" />
}

function ConfidenceLabel({ level }: { level: ConvergencePoint['confidence'] }) {
  const labels = { high: 'High confidence', medium: 'Medium confidence', low: 'Developing' }
  const classes = {
    high: 'bg-emerald-100 text-emerald-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-neutral-100 text-neutral-600',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${classes[level]}`}>
      <ConfidenceIcon level={level} />
      {labels[level]}
    </span>
  )
}

export function ConvergenceBar({ points }: { points: ConvergencePoint[] }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        <h2 className="text-lg font-semibold text-neutral-900">Convergence — What Everyone Agrees On</h2>
      </div>
      <div className="space-y-4">
        {points.map((point) => (
          <div key={point.id} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 bg-neutral-50 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              <ConfidenceLabel level={point.confidence} />
            </div>
            <div className="flex-1">
              <p className="text-neutral-800 font-medium">{point.text}</p>
              <p className="text-xs text-neutral-500 mt-1">
                Confirmed by: {point.sources.join(', ')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
