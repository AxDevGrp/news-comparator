export type BiasTag = 'left' | 'centre-left' | 'centre' | 'centre-right' | 'right' | 'international' | 'alt'

export interface Source {
  name: string
  bias: BiasTag
  url: string
}

export interface Headline {
  id: string
  source: Source
  title: string
  url: string
  publishedAt: string
  excerpt?: string
}

export interface ConvergencePoint {
  id: string
  text: string
  confidence: 'high' | 'medium' | 'low'
  sources: string[]
}

export interface Blindspot {
  id: string
  text: string
  missingFrom: string[]
}

export interface Narrative {
  id: string
  bias: BiasTag
  summary: string
  keyHeadlines: string[]
  framing: string
}

export interface WarRoomTopic {
  slug: string
  title: string
  subtitle: string
  lastUpdated: string
  status: 'active' | 'simmering' | 'resolved'
  convergence: ConvergencePoint[]
  narratives: Narrative[]
  blindspots: Blindspot[]
  headlines: Headline[]
  marketSignal?: {
    question: string
    yesPrice: number
    volume: string
    url: string
  }
}

export interface DailyPulseItem {
  id: string
  rank: number
  topic: string
  slug: string
  convergence: string
  leftTake: string
  rightTake: string
  internationalTake: string
  blindspot: string
  isNew?: boolean
}

// Mock data for Iran War MVP
export const iranWarTopic: WarRoomTopic = {
  slug: 'iran-war',
  title: 'US-Israel-Iran War',
  subtitle: 'Ongoing conflict and diplomatic deadlock',
  lastUpdated: '2026-04-28T12:00:00Z',
  status: 'active',
  convergence: [
    {
      id: 'c1',
      text: 'Direct US-Iran talks are deadlocked with no ceasefire in place.',
      confidence: 'high',
      sources: ['NYT', 'Fox News', 'BBC', 'Guardian', 'WSJ'],
    },
    {
      id: 'c2',
      text: 'Oil prices have spiked due to Strait of Hormuz tensions.',
      confidence: 'high',
      sources: ['FT', 'Bloomberg', 'CNN', 'BBC'],
    },
    {
      id: 'c3',
      text: 'Iran proposed ending the war without a nuclear deal; US response was cool.',
      confidence: 'medium',
      sources: ['AP', 'Guardian', 'Al Jazeera'],
    },
  ],
  narratives: [
    {
      id: 'n1',
      bias: 'left',
      summary: 'Trump is rejecting an off-ramp. The US appears cold to Iranian proposals, preferring escalation over diplomacy. JD Vance is in a thorny predicament.',
      keyHeadlines: [
        'U.S. appears cold to Iranian proposal to end the war without a nuclear deal',
        'JD Vance\'s key role in Iran talks presents him with a thorny predicament',
      ],
      framing: 'US as obstacle to peace; internal Republican friction.',
    },
    {
      id: 'n2',
      bias: 'right',
      summary: 'Iran\'s regime is fanatical and economically battered but believes Trump will blink first. The Embassy in London is recruiting martyrs.',
      keyHeadlines: [
        'Iran\'s economy has been battered. Its leaders still think Trump will blink first',
        'Iranian Embassy in London recruiting martyrs to \'sacrifice their lives\' for the regime',
      ],
      framing: 'Iran as irrational actor; regime extremism; economic desperation.',
    },
    {
      id: 'n3',
      bias: 'international',
      summary: 'European markets are reacting to oil volatility. The UK\'s small shipping agency has become a 911 for ships in Hormuz. BP profits are astronomical.',
      keyHeadlines: [
        'European shares gain after a retreat in Asia as Iran war worries push oil prices higher',
        'The Small U.K. Agency That\'s a 911 for Ships in the Strait of Hormuz',
      ],
      framing: 'Economic and humanitarian impacts; practical crisis management.',
    },
    {
      id: 'n4',
      bias: 'alt',
      summary: 'America is stuck in an unwinnable war repeating historical mistakes. Bernie Sanders is leading Democratic resistance to arming Israel.',
      keyHeadlines: [
        'Why America is stuck in a war with Iran',
        'How Bernie Sanders convinced Democrats against arming Israel',
      ],
      framing: 'Anti-interventionist; domestic political resistance; historical analogy.',
    },
  ],
  blindspots: [
    {
      id: 'b1',
      text: 'Civilian casualty figures from recent strikes are not prominently reported across conservative outlets.',
      missingFrom: ['Fox News', 'NY Post', 'WSJ Opinion'],
    },
    {
      id: 'b2',
      text: 'The specific terms of Iran\'s proposal to end the war without a nuclear deal are not detailed in most coverage.',
      missingFrom: ['CNN', 'BBC', 'LATimes'],
    },
    {
      id: 'b3',
      text: 'Oil supply disruption numbers (actual barrels affected) are asserted but rarely sourced.',
      missingFrom: ['Guardian', 'Fox News', 'Politico'],
    },
  ],
  headlines: [
    {
      id: 'h1',
      source: { name: 'New York Times', bias: 'centre-left', url: '#' },
      title: 'Oil Prices Jump Again as U.S.-Iran Talks Appear Deadlocked',
      url: '#',
      publishedAt: '2026-04-28T10:00:00Z',
      excerpt: 'Global oil markets reacted sharply Tuesday as diplomatic efforts...',
    },
    {
      id: 'h2',
      source: { name: 'Fox News', bias: 'right', url: '#' },
      title: 'Iranian leaders believe Trump will blink first as economy crumbles',
      url: '#',
      publishedAt: '2026-04-28T09:30:00Z',
      excerpt: 'Despite crushing sanctions and military pressure...',
    },
    {
      id: 'h3',
      source: { name: 'The Guardian', bias: 'left', url: '#' },
      title: 'JD Vance\'s key role in Iran talks presents him with a thorny predicament',
      url: '#',
      publishedAt: '2026-04-28T08:15:00Z',
      excerpt: 'The Vice President finds himself navigating...',
    },
    {
      id: 'h4',
      source: { name: 'BBC News', bias: 'centre', url: '#' },
      title: 'European shares gain after Asia retreat on Iran war worries',
      url: '#',
      publishedAt: '2026-04-28T07:45:00Z',
      excerpt: 'Markets in London and Frankfurt showed resilience...',
    },
    {
      id: 'h5',
      source: { name: 'Al Jazeera', bias: 'international', url: '#' },
      title: 'US appears cold to Iranian proposal to end war without nuclear deal',
      url: '#',
      publishedAt: '2026-04-28T06:00:00Z',
      excerpt: 'Tehran\'s offer to de-escalate without addressing...',
    },
    {
      id: 'h6',
      source: { name: 'The Hill', bias: 'centre', url: '#' },
      title: 'Bernie Sanders leads Democratic pushback on Israel arms package',
      url: '#',
      publishedAt: '2026-04-28T05:30:00Z',
      excerpt: 'Progressive senators are mounting a challenge...',
    },
  ],
  marketSignal: {
    question: 'US-Iran permanent peace deal by May 31, 2026?',
    yesPrice: 27.5,
    volume: '$59.2M',
    url: 'https://polymarket.com',
  },
}

// Mock Daily Pulse
export const dailyPulse: DailyPulseItem[] = [
  {
    id: 'dp1',
    rank: 1,
    topic: 'US-Israel-Iran War',
    slug: 'iran-war',
    convergence: 'Talks are deadlocked; no ceasefire. Oil prices spiking.',
    leftTake: 'US is cold-shouldering an Iranian off-ramp; Trump escalating.',
    rightTake: 'Iran is fanatical and desperate; martyrdom recruitment in London.',
    internationalTake: 'Economic fallout spreading; UK shipping agency on Hormuz alert.',
    blindspot: 'Actual oil supply disruption numbers remain unsourced across the board.',
    isNew: false,
  },
  {
    id: 'dp2',
    rank: 2,
    topic: 'AI Safety Regulation',
    slug: 'ai-regulation',
    convergence: 'EU AI Act enforcement begins; US Congress gridlocked on federal bill.',
    leftTake: 'Self-regulation has failed; Big Tech cannot be trusted.',
    rightTake: 'Regulation will stifle American innovation and cede ground to China.',
    internationalTake: 'EU is setting the global standard; other regions following.',
    blindspot: 'Small AI startups\' compliance burden is largely unreported.',
    isNew: true,
  },
  {
    id: 'dp3',
    rank: 3,
    topic: '2026 US Midterms',
    slug: 'midterms-2026',
    convergence: 'Primary season underway; immigration and economy top voter concerns.',
    leftTake: 'Democratic turnout is surging in response to Trump policies.',
    rightTake: 'Republicans poised to expand Senate majority; House in play.',
    internationalTake: 'Foreign observers note heightened polarisation and misinformation risks.',
    blindspot: 'Down-ballot races (state legislatures) receiving minimal national coverage.',
    isNew: false,
  },
  {
    id: 'dp4',
    rank: 4,
    topic: 'Ukraine-Russia Conflict',
    slug: 'ukraine-russia',
    convergence: 'Fighting continues in Donbas; diplomatic channels remain open but stalled.',
    leftTake: 'Western support must not waver; Putin is testing NATO resolve.',
    rightTake: 'US has spent enough; European allies must step up funding.',
    internationalTake: 'Global South frustration with Western focus on Ukraine over other crises.',
    blindspot: 'Casualty figures on both sides are significantly underreported.',
    isNew: false,
  },
  {
    id: 'dp5',
    rank: 5,
    topic: 'Trump Administration',
    slug: 'trump-admin',
    convergence: 'Second-term policy agenda advancing; legal challenges ongoing.',
    leftTake: 'Democratic institutions under unprecedented strain.',
    rightTake: 'Election mandate being fulfilled; media hysteria overblown.',
    internationalTake: 'Allies recalibrating relationships; adversaries probing for weakness.',
    blindspot: 'Day-to-day governance and non-controversial policy wins receive little coverage.',
    isNew: false,
  },
]

export function getTopicBySlug(slug: string): WarRoomTopic | undefined {
  if (slug === 'iran-war') return iranWarTopic
  return undefined
}
