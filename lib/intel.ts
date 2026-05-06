/**
 * Daily Intel Pipeline — Pipeline 3
 *
 * Ported from ~/.hermes/scripts/intel_report.py
 * Architecture:
 *   Phase 1: Article collection (4 domains, parallel)
 *   Phase 2: Domain synthesis (4x Gemini 2.5 Flash, parallel)
 *   Phase 2.5: Domain compression → 5 bullets each
 *   Phase 3: Final synthesis (Gemini 2.5 Flash)
 *
 * Returns a markdown string — no Discord/Obsidian delivery (front page handles display).
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchRss, fetchGoogleNewsSearch, RssArticle } from './rss'

// ── RSS Feed Definitions ─────────────────────────────────────────────────────

const INTEL_FEEDS: Record<string, { url: string; name: string }[]> = {
  politics: [
    { url: 'https://feeds.reuters.com/reuters/worldNews', name: 'Reuters' },
    { url: 'https://rss.dw.com/atom/rss-en-world', name: 'DW' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', name: 'Al Jazeera' },
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', name: 'BBC World' },
    { url: 'https://foreignpolicy.com/feed/', name: 'Foreign Policy' },
    { url: 'https://thediplomat.com/feed/', name: 'The Diplomat' },
    { url: 'https://breakingdefense.com/feed/', name: 'Breaking Defense' },
    { url: 'https://www.scmp.com/rss/91/feed', name: 'SCMP' },
    { url: 'https://asia.nikkei.com/rss/feed/nar', name: 'Nikkei Asia' },
  ],
  tech: [
    { url: 'https://feeds.feedburner.com/TechCrunch', name: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
    { url: 'https://arstechnica.com/feed/', name: 'Ars Technica' },
    { url: 'https://www.wired.com/feed/rss', name: 'Wired' },
    { url: 'https://hnrss.org/frontpage', name: 'Hacker News' },
    { url: 'https://huggingface.co/blog/feed.xml', name: 'HuggingFace' },
    { url: 'https://krebsonsecurity.com/feed/', name: 'Krebs Security' },
    { url: 'https://feeds.feedburner.com/TheHackersNews', name: 'The Hacker News' },
    { url: 'https://semianalysis.com/feed/', name: 'SemiAnalysis' },
  ],
  finance: [
    { url: 'https://feeds.reuters.com/reuters/businessNews', name: 'Reuters Business' },
    { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', name: 'MarketWatch' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', name: 'CNBC' },
    { url: 'https://finance.yahoo.com/news/rssindex', name: 'Yahoo Finance' },
    { url: 'https://oilprice.com/rss/main', name: 'OilPrice' },
    { url: 'https://www.eia.gov/rss/news.xml', name: 'EIA' },
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', name: 'BBC Business' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', name: 'WSJ Markets' },
  ],
  happy: [
    { url: 'https://www.sciencedaily.com/rss/all.xml', name: 'Science Daily' },
    { url: 'https://phys.org/rss-feed/', name: 'Phys.org' },
    { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', name: 'NASA' },
    { url: 'https://spacenews.com/feed/', name: 'Space News' },
    { url: 'https://www.theguardian.com/environment/rss', name: 'Guardian Environment' },
    { url: 'https://www.positive.news/feed/', name: 'Positive News' },
    { url: 'https://www.goodnewsnetwork.org/feed/', name: 'Good News Network' },
  ],
}

const GNEWS_QUERIES: Record<string, string[]> = {
  politics: [
    'Iran war Middle East Strait Hormuz',
    'Ukraine Russia war',
    'China Taiwan geopolitics',
    'NATO Europe military',
  ],
  tech: [
    'artificial intelligence model release',
    'AI startup funding',
    'cybersecurity exploit breach',
    'semiconductor chip supply',
  ],
  finance: [
    'stock market S&P 500',
    'oil price Iran energy markets',
    'Bitcoin crypto market',
    'Federal Reserve interest rates inflation',
    'trade tariffs sanctions economy',
  ],
  happy: [
    'science medical breakthrough discovery',
    'space exploration NASA',
    'conservation environment win',
  ],
}

// ── Synthesis Prompts ────────────────────────────────────────────────────────

const DOMAIN_PROMPTS: Record<string, string> = {
  politics: `You are an elite geopolitical intelligence analyst. Today is {date}.

Analyze these recent news articles and produce a dense, factual geopolitical brief for a busy executive.

ARTICLES:
{articles}

Cover what's actually in the articles. Focus on:
1. Middle East — Iran war, Strait of Hormuz, oil disruption risk, diplomacy, Israel
2. Ukraine/Russia — battlefield, peace talks, military moves
3. China — Taiwan, trade, domestic politics, regional tensions
4. NATO/Europe — military posture, alliance politics
5. Other major conflicts or crises

For each story: specific headline, key numbers (casualties/distances/dates/$), why it matters.
End with: Patterns & Trends (2–3 themes), Gaps (missing angles).
Be dense. No filler. Markdown headers.`,

  tech: `You are an elite technology and AI intelligence analyst. Today is {date}.

Analyze these recent news articles and produce a dense tech intelligence brief.

ARTICLES:
{articles}

Cover:
1. AI model releases — models, benchmarks, pricing, capabilities
2. Big tech moves — partnerships, acquisitions, launches
3. AI funding — raises $20M+, valuations
4. Cybersecurity — exploits (CVE numbers), breaches
5. Semiconductors — supply chain, geopolitics
6. Notable open source / dev tools

For each story: specific headline, technical facts (benchmark scores, prices, CVE IDs), why it matters.
End with: Patterns & Trends (2–3 themes), Gaps.
Dense, specific. Markdown headers.`,

  finance: `You are an elite financial intelligence analyst. Today is {date}.

Analyze these recent news articles and produce a comprehensive financial brief. CRITICAL: Energy markets and geopolitical events — Iran war, Strait of Hormuz, sanctions, tariffs — are a core part of this section. Explicitly connect geopolitical events to market impacts.

ARTICLES:
{articles}

Cover:
1. Equities — S&P 500, Dow, Nasdaq (prices, % change, key movers)
2. Energy markets — Brent crude, WTI, natural gas (prices + Iran/OPEC/Hormuz drivers)
3. Crypto — BTC, ETH, SOL (price, 24h change, flows)
4. Other commodities — gold, silver
5. Fed/central banks — rate expectations, Fed speak
6. Macro data — CPI, jobs, GDP, trade data
7. Geopolitical market impacts — tariffs, sanctions, war premiums, trade disruptions
8. Earnings — notable reports

Lead each section with the key number. Include analyst commentary. Trading implications for next 24–48h.
End with: Recession/stagflation signals, Patterns & Trends.
Precision first. Markdown headers.`,

  happy: `You are a researcher specializing in positive developments. Today is {date}.

Find the genuinely significant good news in these articles — real breakthroughs, not fluff.

ARTICLES:
{articles}

Cover:
1. Scientific/medical breakthroughs — treatments, trials, discoveries
2. Environmental wins — conservation, clean energy, species recovery
3. Space exploration — launches, discoveries, milestones
4. Humanitarian — meaningful policy wins, health campaigns

For each: headline, why it actually matters (scientific/human significance), key facts/numbers.
Quality filter: only genuine impact. Skip trivial feel-good pieces.
End with: Patterns & Trends.
Markdown headers.`,
}

const COMPRESS_PROMPT = `From the intelligence report below, extract exactly 5 bullet points covering the most important stories.

Format each bullet as:
• [emoji] [Headline] — [Key fact with number/date/price]

Rules: numbers beat vague language, include source context, no duplicates, most impactful stories only. Output ONLY the 5 bullets, nothing else.

REPORT:
{report}`

const SYNTHESIS_PROMPT = `You are the chief intelligence analyst producing a personal daily briefing. Today is {date} at {time}.

Synthesize these specialist analyst summaries into one polished Daily Intel Report for a busy founder/investor. Depth, precision, cross-domain connections. No padding.

=== POLITICS ===
{politics}

=== TECH & AI ===
{tech}

=== FINANCE & MARKETS ===
{finance}

=== BRIGHT SPOTS ===
{happy}

OUTPUT — follow this format exactly:

---
# 🌍 Daily Intel — {date_short}

## Executive Summary
(6–8 bullets — standalone readable, best story per domain + 1–2 cross-domain)
- 🔴 **Politics**: [headline] — [key fact with number]
- 🛢️ **Energy/Finance**: [headline] — [key fact]
- 🤖 **Tech/AI**: [headline] — [key fact]
- 📊 **Markets**: [headline] — [key fact]
- 🌱 **Bright Spot**: [headline] — [key fact]
[use: 🔴 war/crisis · 📉📈 markets · 🤖 AI/tech · 💰 finance · 🚀 space · 🌱 good news · 🛢️ energy · ⚠️ alert · country flags]

---

## 🔴 World Politics
[Key stories grouped by region — headline, facts with numbers, why-it-matters]

---

## 💻 Tech & AI
[AI releases → funding → big tech → cybersecurity]

---

## 📊 Finance & Markets

### Equities
### 🛢️ Energy & Oil
### Crypto
### Macro & Fed

---

## 🌱 Bright Spots
1. 🚀 [Space]
2. 🧬 [Science/medicine]
3. 🌿 [Environment]

---

## 🔑 Key Themes
(3–4 themes connecting dots ACROSS domains)
1. **[Theme name]** — [2–3 sentences connecting politics ↔ finance ↔ tech]

---
*Miss Penny Intel · {time} · {date_short} · Next edition tomorrow*

RULES: Numbers beat vague language. Executive Summary must work standalone. Key Themes must be cross-domain. Target 800–1,500 words.`

// ── Gemini helper ────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch (err) {
    console.error('[intel] Gemini error:', err)
    return `[Synthesis error: ${String(err)}]`
  }
}

// ── Article collection ────────────────────────────────────────────────────────

async function collectDomain(domain: string): Promise<RssArticle[]> {
  const feeds = INTEL_FEEDS[domain] ?? []
  const queries = GNEWS_QUERIES[domain] ?? []

  const [rssNested, gnewsNested] = await Promise.all([
    Promise.all(feeds.map(f => fetchRss(f.url, f.name, 10))),
    Promise.all(queries.map(q => fetchGoogleNewsSearch(q, 6))),
  ])

  const all = [...rssNested.flat(), ...gnewsNested.flat()]
  const seen = new Set<string>()
  return all.filter(a => {
    if (!a.url || seen.has(a.url)) return false
    seen.add(a.url)
    return true
  })
}

function formatArticles(articles: RssArticle[], cap = 40): string {
  if (!articles.length) return '(No articles collected for this domain)'
  return articles.slice(0, cap).map((a, i) =>
    `${i + 1}. [${a.source}] ${a.title}\n   URL: ${a.url}\n   ${a.description.slice(0, 200)}`
  ).join('\n\n')
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

export async function runDailyIntelPipeline(): Promise<string> {
  const now = new Date()
  const etOpts = { timeZone: 'America/New_York' }
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...etOpts,
  })
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short', ...etOpts,
  })
  const dateShort = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', ...etOpts,
  })

  const domains = ['politics', 'tech', 'finance', 'happy'] as const

  // Phase 1: Collect articles (parallel)
  console.log('[intel] Phase 1: collecting articles...')
  const domainArticles = Object.fromEntries(
    await Promise.all(domains.map(async d => [d, await collectDomain(d)]))
  )
  for (const d of domains) {
    console.log(`[intel]   ${d}: ${domainArticles[d].length} articles`)
  }

  // Phase 2: Domain synthesis (parallel — Gemini handles concurrent calls fine)
  console.log('[intel] Phase 2: domain synthesis...')
  const domainReports = Object.fromEntries(
    await Promise.all(domains.map(async d => {
      const prompt = DOMAIN_PROMPTS[d]
        .replace('{date}', dateStr)
        .replace('{articles}', formatArticles(domainArticles[d]))
      const report = await callGemini(prompt)
      console.log(`[intel]   ${d}: ${report.length} chars`)
      return [d, report]
    }))
  )

  // Phase 2.5: Compress each domain report to 5 key bullets (parallel)
  console.log('[intel] Phase 2.5: compressing domain reports...')
  const compressed = Object.fromEntries(
    await Promise.all(domains.map(async d => {
      const report = domainReports[d] as string
      if (report.length < 200 || report.startsWith('[Synthesis error')) {
        return [d, report]
      }
      const prompt = COMPRESS_PROMPT.replace('{report}', report.slice(0, 6000))
      const bullets = await callGemini(prompt)
      console.log(`[intel]   ${d} compressed: ${bullets.length} chars`)
      return [d, bullets]
    }))
  )

  // Phase 3: Final synthesis
  console.log('[intel] Phase 3: final synthesis...')
  const finalPrompt = SYNTHESIS_PROMPT
    .replace(/{date}/g, dateStr)
    .replace('{date_short}', dateShort)
    .replace('{time}', timeStr)
    .replace('{politics}', (compressed['politics'] as string) ?? '(unavailable)')
    .replace('{tech}', (compressed['tech'] as string) ?? '(unavailable)')
    .replace('{finance}', (compressed['finance'] as string) ?? '(unavailable)')
    .replace('{happy}', (compressed['happy'] as string) ?? '(unavailable)')

  const finalReport = await callGemini(finalPrompt)
  console.log(`[intel] Final report: ${finalReport.length} chars`)

  return finalReport
}
