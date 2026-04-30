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
  { name: 'New York Times', bias: 'centre-left',  url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml' },
  { name: 'The Guardian',   bias: 'left',          url: 'https://www.theguardian.com/world/rss' },
  { name: 'BBC News',       bias: 'centre',        url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'NPR',            bias: 'centre-left',   url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'Al Jazeera',     bias: 'international', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'AP News',        bias: 'centre',        url: 'https://feeds.apnews.com/rss/apf-topnews' },
  { name: 'Fox News',       bias: 'right',         url: 'https://moxie.foxnews.com/google-publisher/latest.xml' },
  { name: 'Breitbart',      bias: 'right',         url: 'https://feeds.feedburner.com/breitbart' },
  { name: 'Washington Times', bias: 'right',       url: 'https://www.washingtontimes.com/rss/headlines/news/' },
  { name: 'The Hill',       bias: 'centre',        url: 'https://thehill.com/rss/syndicator/19110' },
]
