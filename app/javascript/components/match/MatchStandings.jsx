import { parseScore, projectStandings } from '../../services/standings'
import styles from './MatchStandings.module.css'

export default function MatchStandings({ standings, liveMatches }) {
  if (!standings || standings.length === 0) {
    return <div className={styles.noData}>No standings available</div>
  }

  const hasLive   = liveMatches?.some(m => m.score != null)
  const projected = hasLive ? projectStandings(standings, liveMatches) : standings

  const liveTeamIds = new Set(
    (liveMatches ?? []).flatMap(m => [m.homeExternalId, m.awayExternalId])
  )

  const liveScoreByTeam = {}
  ;(liveMatches ?? []).forEach(({ homeExternalId, awayExternalId, score }) => {
    const parsed = parseScore(score)
    if (!parsed) return
    const { home: hg, away: ag } = parsed
    const label = `${hg} - ${ag}`
    liveScoreByTeam[homeExternalId] = { label, cls: hg > ag ? styles.liveScoreGreen : hg < ag ? styles.liveScoreRed : styles.liveScoreYellow }
    liveScoreByTeam[awayExternalId] = { label, cls: ag > hg ? styles.liveScoreGreen : ag < hg ? styles.liveScoreRed : styles.liveScoreYellow }
  })

  return (
    <div className={styles.card}>
      {hasLive && (
        <div className={styles.liveBar}>
          <span className={styles.liveDot} />
          <span className={styles.liveBarText}>Live projected standings based on current score</span>
        </div>
      )}

      <table className={styles.table}>
        <colgroup>
          <col className={styles.colPos} />
          <col className={styles.colTeam} />
          <col className={styles.colStat} />
          <col className={styles.colStat} />
          <col className={styles.colStat} />
          <col className={styles.colStat} />
          <col className={styles.colGoals} />
          <col className={styles.colPts} />
          <col className={styles.colWdl} />
          <col className={styles.colWdl} />
        </colgroup>
        <thead>
          <tr className={styles.tableHeader}>
            <th scope="col" className={styles.thCenter}>#</th>
            <th scope="col">Team</th>
            <th scope="col" className={styles.thCenter}>P</th>
            <th scope="col" className={styles.thCenter}>W</th>
            <th scope="col" className={styles.thCenter}>D</th>
            <th scope="col" className={styles.thCenter}>L</th>
            <th scope="col" className={styles.thCenter}>Goals</th>
            <th scope="col" className={styles.thBold}>Pts</th>
            <th scope="col" className={styles.thCenter}>Home</th>
            <th scope="col" className={styles.thCenter}>Away</th>
          </tr>
        </thead>
        <tbody>
          {projected.map(s => {
            const isHighlighted = liveTeamIds.has(s.team_external_id)
            const gf = s.scored_goals   || 0
            const ga = s.received_goals || 0
            const gd = gf - ga
            const gdCls = gd > 0 ? styles.goalDiffGreen : gd < 0 ? styles.goalDiffRed : styles.goalDiffYellow
            const gdStr = gd > 0 ? `+${gd}` : `${gd}`
            const liveScore = liveScoreByTeam[s.team_external_id]

            return (
              <tr
                key={s.position}
                className={`${styles.row} ${isHighlighted ? styles.rowHighlight : styles.rowDefault}`}
                onClick={() => { if (s.team_path) window.location.href = s.team_path }}
                style={{ cursor: s.team_path ? 'pointer' : 'default' }}
              >
                <td className={styles.posCell}>{s.position}</td>
                <td className={styles.teamCell}>
                  <div className={styles.teamCellInner}>
                    {s.logo && <img src={s.logo} alt={s.team_name} className={styles.teamLogo} />}
                    <span className={isHighlighted ? styles.teamNameHighlight : styles.teamNameDefault}>
                      {s.team_name}
                    </span>
                    {isHighlighted && hasLive && <span className={styles.liveTeamDot} />}
                    {liveScore && (
                      <span className={`${styles.liveScore} ${liveScore.cls}`}>{liveScore.label}</span>
                    )}
                  </div>
                </td>
                <td className={styles.statCell}>{s.games_played}</td>
                <td className={styles.statCell}>{s.wins}</td>
                <td className={styles.statCell}>{s.draws}</td>
                <td className={styles.statCell}>{s.loses}</td>
                <td className={styles.goalCell}>
                  <span className={styles.goalGoals}>{gf}:{ga}</span>
                  <span className={gdCls}>({gdStr})</span>
                </td>
                <td className={styles.ptsCell}>{s.points}</td>
                <td className={styles.wdlCell}>
                  <span className={styles.wdlW}>{s.home_wins}W</span>
                  <span className={styles.wdlD}>{s.home_draws}D</span>
                  <span className={styles.wdlL}>{s.home_loses}L</span>
                </td>
                <td className={styles.wdlCell}>
                  <span className={styles.wdlW}>{s.away_wins}W</span>
                  <span className={styles.wdlD}>{s.away_draws}D</span>
                  <span className={styles.wdlL}>{s.away_loses}L</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
