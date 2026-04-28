import { NextResponse } from 'next/server'
import { dailyPulse, iranWarTopic } from '@/lib/data'

export async function GET() {
  return NextResponse.json({
    dailyPulse,
    warRooms: [iranWarTopic],
    generatedAt: new Date().toISOString(),
  })
}
