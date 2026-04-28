import { NextResponse } from 'next/server'
import { dailyPulse, iranWarTopic, xTopStories } from '@/lib/data'

export async function GET() {
  return NextResponse.json({
    dailyPulse,
    xTopStories,
    warRooms: [iranWarTopic],
    generatedAt: new Date().toISOString(),
  })
}
