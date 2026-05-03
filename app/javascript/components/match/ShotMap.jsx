import GoalFace, { OUTCOME_STYLE, ON_GOAL_OUTCOMES } from './shots/GoalFace'
import { CombinedShotList } from './shots/ShotList'
import styles from './ShotMap.module.css'

export default function ShotMap({ shots, homeTeam, awayTeam, homeExternalId, awayExternalId }) {
  const homeShots = shots.filter(s => String(s.team_external_id) === String(homeExternalId))
  const awayShots = shots.filter(s => String(s.team_external_id) === String(awayExternalId))

  const legend = [...ON_GOAL_OUTCOMES, 'Post', 'Missed'].map(o => [o, OUTCOME_STYLE[o]])

  if (shots.length === 0) {
    return (
      <div className={styles.noData}>No shot data available yet</div>
    )
  }

  return (
    <div className={styles.stack}>

      {shots.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Shot Map</p>
          </div>

          <div className={styles.legend}>
            {legend.map(([outcome, style]) => (
              <div key={outcome} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: style.fill }} />
                <span className={styles.legendLabel}>{style.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.shotGrid}>
            <div className={styles.shotTeam}>
              <a href={homeTeam.path} className={styles.teamLink}>
                {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} className={styles.teamLogo} />}
                <p className={styles.teamName}>{homeTeam.name}</p>
              </a>
              <GoalFace shots={homeShots} />
              <p className={styles.onTarget}>{homeShots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome)).length} on target</p>
            </div>
            <div className={styles.shotTeam}>
              <a href={awayTeam.path} className={styles.teamLink}>
                {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} className={styles.teamLogo} />}
                <p className={styles.teamName}>{awayTeam.name}</p>
              </a>
              <GoalFace shots={awayShots} />
              <p className={styles.onTarget}>{awayShots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome)).length} on target</p>
            </div>
          </div>

          <div className={styles.shotListWrap}>
            <CombinedShotList homeShots={homeShots} awayShots={awayShots} homeExternalId={homeExternalId} />
          </div>
        </div>
      )}
    </div>
  )
}
