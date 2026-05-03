import { useState, useEffect, useRef } from 'react'
import { useMatchChannel }              from '../../hooks/useMatchChannel'
import { formatClock }                  from '../../utils/clock'
import { LIVE_STATUSES, FINISHED_STATUSES } from '../../constants/matchStatus'
import CountdownStrip                   from './score/CountdownStrip'
import MatchMeta                        from './score/MatchMeta'
import GoalsList                        from './score/GoalsList'
import styles                           from './MatchScore.module.css'

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
    <div className={styles.card}>
      {notification && (
        <div className={styles.notification}>{notification}</div>
      )}

      {/* League */}
      <div className={styles.leagueRow}>
        {leagueLogo && (
          leaguePath
            ? <a href={leaguePath}><img src={leagueLogo} alt={leagueName} className={styles.leagueLogo} /></a>
            : <img src={leagueLogo} alt={leagueName} className={styles.leagueLogo} />
        )}
        {leaguePath
          ? <a href={leaguePath} className={styles.leagueLink}>{leagueName}</a>
          : <span>{leagueName}</span>
        }
        <span>·</span><span>{round}</span><span>·</span><span>{matchDate}</span>
      </div>

      {/* Teams & Score */}
      <div className={styles.teamsGrid}>
        <div className={styles.teamCol}>
          {homeTeam.logo && (
            <a href={homeTeam.path} className={styles.teamLogoLink}>
              <img src={homeTeam.logo} alt={homeTeam.name} className={styles.teamLogo} />
            </a>
          )}
          <a href={homeTeam.path} className={styles.teamName}>{homeTeam.name}</a>
          <GoalsList events={homeEvents} />
        </div>

        <div className={styles.scoreCenter} id={`match_score_${matchId}`}>
          {isLive ? (
            <>
              <p className={styles.scoreValue}>{score || '0 - 0'}</p>
              <div className={styles.liveIndicator}>
                {isHalfTime ? (
                  <span className={styles.htBadge}>HT</span>
                ) : (
                  <>
                    <span className={styles.liveDot} />
                    <p className={styles.liveClock}>{clockLabel}</p>
                  </>
                )}
              </div>
            </>
          ) : isFinished ? (
            <>
              <p className={styles.scoreValue}>{score || '-'}</p>
              <p className={styles.ftLabel}>FT</p>
            </>
          ) : (
            <>
              <p className={styles.kickoffTime}>
                {new Date(initialClock).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className={styles.statusLabel}>{status}</p>
              <CountdownStrip matchDateIso={matchDateIso} />
            </>
          )}
        </div>

        <div className={styles.teamCol}>
          {awayTeam.logo && (
            <a href={awayTeam.path} className={styles.teamLogoLink}>
              <img src={awayTeam.logo} alt={awayTeam.name} className={styles.teamLogo} />
            </a>
          )}
          <a href={awayTeam.path} className={styles.teamName}>{awayTeam.name}</a>
          <GoalsList events={awayEvents} />
        </div>
      </div>

      {isFinished && playerOfMatch ? (
        <div className={styles.footer}>
          <div className={styles.potmRow}>
            <span className={styles.potmLabel}>Player of the Match</span>
            {playerOfMatch.player_logo
              ? (
                <div className={styles.potmAvatar}>
                  <img src={playerOfMatch.player_logo} alt="" className={styles.potmAvatarImg} />
                </div>
              )
              : <div className={styles.potmAvatarFallback}>👤</div>
            }
            <div className={styles.potmInfo}>
              <a href={playerOfMatch.player_path} className={styles.potmName}>
                {playerOfMatch.player_name}
              </a>
              <div className={styles.potmTeamRow}>
                {playerOfMatch.team_logo && (
                  <img src={playerOfMatch.team_logo} alt="" className={styles.potmTeamLogo} />
                )}
                <a href={playerOfMatch.team_path} className={styles.potmTeamLink}>
                  {playerOfMatch.team_name}
                </a>
              </div>
            </div>
            <span className={styles.potmRating}>{Math.min(parseFloat(playerOfMatch.match_rating), 10).toFixed(2)}</span>
          </div>
          <MatchMeta {...metaProps} />
        </div>
      ) : (
        <div className={styles.footerMeta}>
          <MatchMeta {...metaProps} />
        </div>
      )}
    </div>
  )
}
