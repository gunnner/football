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

// Derive the opponent team (not homeTeam) from match list
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
    <div className="px-4 py-3 border-b border-gray-800 space-y-2.5">
      {/* Win bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {homeW > 0 && <div className="bg-blue-600"   style={{ width: `${homeW}%` }} />}
        {drawW > 0 && <div className="bg-gray-600"   style={{ width: `${drawW}%` }} />}
        {awayW > 0 && <div className="bg-orange-600" style={{ width: `${awayW}%` }} />}
      </div>

      {/* Wins counts */}
      <div className="grid grid-cols-3 text-center">
        <div>
          <p className="text-xl font-bold text-blue-400">{homeWins}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">{homeTeam.name}</p>
        </div>
        <div>
          <p className="text-xl font-bold text-gray-400">{draws}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">Draws</p>
        </div>
        <div>
          <p className="text-xl font-bold text-orange-400">{awayWins}</p>
          <p className="text-[10px] text-gray-500 mt-0.5 truncate">{awayTeam?.name ?? 'Opponent'}</p>
        </div>
      </div>

      {/* Goals stats */}
      <div className="flex justify-center gap-6 pt-0.5">
        <div className="text-center">
          <p className="text-xs text-gray-500">Total goals</p>
          <p className="text-sm font-semibold text-gray-200">{homeGoals + awayGoals}</p>
        </div>
        <div className="w-px bg-gray-800" />
        <div className="text-center">
          <p className="text-xs text-gray-500">Avg per game</p>
          <p className="text-sm font-semibold text-gray-200">
            {total > 0 ? ((homeGoals + awayGoals) / total).toFixed(1) : '—'}
          </p>
        </div>
        <div className="w-px bg-gray-800" />
        <div className="text-center">
          <p className="text-xs text-gray-500 truncate">{homeTeam.name} avg</p>
          <p className="text-sm font-semibold text-blue-400">{avgHome}</p>
        </div>
        <div className="w-px bg-gray-800" />
        <div className="text-center">
          <p className="text-xs text-gray-500 truncate">{awayTeam?.name ?? 'Opponent'} avg</p>
          <p className="text-sm font-semibold text-orange-400">{avgAway}</p>
        </div>
      </div>
    </div>
  )
}

export default function MatchH2H({ matches, homeTeam }) {
  if (!matches || matches.length === 0) return null

  const awayTeam = deriveAwayTeam(matches, homeTeam)

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
          Head to Head — last {matches.length} meeting{matches.length !== 1 ? 's' : ''}
        </p>
      </div>

      <H2HSummary matches={matches} homeTeam={homeTeam} awayTeam={awayTeam} />

      <div className="divide-y divide-gray-800/60">
        {matches.map((m, i) => {
          const homeName = m.home_team?.name ?? '?'
          const awayName = m.away_team?.name ?? '?'
          const homeLogo = m.home_team?.logo
          const awayLogo = m.away_team?.logo
          const score    = m.score_current ?? '—'
          const date     = formatDate(m.date)
          const href     = m.match_path ?? null
          const Row      = href ? 'a' : 'div'

          return (
            <Row
              key={m.match_path ?? i}
              {...(href ? { href } : {})}
              className="grid grid-cols-[1fr_auto_1fr] items-center px-3 py-2.5 gap-2 hover:bg-gray-800/40 transition-colors"
            >
              {/* Home side */}
              <div className="flex items-center gap-1.5 min-w-0">
                {homeLogo && (
                  <img src={homeLogo} alt={homeName} className="w-4 h-4 object-contain shrink-0" />
                )}
                <span className="text-sm text-gray-300 truncate">{homeName}</span>
              </div>

              {/* Score + date */}
              <div className="flex flex-col items-center gap-0.5 min-w-[70px]">
                <span className="font-mono text-sm font-semibold text-white">{score}</span>
                {date && <span className="text-[10px] text-gray-600">{date}</span>}
              </div>

              {/* Away side */}
              <div className="flex items-center justify-end gap-1.5 min-w-0">
                <span className="text-sm text-gray-300 truncate">{awayName}</span>
                {awayLogo && (
                  <img src={awayLogo} alt={awayName} className="w-4 h-4 object-contain shrink-0" />
                )}
              </div>
            </Row>
          )
        })}
      </div>
    </div>
  )
}
