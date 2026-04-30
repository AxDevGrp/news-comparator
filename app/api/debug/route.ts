import { NextResponse } from 'next/server'
import { fetchRss } from '@/lib/rss'
import { ALL_FEEDS } from '@/lib/bias-map'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {}

  // 1. Check env var
  const keyPresent = !!process.env.GEMINI_API_KEY
  const keyPrefix = process.env.GEMINI_API_KEY?.slice(0, 8) ?? 'MISSING'
  results['gemini_key_present'] = keyPresent
  results['gemini_key_prefix'] = keyPrefix
  results['base_url'] = process.env.NEXT_PUBLIC_BASE_URL ?? 'NOT SET'

  // 2. Test one RSS feed
  try {
    const articles = await fetchRss(ALL_FEEDS[2].url, ALL_FEEDS[2].name, 3)
    results['rss_test'] = { feed: ALL_FEEDS[2].name, count: articles.length, sample: articles[0]?.title ?? 'none' }
  } catch (e) {
    results['rss_test'] = { error: String(e) }
  }

  // 3. Test Gemini directly with a tiny prompt
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent('Say "ok" and nothing else.')
    const text = result.response.text()
    results['gemini_test'] = { success: true, response: text.slice(0, 100) }
  } catch (e) {
    results['gemini_test'] = { success: false, error: String(e) }
  }

  return NextResponse.json(results)
}
