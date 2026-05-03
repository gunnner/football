import { useState, useEffect, useRef } from 'react'
import styles from './SearchPage.module.css'

const SEARCH_SVG = (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

function ResultItem({ logo, name, url, rounded }) {
  return (
    <a href={url} className={styles.resultLink}>
      <div className={styles.resultItem}>
        {logo
          ? (rounded
              ? <div className={styles.resultAvatar}><img src={logo} alt="" className={styles.resultLogo} style={{ height: '200%', objectFit: 'cover', objectPosition: '50% 0%' }} /></div>
              : <img src={logo} alt="" className={styles.resultLogo} />
            )
          : <div className={rounded ? styles.resultAvatar : styles.resultAvatarSquare}>
              {rounded && <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>👤</span>}
            </div>
        }
        <p className={styles.resultName}>{name}</p>
      </div>
    </a>
  )
}

function ResultSection({ title, items, rounded }) {
  if (!items?.length) return null
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.sectionList}>
        {items.map(item => (
          <ResultItem key={item.id} logo={item.logo} name={item.name} url={item.url} rounded={rounded} />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage({ initialQuery = '' }) {
  const [query,   setQuery]   = useState(initialQuery)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus()
  }, [])

  useEffect(() => {
    const url = new URL(window.location)
    if (query) url.searchParams.set('q', query)
    else url.searchParams.delete('q')
    window.history.replaceState({}, '', url)

    clearTimeout(timerRef.current)

    if (!query || query.length < 2) {
      setResults(null)
      setLoading(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(() => {
      fetch(`/search.json?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => { setResults(data); setLoading(false) })
        .catch(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timerRef.current)
  }, [query])

  const empty = results && !results.teams?.length && !results.players?.length && !results.leagues?.length

  return (
    <>
      <div className={styles.searchWrap}>
        <div className={styles.inputWrap}>
          <div className={styles.searchIcon}>
            {SEARCH_SVG}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search teams, players, leagues..."
            className={styles.input}
          />
          {loading && (
            <div className={styles.spinner}>
              <div className={styles.spinnerDot} />
            </div>
          )}
        </div>
      </div>

      {!query && (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>🔍</p>
          <p>Search for teams, players or leagues</p>
        </div>
      )}

      {query && query.length < 2 && (
        <p className={styles.hint}>Type at least 2 characters</p>
      )}

      {empty && (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>😕</p>
          <p>No results for "{query}"</p>
        </div>
      )}

      {results && !empty && (
        <>
          <ResultSection title="Leagues" items={results.leagues} rounded={false} />
          <ResultSection title="Teams"   items={results.teams}   rounded={false} />
          <ResultSection title="Players" items={results.players} rounded={true}  />
        </>
      )}
    </>
  )
}
