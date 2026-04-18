import { useState, useEffect }              from 'react'
import { LIVE_STATUSES }                    from '../../constants/matchStatus'
import { today }                            from '../../utils/date'
import DateNavigator                        from '../ui/DateNavigator'
import MatchGroup, { groupByLeague }        from './MatchGroup'
import { StandingsSidebar, LeaguesSidebar } from './MatchesSidebars'

function Skeleton({ className }) {
  return <div className={`bg-gray-800 animate-pulse rounded ${className}`} />
}

function MatchListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <Skeleton className="h-9 rounded-t-lg rounded-b-none" />
          <Skeleton className="h-14 rounded-t-none rounded-b-lg mt-0.5" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ isToday, onGoToToday }) {
  return (
    <div className="text-center py-16 text-gray-500">
      <p className="text-4xl mb-4">⚽</p>
      <p className="text-lg">No matches on this day</p>
      {!isToday && (
        <button onClick={onGoToToday} className="mt-3 text-sm text-blue-400 hover:text-blue-300">
          Go to today
        </button>
      )}
    </div>
  )
}

export default function MatchesPage({ initialDate }) {
  const [date,     setDate]     = useState(initialDate || today())
  const [matches,  setMatches]  = useState([])
  const [included, setIncluded] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const url = new URL(window.location)
    url.searchParams.set('date', date)
    window.history.replaceState({}, '', url)

    setLoading(true)
    fetch(`/api/v1/matches?date=${date}&per_page=100`)
      .then(r => r.json())
      .then(d => {
        setMatches(d.data ?? [])
        setIncluded(d.included ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [date])

  const isToday      = date === today()
  const liveMatches  = matches.filter(m => LIVE_STATUSES.includes(m.attributes.status))
  const otherMatches = matches.filter(m => !LIVE_STATUSES.includes(m.attributes.status))
  const liveGroups   = groupByLeague(liveMatches,  included)
  const otherGroups  = groupByLeague(otherMatches, included)

  return (
    <>
      <div className="fixed top-14 left-0 right-0 z-20 bg-gray-950 border-b border-gray-800/60 py-3">
        <div className="max-w-7xl mx-auto px-4 xl:pl-[17.25rem] lg:pr-[13.25rem]">
          <DateNavigator date={date} onChange={setDate} />
        </div>
      </div>

      <div className="h-[60px]" />

      <div className="flex gap-5 items-start mt-4">
        <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-32">
          <StandingsSidebar />
        </aside>

        <div className="flex-1 min-w-0">
          {loading && <MatchListSkeleton />}

          {!loading && matches.length === 0 && (
            <EmptyState isToday={isToday} onGoToToday={() => setDate(today())} />
          )}

          {!loading && liveMatches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Live</span>
              </div>
              {liveGroups.map(g => (
                <MatchGroup key={g.leagueHref} {...g} included={included} isLive />
              ))}
            </div>
          )}

          {!loading && otherMatches.length > 0 && (
            <div>
              {liveMatches.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Other matches</span>
                </div>
              )}
              {otherGroups.map(g => (
                <MatchGroup key={g.leagueHref} {...g} included={included} />
              ))}
            </div>
          )}
        </div>

        <aside className="hidden lg:block w-48 flex-shrink-0 sticky top-32">
          <LeaguesSidebar />
        </aside>
      </div>
    </>
  )
}
