export interface RssArticle {
  title: string
  url: string
  description: string
  publishedAt: string
  source: string
}

export async function fetchRss(url: string, sourceName: string, maxItems = 10): Promise<RssArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsComparatorBot/1.0)' },
      next: { revalidate: 1800 },
    })
    if (!res.ok) {
      logFeedFailure(url, sourceName, `HTTP ${res.status}`)
      return []
    }
    const xml = await res.text()
    const items = xml.match(/<item\b[^>]*>([\s\S]*?)<\/item>/g) ?? []
    if (items.length) {
      return items.slice(0, maxItems).map((item) => ({
        title: decodeXml(extract(item, 'title')),
        url: extract(item, 'link').trim(),
        description: stripHtml(decodeXml(extract(item, 'description'))).slice(0, 300),
        publishedAt: extract(item, 'pubDate') || new Date().toISOString(),
        source: sourceName,
      }))
    }

    const entries = xml.match(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g) ?? []
    if (entries.length) {
      return entries.slice(0, maxItems).map((entry) => ({
        title: decodeXml(extract(entry, 'title')),
        url: extractAtomLink(entry),
        description: stripHtml(decodeXml(extract(entry, 'summary') || extract(entry, 'content'))).slice(0, 300),
        publishedAt: extract(entry, 'updated') || extract(entry, 'published') || new Date().toISOString(),
        source: sourceName,
      }))
    }

    logFeedFailure(url, sourceName, 'no RSS items or Atom entries found')
    return []
  } catch (err) {
    logFeedFailure(url, sourceName, String(err))
    return []
  }
}

export async function fetchGoogleNewsSearch(query: string, maxItems = 8): Promise<RssArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`
  return fetchRss(url, 'Google News', maxItems)
}

function extract(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return m ? (m[1] ?? m[2] ?? '').trim() : ''
}

function extractAtomLink(entry: string): string {
  const alternate = entry.match(/<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/)
  const first = alternate ?? entry.match(/<link\b(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/)
  return decodeXml(first?.[1] ?? '')
}

function logFeedFailure(url: string, sourceName: string, reason: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[rss] ${sourceName} failed (${url}): ${reason}`)
  }
}

function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
