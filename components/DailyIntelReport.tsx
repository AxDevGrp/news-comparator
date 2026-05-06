'use client'

import { useEffect, useRef } from 'react'

interface DailyIntelReportProps {
  markdown: string
  generatedAt: string
}

/**
 * Renders the Daily Intel markdown report.
 * Converts section headers, bullets, and bold text to styled HTML.
 */
export function DailyIntelReport({ markdown, generatedAt }: DailyIntelReportProps) {
  const formatted = formatMarkdown(markdown)
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
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    </div>
  )
}

/** Lightweight markdown → HTML converter for the intel report format */
function formatMarkdown(md: string): string {
  return md
    // Strip leading/trailing dashes used as section dividers (---) → <hr>
    .replace(/^---$/gm, '<hr />')
    // h1
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // h2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // h3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Bullet points starting with - or •
    .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul class="list-none pl-0 space-y-1">${match}</ul>`)
    // Numbered list items (1. 2. etc)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Italic *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blank lines → paragraph breaks (only between non-tag lines)
    .replace(/\n\n(?!<)/g, '</p><p>')
    // Wrap the whole thing
    .replace(/^(?!<)(.+)$/gm, (line) => line.trim() ? line : '')
    // Clean up any double paragraph tags
    .replace(/<p><\/p>/g, '')
    // Wrap in a paragraph if content exists
    .split('\n').join('\n')
}
