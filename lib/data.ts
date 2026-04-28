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

// ─────────────────────────────────────────────────────────────
// X TOP STORIES — Trending discourse decomposed
// ─────────────────────────────────────────────────────────────

export interface XTopStory {
  id: string
  rank: number
  trendingTopic: string
  slug: string
  viralClaim: string
  leftFraming: string
  rightFraming: string
  mediaLag: string
  earlyFacts: string
  blindspot: string
  engagementEstimate: string
  lastUpdated: string
  isBreaking?: boolean
}

export const xTopStories: XTopStory[] = [
  {
    id: 'x1',
    rank: 1,
    trendingTopic: 'JD Vance stormed out of Iran briefing',
    slug: 'vance-iran-briefing',
    viralClaim: 'Video shows JD Vance leaving an Iran briefing in anger after clashing with generals.',
    leftFraming: 'Proof the Trump administration is in disarray; even the VP cannot stomach the war plan.',
    rightFraming: 'Vance stood firm against reckless escalation — exactly why Americans elected this ticket.',
    mediaLag: 'Fox has not covered the clip. Politico published a brief but did not embed the video.',
    earlyFacts: 'The video is 12 seconds, decontextualized. White House says Vance left for a scheduled meeting.',
    blindspot: 'No outlet has verified the timestamp or the meeting schedule Vance was supposedly heading to.',
    engagementEstimate: '~2.3M impressions on X',
    lastUpdated: '2026-04-28T13:00:00Z',
    isBreaking: true,
  },
  {
    id: 'x2',
    rank: 2,
    trendingTopic: 'Oil hits $112 after Hormuz rumours',
    slug: 'oil-hormuz-rumours',
    viralClaim: 'A tanker was "disabled" in the Strait of Hormuz, triggering the oil spike.',
    leftFraming: 'Trump\'s brinkmanship is already hitting working families at the petrol pump.',
    rightFraming: 'This is why energy independence matters — Biden-era weakness enabled Iranian aggression.',
    mediaLag: 'Reuters confirmed no tanker incident. Bloomberg reported the rumour without the retraction.',
    earlyFacts: 'Reuters: no incident reported. Price spike driven by futures speculation, not supply disruption.',
    blindspot: 'The original rumour account has 400 followers and no verification. It was quoted by major outlets.',
    engagementEstimate: '~1.8M impressions on X',
    lastUpdated: '2026-04-28T12:45:00Z',
    isBreaking: false,
  },
  {
    id: 'x3',
    rank: 3,
    trendingTopic: 'Bernie Sanders clip goes viral in Israel',
    slug: 'bernie-israel-viral',
    viralClaim: 'Bernie Sanders\' floor speech on stopping Israel arms aid is trending #1 in Tel Aviv.',
    leftFraming: 'Even Israelis recognise Sanders is speaking truth to power — American hawks are isolated.',
    rightFraming: 'Tel Aviv leftists do not speak for Israel. Hamas supporters signal-boosting an anti-Israel politician.',
    mediaLag: 'Haaretz reported the clip but noted it was shared by a fringe account, not mainstream Israeli discourse.',
    earlyFacts: 'The clip was shared by a single account with 12K followers. Not verified as trending in Israel.',
    blindspot: 'No outlet checked X\'s trending algorithm for Tel Aviv — the claim is unverified but widely repeated.',
    engagementEstimate: '~940K impressions on X',
    lastUpdated: '2026-04-28T12:30:00Z',
    isBreaking: false,
  },
  {
    id: 'x4',
    rank: 4,
    trendingTopic: 'Iranian "martyrdom" London embassy story',
    slug: 'iran-embassy-martyrs',
    viralClaim: 'The Iranian Embassy in London is openly recruiting suicide bombers / martyrs.',
    leftFraming: 'Tabloid hysteria. Diplomatic cultural events are being misrepresented as terror recruitment.',
    rightFraming: 'This is not hyperbole — the Iranian regime has a documented history of using embassies for operations.',
    mediaLag: 'Evening Standard broke the story. BBC has not covered it. Guardian published a critical fact-check.',
    earlyFacts: 'The event was a cultural commemoration. The word "martyr" was used in a religious context.',
    blindspot: 'No outlet has published the original invitation or programme to let readers judge for themselves.',
    engagementEstimate: '~720K impressions on X',
    lastUpdated: '2026-04-28T11:15:00Z',
    isBreaking: false,
  },
  {
    id: 'x5',
    rank: 5,
    trendingTopic: 'European leaders "bypassing" US on Iran',
    slug: 'europe-bypass-us',
    viralClaim: 'Macron and Starmer are negotiating a separate Iran deal without Trump\'s involvement.',
    leftFraming: 'America\'s allies are losing faith in Trump\'s chaotic diplomacy and forging their own path.',
    rightFraming: 'European elites have always been weak on Iran — they\'re undermining US-led pressure for their own gain.',
    mediaLag: 'BBC reported the meeting but did not characterise it as "bypassing." No US outlet has used that framing.',
    earlyFacts: 'Macron and Starmer held a bilateral. Joint statement called for "coordinated diplomacy" with the US.',
    blindspot: 'The word "bypassing" appears only on X and in one substack post. It is not in any official communication.',
    engagementEstimate: '~560K impressions on X',
    lastUpdated: '2026-04-28T10:50:00Z',
    isBreaking: false,
  },
]
