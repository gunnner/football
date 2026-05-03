import styles from './MatchLastFive.module.css'

const SCORE_CLS = { W: styles.scoreW, D: styles.scoreD, L: styles.scoreL }

function TeamColumn({ team, matches }) {
  return (
    <div>
      <p className={styles.colName}>{team.name}</p>
      <div className={styles.colMatches}>
        {matches.length === 0 ? (
          <p className={styles.noMatches}>No recent matches</p>
        ) : (
          matches.map((m, i) => {
            const href = m.match_id ? `/matches/${m.match_id}` : null
            const scoreCls = SCORE_CLS[m.result] ?? styles.scoreN
            const Row = href ? 'a' : 'div'

            return (
              <Row
                key={i}
                {...(href ? { href } : {})}
                className={styles.matchRow}
              >
                {m.home_logo && (
                  <img src={m.home_logo} alt={m.home_team} className={styles.matchLogo} />
                )}
                <span className={styles.matchTeam}>{m.home_team}</span>
                <span className={scoreCls}>{m.score}</span>
                <span className={styles.matchTeamRight}>{m.away_team}</span>
                {m.away_logo && (
                  <img src={m.away_logo} alt={m.away_team} className={styles.matchLogo} />
                )}
              </Row>
            )
          })
        )}
      </div>
    </div>
  )
}

export default function MatchLastFive({ homeTeam, awayTeam, lastFive }) {
  if (!lastFive) return null
  const homeMatches = lastFive.home ?? []
  const awayMatches = lastFive.away ?? []
  if (homeMatches.length === 0 && awayMatches.length === 0) return null

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>Last 5 Games</p>
      </div>
      <div className={styles.cols}>
        <div className={styles.col}>
          <TeamColumn team={homeTeam} matches={homeMatches} />
        </div>
        <div className={`${styles.col} ${styles.colDivide}`}>
          <TeamColumn team={awayTeam} matches={awayMatches} />
        </div>
      </div>
    </div>
  )
}
