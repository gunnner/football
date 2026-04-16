import { useState, useEffect }   from 'react'
import { GOAL_TYPES }            from '../../constants/matchEvents'
import { matchPhase } from '../../constants/matchStatus'
import { formatMatchDate }       from '../../utils/date'
import { getCountryCode }        from '../../utils/country'
import { useMatchChannel }       from '../../hooks/useMatchChannel'
import MatchScore                from './MatchScore'
import MatchOverview             from './MatchOverview'
import MatchLineup               from './MatchLineup'
import MatchStatistics           from './MatchStatistics'
import MatchStandings            from './MatchStandings'
import MatchEvents               from './MatchEvents'
import ShotMap                   from './ShotMap'
import MatchNews                 from './MatchNews'
import MatchHighlights           from './MatchHighlights'
import MatchInjuries             from './MatchInjuries'
import MatchOdds                 from './MatchOdds'

function formatRound(round) {
  if (!round) return ''
  const parts = round.split(' ')
  const last  = parseInt(parts[parts.length - 1])
  return isNaN(last) || last === 0 ? round : `Tour - ${last}`
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 animate-pulse rounded-xl h-44" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => <div key={i} className="flex-1 h-10 bg-gray-800 animate-pulse rounded-md" />)}
      </div>
      <div className="bg-gray-800 animate-pulse rounded-xl h-64" />
    </div>
  )
}

function MatchTabs({ tabs, activeTab, onSelect }) {
  return (
    <div className="flex gap-1 mb-4 bg-gray-900 p-1 rounded-lg overflow-x-auto scrollbar-none">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={`flex-1 min-w-max py-2 px-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export default function MatchShow({ matchId }) {
  const [match,      setMatch]      = useState(null)
  const [included,   setIncluded]   = useState([])
  const [loading,    setLoading]    = useState(true)

  const [events,       setEvents]       = useState([])
  const [currentScore, setCurrentScore] = useState(null)

  const [lineups,           setLineups]           = useState([])
  const [lineupsLastKnown,  setLineupsLastKnown]  = useState(false)
  const [statistics,        setStatistics]        = useState([])
  const [boxScores,         setBoxScores]         = useState([])
  const [standings,         setStandings]         = useState(null)
  const [predictions,       setPredictions]       = useState(null)
  const [shots,             setShots]             = useState([])
  const [news,              setNews]              = useState([])
  const [highlights,        setHighlights]        = useState(null)
  const [lastFive,          setLastFive]          = useState(null)
  const [injuries,          setInjuries]          = useState(null)
  const [bookmakers,        setBookmakers]        = useState(null)
  const [h2h,               setH2h]              = useState(null)

  const [tab,          setTab]          = useState(null)
  const [statsKey,     setStatsKey]     = useState(0)
  const [lineupsKey,   setLineupsKey]   = useState(0)
  const [standingsKey, setStandingsKey] = useState(0)
  const [richKey,      setRichKey]      = useState(0)

  useEffect(() => {
    const base = `/api/v1/matches/${matchId}`
    Promise.all([
      fetch(base).then(r => r.json()),
      fetch(`${base}/events`).then(r => r.json()),
    ]).then(([showRes, eventsRes]) => {
      setMatch(showRes.data?.data ?? null)
      setIncluded(showRes.data?.included ?? [])
      setStandings(showRes.meta?.standings ?? [])
      setCurrentScore(showRes.data?.data?.attributes?.score_current ?? null)
      setEvents(eventsRes.data ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [matchId])

  useEffect(() => {
    if (!match) return
    const status = match.attributes?.status
    setTab(matchPhase(status) !== 'upcoming' ? 'Events' : 'Overview')
  }, [!!match])

  useEffect(() => {
    fetch(`/api/v1/matches/${matchId}/lineups`)
      .then(r => r.json())
      .then(res => {
        setLineups(res.data ?? [])
        setLineupsLastKnown(res.last_known ?? false)
      })
      .catch(() => {})
  }, [matchId, lineupsKey])

  useEffect(() => {
    const base = `/api/v1/matches/${matchId}`
    Promise.all([
      fetch(`${base}/statistics`).then(r => r.json()),
      fetch(`${base}/box_scores`).then(r => r.json()),
    ]).then(([statsRes, boxRes]) => {
      setStatistics(statsRes.data ?? [])
      setBoxScores(boxRes.data ?? [])
    }).catch(() => {})
  }, [matchId, statsKey])

  useEffect(() => {
    if (standingsKey === 0) return
    fetch(`/api/v1/matches/${matchId}`)
      .then(r => r.json())
      .then(res => setStandings(res.meta?.standings ?? []))
      .catch(() => {})
  }, [matchId, standingsKey])

  useEffect(() => {
    const base    = `/api/v1/matches/${matchId}`
    const country = getCountryCode()
    const hlUrl   = country ? `${base}/highlights?country_code=${country}` : `${base}/highlights`
    Promise.all([
      fetch(`${base}/predictions`).then(r => r.json()),
      fetch(`${base}/shots`).then(r => r.json()),
      fetch(`${base}/news`).then(r => r.json()),
      fetch(hlUrl).then(r => r.json()),
    ]).then(([predRes, shotsRes, newsRes, hlRes]) => {
      setPredictions(predRes.data ?? null)
      setShots(shotsRes.data ?? [])
      setNews(newsRes.data ?? [])
      setHighlights(hlRes.data ?? [])
    }).catch(() => {})
  }, [matchId, richKey])

  useEffect(() => {
    if (!match) return
    const byId = {}
    included.forEach(i => { byId[`${i.type}:${i.id}`] = i.attributes })
    const homeId = match.relationships?.home_team?.data?.id
    const awayId = match.relationships?.away_team?.data?.id
    const base = `/api/v1/matches/${matchId}`
    Promise.all([
      fetch(`${base}/last_five`).then(r => r.json()),
      fetch(`${base}/injuries`).then(r => r.json()),
      fetch(`${base}/bookmakers`).then(r => r.json()),
      fetch(`/api/v1/matches/h2h?team1_id=${homeId}&team2_id=${awayId}`).then(r => r.json()),
    ]).then(([lfRes, injRes, bmRes, h2hRes]) => {
      setLastFive(lfRes.data ?? { home: [], away: [] })
      setInjuries(injRes.data ?? { home: [], away: [] })
      setBookmakers(bmRes.data ?? [])
      setH2h(h2hRes.data ?? [])
    }).catch(() => {})
  }, [matchId, !!match])

  useMatchChannel(matchId, (data) => {
    if (data.type === 'statistics_updated') { setStatsKey(k => k + 1); setRichKey(k => k + 1) }
    if (data.type === 'lineups_updated')    setLineupsKey(k => k + 1)
    if (data.type === 'match_end')          setStandingsKey(k => k + 1)
    if ((data.type === 'match_update' || data.type === 'goal' || data.type === 'match_event') && data.match?.score_current) {
      setCurrentScore(data.match.score_current)
    }
  })

  if (loading) return <LoadingSkeleton />
  if (!match)  return <div className="text-center py-16 text-gray-500">Match not found</div>

  const a = match.attributes

  const byId = {}
  included.forEach(i => { byId[`${i.type}:${i.id}`] = i.attributes })

  const homeId   = match.relationships?.home_team?.data?.id
  const awayId   = match.relationships?.away_team?.data?.id
  const leagueId = match.relationships?.league?.data?.id
  const homeAttr = byId[`team:${homeId}`] ?? {}
  const awayAttr = byId[`team:${awayId}`] ?? {}
  const league   = byId[`league:${leagueId}`] ?? {}

  const homeTeam = { name: homeAttr.name, logo: homeAttr.logo, path: `/teams/${homeId}`, external_id: homeAttr.external_id }
  const awayTeam = { name: awayAttr.name, logo: awayAttr.logo, path: `/teams/${awayId}`, external_id: awayAttr.external_id }

  const phase      = matchPhase(a.status)
  const isPreMatch = phase === 'upcoming'
  const isLive     = phase === 'live'
  const isFinished = phase === 'finished'

  const playerOfMatch = (() => {
    if (!isFinished || !boxScores.length) return null
    return [...boxScores]
      .filter(b => b.match_rating && parseFloat(b.match_rating) > 0)
      .sort((a, b) => parseFloat(b.match_rating) - parseFloat(a.match_rating))[0] ?? null
  })()

  const hasInjuries = injuries && ((injuries.home?.length ?? 0) + (injuries.away?.length ?? 0)) > 0

  const goalEvents = events
    .filter(e => GOAL_TYPES.has(e.event_type))
    .map(e => ({ ...e, type: e.event_type }))

  const lineupEvents = events.map(e => ({
    type:                         e.event_type,
    time:                         e.time,
    player_external_id:           e.player_external_id,
    assisting_player_external_id: e.assisting_player_external_id,
    team_external_id:             e.team_external_id,
  }))

  const tabs = (() => {
    if (isPreMatch) return [
      'Overview', 'Lineups',
      standings?.length > 0  && 'Standings',
      hasInjuries            && 'Injuries',
      bookmakers?.length > 0 && 'Odds',
      news.length > 0        && 'News',
    ].filter(Boolean)

    if (isLive) return [
      'Events',
      lineups.length > 0    && 'Lineups',
      statistics.length > 0 && 'Statistics',
      shots.length > 0      && 'Shots',
      standings?.length > 0 && 'Standings',
      'Overview',
      news.length > 0       && 'News',
    ].filter(Boolean)

    return [
      'Events',
      lineups.length > 0    && 'Lineups',
      statistics.length > 0 && 'Statistics',
      shots.length > 0      && 'Shots',
      standings?.length > 0 && 'Standings',
      highlights?.length > 0 && 'Highlights',
      'Overview',
      news.length > 0       && 'News',
    ].filter(Boolean)
  })()

  const activeTab = tabs.includes(tab) ? tab : tabs[0]

  return (
    <>
      <MatchScore
        matchId={matchId}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        initialScore={a.score_current}
        initialStatus={a.status}
        initialClock={a.clock ?? a.date}
        matchDate={formatMatchDate(a.date)}
        matchDateIso={a.date}
        leagueName={league.name ?? ''}
        leagueLogo={league.logo}
        leaguePath={leagueId ? `/leagues/${leagueId}` : null}
        refereeNationality={a.referee_nationality}
        refereeCountryLogo={a.referee_country_logo}
        round={formatRound(a.round)}
        homeTeamExternalId={homeAttr.external_id}
        awayTeamExternalId={awayAttr.external_id}
        events={goalEvents}
        playerOfMatch={playerOfMatch}
        venueName={a.venue_name}
        venueCity={a.venue_city}
        venueCapacity={a.venue_capacity}
        refereeName={a.referee_name}
        forecastStatus={a.forecast_status}
        forecastTemperature={a.forecast_temperature}
      />

      <MatchTabs tabs={tabs} activeTab={activeTab} onSelect={setTab} />

      {activeTab === 'Overview' && (
        <MatchOverview
          homeTeam={homeTeam} awayTeam={awayTeam}
          homeCoach={homeAttr.coach_name} awayCoach={awayAttr.coach_name}
          venueName={a.venue_name} venueCity={a.venue_city} venueCapacity={a.venue_capacity}
          forecastStatus={a.forecast_status} forecastTemperature={a.forecast_temperature}
          predictions={predictions} lastFive={lastFive} h2h={h2h} isPreMatch={isPreMatch}
        />
      )}

      {activeTab === 'Lineups' && (
        <MatchLineup homeTeam={homeTeam} awayTeam={awayTeam} lineups={lineups} events={lineupEvents} lastKnown={lineupsLastKnown} />
      )}

      {activeTab === 'Statistics' && (
        <MatchStatistics homeTeam={homeTeam} awayTeam={awayTeam} statistics={statistics} boxScores={boxScores} />
      )}

      {activeTab === 'Standings' && (
        <MatchStandings
          standings={standings ?? []}
          liveMatches={[{
            homeExternalId: homeAttr.external_id,
            awayExternalId: awayAttr.external_id,
            score: isLive ? (currentScore ?? a.score_current) : null,
          }]}
        />
      )}

      {activeTab === 'Events' && (
        <MatchEvents
          matchId={matchId}
          homeTeamExternalId={homeAttr.external_id}
          homeTeam={homeTeam} awayTeam={awayTeam}
          isLive={isLive} matchStatus={a.status} initialEvents={events}
        />
      )}

      {activeTab === 'Shots' && (
        <ShotMap
          shots={shots} homeTeam={homeTeam} awayTeam={awayTeam}
          homeExternalId={homeAttr.external_id} awayExternalId={awayAttr.external_id}
          predictions={predictions} isLive={isLive}
        />
      )}

      {activeTab === 'Injuries' && (
        <MatchInjuries homeTeam={homeTeam} awayTeam={awayTeam} injuries={injuries} />
      )}

      {activeTab === 'Odds' && (
        <MatchOdds bookmakers={bookmakers} homeTeam={homeTeam} awayTeam={awayTeam} />
      )}

      {activeTab === 'News' && <MatchNews news={news} />}

      {activeTab === 'Highlights' && (
        <MatchHighlights matchId={matchId} isLive={isLive} highlights={highlights} />
      )}
    </>
  )
}
