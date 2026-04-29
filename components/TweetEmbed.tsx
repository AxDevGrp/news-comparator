'use client'

import { useEffect, useRef, useState } from 'react'

interface TweetEmbedProps {
  tweetUrl: string
}

export function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/tweet-embed?url=${encodeURIComponent(tweetUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          if (data.html) setHtml(data.html)
          else setError(true)
        }
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => { cancelled = true }
  }, [tweetUrl])

  // Trigger Twitter widget JS after HTML is injected
  useEffect(() => {
    if (!html || !containerRef.current) return

    // Load Twitter widget script if not already present
    if (!(window as any).twttr) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)
    } else {
      ;(window as any).twttr?.widgets?.load(containerRef.current)
    }
  }, [html])

  if (error) {
    return (
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700 underline underline-offset-2 mt-2"
      >
        View post on X ↗
      </a>
    )
  }

  if (!html) {
    return (
      <div className="mt-3 h-16 rounded-lg bg-neutral-100 animate-pulse" />
    )
  }

  return (
    <div
      ref={containerRef}
      className="mt-3 [&_.twitter-tweet]:mx-0 [&_.twitter-tweet]:max-w-full"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
