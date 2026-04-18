import { useState, useEffect }    from 'react'
import { LIVE_STATUSES }          from '../../constants/matchStatus'
import { today }                  from '../../utils/date'
import { shortTeamName }          from '../../utils/team'
import { useLiveMatchChannels }   from '../../hooks/useLiveMatchChannels'
import { projectStandings }       from '../../services/standings'

function Skeleton({ className }) {
  return <div className={`bg-gray-800 animate-pulse rounded ${className}`} />
}

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

export function LeaguesSidebar() {
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

export function StandingsSidebar() {
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
