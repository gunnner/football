import { useState, useEffect, useRef } from 'react'
import { LIVE_STATUSES }             from '../../constants/matchStatus'
import { EVENT_EMOJI }               from '../../constants/matchEvents'
import { today }                     from '../../utils/date'
import { formatClock }               from '../../utils/clock'
import { useMatchChannel }           from '../../hooks/useMatchChannel'
import { useLiveMatchChannels }      from '../../hooks/useLiveMatchChannels'
import { projectStandings }          from '../../services/standings'
import DateNavigator                 from '../ui/DateNavigator'
import { ChevronLeft, ChevronRight } from '../ui/Icons'

const FINISHED = ['Finished', 'Finished after penalties', 'Finished after extra time']

function Skeleton({ className }) {
  return <div className={`bg-gray-800 animate-pulse rounded ${className}`} />
}

// ── Team name shortening ──────────────────────────────────────────────────────

const SHORT_NAMES = {
  'Manchester City':           'Man City',
  'Manchester United':         'Man United',
  'Tottenham Hotspur':         'Tottenham',
  'Nottingham Forest':         "Nott'm Forest",
  'Crystal Palace':            'C. Palace',
  'Brighton & Hove Albion':    'Brighton',
  'Wolverhampton Wanderers':   'Wolves',
  'West Bromwich Albion':      'West Brom',
  'Sheffield United':          'Sheffield Utd',
  'Sheffield Wednesday':       'Sheffield Wed',
  'Leicester City':            'Leicester',
  'Queens Park Rangers':       'QPR',
  'Huddersfield Town':         'Huddersfield',
  'Blackburn Rovers':          'Blackburn',
  'Stoke City':                'Stoke',
  'Swansea City':              'Swansea',
  'Norwich City':              'Norwich',
  'Ipswich Town':              'Ipswich',
  'Luton Town':                'Luton',
}

function shortTeamName(name) {
  return SHORT_NAMES[name] ?? name
}

// ── Sidebars ──────────────────────────────────────────────────────────────────

function SidebarCard({ children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {children}
    </div>
  )
}

function SidebarHeader({ logo, name, href }) {
  return (
    <a href={href} className="flex items-center gap-2 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 transition-colors">
      {logo && <img src={logo} alt="" className="w-5 h-5 object-contain flex-shrink-0 bg-white rounded p-0.5" />}
      <span className="text-sm font-semibold text-gray-200 truncate">{name}</span>
    </a>
  )
}

function LeaguesSidebar() {
  const [leagues, setLeagues] = useState(null)

  useEffect(() => {
    fetch('/api/v1/leagues?per_page=50')
      .then(r => r.json())
      .then(d => setLeagues(d.data ?? []))
      .catch(() => setLeagues([]))
  }, [])

  if (leagues === null) return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}
    </div>
  )

  return (
    <SidebarCard>
      <div className="px-3 py-2.5 bg-gray-800">
        <span className="text-sm font-semibold text-gray-200">Leagues</span>
      </div>
      <div className="p-1">
        {leagues.map(l => (
          <a key={l.id} href={`/leagues/${l.id}`}
             className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            {l.attributes.logo && (
              <img src={l.attributes.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0 bg-white rounded p-0.5" />
            )}
            <span className="text-sm text-gray-200 truncate">{l.attributes.name}</span>
          </a>
        ))}
      </div>
    </SidebarCard>
  )
}

function StandingsSidebar() {
  const [groups,        setGroups]        = useState(null)
  const [liveMatchData, setLiveMatchData] = useState([])
  const [liveScores,    setLiveScores]    = useState({})
  const season = new Date().getFullYear() - 1

  useEffect(() => {
    fetch('/api/v1/leagues?per_page=50')
      .then(r => r.json())
      .then(d => {
        const leagues = d.data ?? []
        return Promise.all(
          leagues.map(l =>
            fetch(`/api/v1/leagues/${l.id}/standings?season=${season}`)
              .then(r => r.json())
              .then(json => {
                const teamsById = {}
                ;(json.included ?? []).forEach(i => {
                  if (i.type === 'team') teamsById[i.id] = i.attributes
                })
                const standings = (json.data ?? []).map(s => {
                  const teamId   = s.relationships?.team?.data?.id
                  const teamAttr = teamsById[teamId] ?? {}
                  return {
                    ...s.attributes,
                    id: s.id, teamId,
                    team:             teamAttr,
                    team_external_id: teamAttr.external_id,
                  }
                })
                return { leagueId: l.id, leagueName: l.attributes.name, leagueLogo: l.attributes.logo, standings }
              })
          )
        )
      })
      .then(setGroups)
      .catch(() => setGroups([]))
  }, [season])

  useEffect(() => {
    fetch(`/api/v1/matches?date=${today()}&per_page=100`)
      .then(r => r.json())
      .then(d => {
        const teamsById = {}
        ;(d.included ?? []).forEach(i => { if (i.type === 'team') teamsById[i.id] = i.attributes })
        const liveData = (d.data ?? [])
          .filter(m => LIVE_STATUSES.includes(m.attributes.status))
          .map(m => ({
            matchId:        m.id,
            leagueId:       m.relationships?.league?.data?.id,
            homeExternalId: teamsById[m.relationships?.home_team?.data?.id]?.external_id,
            awayExternalId: teamsById[m.relationships?.away_team?.data?.id]?.external_id,
            score:          m.attributes.score_current,
          }))
        setLiveMatchData(liveData)
        setLiveScores(Object.fromEntries(liveData.map(m => [m.matchId, m.score])))
      })
      .catch(() => {})
  }, [])

  useLiveMatchChannels(liveMatchData.map(m => m.matchId), (matchId, data) => {
    if (data.match?.score_current !== undefined) {
      setLiveScores(prev => ({ ...prev, [matchId]: data.match.score_current }))
    }
  })

  if (groups === null) return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      {groups.map(({ leagueId, leagueName, leagueLogo, standings }) => {
        const liveForLeague = liveMatchData
          .filter(m => String(m.leagueId) === String(leagueId))
          .map(m => ({
            homeExternalId: m.homeExternalId,
            awayExternalId: m.awayExternalId,
            score: liveScores[m.matchId] ?? m.score,
          }))
        const projected   = liveForLeague.length > 0 ? projectStandings(standings, liveForLeague) : standings
        const liveTeamIds = new Set(liveForLeague.flatMap(m => [m.homeExternalId, m.awayExternalId]))

        return (
          <SidebarCard key={leagueId}>
            <SidebarHeader logo={leagueLogo} name={leagueName} href={`/leagues/${leagueId}`} />
            {liveForLeague.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-800/40 border-b border-gray-800">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live projected</span>
              </div>
            )}
            <div className="px-1 py-1">
              <div className="grid grid-cols-[1.25rem_1fr_1.75rem_2.25rem_1.75rem] text-xs text-gray-500 px-2 pb-1 pt-0.5">
                <span>#</span><span>Team</span>
                <span className="text-right">MP</span>
                <span className="text-right">GD</span>
                <span className="text-right">Pts</span>
              </div>
              {projected.map(s => {
                const gd        = (s.scored_goals ?? 0) - (s.received_goals ?? 0)
                const isPlaying = liveTeamIds.has(s.team_external_id)
                return (
                  <a key={s.id} href={s.teamId ? `/teams/${s.teamId}` : '#'}
                     className={`grid grid-cols-[1.25rem_1fr_1.75rem_2.25rem_1.75rem] items-center px-2 py-1 rounded-lg transition-colors ${
                       isPlaying ? 'bg-blue-950/50 hover:bg-blue-950/70' : 'hover:bg-gray-800'
                     }`}>
                    <span className="text-xs text-gray-500">{s.position}</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      {s.team?.logo && (
                        <img src={s.team.logo} alt="" className="w-4 h-4 object-contain flex-shrink-0 bg-white rounded p-px" />
                      )}
                      <span className={`text-xs truncate ${isPlaying ? 'text-white font-semibold' : 'text-gray-200'}`}>
                        {shortTeamName(s.team?.name ?? '—')}
                      </span>
                      {isPlaying && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />}
                    </div>
                    <span className="text-xs text-gray-400 text-right">{s.games_played}</span>
                    <span className={`text-xs text-right font-medium ${gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                      {gd > 0 ? `+${gd}` : gd}
                    </span>
                    <span className={`text-xs font-semibold text-right ${isPlaying ? 'text-white' : 'text-gray-300'}`}>{s.points}</span>
                  </a>
                )
              })}
            </div>
          </SidebarCard>
        )
      })}
    </div>
  )
}

// ── Match rows ─────────────────────────────────────────────────────────────────

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
    }
    if (data.type === 'match_end') {
      if (data.match?.score_current !== undefined) setScore(data.match.score_current)
      setIsDone(true)
    }
    if ((data.type === 'match_event' || data.type === 'goal') && data.event) {
      setRecentEvents(prev => [data.event, ...prev].slice(0, 3))
    }
  })

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
              : <span className="text-red-400 text-xs block animate-pulse">{formatClock(clock, a.status)}</span>
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

function MatchGroup({ league, matches, included, isLive }) {
  return (
    <div className="mb-2">
      <div className="bg-gray-800 px-4 py-2 rounded-t-lg">
        <span className="text-sm font-semibold text-gray-300">{league}</span>
      </div>
      <div className="bg-gray-900 rounded-b-lg overflow-hidden">
        {matches.map(m =>
          isLive
            ? <LiveMatchRow key={m.id} match={m} included={included} />
            : <MatchRow     key={m.id} match={m} included={included} />
        )}
      </div>
    </div>
  )
}

function groupByLeague(matches, included) {
  const leaguesById = {}
  included?.forEach(i => { if (i.type === 'league') leaguesById[i.id] = i.attributes })
  const groups = {}
  matches.forEach(m => {
    const leagueId   = m.relationships?.league?.data?.id
    const leagueName = leaguesById[leagueId]?.name ?? 'Unknown'
    if (!groups[leagueName]) groups[leagueName] = []
    groups[leagueName].push(m)
  })
  return groups
}

// ── Main ──────────────────────────────────────────────────────────────────────

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
          {loading && (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-9 rounded-t-lg rounded-b-none" />
                  <Skeleton className="h-14 rounded-t-none rounded-b-lg mt-0.5" />
                </div>
              ))}
            </div>
          )}

          {!loading && matches.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-4">⚽</p>
              <p className="text-lg">No matches on this day</p>
              {!isToday && (
                <button onClick={() => setDate(today())} className="mt-3 text-sm text-blue-400 hover:text-blue-300">
                  Go to today
                </button>
              )}
            </div>
          )}

          {!loading && liveMatches.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-red-400 uppercase tracking-wider">Live</span>
              </div>
              {Object.entries(liveGroups).map(([league, ms]) => (
                <MatchGroup key={league} league={league} matches={ms} included={included} isLive />
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
              {Object.entries(otherGroups).map(([league, ms]) => (
                <MatchGroup key={league} league={league} matches={ms} included={included} />
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
