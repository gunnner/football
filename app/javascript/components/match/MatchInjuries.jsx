function formatDate(str) {
  if (!str) return null
  const d = new Date(str)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function InjuryCard({ injury }) {
  const from   = formatDate(injury.from_date)
  const to     = injury.to_date ? formatDate(injury.to_date) : 'Ongoing'
  const missed = injury.missed_games

  const nameEl = injury.player_path ? (
    <a href={injury.player_path} className="text-sm font-medium text-gray-200 hover:text-blue-400 transition-colors truncate block">
      {injury.player_name}
    </a>
  ) : (
    <p className="text-sm font-medium text-gray-200 truncate">{injury.player_name}</p>
  )

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-gray-800/50 last:border-0">
      {injury.player_logo ? (
        <img
          src={injury.player_logo}
          alt={injury.player_name}
          className="w-8 h-8 rounded-full object-cover shrink-0 bg-gray-800"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0 flex items-center justify-center text-base">
          👤
        </div>
      )}
      <div className="min-w-0 flex-1">
        {nameEl}
        {injury.reason && (
          <p className="text-xs text-red-400/80 mt-0.5">{injury.reason}</p>
        )}
        <p className="text-[10px] text-gray-600 mt-0.5">
          {from && <span>{from}</span>}
          {from && <span className="mx-1">—</span>}
          <span>{to}</span>
          {missed > 0 && (
            <span className="ml-1.5 text-gray-500">· {missed} game{missed !== 1 ? 's' : ''} missed</span>
          )}
        </p>
      </div>
    </div>
  )
}

function TeamHeader({ team }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-3">
      {team.logo && (
        <img src={team.logo} alt={team.name} className="w-4 h-4 object-contain shrink-0" />
      )}
      {team.path ? (
        <a href={team.path} className="text-xs font-semibold text-gray-300 hover:text-blue-400 transition-colors truncate">
          {team.name}
        </a>
      ) : (
        <p className="text-xs font-semibold text-gray-300 truncate">{team.name}</p>
      )}
    </div>
  )
}

function TeamInjuries({ team, injuries }) {
  return (
    <div className="flex-1 min-w-0">
      <TeamHeader team={team} />
      {injuries.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-3">No known injuries</p>
      ) : (
        <div className="px-1">
          {injuries.map((inj, i) => <InjuryCard key={i} injury={inj} />)}
        </div>
      )}
    </div>
  )
}

export default function MatchInjuries({ homeTeam, awayTeam, injuries }) {
  if (!injuries) return null
  const home = injuries.home ?? []
  const away = injuries.away ?? []
  if (home.length === 0 && away.length === 0) return null

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Injuries & Unavailability</p>
      </div>
      <div className="flex divide-x divide-gray-800">
        <div className="flex-1 min-w-0 p-3">
          <TeamInjuries team={homeTeam} injuries={home} />
        </div>
        <div className="flex-1 min-w-0 p-3">
          <TeamInjuries team={awayTeam} injuries={away} />
        </div>
      </div>
    </div>
  )
}
