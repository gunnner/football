import { useState, useEffect } from 'react'
import { getCountryCode } from '../../utils/country'
import styles from './MatchHighlights.module.css'

function EmbedCard({ highlight }) {
  const [showEmbed, setShowEmbed] = useState(false)

  if (showEmbed && highlight.embed_url) {
    return (
      <div className={styles.embedCard}>
        <div className={styles.iframeWrap}>
          <iframe
            src={highlight.embed_url}
            className={styles.iframe}
            allowFullScreen
            allow="autoplay; encrypted-media"
          />
        </div>
        {highlight.title && (
          <div className={styles.cardInfo}>
            <p className={styles.cardTitle}>{highlight.title}</p>
            {highlight.channel && <p className={styles.cardChannel}>{highlight.channel}</p>}
          </div>
        )}
      </div>
    )
  }

  const href = highlight.url || highlight.embed_url

  return (
    <div
      className={styles.embedCard}
      onClick={() => highlight.embed_url ? setShowEmbed(true) : window.open(href, '_blank')}
    >
      <div className={styles.thumbnail}>
        {highlight.img_url
          ? <img src={highlight.img_url} alt={highlight.title} className={styles.thumbnailImg} onError={e => { e.target.style.display='none' }} />
          : <div className={styles.thumbnailEmpty}><span>🎬</span></div>
        }
        <div className={styles.playOverlay}>
          <div className={styles.playBtn}>
            <svg className={styles.playIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {highlight.highlight_type && (
          <span className={styles.typeBadge}>{highlight.highlight_type}</span>
        )}
      </div>
      <div className={styles.cardInfo}>
        <p className={styles.cardTitle}>{highlight.title || 'Highlights'}</p>
        {highlight.channel && <p className={styles.cardChannel}>{highlight.channel}</p>}
      </div>
    </div>
  )
}

export default function MatchHighlights({ matchId, isLive, highlights: highlightsProp }) {
  const [highlights, setHighlights] = useState(highlightsProp ?? null)

  useEffect(() => {
    if (highlightsProp !== undefined) { setHighlights(highlightsProp); return }
    const country = getCountryCode()
    const url = country
      ? `/api/v1/matches/${matchId}/highlights?country_code=${country}`
      : `/api/v1/matches/${matchId}/highlights`
    fetch(url)
      .then(r => r.json())
      .then(res => setHighlights(res.data ?? []))
      .catch(() => setHighlights([]))
  }, [matchId, highlightsProp])

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
      <div className={styles.grid}>
        {[...Array(2)].map((_, i) => (
          <div key={i} style={{ background: '#1f2937', animation: 'pulse 1.5s infinite', borderRadius: '0.75rem', height: '13rem' }} />
        ))}
      </div>
    )
  }

  if (highlights.length === 0) {
    return (
      <div className={styles.noData}>
        {isLive
          ? <p>Highlights will appear after the match ends</p>
          : <p>No highlights available yet</p>
        }
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {highlights.map(h => (
        <EmbedCard key={h.id} highlight={h.attributes} />
      ))}
    </div>
  )
}
