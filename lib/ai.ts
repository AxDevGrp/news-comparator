import { GoogleGenerativeAI } from '@google/generative-ai'
import { RssArticle } from './rss'
import { XTopStory, WarRoomTopic } from './data'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

async function generateJson<T>(prompt: string, fallback: T): Promise<T> {
  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()
    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    return JSON.parse(json) as T
  } catch (err) {
    console.error('[ai] generateJson error:', err)
    return fallback
  }
}

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

Respond with ONLY valid JSON (no markdown fences) matching this exact structure:
{
  "trendingTopic": "short punchy topic label (max 8 words)",
  "viralClaim": "the most-shared or most-contested claim in one sentence",
  "leftFraming": "how left/centre-left outlets are framing this (1-2 sentences)",
  "rightFraming": "how right-wing outlets are framing this (1-2 sentences)",
  "earlyFacts": "what is confirmed/verified so far (1-2 sentences)",
  "mediaLag": "what mainstream media is slow to cover or missing (1 sentence)",
  "blindspot": "the angle nobody is covering (1 sentence)",
  "engagementEstimate": "estimated social engagement e.g. ~500K impressions",
  "isBreaking": false
}

Be direct. No hedging. Use plain English. Base everything on the articles provided.`

  const data = await generateJson<Record<string, unknown>>(prompt, {})

  return {
    rank,
    slug: slugify(trendingTopic),
    lastUpdated: new Date().toISOString(),
    trendingTopic: (data.trendingTopic as string) ?? trendingTopic,
    viralClaim: (data.viralClaim as string) ?? '',
    leftFraming: (data.leftFraming as string) ?? '',
    rightFraming: (data.rightFraming as string) ?? '',
    earlyFacts: (data.earlyFacts as string) ?? '',
    mediaLag: (data.mediaLag as string) ?? '',
    blindspot: (data.blindspot as string) ?? '',
    engagementEstimate: (data.engagementEstimate as string) ?? '',
    isBreaking: (data.isBreaking as boolean) ?? false,
  }
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

Respond with ONLY valid JSON (no markdown fences):
{
  "topics": [
    { "topic": "topic name", "articleIndices": [0, 3, 7, 12] },
    { "topic": "topic name", "articleIndices": [1, 5, 9] }
  ]
}

Each topic should have at least 3 articles. Prefer topics covered by multiple outlets.`

  const data = await generateJson<{ topics: { topic: string; articleIndices: number[] }[] }>(
    prompt,
    { topics: [] }
  )
  return data.topics ?? []
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

Respond with ONLY valid JSON (no markdown fences):
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

  const data = await generateJson<Partial<WarRoomTopic>>(prompt, {})
  return { ...data, slug: slugify(topicTitle), lastUpdated: new Date().toISOString() }
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}
