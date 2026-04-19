import { useState, useEffect, useRef } from 'react'
import { LIVE_STATUSES }               from '../../constants/matchStatus'
import { EVENT_EMOJI }                 from '../../constants/matchEvents'
import { formatClock }                 from '../../utils/clock'
import { useMatchChannel }             from '../../hooks/useMatchChannel'
import { ChevronLeft, ChevronRight }   from '../ui/Icons'

const FINISHED = ['Finished', 'Finished after penalties', 'Finished after extra time']

function countryFlag(code) {
  if (!code || code.length !== 2) return null
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')
}

function CountryFlag({ logo, code }) {
  if (logo) return <img src={logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
  const emoji = countryFlag(code)
  if (emoji) return <span className="text-sm leading-none">{emoji}</span>
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

  const tickRef = useRef(null)
  useEffect(() => {
    if (isDone) { clearInterval(tickRef.current); return }
    tickRef.current = setInterval(() => {
      setClock(prev => {
        const n = parseInt(prev)
        return isNaN(n) ? prev : String(n + 1)
      })
    }, 60000)
    return () => clearInterval(tickRef.current)
  }, [isDone])

  useMatchChannel(match.id, (data) => {
    if (data.type === 'match_update' || data.type === 'match_event' || data.type === 'goal') {
      if (data.match?.score_current !== undefined) setScore(data.match.score_current)
      if (data.match?.clock !== undefined)         setClock(data.match.clock)
      if (data.match?.status !== undefined)        setStatus(data.match.status)
    }
    if (data.type === 'match_end') {
      if (data.match?.score_current !== undefined) setScore(data.match.score_current)
      setIsDone(true)
    }
    if ((data.type === 'match_event' || data.type === 'goal') && data.event) {
      setRecentEvents(prev => [data.event, ...prev].slice(0, 3))
    }
  })

  const clockStr      = String(clock ?? '')
  const clockMin      = parseInt(clockStr) || 0
  const isOvertime    = clockStr.includes('+')
  // Only normalise HT — end of match is determined solely by API status, never by clock
  const effectiveStatus = (!isOvertime && status === 'First half' && clockMin >= 45) ? 'Half time'
                        : status
  const isHalfTime    = effectiveStatus === 'Half time' || effectiveStatus === 'Break time'

  return (
    <a href={`/matches/${match.id}`} className="block">
      <div className="flex flex-col px-4 py-2.5 border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
        <div className="flex items-center">
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="text-sm font-medium text-gray-100">{home.name ?? '—'}</span>
            {home.logo && <img src={home.logo} alt="" className="w-6 h-5 object-contain flex-shrink-0" />}
          </div>
          <div className="w-32 text-center mx-4">
            <span className="text-white font-bold text-sm">{score || '0 - 0'}</span>
            {isDone
              ? <span className="text-gray-500 text-xs block font-medium">FT</span>
              : isHalfTime
              ? <span className="text-yellow-500 text-xs block font-medium">HT</span>
              : <span className="text-red-400 text-xs block animate-pulse">{formatClock(clock, effectiveStatus)}</span>
            }
          </div>
          <div className="flex-1 flex items-center justify-start gap-2">
            {away.logo && <img src={away.logo} alt="" className="w-6 h-5 object-contain flex-shrink-0" />}
            <span className="text-sm font-medium text-gray-100">{away.name ?? '—'}</span>
          </div>
        </div>
        {recentEvents.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-1.5 flex-wrap">
            {recentEvents.map((e, i) => (
              <span key={i} className="text-xs text-gray-400 whitespace-nowrap">
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
    <a href={`/matches/${match.id}`} className="block">
      <div className="flex items-center px-4 py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800 transition-colors">
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className="text-sm font-medium text-gray-100">{home.name ?? '—'}</span>
          {home.logo && <img src={home.logo} alt="" className="w-6 h-5 object-contain flex-shrink-0" />}
        </div>
        <div className="w-32 text-center mx-4">
          {done && (
            <>
              <span className="text-white font-bold text-sm">{a.score_current || '-'}</span>
              <span className="text-gray-500 text-xs block font-medium">FT</span>
            </>
          )}
          {live && (
            <>
              <span className="text-white font-bold text-sm">{a.score_current || '0 - 0'}</span>
              <span className="text-red-400 text-xs block animate-pulse">{formatClock(a.clock, a.status)}</span>
            </>
          )}
          {!done && !live && (
            <>
              <span className="text-gray-400 text-sm">
                {new Date(a.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-gray-600 text-xs block">{a.status}</span>
            </>
          )}
        </div>
        <div className="flex-1 flex items-center justify-start gap-2">
          {away.logo && <img src={away.logo} alt="" className="w-6 h-5 object-contain flex-shrink-0" />}
          <span className="text-sm font-medium text-gray-100">{away.name ?? '—'}</span>
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
    <div className="mb-2">
      <div className="flex items-center bg-gray-800 px-3 py-2 rounded-t-lg gap-2">
        {leagueLogo && (
          <img src={leagueLogo} alt="" className="w-5 h-5 object-contain flex-shrink-0 bg-white rounded p-0.5" />
        )}

        <a href={leagueHref} className="flex-1 min-w-0 flex items-center gap-2 hover:text-white transition-colors">
          <span className="text-sm font-semibold text-gray-200 truncate">{leagueName}</span>
          {countryName && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 flex-shrink-0">
              <span>—</span>
              <CountryFlag logo={countryLogo} code={countryCode} />
              <span>{countryName}</span>
            </span>
          )}
        </a>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 ml-1"
        >
          {collapsed ? (
            <>
              <span className="text-xs tabular-nums">{matches.length} {matches.length === 1 ? 'match' : 'matches'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 rotate-90" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="bg-gray-900 rounded-b-lg overflow-hidden">
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
