import { useState, useEffect } from 'react'
import { matchPhase }          from '../../constants/matchStatus'
import { formatMatchDate }     from '../../utils/date'
import { useMatchData }        from '../../hooks/useMatchData'
import MatchScore              from './MatchScore'
import MatchOverview           from './MatchOverview'
import MatchLineup             from './MatchLineup'
import MatchStatistics         from './MatchStatistics'
import MatchStandings          from './MatchStandings'
import MatchEvents             from './MatchEvents'
import ShotMap                 from './ShotMap'
import MatchHighlights         from './MatchHighlights'
import MatchOdds               from './MatchOdds'

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
  const {
    match, loading, tabsReady,
    homeAttr, awayAttr, league,
    homeId, awayId, leagueId,
    a, liveStatus, isPreMatch, isLive,
    currentScore,
    events, goalEvents, lineupEvents,
    lineups, lineupsLastKnown,
    statistics, boxScores,
    standings,
    predictions, shots, highlights,
    lastFive, injuries, bookmakers, h2h,
    playerOfMatch,
  } = useMatchData(matchId)

  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('tab'))

  useEffect(() => {
    if (!match || tab) return
    const status = match.attributes?.status
    setTab(matchPhase(status) !== 'upcoming' ? 'Events' : 'Overview')
  }, [!!match])

  if (loading || !tabsReady) return <LoadingSkeleton />
  if (!match)               return <div className="text-center py-16 text-gray-500">Match not found</div>

  const homeTeam = { name: homeAttr.name, logo: homeAttr.logo, path: `/teams/${homeId}`, external_id: homeAttr.external_id }
  const awayTeam = { name: awayAttr.name, logo: awayAttr.logo, path: `/teams/${awayId}`, external_id: awayAttr.external_id }

  const tabs = (() => {
    if (isPreMatch) return [
      'Overview', 'Lineups',
      standings?.length > 0  && 'Standings',
      bookmakers?.length > 0 && 'Odds',
    ].filter(Boolean)

    if (isLive) return [
      'Events',
      lineups.length > 0    && 'Lineups',
      statistics.length > 0 && 'Statistics',
      shots.length > 0      && 'Shots',
      standings?.length > 0 && 'Standings',
      'Overview',
    ].filter(Boolean)

    return [
      'Events',
      lineups.length > 0     && 'Lineups',
      statistics.length > 0  && 'Statistics',
      shots.length > 0       && 'Shots',
      standings?.length > 0  && 'Standings',
      highlights?.length > 0 && 'Highlights',
      'Overview',
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

      <MatchTabs tabs={tabs} activeTab={activeTab} onSelect={t => {
        setTab(t)
        const url = new URL(window.location)
        url.searchParams.set('tab', t)
        window.history.replaceState({}, '', url)
      }} />

      {activeTab === 'Overview' && (
        <MatchOverview
          homeTeam={homeTeam} awayTeam={awayTeam}
          homeCoach={homeAttr.coach_name} awayCoach={awayAttr.coach_name}
          predictions={predictions} lastFive={lastFive} h2h={h2h} isPreMatch={isPreMatch}
        />
      )}

      {activeTab === 'Lineups' && (
        <MatchLineup homeTeam={homeTeam} awayTeam={awayTeam} lineups={lineups} events={lineupEvents} lastKnown={lineupsLastKnown} injuries={injuries} boxScores={boxScores} />
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
          isLive={isLive} matchStatus={liveStatus} initialEvents={events} clock={a.clock}
        />
      )}

      {activeTab === 'Shots' && (
        <ShotMap
          shots={shots} homeTeam={homeTeam} awayTeam={awayTeam}
          homeExternalId={homeAttr.external_id} awayExternalId={awayAttr.external_id}
          predictions={predictions} isLive={isLive}
        />
      )}

      {activeTab === 'Odds' && (
        <MatchOdds bookmakers={bookmakers} homeTeam={homeTeam} awayTeam={awayTeam} />
      )}

      {activeTab === 'Highlights' && (
        <MatchHighlights matchId={matchId} isLive={isLive} highlights={highlights} />
      )}
    </>
  )
}
