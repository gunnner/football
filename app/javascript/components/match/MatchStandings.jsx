import { parseScore, projectStandings } from '../../services/standings'

const COL = '2.5rem minmax(8rem,1fr) 3rem 3rem 3rem 3rem 7rem 3.5rem 5.5rem 5.5rem'

// liveMatches: [{ homeExternalId, awayExternalId, score: "1 - 1" }]
export default function MatchStandings({ standings, liveMatches }) {
  if (!standings || standings.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-center text-gray-500 py-8">No standings available</p>
      </div>
    )
  }

  const hasLive   = liveMatches?.some(m => m.score != null)
  const projected = hasLive ? projectStandings(standings, liveMatches) : standings

  // Set of team_external_ids currently playing
  const liveTeamIds = new Set(
    (liveMatches ?? []).flatMap(m => [m.homeExternalId, m.awayExternalId])
  )

  // Map external_id → score from their perspective
  // liveScoreByTeam: external_id → { label, color }
  const liveScoreByTeam = {}
  ;(liveMatches ?? []).forEach(({ homeExternalId, awayExternalId, score }) => {
    const parsed = parseScore(score)
    if (!parsed) return
    const { home: hg, away: ag } = parsed
    const label = `${hg} - ${ag}`

    const homeColor = hg > ag ? 'text-green-400' : hg < ag ? 'text-red-400' : 'text-yellow-400'
    const awayColor = ag > hg ? 'text-green-400' : ag < hg ? 'text-red-400' : 'text-yellow-400'

    liveScoreByTeam[homeExternalId] = { label, color: homeColor }
    liveScoreByTeam[awayExternalId] = { label, color: awayColor }
  })

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {hasLive && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-800/40">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live projected standings based on current score</span>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-2 text-xs text-gray-500 uppercase border-b border-gray-800 tracking-wider grid"
           style={{ gridTemplateColumns: COL }}>
        <div className="text-center">#</div>
        <div>Team</div>
        <div className="text-center">P</div>
        <div className="text-center">W</div>
        <div className="text-center">D</div>
        <div className="text-center">L</div>
        <div className="text-center">Goals</div>
        <div className="text-center font-bold">Pts</div>
        <div className="text-center">Home</div>
        <div className="text-center">Away</div>
      </div>

      {projected.map(s => {
        const isHighlighted = liveTeamIds.has(s.team_external_id)
        const gf = s.scored_goals   || 0
        const ga = s.received_goals || 0
        const gd = gf - ga
        const gdColor = gd > 0 ? 'text-green-400' : gd < 0 ? 'text-red-400' : 'text-yellow-400'
        const gdStr   = gd > 0 ? `+${gd}` : `${gd}`
        const liveScore  = liveScoreByTeam[s.team_external_id]

        return (
          <a
            key={s.position}
            href={s.team_path}
            className={`px-4 py-3 border-b border-gray-800 last:border-0 items-center transition-colors grid
              ${isHighlighted ? 'bg-blue-950/60 hover:bg-blue-950/80' : 'hover:bg-gray-800'}`}
            style={{ gridTemplateColumns: COL }}
          >
            <div className="text-center text-gray-400 text-sm">{s.position}</div>
            <div className="flex items-center gap-2 min-w-0">
              {s.logo && <img src={s.logo} alt={s.team_name} className="w-5 h-5 object-contain flex-shrink-0" />}
              <span className={`text-sm truncate ${isHighlighted ? 'text-white font-semibold' : 'text-gray-100 font-medium'}`}>
                {s.team_name}
              </span>
              {isHighlighted && hasLive && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
              )}
              {liveScore && (
                <span className={`text-xs font-bold whitespace-nowrap flex-shrink-0 ${liveScore.color}`}>
                  {liveScore.label}
                </span>
              )}
            </div>
            <div className="text-center text-gray-400 text-sm">{s.games_played}</div>
            <div className="text-center text-gray-400 text-sm">{s.wins}</div>
            <div className="text-center text-gray-400 text-sm">{s.draws}</div>
            <div className="text-center text-gray-400 text-sm">{s.loses}</div>
            <div className="text-center text-sm">
              <span className="text-gray-200">{gf}:{ga}</span>
              <span className={`text-xs ml-1 ${gdColor}`}>({gdStr})</span>
            </div>
            <div className="text-center text-white font-bold text-sm">{s.points}</div>
            <div className="text-center text-xs">
              <span className="text-green-400 font-medium">{s.home_wins}W</span>
              <span className="text-orange-400 mx-0.5">{s.home_draws}D</span>
              <span className="text-red-400">{s.home_loses}L</span>
            </div>
            <div className="text-center text-xs">
              <span className="text-green-400 font-medium">{s.away_wins}W</span>
              <span className="text-orange-400 mx-0.5">{s.away_draws}D</span>
              <span className="text-red-400">{s.away_loses}L</span>
            </div>
          </a>
        )
      })}
    </div>
  )
}
