import { NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { runDailyIntelPipeline } from '@/lib/intel'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 hours — refreshes once per day

const getCachedDailyIntelReport = unstable_cache(
  async () => runDailyIntelPipeline(),
  ['daily-intel-report'],
  { revalidate: 86400 }
)

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { report: null, error: 'Missing GEMINI_API_KEY' },
        { status: 503 }
      )
    }

    const report = await getCachedDailyIntelReport()

    if (!report || report.length < 200) {
      return NextResponse.json(
        { report: null, error: 'Pipeline returned an empty report' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      report,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[daily-intel]', err)
    return NextResponse.json(
      { report: null, error: String(err) },
      { status: 500 }
    )
  }
}
