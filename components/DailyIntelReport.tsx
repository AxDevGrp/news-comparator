'use client'

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

interface DailyIntelReportProps {
  markdown: string
  generatedAt: string
}

/** Renders the Daily Intel markdown report with sanitized HTML output. */
export function DailyIntelReport({ markdown, generatedAt }: DailyIntelReportProps) {
  const genDate = new Date(generatedAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'America/New_York',
  })

  return (
    <div className="bg-neutral-950 text-neutral-100 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-red-900/80 to-neutral-900 px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Daily Intel</h2>
            <p className="text-xs text-neutral-400">AI-synthesised from 30+ live sources</p>
          </div>
        </div>
        <span className="text-xs text-neutral-500">{genDate}</span>
      </div>

      {/* Report body */}
      <div
        className="px-6 py-6 prose prose-invert prose-sm max-w-none
          prose-headings:text-neutral-100
          prose-h1:text-xl prose-h1:font-bold prose-h1:mb-4
          prose-h2:text-base prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-2 prose-h2:border-b prose-h2:border-neutral-800 prose-h2:pb-1
          prose-h3:text-sm prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-1 prose-h3:text-neutral-300
          prose-p:text-neutral-300 prose-p:leading-relaxed
          prose-li:text-neutral-300 prose-li:leading-relaxed
          prose-strong:text-white
          prose-hr:border-neutral-800"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  )
}
