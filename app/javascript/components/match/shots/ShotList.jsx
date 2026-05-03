import { useState } from 'react'
import { OUTCOME_STYLE } from './GoalFace'
import styles from './ShotList.module.css'

function PlayerAvatar({ logo, name, size = 20 }) {
  const [failed, setFailed] = useState(false)
  if (logo && !failed) {
    return (
      <div className={styles.shotAvatar} style={{ width: size, height: size }}>
        <img src={logo} alt={name} onError={() => setFailed(true)} className={styles.shotAvatarImg} />
      </div>
    )
  }
  return (
    <div className={styles.shotAvatarFallback} style={{ width: size, height: size }}>👤</div>
  )
}

function parseTime(t) {
  if (!t) return 0
  const m = String(t).match(/(\d+)\s*\+\s*(\d+)/)
  return m ? parseInt(m[1]) * 100 + parseInt(m[2]) : parseInt(t) * 100
}

export function CombinedShotList({ homeShots, awayShots, homeExternalId }) {
  const all = [...homeShots, ...awayShots].sort((a, b) => parseTime(a.time) - parseTime(b.time))

  if (all.length === 0) return <p className={styles.noData}>No shot data</p>

  return (
    <div className={styles.shotList}>
      {all.map((s, i) => {
        const isHome = String(s.team_external_id) === String(homeExternalId)
        const style  = OUTCOME_STYLE[s.outcome] ?? { fill: '#6b7280' }
        const nameEl = s.player_path
          ? <a href={s.player_path} className={styles.shotPlayerLink}>{s.player_name}</a>
          : <span className={styles.shotPlayerName}>{s.player_name}</span>
        return (
          <div key={i} className={`${styles.shotRow}${isHome ? '' : ` ${styles.shotRowRev}`}`}>
            <PlayerAvatar logo={s.player_logo} name={s.player_name} size={20} />
            <span className={styles.shotTime}>{s.time}'</span>
            {nameEl}
            <span className={styles.shotOutcome} style={{ color: style.fill }}>{s.outcome}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ProbabilityBars({ predictions, homeTeam, awayTeam, isLive }) {
  if (!isLive || !predictions) return null
  const pred = predictions.live ?? predictions.prematch
  if (!pred) return null

  const rows = [
    { logo: homeTeam.logo, path: homeTeam.path, pct: parseFloat(pred.home_pct), fillCls: styles.probFillHome },
    { label: 'Draw',                                pct: parseFloat(pred.draw_pct), fillCls: styles.probFillDraw },
    { logo: awayTeam.logo, path: awayTeam.path, pct: parseFloat(pred.away_pct), fillCls: styles.probFillAway  },
  ]

  return (
    <div className={styles.probCard}>
      <p className={styles.probTitle}>
        Win Probability {predictions.live ? '· Live' : '· Pre-match'}
      </p>
      <div className={styles.probRows}>
        {rows.map((row, i) => (
          <div key={i} className={styles.probRow}>
            <div className={styles.probIcon}>
              {row.logo
                ? <a href={row.path}><img src={row.logo} className={styles.probTeamImg} alt="" /></a>
                : <span className={styles.probLabel}>{row.label}</span>
              }
            </div>
            <div className={styles.probTrack}>
              <div className={`${styles.probFill} ${row.fillCls}`} style={{ width: `${row.pct ?? 0}%` }} />
            </div>
            <span className={styles.probPct}>{row.pct?.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
