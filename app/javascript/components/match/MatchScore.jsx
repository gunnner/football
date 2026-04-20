import { useState, useEffect, useRef } from 'react'
import { useMatchChannel }              from '../../hooks/useMatchChannel'
import { formatClock }                  from '../../utils/clock'
import { LIVE_STATUSES, FINISHED_STATUSES } from '../../constants/matchStatus'
import CountdownStrip                   from './score/CountdownStrip'
import MatchMeta                        from './score/MatchMeta'
import GoalsList                        from './score/GoalsList'

export default function MatchScore({
  matchId, homeTeam, awayTeam,
  initialScore, initialStatus, initialClock,
  matchDate, matchDateIso,
  leagueName, leagueLogo, leaguePath, round,
  homeTeamExternalId, awayTeamExternalId,
  events = [], playerOfMatch,
  venueName, venueCity, venueCapacity,
  refereeName, refereeNationality, refereeCountryLogo,
  forecastStatus, forecastTemperature,
}) {
  const [score,        setScore]        = useState(initialScore)
  const [status,       setStatus]       = useState(initialStatus)
  const [clock,        setClock]        = useState(initialClock)
  const [notification, setNotification] = useState(null)

  const isLive     = LIVE_STATUSES.includes(status)
  const isFinished = FINISHED_STATUSES.includes(status)
  const isHalfTime = status === 'Half time' || status === 'Break time'
  const isTicking  = isLive && !isHalfTime && !isFinished

  const tickRef = useRef(null)
  useEffect(() => {
    if (!isTicking) { clearInterval(tickRef.current); return }
    tickRef.current = setInterval(() => {
      setClock(prev => {
        const n = parseInt(prev)
        return isNaN(n) ? prev : String(n + 1)
      })
    }, 60000)
    return () => clearInterval(tickRef.current)
  }, [isTicking])

  const clockLabel = isHalfTime ? null : formatClock(clock, status)

  const homeEvents = events.filter(e => e.team_external_id === homeTeamExternalId)
  const awayEvents = events.filter(e => e.team_external_id === awayTeamExternalId)

  function showNotification(message) {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  useMatchChannel(matchId, (data) => {
    switch (data.type) {
      case 'match_update':
        setScore(data.match.score_current)
        setStatus(data.match.status)
        setClock(data.match.clock)
        break
      case 'goal':
        setScore(data.match.score_current)
        setStatus(data.match.status)
        setClock(data.match.clock)
        showNotification(`⚽ GOAL! ${data.event.player_name} (${data.event.team_name}) ${data.event.time}'`)
        break
      case 'match_start':
        setStatus(data.match.status)
        showNotification('🟢 Match started!')
        break
      case 'match_end':
        setStatus(data.match.status)
        setScore(data.match.score_current)
        showNotification('🔴 Final whistle!')
        break
    }
  })

  const metaProps = { venueName, venueCity, venueCapacity, refereeName, refereeNationality, refereeCountryLogo, forecastStatus, forecastTemperature }

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-4 relative">
      {notification && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white
                        px-4 py-2 rounded-full text-sm font-medium animate-bounce z-10">
          {notification}
        </div>
      )}

      {/* League */}
      <div className="flex items-center justify-center gap-1.5 text-gray-500 text-sm mb-4">
        {leagueLogo && (
          leaguePath
            ? <a href={leaguePath}><img src={leagueLogo} alt={leagueName} className="w-4 h-4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} /></a>
            : <img src={leagueLogo} alt={leagueName} className="w-4 h-4 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        )}
        {leaguePath
          ? <a href={leaguePath} className="hover:text-gray-300 transition-colors">{leagueName}</a>
          : <span>{leagueName}</span>
        }
        <span>·</span><span>{round}</span><span>·</span><span>{matchDate}</span>
      </div>

      {/* Teams & Score */}
      <div className="grid grid-cols-3 items-start gap-4">
        <div className="flex flex-col">
          {homeTeam.logo && (
            <a href={homeTeam.path} className="mx-auto">
              <img src={homeTeam.logo} alt={homeTeam.name} className="w-12 h-12 object-contain mb-2" />
            </a>
          )}
          <a href={homeTeam.path} className="font-bold text-lg text-white hover:text-blue-400 transition-colors text-center">{homeTeam.name}</a>
          <GoalsList events={homeEvents} />
        </div>

        <div className="text-center" id={`match_score_${matchId}`}>
          {isLive ? (
            <>
              <p className="text-5xl font-bold text-white">{score || '0 - 0'}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {isHalfTime ? (
                  <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">HT</span>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <p className="text-red-400 text-sm font-medium">{clockLabel}</p>
                  </>
                )}
              </div>
            </>
          ) : isFinished ? (
            <>
              <p className="text-5xl font-bold text-white">{score || '-'}</p>
              <p className="text-gray-500 text-sm font-semibold mt-2">FT</p>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-3xl">
                {new Date(initialClock).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-gray-600 text-sm mt-1">{status}</p>
              <CountdownStrip matchDateIso={matchDateIso} />
            </>
          )}
        </div>

        <div className="flex flex-col">
          {awayTeam.logo && (
            <a href={awayTeam.path} className="mx-auto">
              <img src={awayTeam.logo} alt={awayTeam.name} className="w-12 h-12 object-contain mb-2" />
            </a>
          )}
          <a href={awayTeam.path} className="font-bold text-lg text-white hover:text-blue-400 transition-colors text-center">{awayTeam.name}</a>
          <GoalsList events={awayEvents} />
        </div>
      </div>

      {isFinished && playerOfMatch ? (
        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">Player of the Match</span>
            <div className="flex items-center gap-2">
              {playerOfMatch.player_logo
                ? (
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden">
                    <img src={playerOfMatch.player_logo} alt="" className="w-full" style={{ height: '200%', objectFit: 'cover', objectPosition: '50% 0%' }} />
                  </div>
                )
                : <span className="w-8 h-8 flex items-center justify-center text-lg bg-gray-800 rounded-full flex-shrink-0">👤</span>
              }
              <div>
                <a href={playerOfMatch.player_path} className="text-sm font-semibold text-white hover:text-blue-400 transition-colors block leading-tight">
                  {playerOfMatch.player_name}
                </a>
                <div className="flex items-center gap-1 mt-0.5">
                  {playerOfMatch.team_logo && (
                    <img src={playerOfMatch.team_logo} alt="" className="w-3 h-3 object-contain flex-shrink-0" />
                  )}
                  <a href={playerOfMatch.team_path} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    {playerOfMatch.team_name}
                  </a>
                </div>
              </div>
              <span className="text-xl font-bold text-yellow-400 ml-1">{Math.min(parseFloat(playerOfMatch.match_rating), 10).toFixed(2)}</span>
            </div>
          </div>
          <MatchMeta {...metaProps} />
        </div>
      ) : (
        <div className="mt-2">
          <MatchMeta {...metaProps} />
        </div>
      )}
    </div>
  )
}
