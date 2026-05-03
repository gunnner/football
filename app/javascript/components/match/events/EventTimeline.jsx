import { useState, useEffect, useRef } from 'react'
import { buildGroups, currentMinutePos, FINISHED_STATUSES } from './eventTimelineUtils'
import { EventGroup } from './EventTimelineItems'
import styles from './EventTimeline.module.css'

const TIMELINE_H = 140
const LEFT_COL   = 36

export default function EventTimeline({ events, homeTeamExternalId, homeTeam, awayTeam, isLive, matchStatus, clock }) {
  const [tickClock, setTickClock] = useState(clock)
  const tickRef = useRef(null)

  useEffect(() => { setTickClock(clock) }, [clock])

  const clockStr0   = String(clock ?? '')
  const isOvertime0 = clockStr0.includes('+')
  const isHalfTime0 = ['Half time', 'Break time'].includes(matchStatus)
  const isTicking   = isLive && !isHalfTime0 && !isOvertime0 && !FINISHED_STATUSES.has(matchStatus)

  useEffect(() => {
    if (!isTicking) { clearInterval(tickRef.current); return }
    tickRef.current = setInterval(() => {
      setTickClock(prev => {
        const n = parseInt(prev)
        return isNaN(n) ? prev : String(n + 1)
      })
    }, 60000)
    return () => clearInterval(tickRef.current)
  }, [isTicking])

  const clockStr  = String(tickClock ?? '')
  const clockMin  = parseInt(clockStr) || 0
  const isOvertime = clockStr.includes('+')
  const effectiveStatus = (!isOvertime && matchStatus === 'First half' && clockMin >= 45) ? 'Half time'
                        : matchStatus

  const isHalfTime     = ['Half time', 'Break time'].includes(effectiveStatus)
  const firstHalfLive  = isLive && effectiveStatus === 'First half'
  const halfTimeLive   = isLive && isHalfTime
  const secondHalfLive = isLive && ['Second half', 'Extra time'].includes(effectiveStatus)
  const matchStarted   = isLive || FINISHED_STATUSES.has(effectiveStatus) || events.length > 0
  const matchFinished  = FINISHED_STATUSES.has(effectiveStatus)

  const homeGroups = buildGroups(events.filter(e => e.team_external_id === homeTeamExternalId))
  const awayGroups = buildGroups(events.filter(e => e.team_external_id !== homeTeamExternalId))

  const livePos = isLive ? currentMinutePos(effectiveStatus, tickClock) : null

  return (
    <div>
      <div className={styles.halves}>
        <div style={{ width: `${LEFT_COL}px`, flexShrink: 0 }} />
        <div style={{ display: 'flex', flex: 1 }}>
          <div className={styles.halfLabel}>
            First Half
            {firstHalfLive && <span className={styles.liveDot} />}
          </div>
          <div className={styles.halfLabel}>
            {halfTimeLive && <span className={styles.liveDot} />}
            Second Half
            {secondHalfLive && <span className={styles.liveDot} />}
          </div>
        </div>
      </div>

      <div className={styles.track} style={{ height: `${TIMELINE_H}px` }}>
        <div className={styles.teamCol} style={{ width: `${LEFT_COL}px` }}>
          <div className={styles.teamSlot}>
            {homeTeam?.logo
              ? <a href={homeTeam?.path}><img src={homeTeam.logo} className={styles.teamLogoImg} alt={homeTeam?.name} /></a>
              : <span className={styles.teamName}>{homeTeam?.name}</span>
            }
          </div>
          <div className={styles.teamSlot}>
            {awayTeam?.logo
              ? <a href={awayTeam?.path}><img src={awayTeam.logo} className={styles.teamLogoImg} alt={awayTeam?.name} /></a>
              : <span className={styles.teamName}>{awayTeam?.name}</span>
            }
          </div>
        </div>

        <div style={{ position: 'absolute', left: `${LEFT_COL}px`, right: 0, top: 0, bottom: 0, overflow: 'visible' }}>
          {/* Center line */}
          <div style={{ position: 'absolute', insetInline: 0, background: '#374151', top: '50%', height: '2px', transform: 'translateY(-50%)', zIndex: 0 }} />

          {matchStarted && (
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#6b7280', border: '1px solid #374151' }} />
              <span className={styles.kickOffLabel}>Kick Off</span>
            </div>
          )}

          {/* HT divider */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(75,85,99,0.5)', zIndex: 1 }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, background: '#111827', padding: '0 2px' }}>
            <span className={styles.htLabel}>HT</span>
          </div>

          {matchFinished && (
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#6b7280', border: '1px solid #374151' }} />
              <span className={styles.fullTimeLabel}>Full Time</span>
            </div>
          )}

          {livePos !== null && (() => {
            const allGroups = [...homeGroups, ...awayGroups]
            const tooClose = allGroups.some(g => Math.abs(g.pos - livePos) < 0.5)
            return !tooClose && (
              <div className={styles.liveGroup} style={{ position: 'absolute', left: `${livePos}%`, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 4 }}>
                <div className={styles.liveDotBig} />
                <div className={styles.liveTooltip}>{clockMin}'</div>
              </div>
            )
          })()}

          {homeGroups.map((g, i) => <EventGroup key={i} group={g} side="home" />)}
          {awayGroups.map((g, i) => <EventGroup key={i} group={g} side="away" />)}
        </div>
      </div>
    </div>
  )
}
