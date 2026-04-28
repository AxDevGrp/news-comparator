# News Comparator

Meta-journalism platform. We do not report the news. We report how the news is reported.

## Quick Start

```bash
cd ~/Projects/news-comparator
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Structure

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages |
| `app/api/feeds/` | JSON API for feed data |
| `app/topics/[topic]/` | Topic detail pages |
| `components/` | React components |
| `lib/data.ts` | Mock data layer (replace with real feed pipeline) |

## Deployment

Built for Railway:

```bash
railway login
railway init
railway up
```

## Environment Variables

None required for MVP. Future:
- `POLYMARKET_API_URL`
- `OPENAI_API_KEY` (for AI analysis pipeline)
- `DATABASE_URL` (for PostgreSQL)

## Next Steps

1. Replace `lib/data.ts` with live RSS ingestion via `blogwatcher-cli`
2. Add AI analysis pipeline (OpenAI/Kimi API)
3. Add CMS (Sanity/Strapi) for editorial workflow
4. Connect X bot for auto-posting
5. Apply for Google AdSense
