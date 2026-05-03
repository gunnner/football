import styles from './MatchH2H.module.css'

function formatDate(str) {
  if (!str) return null
  const d = new Date(str)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function parseScore(score) {
  if (!score) return null
  const parts = score.split('-').map(s => parseInt(s.trim()))
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null
  return { home: parts[0], away: parts[1] }
}

function deriveAwayTeam(matches, homeTeam) {
  for (const m of matches) {
    if (m.home_team?.name && m.home_team.name !== homeTeam.name) return m.home_team
    if (m.away_team?.name && m.away_team.name !== homeTeam.name) return m.away_team
  }
  return null
}

function H2HSummary({ matches, homeTeam, awayTeam }) {
  let homeWins = 0, draws = 0, awayWins = 0
  let homeGoals = 0, awayGoals = 0

  matches.forEach(m => {
    const score = parseScore(m.score_current)
    if (!score) return

    const mHomeIsTeam1 = (m.home_team?.name ?? '') === homeTeam.name
    const team1Goals   = mHomeIsTeam1 ? score.home : score.away
    const team2Goals   = mHomeIsTeam1 ? score.away : score.home

    homeGoals += team1Goals
    awayGoals += team2Goals

    if (team1Goals > team2Goals) homeWins++
    else if (team1Goals < team2Goals) awayWins++
    else draws++
  })

  const total   = homeWins + draws + awayWins
  const avgHome = total > 0 ? (homeGoals / total).toFixed(1) : '—'
  const avgAway = total > 0 ? (awayGoals / total).toFixed(1) : '—'

  const homeW = total > 0 ? Math.round((homeWins / total) * 100) : 0
  const drawW = total > 0 ? Math.round((draws    / total) * 100) : 0
  const awayW = total > 0 ? 100 - homeW - drawW                  : 0

  return (
    <div className={styles.summary}>
      <div className={styles.winBar}>
        {homeW > 0 && <div className={styles.winBarHome} style={{ width: `${homeW}%` }} />}
        {drawW > 0 && <div className={styles.winBarDraw} style={{ width: `${drawW}%` }} />}
        {awayW > 0 && <div className={styles.winBarAway} style={{ width: `${awayW}%` }} />}
      </div>

      <div className={styles.winsGrid}>
        <div>
          <p className={`${styles.winCount} ${styles.winCountHome}`}>{homeWins}</p>
          <p className={styles.winTeam}>{homeTeam.name}</p>
        </div>
        <div>
          <p className={`${styles.winCount} ${styles.winCountDraw}`}>{draws}</p>
          <p className={styles.winTeam}>Draws</p>
        </div>
        <div>
          <p className={`${styles.winCount} ${styles.winCountAway}`}>{awayWins}</p>
          <p className={styles.winTeam}>{awayTeam?.name ?? 'Opponent'}</p>
        </div>
      </div>

      <div className={styles.goalStats}>
        <div className={styles.goalStat}>
          <p className={styles.goalStatLabel}>Total goals</p>
          <p className={styles.goalStatValue}>{homeGoals + awayGoals}</p>
        </div>
        <div className={styles.goalStatDivider} />
        <div className={styles.goalStat}>
          <p className={styles.goalStatLabel}>Avg per game</p>
          <p className={styles.goalStatValue}>
            {total > 0 ? ((homeGoals + awayGoals) / total).toFixed(1) : '—'}
          </p>
        </div>
        <div className={styles.goalStatDivider} />
        <div className={styles.goalStat}>
          <p className={styles.goalStatLabel}>{homeTeam.name} avg</p>
          <p className={`${styles.goalStatValue} ${styles.goalStatValueHome}`}>{avgHome}</p>
        </div>
        <div className={styles.goalStatDivider} />
        <div className={styles.goalStat}>
          <p className={styles.goalStatLabel}>{awayTeam?.name ?? 'Opponent'} avg</p>
          <p className={`${styles.goalStatValue} ${styles.goalStatValueAway}`}>{avgAway}</p>
        </div>
      </div>
    </div>
  )
}

export default function MatchH2H({ matches, homeTeam }) {
  if (!matches || matches.length === 0) return null

  const awayTeam = deriveAwayTeam(matches, homeTeam)

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>
          Head to Head — last {matches.length} meeting{matches.length !== 1 ? 's' : ''}
        </p>
      </div>

      <H2HSummary matches={matches} homeTeam={homeTeam} awayTeam={awayTeam} />

      <div className={styles.matchList}>
        {matches.map((m, i) => {
          const homeName = m.home_team?.name ?? '?'
          const awayName = m.away_team?.name ?? '?'
          const homeLogo = m.home_team?.logo
          const awayLogo = m.away_team?.logo
          const homePath = m.home_team?.id ? `/teams/${m.home_team.id}` : null
          const awayPath = m.away_team?.id ? `/teams/${m.away_team.id}` : null
          const score    = m.score_current ?? '—'
          const date     = formatDate(m.date)
          const league   = m.league

          return (
            <div key={m.match_path ?? i} className={styles.matchItem}>
              {league && (
                <div className={styles.leagueRow}>
                  {league.logo && <img src={league.logo} alt="" className={styles.leagueLogo} />}
                  <a href={`/leagues/${league.id}`} className={styles.leagueLink}>{league.name}</a>
                  {date && <span className={styles.leagueDate}>{date}</span>}
                </div>
              )}

              <a href={m.match_path ?? '#'} className={styles.matchRow}>
                <div className={styles.matchTeamHome}>
                  {homeLogo && <img src={homeLogo} alt={homeName} className={styles.matchTeamLogo} />}
                  {homePath
                    ? <a href={homePath} onClick={e => e.stopPropagation()} className={styles.matchTeamLink}>{homeName}</a>
                    : <span className={styles.matchTeamName}>{homeName}</span>
                  }
                </div>

                <span className={styles.matchScore}>{score}</span>

                <div className={styles.matchTeamAway}>
                  {awayPath
                    ? <a href={awayPath} onClick={e => e.stopPropagation()} className={styles.matchTeamLink}>{awayName}</a>
                    : <span className={styles.matchTeamName}>{awayName}</span>
                  }
                  {awayLogo && <img src={awayLogo} alt={awayName} className={styles.matchTeamLogo} />}
                </div>
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
