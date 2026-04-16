export function parseScore(scoreStr) {
  if (!scoreStr) return null
  const parts = scoreStr.split(' - ').map(Number)
  if (parts.length !== 2 || parts.some(isNaN)) return null
  return { home: parts[0], away: parts[1] }
}

// liveMatches: [{ homeExternalId, awayExternalId, score: "1 - 1" }]
export function projectStandings(standings, liveMatches) {
  if (!liveMatches?.length) return standings

  let result = standings.map(s => ({ ...s }))

  liveMatches.forEach(({ homeExternalId, awayExternalId, score }) => {
    const parsed = parseScore(score)
    if (!parsed) return
    const { home: hg, away: ag } = parsed

    result = result.map(s => {
      const isHome = s.team_external_id === homeExternalId
      const isAway = s.team_external_id === awayExternalId
      if (!isHome && !isAway) return s

      const myGoals    = isHome ? hg : ag
      const theirGoals = isHome ? ag : hg
      const deltaW     = myGoals > theirGoals ? 1 : 0
      const deltaD     = myGoals === theirGoals ? 1 : 0
      const deltaL     = myGoals < theirGoals ? 1 : 0
      const deltaPts   = deltaW * 3 + deltaD

      return {
        ...s,
        games_played:   (s.games_played   || 0) + 1,
        wins:           (s.wins           || 0) + deltaW,
        draws:          (s.draws          || 0) + deltaD,
        loses:          (s.loses          || 0) + deltaL,
        scored_goals:   (s.scored_goals   || 0) + myGoals,
        received_goals: (s.received_goals || 0) + theirGoals,
        points:         (s.points         || 0) + deltaPts,
        home_wins:  isHome ? (s.home_wins  || 0) + deltaW : s.home_wins,
        home_draws: isHome ? (s.home_draws || 0) + deltaD : s.home_draws,
        home_loses: isHome ? (s.home_loses || 0) + deltaL : s.home_loses,
        away_wins:  isAway ? (s.away_wins  || 0) + deltaW : s.away_wins,
        away_draws: isAway ? (s.away_draws || 0) + deltaD : s.away_draws,
        away_loses: isAway ? (s.away_loses || 0) + deltaL : s.away_loses,
      }
    })
  })

  return result
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const gdA = (a.scored_goals || 0) - (a.received_goals || 0)
      const gdB = (b.scored_goals || 0) - (b.received_goals || 0)
      if (gdB !== gdA) return gdB - gdA
      return (b.scored_goals || 0) - (a.scored_goals || 0)
    })
    .map((s, i) => ({ ...s, position: i + 1 }))
}
