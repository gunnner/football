import { useState, useEffect }    from 'react'
import { LIVE_STATUSES }          from '../../constants/matchStatus'
import { today }                  from '../../utils/date'
import { shortTeamName }          from '../../utils/team'
import { useLiveMatchChannels }   from '../../hooks/useLiveMatchChannels'
import { projectStandings }       from '../../services/standings'
import styles                     from './MatchesSidebars.module.css'


export function LeaguesSidebar() {
  const [leagues, setLeagues] = useState(null)

  useEffect(() => {
    fetch('/api/v1/leagues?per_page=50')
      .then(r => r.json())
      .then(d => setLeagues(d.data ?? []))
      .catch(() => setLeagues([]))
  }, [])

  if (leagues === null) return (
    <div className={styles.skeletonStack}>
      {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} style={{ height: '2.5rem' }} />)}
    </div>
  )

  return (
    <div className={styles.sidebarCard}>
      <div className={styles.leagueSimpleHeader}>
        <span className={styles.leagueSimpleTitle}>Leagues</span>
      </div>
      <div className={styles.leaguesList}>
        {leagues.map(l => (
          <a key={l.id} href={`/leagues/${l.id}`} className={styles.leagueItem}>
            {l.attributes.logo && (
              <img src={l.attributes.logo} alt="" className={styles.leagueItemLogo} />
            )}
            <span className={styles.leagueItemName}>{l.attributes.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

export function StandingsSidebar() {
  const [groups,        setGroups]        = useState(null)
  const [liveMatchData, setLiveMatchData] = useState([])
  const [liveScores,    setLiveScores]    = useState({})
  const season = new Date().getFullYear() - 1

  useEffect(() => {
    fetch('/api/v1/leagues?per_page=50')
      .then(r => r.json())
      .then(d => {
        const leagues = d.data ?? []
        return Promise.all(
          leagues.map(l =>
            fetch(`/api/v1/leagues/${l.id}/standings?season=${season}`)
              .then(r => r.json())
              .then(json => {
                const teamsById = {}
                ;(json.included ?? []).forEach(i => {
                  if (i.type === 'team') teamsById[i.id] = i.attributes
                })
                const standings = (json.data ?? []).map(s => {
                  const teamId   = s.relationships?.team?.data?.id
                  const teamAttr = teamsById[teamId] ?? {}
                  return {
                    ...s.attributes,
                    id: s.id, teamId,
                    team:             teamAttr,
                    team_external_id: teamAttr.external_id,
                  }
                })
                return { leagueId: l.id, leagueName: l.attributes.name, leagueLogo: l.attributes.logo, standings }
              })
          )
        )
      })
      .then(setGroups)
      .catch(() => setGroups([]))
  }, [season])

  useEffect(() => {
    fetch(`/api/v1/matches?date=${today()}&per_page=100`)
      .then(r => r.json())
      .then(d => {
        const teamsById = {}
        ;(d.included ?? []).forEach(i => { if (i.type === 'team') teamsById[i.id] = i.attributes })
        const liveData = (d.data ?? [])
          .filter(m => LIVE_STATUSES.includes(m.attributes.status))
          .map(m => ({
            matchId:        m.id,
            leagueId:       m.relationships?.league?.data?.id,
            homeExternalId: teamsById[m.relationships?.home_team?.data?.id]?.external_id,
            awayExternalId: teamsById[m.relationships?.away_team?.data?.id]?.external_id,
            score:          m.attributes.score_current,
          }))
        setLiveMatchData(liveData)
        setLiveScores(Object.fromEntries(liveData.map(m => [m.matchId, m.score])))
      })
      .catch(() => {})
  }, [])

  useLiveMatchChannels(liveMatchData.map(m => m.matchId), (matchId, data) => {
    if (data.match?.score_current !== undefined) {
      setLiveScores(prev => ({ ...prev, [matchId]: data.match.score_current }))
    }
    if (data.type === 'match_end') {
      setLiveMatchData(prev => prev.filter(m => m.matchId !== matchId))
    }
  })

  if (groups === null) return (
    <div className={styles.skeletonStack}>
      {[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} style={{ height: '2rem' }} />)}
    </div>
  )

  return (
    <div className={styles.leaguesStack}>
      {groups.map(({ leagueId, leagueName, leagueLogo, standings }) => {
        const liveForLeague = liveMatchData
          .filter(m => String(m.leagueId) === String(leagueId))
          .map(m => ({
            homeExternalId: m.homeExternalId,
            awayExternalId: m.awayExternalId,
            score: liveScores[m.matchId] ?? m.score,
          }))
        const projected   = liveForLeague.length > 0 ? projectStandings(standings, liveForLeague) : standings
        const liveTeamIds = new Set(liveForLeague.flatMap(m => [m.homeExternalId, m.awayExternalId]))

        return (
          <div key={leagueId} className={styles.sidebarCard}>
            <a href={`/leagues/${leagueId}`} className={styles.sidebarHeaderLink}>
              {leagueLogo && <img src={leagueLogo} alt="" className={styles.sidebarHeaderLogo} />}
              <span className={styles.sidebarHeaderName}>{leagueName}</span>
            </a>
            {liveForLeague.length > 0 && (
              <div className={styles.liveBar}>
                <span className={styles.liveDot} />
                <span className={styles.liveBarText}>Live projected</span>
              </div>
            )}
            <table className={styles.standingsTable}>
              <thead>
                <tr className={styles.standingsHeader}>
                  <th scope="col">#</th>
                  <th scope="col">Team</th>
                  <th scope="col" className={styles.thRight}>MP</th>
                  <th scope="col" className={styles.thRight}>GD</th>
                  <th scope="col" className={styles.thRight}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {projected.map(s => {
                  const gd        = (s.scored_goals ?? 0) - (s.received_goals ?? 0)
                  const isPlaying = liveTeamIds.has(s.team_external_id)
                  return (
                    <tr
                      key={s.id}
                      className={`${styles.standingsRow} ${isPlaying ? styles.standingsRowLive : styles.standingsRowDefault}`}
                      onClick={() => { if (s.teamId) window.location.href = `/teams/${s.teamId}` }}
                      style={{ cursor: s.teamId ? 'pointer' : 'default' }}
                    >
                      <td className={styles.posCell}>{s.position}</td>
                      <td className={styles.teamCell}>
                        {s.team?.logo && (
                          <img src={s.team.logo} alt="" className={styles.teamLogo} />
                        )}
                        <span className={isPlaying ? styles.teamNameLive : styles.teamNameDefault}>
                          {shortTeamName(s.team?.name ?? '—')}
                        </span>
                        {isPlaying && <span className={styles.liveTeamDot} />}
                      </td>
                      <td className={styles.mpCell}>{s.games_played}</td>
                      <td className={`${styles.gdCell} ${gd > 0 ? styles.gdGreen : gd < 0 ? styles.gdRed : styles.gdGray}`}>
                        {gd > 0 ? `+${gd}` : gd}
                      </td>
                      <td className={isPlaying ? styles.ptsLive : styles.ptsDefault}>{s.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}
