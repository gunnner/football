import { useState, useEffect } from 'react'
import { getCountryCode } from '../../utils/country'

function Skeleton({ className }) {
  return <div className={`bg-gray-800 animate-pulse rounded ${className}`} />
}

function EmbedCard({ highlight }) {
  const [showEmbed, setShowEmbed] = useState(false)

  if (showEmbed && highlight.embed_url) {
    return (
      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={highlight.embed_url}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
        {highlight.title && (
          <div className="px-4 py-3">
            <p className="text-sm text-gray-200">{highlight.title}</p>
            {highlight.channel && <p className="text-xs text-gray-500 mt-0.5">{highlight.channel}</p>}
          </div>
        )}
      </div>
    )
  }

  const href = highlight.url || highlight.embed_url

  return (
    <div
      className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer group"
      onClick={() => highlight.embed_url ? setShowEmbed(true) : window.open(href, '_blank')}
    >
      <div className="relative">
        {highlight.img_url
          ? <img src={highlight.img_url} alt={highlight.title} className="w-full aspect-video object-cover" onError={e => { e.target.style.display='none' }} />
          : <div className="w-full aspect-video bg-gray-800 flex items-center justify-center"><span className="text-4xl">🎬</span></div>
        }
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {highlight.highlight_type && (
          <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
            {highlight.highlight_type}
          </span>
        )}
      </div>
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-gray-100 line-clamp-2">{highlight.title || 'Highlights'}</p>
        {highlight.channel && <p className="text-xs text-gray-500 mt-0.5">{highlight.channel}</p>}
      </div>
    </div>
  )
}

export default function MatchHighlights({ matchId, isLive, highlights: highlightsProp }) {
  const [highlights, setHighlights] = useState(highlightsProp ?? null)

  useEffect(() => {
    if (highlightsProp !== undefined) { setHighlights(highlightsProp); return }
    // Fallback: fetch independently if not provided by parent
    const country = getCountryCode()
    const url = country
      ? `/api/v1/matches/${matchId}/highlights?country_code=${country}`
      : `/api/v1/matches/${matchId}/highlights`
    fetch(url)
      .then(r => r.json())
      .then(res => setHighlights(res.data ?? []))
      .catch(() => setHighlights([]))
  }, [matchId, highlightsProp])

  // Expose delayed refresh for parent to call after match_end (highlights sync takes ~2 min)
  MatchHighlights.scheduleRefresh = () => {
    setTimeout(() => {
      const country = getCountryCode()
      const url = country
        ? `/api/v1/matches/${matchId}/highlights?country_code=${country}`
        : `/api/v1/matches/${matchId}/highlights`
      fetch(url)
        .then(r => r.json())
        .then(res => setHighlights(res.data ?? []))
        .catch(() => {})
    }, 2 * 60 * 1000)
  }

  if (highlights === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
      </div>
    )
  }

  if (highlights.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4 text-center py-8">
        {isLive
          ? <p className="text-gray-500">Highlights will appear after the match ends</p>
          : <p className="text-gray-500">No highlights available yet</p>
        }
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {highlights.map(h => (
        <EmbedCard key={h.id} highlight={h.attributes} />
      ))}
    </div>
  )
}
