import { XTopStory } from '@/lib/data'
import { Flame, Zap, Clock, AlertTriangle, Eye, Radio } from 'lucide-react'
import { TweetEmbed } from '@/components/TweetEmbed'

export function XTopStoryCard({ story }: { story: XTopStory }) {
  const sourceArticles = story.sourceArticles ?? []

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 transition hover:shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-900 text-white text-sm font-bold">
            {story.rank}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 leading-tight">
              {story.trendingTopic}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {story.engagementEstimate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(story.lastUpdated).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {story.isBreaking && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <Radio className="w-3 h-3" />
                  Breaking
                </span>
              )}
            </div>
          </div>
        </div>
        <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
      </div>

      <div className="mb-4 p-3 bg-neutral-50 rounded-lg border-l-4 border-orange-400">
        <p className="text-sm text-neutral-500 mb-1 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Viral claim
        </p>
        <p className="text-neutral-800 font-medium">{story.viralClaim}</p>
        {story.featuredTweetUrl && (
          <TweetEmbed tweetUrl={story.featuredTweetUrl} />
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Left media framing</span>
          <p className="text-sm text-neutral-600 mt-1">{story.leftFraming || 'No left-side framing generated yet.'}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Right media framing</span>
          <p className="text-sm text-neutral-600 mt-1">{story.rightFraming || 'No right-side framing generated yet.'}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 bg-emerald-50 rounded-lg">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Early facts</span>
          <p className="text-sm text-neutral-700 mt-1">{story.earlyFacts}</p>
        </div>

        <div className="p-3 bg-purple-50 rounded-lg">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Media lag</span>
          <p className="text-sm text-neutral-700 mt-1">{story.mediaLag}</p>
        </div>

        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Blindspot</span>
            <p className="text-sm text-neutral-700 mt-1">{story.blindspot}</p>
          </div>
        </div>

        {sourceArticles.length > 0 && (
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Source articles</span>
            <ul className="mt-2 space-y-2">
              {sourceArticles.map((article) => (
                <li key={article.url} className="text-sm">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-neutral-900 hover:text-neutral-600 underline underline-offset-2"
                  >
                    {article.title}
                  </a>
                  <span className="ml-2 text-xs text-neutral-500">{article.source}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
