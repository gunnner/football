import { useState, useEffect } from 'react'
import { GOAL_TYPES }          from '../constants/matchEvents'
import { matchPhase }          from '../constants/matchStatus'
import { getCountryCode }      from '../utils/country'
import { useMatchChannel }     from './useMatchChannel'
import { parseMinute }         from '../utils/eventTime'

// Remove duplicate events: same event_type + player_external_id within ±1 minute.
// Keeps the first occurrence (earlier in the array).
function dedupeEvents(evts) {
  const seen = []
  return evts.filter(evt => {
    const evtMin = Math.floor(parseMinute(evt.time) / 100)
    const dup = seen.some(s =>
      s.event_type         === evt.event_type &&
      s.player_external_id != null &&
      s.player_external_id === evt.player_external_id &&
      Math.abs(Math.floor(parseMinute(s.time) / 100) - evtMin) <= 1
    )
    if (!dup) seen.push(evt)
    return !dup
  })
}

export function useMatchData(matchId) {
  const [match,    setMatch]    = useState(null)
  const [included, setIncluded] = useState([])
  const [loading,  setLoading]  = useState(true)

  const [events,        setEvents]        = useState([])
  const [currentScore,  setCurrentScore]  = useState(null)
  const [currentStatus, setCurrentStatus] = useState(null)

  const [lineups,          setLineups]          = useState([])
  const [lineupsLastKnown, setLineupsLastKnown] = useState(false)
  const [statistics,       setStatistics]       = useState([])
  const [boxScores,        setBoxScores]        = useState([])
  const [standings,        setStandings]        = useState(null)
  const [predictions,      setPredictions]      = useState(null)
  const [shots,            setShots]            = useState([])
  const [highlights,       setHighlights]       = useState(null)
  const [lastFive,         setLastFive]         = useState(null)
  const [injuries,         setInjuries]         = useState(null)
  const [bookmakers,       setBookmakers]       = useState(null)
  const [h2h,              setH2h]              = useState(null)

  const [statsKey,     setStatsKey]     = useState(0)
  const [lineupsKey,   setLineupsKey]   = useState(0)
  const [standingsKey, setStandingsKey] = useState(0)
  const [richKey,      setRichKey]      = useState(0)
  const [tabsReady,    setTabsReady]    = useState(false)

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
      setCurrentStatus(showRes.data?.data?.attributes?.status ?? null)
      setEvents(dedupeEvents(eventsRes.data ?? []))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [matchId])

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
      fetch(hlUrl).then(r => r.json()),
    ]).then(([predRes, shotsRes, hlRes]) => {
      setPredictions(predRes.data ?? null)
      setShots(shotsRes.data ?? [])
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
      setTabsReady(true)
    }).catch(() => setTabsReady(true))
  }, [matchId, !!match])

  useMatchChannel(matchId, (data) => {
    if (data.type === 'statistics_updated') { setStatsKey(k => k + 1); setRichKey(k => k + 1) }
    if (data.type === 'lineups_updated')    setLineupsKey(k => k + 1)
    if (data.type === 'match_end')          setStandingsKey(k => k + 1)
    if (data.type === 'match_update' || data.type === 'goal' || data.type === 'match_event') {
      if (data.match?.score_current) setCurrentScore(data.match.score_current)
      if (data.match?.status)        setCurrentStatus(data.match.status)
    }
    if ((data.type === 'match_event' || data.type === 'goal') && data.event) {
      const e = data.event
      setEvents(prev => dedupeEvents([...prev, {
        id:                           Date.now(),
        time:                         e.time,
        event_type:                   e.event_type,
        player_name:                  e.player_name,
        player_external_id:           e.player_external_id ?? null,
        team_name:                    e.team_name,
        team_external_id:             e.team_external_id,
        assisting_player_name:        e.assisting_player_name ?? null,
        assisting_player_external_id: e.assisting_player_external_id ?? null,
        substituted_player:           e.substituted_player ?? null,
      }]))
    }
  })

  // Derived values
  const byId = {}
  included.forEach(i => { byId[`${i.type}:${i.id}`] = i.attributes })

  const homeId   = match?.relationships?.home_team?.data?.id
  const awayId   = match?.relationships?.away_team?.data?.id
  const leagueId = match?.relationships?.league?.data?.id
  const homeAttr = byId[`team:${homeId}`] ?? {}
  const awayAttr = byId[`team:${awayId}`] ?? {}
  const league   = byId[`league:${leagueId}`] ?? {}

  const a = match?.attributes ?? {}
  const liveStatus = currentStatus ?? a.status
  const phase      = matchPhase(liveStatus)
  const isPreMatch = phase === 'upcoming'
  const isLive     = phase === 'live'
  const isFinished = phase === 'finished'

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

  const playerOfMatch = (() => {
    if (!isFinished || !boxScores.length) return null
    return [...boxScores]
      .filter(b => b.match_rating && parseFloat(b.match_rating) > 0)
      .sort((a, b) => parseFloat(b.match_rating) - parseFloat(a.match_rating))[0] ?? null
  })()

  return {
    match, loading, tabsReady,
    included, byId,
    homeId, awayId, leagueId,
    homeAttr, awayAttr, league,
    a, liveStatus, isPreMatch, isLive, isFinished,
    currentScore,
    events, goalEvents, lineupEvents,
    lineups, lineupsLastKnown,
    statistics, boxScores,
    standings,
    predictions, shots, highlights,
    lastFive, injuries, bookmakers, h2h,
    playerOfMatch,
  }
}
