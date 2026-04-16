import { useState, useEffect }  from 'react'
import { LIVE_STATUSES }        from '../../constants/matchStatus'
import { useLiveMatchChannels } from '../../hooks/useLiveMatchChannels'
import MatchStandings           from '../match/MatchStandings'

function Skeleton({ className }) {
  return <div className={`bg-gray-800 animate-pulse rounded ${className}`} />
}

function formatSeason(s) {
  return `${s}/${String(s + 1).slice(-2)}`
}

function todayStr() {
  const d  = new Date()
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export default function LeagueShow({ leagueId }) {
  const [availableSeasons, setAvailableSeasons] = useState([])
  const [season,           setSeason]           = useState(null)
  const [standings,        setStandings]        = useState([])
  const [loading,          setLoading]          = useState(true)
  const [standingsLoading, setStandingsLoading] = useState(false)
  const [liveMatchData,    setLiveMatchData]    = useState([])  // [{matchId, homeExternalId, awayExternalId, score}]
  const [liveScores,       setLiveScores]       = useState({})  // matchId → score

  useEffect(() => {
    fetch(`/api/v1/leagues/${leagueId}`)
      .then(r => r.json())
      .then(d => {
        const seasons = d.meta?.available_seasons ?? []
        setAvailableSeasons(seasons)
        const initial = seasons[0] ?? null
        setSeason(initial)
        if (!initial) setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [leagueId])

  useEffect(() => {
    if (!season) return
    setStandingsLoading(true)
    fetch(`/api/v1/leagues/${leagueId}/standings?season=${season}`)
      .then(r => r.json())
      .then(d => {
        const data     = d.data     ?? []
        const included = d.included ?? []

        const teamsById = {}
        included.filter(i => i.type === 'team').forEach(i => { teamsById[i.id] = i })

        const parsed = data.map(s => {
          const teamId   = s.relationships?.team?.data?.id
          const teamAttr = teamsById[teamId]?.attributes ?? {}
          return {
            ...s.attributes,
            team_name:        teamAttr.name,
            team_external_id: teamAttr.external_id,
            logo:             teamAttr.logo,
            team_path:        `/teams/${teamId}`,
          }
        })

        setStandings(parsed)
        setLoading(false)
        setStandingsLoading(false)
      })
      .catch(() => { setLoading(false); setStandingsLoading(false) })
  }, [leagueId, season])

  // Fetch today's live matches to compute projected standings
  useEffect(() => {
    fetch(`/api/v1/matches?date=${todayStr()}&per_page=100`)
      .then(r => r.json())
      .then(d => {
        const allMatches = d.data ?? []
        const teamsById  = {}
        ;(d.included ?? []).forEach(i => { if (i.type === 'team') teamsById[i.id] = i.attributes })

        const liveData = allMatches
          .filter(m =>
            LIVE_STATUSES.includes(m.attributes.status) &&
            String(m.relationships?.league?.data?.id) === String(leagueId)
          )
          .map(m => ({
            matchId:        m.id,
            homeExternalId: teamsById[m.relationships?.home_team?.data?.id]?.external_id,
            awayExternalId: teamsById[m.relationships?.away_team?.data?.id]?.external_id,
            score:          m.attributes.score_current,
          }))

        setLiveMatchData(liveData)
        setLiveScores(Object.fromEntries(liveData.map(m => [m.matchId, m.score])))
      })
      .catch(() => {})
  }, [leagueId])

  const liveMatchIds = liveMatchData.map(m => m.matchId)
  useLiveMatchChannels(liveMatchIds, (_matchId, data) => {
    if (data.match?.score_current !== undefined) {
      setLiveScores(prev => ({ ...prev, [_matchId]: data.match.score_current }))
    }
  })

  const liveMatches = liveMatchData.map(m => ({
    homeExternalId: m.homeExternalId,
    awayExternalId: m.awayExternalId,
    score:          liveScores[m.matchId] ?? m.score,
  }))

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-md" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <>
      {availableSeasons.length > 1 && (
        <div className="flex gap-1 mb-4 flex-wrap">
          {availableSeasons.map(s => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                s === season
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {formatSeason(s)}
            </button>
          ))}
        </div>
      )}

      {standingsLoading
        ? <Skeleton className="h-96 rounded-xl" />
        : <MatchStandings standings={standings} liveMatches={liveMatches} />
      }
    </>
  )
}
