import { useState, useEffect, useRef } from 'react'
import { LIVE_STATUSES }               from '../../constants/matchStatus'
import { EVENT_EMOJI }                 from '../../constants/matchEvents'
import { formatClock }                 from '../../utils/clock'
import { useMatchChannel }             from '../../hooks/useMatchChannel'
import { ChevronLeft, ChevronRight }   from '../ui/Icons'
import styles                          from './MatchGroup.module.css'

const FINISHED = ['Finished', 'Finished after penalties', 'Finished after extra time']

function countryFlag(code) {
  if (!code || code.length !== 2) return null
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}

function CountryFlag({ logo, code }) {
  if (logo) return <img src={logo} alt="" className={styles.countryLogo} />
  const emoji = countryFlag(code)
  if (emoji) return <span style={{ fontSize: '0.875rem', lineHeight: 1 }}>{emoji}</span>
  return null
}

function resolveTeams(match, included) {
  const teamsById = {}
  included?.forEach(i => { if (i.type === 'team') teamsById[i.id] = i.attributes })
  const homeId = match.relationships?.home_team?.data?.id
  const awayId = match.relationships?.away_team?.data?.id
  return { home: teamsById[homeId] ?? {}, away: teamsById[awayId] ?? {} }
}

function LiveMatchRow({ match, included }) {
  const a = match.attributes
  const { home, away } = resolveTeams(match, included)

  const [score,        setScore]        = useState(a.score_current)
  const [clock,        setClock]        = useState(a.clock)
  const [status,       setStatus]       = useState(a.status)
  const [isDone,       setIsDone]       = useState(false)
  const [recentEvents, setRecentEvents] = useState([])

  const clockBaseRef = useRef({
    raw: a.clock ?? '0',
    ts:  a.updated_at ? new Date(a.updated_at).getTime() : Date.now(),
  })

  function computeClock({ raw, ts }) {
    const elapsed = Math.floor((Date.now() - ts) / 60000)
    if (elapsed === 0) return String(raw)
    const str = String(raw)
    if (str.includes('+')) {
      const [base, extra] = str.split('+').map(Number)
      return `${base}+${(extra || 0) + elapsed}`
    }
    return String((parseInt(str) || 0) + elapsed)
  }

  const tickRef = useRef(null)
  useEffect(() => {
    if (isDone) { clearInterval(tickRef.current); return }
    // Sync immediately on mount (fixes back-navigation stale clock)
    setClock(computeClock(clockBaseRef.current))
    tickRef.current = setInterval(() => {
      setClock(computeClock(clockBaseRef.current))
    }, 15000)
    return () => clearInterval(tickRef.current)
  }, [isDone])

  useMatchChannel(match.id, (data) => {
    if (data.type === 'match_update' || data.type === 'match_event' || data.type === 'goal') {
      if (data.match?.score_current !== undefined) setScore(data.match.score_current)
      if (data.match?.status !== undefined)        setStatus(data.match.status)

      // Use event time as clock floor so displayed minute is never behind the latest event
      const eventMin  = parseInt(data.event?.time) || 0
      const matchClock = data.match?.clock
      const rawClock  = matchClock !== undefined ? matchClock : clockBaseRef.current.raw
      const clockMin  = parseInt(rawClock) || 0
      const effective = eventMin > clockMin ? String(eventMin) : rawClock

      if (matchClock !== undefined || eventMin > 0) {
        clockBaseRef.current = { raw: effective, ts: Date.now() }
        setClock(effective)
      }
    }
    if (data.type === 'match_end') {
      if (data.match?.score_current !== undefined) setScore(data.match.score_current)
      setIsDone(true)
    }
    if ((data.type === 'match_event' || data.type === 'goal') && data.event) {
      setRecentEvents(prev => {
        if (prev.some(e => e.id === data.event.id)) return prev
        const stamped = { ...data.event, addedAt: Date.now() }
        setTimeout(() => {
          setRecentEvents(cur => cur.filter(e => e.addedAt !== stamped.addedAt))
        }, 60000)
        return [stamped, ...prev].slice(0, 2)
      })
    }
  })

  const clockStr   = String(clock ?? '')
  const clockMin   = parseInt(clockStr) || 0
  const isOvertime = clockStr.includes('+')
  const effectiveStatus = (!isOvertime && status === 'First half' && clockMin >= 46) ? 'Second half'
                        : (!isOvertime && status === 'First half' && clockMin === 45) ? 'Half time'
                        : status
  const isHalfTime = effectiveStatus === 'Half time' || effectiveStatus === 'Break time'

  return (
    <a href={`/matches/${match.id}`} className={styles.matchLink}>
      <div className={styles.liveMatchBody}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={`${styles.teamSide} ${styles.teamSideHome}`}>
            <span className={styles.teamName}>{home.name ?? '—'}</span>
            {home.logo && <img src={home.logo} alt="" className={styles.teamLogo} />}
          </div>
          <div className={styles.scoreBox}>
            <span className={styles.scoreValue}>{score || '0 - 0'}</span>
            {isDone
              ? <span className={styles.scoreFt}>FT</span>
              : isHalfTime
              ? <span style={{ color: '#eab308', fontSize: '0.75rem', display: 'block', fontWeight: 500 }}>HT</span>
              : <span className={styles.scoreLive}>{formatClock(clock, effectiveStatus)}</span>
            }
          </div>
          <div className={`${styles.teamSide} ${styles.teamSideAway}`}>
            {away.logo && <img src={away.logo} alt="" className={styles.teamLogo} />}
            <span className={styles.teamName}>{away.name ?? '—'}</span>
          </div>
        </div>
        {recentEvents.length > 0 && (
          <div className={styles.recentEvents}>
            {recentEvents.map((e, i) => (
              <span key={i} className={styles.recentEvent}>
                {EVENT_EMOJI[e.event_type] || '•'} {e.time}' {e.player_name}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}

function MatchRow({ match, included }) {
  const a = match.attributes
  const { home, away } = resolveTeams(match, included)
  const live = LIVE_STATUSES.includes(a.status)
  const done = FINISHED.includes(a.status)

  return (
    <a href={`/matches/${match.id}`} className={styles.matchLink}>
      <div className={styles.matchRow}>
        <div className={`${styles.teamSide} ${styles.teamSideHome}`}>
          <span className={styles.teamName}>{home.name ?? '—'}</span>
          {home.logo && <img src={home.logo} alt="" className={styles.teamLogo} />}
        </div>
        <div className={styles.scoreBox}>
          {done && (
            <>
              <span className={styles.scoreValue}>{a.score_current || '-'}</span>
              <span className={styles.scoreFt}>FT</span>
            </>
          )}
          {live && (
            <>
              <span className={styles.scoreValue}>{a.score_current || '0 - 0'}</span>
              <span className={styles.scoreLive}>{formatClock(a.clock, a.status)}</span>
            </>
          )}
          {!done && !live && (
            <>
              <span className={styles.kickoffTime}>
                {new Date(a.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className={styles.scoreStatus}>{a.status}</span>
            </>
          )}
        </div>
        <div className={`${styles.teamSide} ${styles.teamSideAway}`}>
          {away.logo && <img src={away.logo} alt="" className={styles.teamLogo} />}
          <span className={styles.teamName}>{away.name ?? '—'}</span>
        </div>
      </div>
    </a>
  )
}

export function groupByLeague(matches, included) {
  const leaguesById = {}
  included?.forEach(i => { if (i.type === 'league') leaguesById[i.id] = i.attributes })

  const groups = {}
  matches.forEach(m => {
    const leagueId = m.relationships?.league?.data?.id
    const attrs    = leaguesById[leagueId] ?? {}
    const key      = leagueId ?? 'unknown'
    if (!groups[key]) {
      groups[key] = {
        leagueName:  attrs.name         ?? 'Unknown',
        leagueLogo:  attrs.logo         ?? null,
        countryName: attrs.country_name ?? null,
        countryLogo: attrs.country_logo ?? null,
        countryCode: attrs.country_code ?? null,
        leagueHref:  leagueId ? `/leagues/${leagueId}` : '#',
        matches:     [],
      }
    }
    groups[key].matches.push(m)
  })
  return Object.values(groups)
}

export default function MatchGroup({ leagueName, leagueLogo, countryName, countryLogo, countryCode, leagueHref, matches, included, isLive }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        {leagueLogo && (
          <img src={leagueLogo} alt="" className={styles.leagueLogo} />
        )}

        <a href={leagueHref} className={styles.leagueLink}>
          <span className={styles.leagueName}>{leagueName}</span>
          {countryName && (
            <span className={styles.countryInfo}>
              <span>—</span>
              <CountryFlag logo={countryLogo} code={countryCode} />
              <span>{countryName}</span>
            </span>
          )}
        </a>

        <button onClick={() => setCollapsed(c => !c)} className={styles.collapseBtn}>
          {collapsed ? (
            <>
              <span className={styles.collapseCount}>{matches.length} {matches.length === 1 ? 'match' : 'matches'}</span>
              <ChevronRight className={styles.collapseIcon} />
            </>
          ) : (
            <ChevronLeft className={`${styles.collapseIcon}`} style={{ transform: 'rotate(90deg)' }} />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className={styles.matchesBody}>
          {matches.map(m =>
            isLive
              ? <LiveMatchRow key={m.id} match={m} included={included} />
              : <MatchRow     key={m.id} match={m} included={included} />
          )}
        </div>
      )}
    </div>
  )
}
