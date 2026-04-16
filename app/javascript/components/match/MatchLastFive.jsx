const RESULT_SCORE_COLOR = {
  W: 'text-green-400 font-semibold',
  D: 'text-yellow-400 font-semibold',
  L: 'text-red-400 font-semibold',
}

function TeamColumn({ team, matches }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-400 text-center mb-2 truncate px-1">{team.name}</p>
      {matches.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-2">No recent matches</p>
      ) : (
        matches.map((m, i) => {
          const href        = m.match_id ? `/matches/${m.match_id}` : null
          const scoreColor  = RESULT_SCORE_COLOR[m.result] ?? 'text-gray-400'
          const Row         = href ? 'a' : 'div'

          return (
            <Row
              key={i}
              {...(href ? { href } : {})}
              className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              {/* Home team */}
              {m.home_logo && (
                <img src={m.home_logo} alt={m.home_team} className="w-4 h-4 object-contain shrink-0" />
              )}
              <span className="text-gray-300 truncate flex-1 min-w-0">{m.home_team}</span>

              {/* Score */}
              <span className={`font-mono shrink-0 ${scoreColor}`}>{m.score}</span>

              {/* Away team */}
              <span className="text-gray-300 truncate flex-1 min-w-0 text-right">{m.away_team}</span>
              {m.away_logo && (
                <img src={m.away_logo} alt={m.away_team} className="w-4 h-4 object-contain shrink-0" />
              )}
            </Row>
          )
        })
      )}
    </div>
  )
}

export default function MatchLastFive({ homeTeam, awayTeam, lastFive }) {
  if (!lastFive) return null
  const homeMatches = lastFive.home ?? []
  const awayMatches = lastFive.away ?? []
  if (homeMatches.length === 0 && awayMatches.length === 0) return null

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Last 5 Games</p>
      </div>
      <div className="flex gap-0 divide-x divide-gray-800">
        <div className="flex-1 min-w-0 p-3">
          <TeamColumn team={homeTeam} matches={homeMatches} />
        </div>
        <div className="flex-1 min-w-0 p-3">
          <TeamColumn team={awayTeam} matches={awayMatches} />
        </div>
      </div>
    </div>
  )
}
