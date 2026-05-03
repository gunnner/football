import { useState, useEffect }              from 'react'
import { LIVE_STATUSES }                    from '../../constants/matchStatus'
import { today }                            from '../../utils/date'
import DateNavigator                        from '../ui/DateNavigator'
import MatchGroup, { groupByLeague }        from './MatchGroup'
import { StandingsSidebar, LeaguesSidebar } from './MatchesSidebars'
import styles                               from './MatchesPage.module.css'

function MatchListSkeleton() {
  return (
    <div className={styles.skeletonList}>
      {[...Array(4)].map((_, i) => (
        <div key={i}>
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonRow} />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ isToday, onGoToToday }) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyEmoji}>⚽</p>
      <p className={styles.emptyText}>No matches on this day</p>
      {!isToday && (
        <button onClick={onGoToToday} className={styles.emptyTodayBtn}>
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
      <div className={styles.datebar}>
        <div className={styles.datebarInner}>
          <DateNavigator date={date} onChange={setDate} />
        </div>
      </div>

      <div className={styles.datebarSpacer} />

      <div className={styles.layout}>
        <aside className={styles.sidebarLeft}>
          <StandingsSidebar />
        </aside>

        <div className={styles.main}>
          {loading && <MatchListSkeleton />}

          {!loading && matches.length === 0 && (
            <EmptyState isToday={isToday} onGoToToday={() => setDate(today())} />
          )}

          {!loading && liveMatches.length > 0 && (
            <div className={styles.liveSection}>
              <div className={styles.liveSectionHeader}>
                <span className={styles.liveDot} />
                <span className={styles.liveLabel}>Live</span>
              </div>
              {liveGroups.map(g => (
                <MatchGroup key={g.leagueHref} {...g} included={included} isLive />
              ))}
            </div>
          )}

          {!loading && otherMatches.length > 0 && (
            <div className={styles.otherSection}>
              {liveMatches.length > 0 && (
                <div className={styles.otherSectionHeader}>
                  <span className={styles.otherLabel}>Other matches</span>
                </div>
              )}
              {otherGroups.map(g => (
                <MatchGroup key={g.leagueHref} {...g} included={included} />
              ))}
            </div>
          )}
        </div>

        <aside className={styles.sidebarRight}>
          <LeaguesSidebar />
        </aside>
      </div>
    </>
  )
}
