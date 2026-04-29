import { TrendingUp, RefreshCw, ExternalLink } from 'lucide-react'

export const metadata = {
  title: 'Google Trends — What America Is Searching Right Now | News Comparator',
  description: 'Real-time Google Trends for the US — top 15 trending searches with related news.',
}

interface Trend {
  title: string
  traffic: string
  link: string
  newsItems: { title: string; url: string; source: string }[]
}

async function fetchTrends(): Promise<Trend[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const res = await fetch(`${baseUrl}/api/trends`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.trends ?? []
  } catch {
    return []
  }
}

export default async function TrendsPage() {
  const trends = await fetchTrends()
  const now = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
          <RefreshCw className="w-4 h-4" />
          <span>Refreshed: {now} · Updates hourly</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-7 h-7 text-blue-500" />
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Google Trends
          </h1>
        </div>
        <p className="text-neutral-500 mt-1 max-w-2xl">
          Top 15 trending searches in the United States right now, pulled live from Google Trends.
          These are the topics Americans are searching — the raw signal before media framing kicks in.
        </p>
      </div>

      {trends.length === 0 ? (
        <div className="p-8 text-center text-neutral-400 bg-neutral-50 rounded-xl">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Could not load trends right now</p>
          <p className="text-sm mt-1">Google Trends RSS may be temporarily unavailable — try again in a minute.</p>
        </div>
      ) : (
        <ol className="space-y-4">
          {trends.map((trend, i) => (
            <li key={i} className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-sm transition">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 text-blue-700 text-base font-bold border border-blue-100">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-semibold text-neutral-900">{trend.title}</h2>
                    {trend.traffic && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                        {trend.traffic} searches
                      </span>
                    )}
                  </div>

                  {trend.newsItems.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {trend.newsItems.map((item, j) => (
                        <li key={j}>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start gap-1.5 text-sm text-neutral-700 hover:text-blue-600"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-neutral-400 group-hover:text-blue-500" />
                            <span>
                              {item.title}
                              {item.source && (
                                <span className="ml-1 text-xs text-neutral-400">— {item.source}</span>
                              )}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10 p-5 bg-neutral-50 rounded-xl text-sm text-neutral-500">
        <p>
          <span className="font-semibold text-neutral-700">Source: </span>
          Google Trends Daily RSS feed (US). Data is approximate and represents search interest, not absolute volume.
          Refreshed every hour via server-side caching.
        </p>
      </div>
    </div>
  )
}
