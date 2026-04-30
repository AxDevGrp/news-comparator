# Live Pipelines Implementation Plan

**Goal:** Replace all mock data with two automated AI pipelines — Pipeline 2 (Google Trends → X Top Stories) then Pipeline 1 (RSS feeds → Topics/Daily Pulse).

**Architecture:**
- Server-side Next.js API routes fetch RSS, call OpenAI, and return structured data
- Next.js ISR (`revalidate`) handles caching — no database needed
- Pages switch from importing mock `lib/data.ts` to fetching from live API routes
- Single OpenAI client (`lib/ai.ts`) used by both pipelines

**Tech Stack:**
- `openai` npm package — GPT-4o-mini (cheap, fast, good enough for summarisation)
- Native `fetch` for RSS (already proven with Google Trends)
- Next.js ISR for caching (works on Railway, no filesystem dependency)
- `.env.local` for `OPENAI_API_KEY`

**Outlet RSS feeds (bias-labelled):**
| Outlet | Bias | RSS URL |
|--------|------|---------|
| New York Times | centre-left | `https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml` |
| The Guardian | left | `https://www.theguardian.com/world/rss` |
| BBC News | centre | `https://feeds.bbci.co.uk/news/rss.xml` |
| NPR | centre-left | `https://feeds.npr.org/1001/rss.xml` |
| Al Jazeera | international | `https://www.aljazeera.com/xml/rss/all.xml` |
| AP News | centre | `https://feeds.apnews.com/rss/apf-topnews` |
| Fox News | right | `https://moxie.foxnews.com/google-publisher/latest.xml` |
| Breitbart | right | `https://feeds.feedburner.com/breitbart` |
| Washington Times | right | `https://www.washingtontimes.com/rss/headlines/news/` |
| The Hill | centre | `https://thehill.com/rss/syndicator/19110` |

**Google News topic search:** `https://news.google.com/rss/search?q=TOPIC&hl=en-US&gl=US&ceid=US:en`

---

## Task 1: Install OpenAI SDK + add env scaffolding

**Objective:** Get the OpenAI npm package installed and env vars wired up.

**Files:**
- Modify: `package.json` (via npm install)
- Create: `.env.local`
- Create: `.env.example`

**Steps:**

```bash
cd ~/Projects/news-comparator
npm install openai
```

Create `.env.local`:
```
OPENAI_API_KEY=sk-...your-key-here...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Create `.env.example` (safe to commit):
```
OPENAI_API_KEY=your-openai-api-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Verify:** `node -e "require('openai'); console.log('ok')"` → prints `ok`

**Commit:** `feat: install openai sdk`

---

## Task 2: Create RSS utility (`lib/rss.ts`)

**Objective:** Reusable function to fetch and parse any RSS feed into a clean array of articles.

**Files:**
- Create: `lib/rss.ts`

**Code:**
```typescript
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
      next: { revalidate: 1800 }, // 30min cache
    })
    if (!res.ok) return []
    const xml = await res.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []
    return items.slice(0, maxItems).map((item) => ({
      title: decodeXml(extract(item, 'title')),
      url: extract(item, 'link').trim(),
      description: stripHtml(decodeXml(extract(item, 'description'))).slice(0, 300),
      publishedAt: extract(item, 'pubDate') || new Date().toISOString(),
      source: sourceName,
    }))
  } catch {
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

function decodeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
```

**Verify:** Import in a test file, call `fetchRss` on the BBC RSS URL, confirm articles return.

**Commit:** `feat: rss utility`

---

## Task 3: Create bias map (`lib/bias-map.ts`)

**Objective:** Map outlet names to bias tags so AI can reference them correctly.

**Files:**
- Create: `lib/bias-map.ts`

**Code:**
```typescript
import { BiasTag } from './data'

export const OUTLET_BIAS: Record<string, BiasTag> = {
  'New York Times': 'centre-left',
  'The Guardian': 'left',
  'BBC News': 'centre',
  'NPR': 'centre-left',
  'Al Jazeera': 'international',
  'AP News': 'centre',
  'Fox News': 'right',
  'Breitbart': 'right',
  'Washington Times': 'right',
  'The Hill': 'centre',
  'Google News': 'centre',
}

export const LEFT_OUTLETS = ['The Guardian', 'NPR', 'New York Times']
export const RIGHT_OUTLETS = ['Fox News', 'Breitbart', 'Washington Times']
export const CENTRE_OUTLETS = ['BBC News', 'AP News', 'The Hill', 'Al Jazeera']

export const ALL_FEEDS: { name: string; bias: BiasTag; url: string }[] = [
  { name: 'New York Times', bias: 'centre-left', url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
  { name: 'The Guardian',   bias: 'left',        url: 'https://www.theguardian.com/world/rss' },
  { name: 'BBC News',       bias: 'centre',      url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'NPR',            bias: 'centre-left', url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'Al Jazeera',     bias: 'international', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'AP News',        bias: 'centre',      url: 'https://feeds.apnews.com/rss/apf-topnews' },
  { name: 'Fox News',       bias: 'right',       url: 'https://moxie.foxnews.com/google-publisher/latest.xml' },
  { name: 'Breitbart',      bias: 'right',       url: 'https://feeds.feedburner.com/breitbart' },
  { name: 'Washington Times', bias: 'right',     url: 'https://www.washingtontimes.com/rss/headlines/news/' },
  { name: 'The Hill',       bias: 'centre',      url: 'https://thehill.com/rss/syndicator/19110' },
]
```

**Commit:** `feat: outlet bias map`

---

## Task 4: Create OpenAI client + generation functions (`lib/ai.ts`)

**Objective:** Centralised AI client with two generator functions — one for XTopStory, one for WarRoomTopic.

**Files:**
- Create: `lib/ai.ts`

**Code:**
```typescript
import OpenAI from 'openai'
import { RssArticle } from './rss'
import { XTopStory, WarRoomTopic } from './data'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── Pipeline 2: Generate one XTopStory from a trending topic + related articles ──

export async function generateXTopStory(
  rank: number,
  trendingTopic: string,
  articles: RssArticle[]
): Promise<Omit<XTopStory, 'id'>> {
  const articleSummaries = articles
    .slice(0, 12)
    .map((a) => `[${a.source}] ${a.title}: ${a.description}`)
    .join('\n')

  const prompt = `You are a sharp, non-partisan media analyst. Given a trending topic and news articles covering it, generate a structured analysis card.

TRENDING TOPIC: "${trendingTopic}"

ARTICLES:
${articleSummaries}

Respond with ONLY valid JSON matching this exact structure:
{
  "trendingTopic": "short punchy topic label (max 8 words)",
  "viralClaim": "the most-shared or most-contested claim in one sentence",
  "leftFraming": "how left/centre-left outlets are framing this (1-2 sentences)",
  "rightFraming": "how right-wing outlets are framing this (1-2 sentences)",
  "earlyFacts": "what is confirmed/verified so far (1-2 sentences)",
  "mediaLag": "what mainstream media is slow to cover or missing (1 sentence)",
  "blindspot": "the angle nobody is covering (1 sentence)",
  "engagementEstimate": "estimated X engagement e.g. ~500K impressions on X",
  "isBreaking": false
}

Be direct. No hedging. Use plain English. Base everything on the articles provided.`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  const data = JSON.parse(res.choices[0].message.content ?? '{}')

  return {
    rank,
    slug: slugify(trendingTopic),
    lastUpdated: new Date().toISOString(),
    trendingTopic: data.trendingTopic ?? trendingTopic,
    viralClaim: data.viralClaim ?? '',
    leftFraming: data.leftFraming ?? '',
    rightFraming: data.rightFraming ?? '',
    earlyFacts: data.earlyFacts ?? '',
    mediaLag: data.mediaLag ?? '',
    blindspot: data.blindspot ?? '',
    engagementEstimate: data.engagementEstimate ?? '',
    isBreaking: data.isBreaking ?? false,
  }
}

// ── Pipeline 1: Generate a WarRoomTopic from articles across outlets ──

export async function generateWarRoomTopic(
  topicTitle: string,
  articles: RssArticle[]
): Promise<Partial<WarRoomTopic>> {
  const articleSummaries = articles
    .slice(0, 20)
    .map((a) => `[${a.source}] ${a.title}: ${a.description}`)
    .join('\n')

  const prompt = `You are a sharp, non-partisan media analyst. Given a set of news articles on a topic, generate a structured topic breakdown.

TOPIC: "${topicTitle}"

ARTICLES:
${articleSummaries}

Respond with ONLY valid JSON matching this exact structure:
{
  "title": "topic title (max 6 words)",
  "subtitle": "one-line subtitle",
  "status": "active",
  "convergence": [
    { "id": "c1", "text": "point all outlets agree on", "confidence": "high", "sources": ["source1","source2"] },
    { "id": "c2", "text": "another agreed point", "confidence": "medium", "sources": ["source1"] }
  ],
  "narratives": [
    { "id": "n1", "bias": "left", "summary": "left framing summary", "keyHeadlines": ["headline1"], "framing": "framing label" },
    { "id": "n2", "bias": "right", "summary": "right framing summary", "keyHeadlines": ["headline1"], "framing": "framing label" },
    { "id": "n3", "bias": "centre", "summary": "centrist/international framing", "keyHeadlines": ["headline1"], "framing": "framing label" }
  ],
  "blindspots": [
    { "id": "b1", "text": "angle being missed", "missingFrom": ["outlet1","outlet2"] }
  ]
}

Use only info from the provided articles. Be direct and analytical.`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  const data = JSON.parse(res.choices[0].message.content ?? '{}')
  return { ...data, slug: slugify(topicTitle), lastUpdated: new Date().toISOString() }
}

// ── Pipeline 1: Cluster raw articles into topic groups ──

export async function clusterArticlesIntoTopics(
  articles: RssArticle[]
): Promise<{ topic: string; articleIndices: number[] }[]> {
  const articleList = articles
    .slice(0, 40)
    .map((a, i) => `${i}: [${a.source}] ${a.title}`)
    .join('\n')

  const prompt = `Given these news article titles, group them into 4-6 major topics that multiple outlets are covering. Ignore minor/celebrity/sports stories. Focus on politics, geopolitics, economics, and major events.

ARTICLES:
${articleList}

Respond with ONLY valid JSON:
{
  "topics": [
    { "topic": "topic name", "articleIndices": [0, 3, 7, 12] },
    { "topic": "topic name", "articleIndices": [1, 5, 9] }
  ]
}

Each topic should have at least 3 articles. Prefer topics covered by multiple outlets.`

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const data = JSON.parse(res.choices[0].message.content ?? '{"topics":[]}')
  return data.topics ?? []
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}
```

**Commit:** `feat: openai generation functions`

---

## Task 5: Pipeline 2 — Live X Top Stories API route

**Objective:** API route that pulls Google Trends, searches news per topic, calls AI, returns live XTopStory array.

**Files:**
- Create: `app/api/x-stories-live/route.ts`

**Code:**
```typescript
import { NextResponse } from 'next/server'
import { fetchGoogleNewsSearch } from '@/lib/rss'
import { generateXTopStory } from '@/lib/ai'

export const revalidate = 14400 // refresh every 4 hours

async function fetchGoogleTrends(): Promise<string[]> {
  try {
    const res = await fetch('https://trends.google.com/trends/trendingsearches/daily/rss?geo=US', {
      next: { revalidate: 3600 },
    })
    const xml = await res.text()
    const items = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []
    return items.slice(0, 5).map((item) => {
      const m = item.match(/<title>([\s\S]*?)<\/title>/)
      return m?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() ?? ''
    }).filter(Boolean)
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const trends = await fetchGoogleTrends()
    if (!trends.length) {
      return NextResponse.json({ stories: [], error: 'No trends available' }, { status: 503 })
    }

    // For each trend: fetch news articles then generate AI story card
    const stories = await Promise.all(
      trends.map(async (topic, i) => {
        const articles = await fetchGoogleNewsSearch(topic, 10)
        const story = await generateXTopStory(i + 1, topic, articles)
        return { id: `live-${i + 1}`, ...story }
      })
    )

    return NextResponse.json({ stories, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[x-stories-live]', err)
    return NextResponse.json({ stories: [], error: String(err) }, { status: 500 })
  }
}
```

**Verify:** `curl http://localhost:3000/api/x-stories-live` → returns JSON with 5 story objects

**Commit:** `feat: pipeline 2 - live x top stories api`

---

## Task 6: Wire Pipeline 2 into X Top Stories page

**Objective:** Replace mock `xTopStories` import with live API data on the X Top Stories page.

**Files:**
- Modify: `app/x-top-stories/page.tsx`

**Change:** Convert to async server component, fetch from `/api/x-stories-live`, fall back to mock data if fetch fails.

```typescript
import { XTopStory, xTopStories as mockStories } from '@/lib/data'
// ... existing imports

async function fetchLiveStories(): Promise<XTopStory[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/x-stories-live`, { next: { revalidate: 14400 } })
    if (!res.ok) return mockStories
    const data = await res.json()
    return data.stories?.length ? data.stories : mockStories
  } catch {
    return mockStories
  }
}

export default async function XTopStoriesPage() {
  const stories = await fetchLiveStories()
  // rest of the component uses `stories` instead of `xTopStories`
  ...
}
```

**Commit:** `feat: x top stories page uses live pipeline 2 data`

---

## Task 7: Wire Pipeline 2 into Live Feed sidebar

**Objective:** Live Feed's X Top Stories sidebar also shows live data.

**Files:**
- Modify: `app/feed/page.tsx`

Same pattern as Task 6 — fetch from `/api/x-stories-live`, fallback to mock.

**Commit:** `feat: live feed sidebar uses pipeline 2 data`

---

## Task 8: Pipeline 1 — Live Topics API route

**Objective:** API route that fetches all RSS outlets, clusters articles into topics, generates WarRoomTopic for each.

**Files:**
- Create: `app/api/topics-live/route.ts`

**Code:**
```typescript
import { NextResponse } from 'next/server'
import { fetchRss } from '@/lib/rss'
import { ALL_FEEDS } from '@/lib/bias-map'
import { clusterArticlesIntoTopics, generateWarRoomTopic } from '@/lib/ai'
import { WarRoomTopic } from '@/lib/data'

export const revalidate = 21600 // refresh every 6 hours

export async function GET() {
  try {
    // Fetch all outlet RSS feeds in parallel
    const allArticlesNested = await Promise.all(
      ALL_FEEDS.map((feed) => fetchRss(feed.url, feed.name, 8))
    )
    const allArticles = allArticlesNested.flat()

    if (allArticles.length < 10) {
      return NextResponse.json({ topics: [], error: 'Not enough articles' }, { status: 503 })
    }

    // Cluster into topics
    const clusters = await clusterArticlesIntoTopics(allArticles)

    // Generate full WarRoomTopic for each cluster
    const topics: WarRoomTopic[] = await Promise.all(
      clusters.slice(0, 6).map(async (cluster) => {
        const clusterArticles = cluster.articleIndices.map((i) => allArticles[i]).filter(Boolean)
        const generated = await generateWarRoomTopic(cluster.topic, clusterArticles)

        // Build headlines from actual articles
        const headlines = clusterArticles.slice(0, 6).map((a, i) => ({
          id: `h${i + 1}`,
          source: { name: a.source, bias: 'centre' as const, url: a.url },
          title: a.title,
          url: a.url,
          publishedAt: a.publishedAt,
          excerpt: a.description,
        }))

        return {
          slug: generated.slug ?? '',
          title: generated.title ?? cluster.topic,
          subtitle: generated.subtitle ?? '',
          lastUpdated: generated.lastUpdated ?? new Date().toISOString(),
          status: 'active' as const,
          convergence: generated.convergence ?? [],
          narratives: generated.narratives ?? [],
          blindspots: generated.blindspots ?? [],
          headlines,
        }
      })
    )

    return NextResponse.json({ topics, generatedAt: new Date().toISOString() })
  } catch (err) {
    console.error('[topics-live]', err)
    return NextResponse.json({ topics: [], error: String(err) }, { status: 500 })
  }
}
```

**Verify:** `curl http://localhost:3000/api/topics-live` → returns JSON with topics array

**Commit:** `feat: pipeline 1 - live topics api`

---

## Task 9: Wire Pipeline 1 into Topics page

**Objective:** `/topics` page shows live AI-generated topics instead of mock data.

**Files:**
- Modify: `app/topics/page.tsx`

Fetch from `/api/topics-live`, fallback to `[iranWarTopic]` from mock data.

**Commit:** `feat: topics page uses live pipeline 1 data`

---

## Task 10: Wire Pipeline 1 into topic detail page

**Objective:** `/topics/[topic]` shows live generated WarRoomTopic by slug.

**Files:**
- Modify: `app/topics/[topic]/page.tsx`

Fetch from `/api/topics-live`, find matching slug, fallback to mock `getTopicBySlug`.

**Commit:** `feat: topic detail page uses live pipeline 1 data`

---

## Task 11: Wire Pipeline 1 into Daily Pulse (Live Feed main column)

**Objective:** Daily Pulse on Live Feed shows live topics as DailyPulseItem cards.

**Files:**
- Modify: `app/feed/page.tsx`

Map live WarRoomTopic array to DailyPulseItem shape for the TopicCard component. Fallback to mock `dailyPulse`.

**Commit:** `feat: daily pulse uses live pipeline 1 data`

---

## Task 12: Add Railway env var + test production build

**Objective:** Ensure `OPENAI_API_KEY` is set in Railway and prod build works.

**Steps:**
1. Railway Dashboard → news-comparator service → Variables → Add `OPENAI_API_KEY`
2. `npm run build` locally — confirm no TypeScript errors
3. Push to main → Railway deploys → test `/api/x-stories-live` on prod URL
4. Test `/x-top-stories` page on prod — confirm live data appears

**Commit:** `chore: add env example and railway setup notes`

---

## Cost estimate (for awareness, not optimisation yet)

| Action | Tokens (approx) | Cost per run |
|--------|-----------------|--------------|
| Pipeline 2: 5 topics × generateXTopStory | ~2K tokens each | ~$0.01 total |
| Pipeline 1: clusterArticles | ~3K tokens | ~$0.002 |
| Pipeline 1: 6 topics × generateWarRoomTopic | ~3K tokens each | ~$0.015 total |
| **Per full refresh cycle** | | **~$0.03** |
| **Per day (P2 runs 6x, P1 runs 4x)** | | **~$0.24/day** |
| **Per month** | | **~$7/month** |

GPT-4o-mini at $0.15/1M input tokens. Very cheap.
