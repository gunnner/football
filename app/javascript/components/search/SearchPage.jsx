import { useState, useEffect, useRef } from 'react'

const SEARCH_SVG = (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

function ResultItem({ logo, name, url, rounded }) {
  return (
    <a href={url} className="block">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800
                      last:border-0 hover:bg-gray-800 transition-colors">
        {logo
          ? <img src={logo} alt="" className={`w-8 h-8 object-contain ${rounded ? 'rounded-full' : ''}`} />
          : <div className={`w-8 h-8 bg-gray-700 flex-shrink-0 ${rounded ? 'rounded-full flex items-center justify-center' : 'rounded'}`}>
              {rounded && <span className="text-xs text-gray-400">👤</span>}
            </div>
        }
        <p className="text-sm font-medium text-gray-100">{name}</p>
      </div>
    </a>
  )
}

function ResultSection({ title, items, rounded }) {
  if (!items?.length) return null
  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">{title}</h2>
      <div className="bg-gray-900 rounded-xl overflow-hidden">
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
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {SEARCH_SVG}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search teams, players, leagues..."
            className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl
                       pl-12 pr-4 py-4 text-lg focus:outline-none focus:ring-2
                       focus:ring-blue-500 border border-gray-700"
          />
          {loading && (
            <div className="absolute inset-y-0 right-4 flex items-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {!query && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-4xl mb-4">🔍</p>
          <p>Search for teams, players or leagues</p>
        </div>
      )}

      {query && query.length < 2 && (
        <p className="text-center text-gray-500 py-8">Type at least 2 characters</p>
      )}

      {empty && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">😕</p>
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
