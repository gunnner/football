import MatchLastFive from './MatchLastFive'
import MatchH2H      from './MatchH2H'
import styles        from './MatchOverview.module.css'

// ── Coaches ───────────────────────────────────────────────────────────────────

function Coaches({ homeTeam, awayTeam, homeCoach, awayCoach }) {
  if (!homeCoach && !awayCoach) return null
  return (
    <div className={styles.coachesCard}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>Managers</p>
      </div>
      <div className={styles.coachesGrid}>
        <div className={styles.coachCol}>
          {homeTeam.logo && (
            <img src={homeTeam.logo} alt={homeTeam.name} className={styles.coachLogo} />
          )}
          <p className={styles.coachName}>{homeCoach ?? '—'}</p>
          <p className={styles.coachTeam}>{homeTeam.name}</p>
        </div>
        <div className={`${styles.coachCol} ${styles.coachesGridDivide}`}>
          {awayTeam.logo && (
            <img src={awayTeam.logo} alt={awayTeam.name} className={styles.coachLogo} />
          )}
          <p className={styles.coachName}>{awayCoach ?? '—'}</p>
          <p className={styles.coachTeam}>{awayTeam.name}</p>
        </div>
      </div>
    </div>
  )
}

// ── Win Probability ───────────────────────────────────────────────────────────

function WinProbability({ homeTeam, awayTeam, prediction }) {
  if (!prediction) return null
  const home = prediction.home_pct
  const draw = prediction.draw_pct
  const away = prediction.away_pct
  if (home == null && draw == null && away == null) return null

  return (
    <div className={styles.probCard}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>Win Probability</p>
      </div>
      <div className={styles.probBody}>
        <div className={styles.probTeamLabels}>
          <span>{homeTeam.name}</span>
          <span>Draw</span>
          <span>{awayTeam.name}</span>
        </div>
        <div className={styles.probBar}>
          {home > 0 && <div className={styles.probFillHome} style={{ width: `${home}%` }} />}
          {draw > 0 && <div className={styles.probFillDraw} style={{ width: `${draw}%` }} />}
          {away > 0 && <div className={styles.probFillAway} style={{ width: `${away}%` }} />}
        </div>
        <div className={styles.probValues}>
          <span className={styles.probHome}>{home != null ? `${home}%` : ''}</span>
          <span className={styles.probDraw}>{draw != null ? `${draw}%` : ''}</span>
          <span className={styles.probAway}>{away != null ? `${away}%` : ''}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MatchOverview({
  homeTeam,
  awayTeam,
  homeCoach,
  awayCoach,
  predictions,
  lastFive,
  h2h,
  isPreMatch = false,
}) {
  return (
    <div className={styles.stack}>
      <Coaches
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeCoach={homeCoach}
        awayCoach={awayCoach}
      />

      {isPreMatch && (
        <WinProbability
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          prediction={predictions?.prematch}
        />
      )}

      <MatchLastFive
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        lastFive={lastFive}
      />

      <MatchH2H
        matches={h2h}
        homeTeam={homeTeam}
      />
    </div>
  )
}
