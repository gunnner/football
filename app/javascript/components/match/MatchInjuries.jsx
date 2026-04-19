function PlayerRow({ player, badge, badgeColor }) {
  const nameEl = player.player_path ? (
    <a href={player.player_path} className="text-xs font-medium text-gray-200 hover:text-blue-400 transition-colors truncate block">
      {player.player_name}
    </a>
  ) : (
    <span className="text-xs font-medium text-gray-200 truncate block">{player.player_name}</span>
  )

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-800/40 last:border-0">
      {player.player_logo ? (
        <div className="w-6 h-6 rounded-full shrink-0 bg-gray-800 overflow-hidden">
          <img src={player.player_logo} alt={player.player_name} className="w-full" style={{ height: '200%', objectFit: 'cover', objectPosition: '50% 0%' }} />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-800 shrink-0 flex items-center justify-center text-xs">👤</div>
      )}
      <div className="min-w-0 flex-1">
        {nameEl}
        <p className={`text-[10px] mt-0.5 ${badgeColor}`}>{badge}</p>
      </div>
    </div>
  )
}

function TeamColumn({ team, injuries, suspensions }) {
  const hasInjuries    = injuries.length > 0
  const hasSuspensions = suspensions.length > 0

  return (
    <div className="flex-1 min-w-0 p-3">
      <div className="flex items-center justify-center gap-1.5 mb-2.5">
        {team.logo && <img src={team.logo} alt={team.name} className="w-4 h-4 object-contain shrink-0" />}
        {team.path ? (
          <a href={team.path} className="text-xs font-semibold text-gray-300 hover:text-blue-400 transition-colors truncate">{team.name}</a>
        ) : (
          <span className="text-xs font-semibold text-gray-300 truncate">{team.name}</span>
        )}
      </div>

      {!hasInjuries && !hasSuspensions && (
        <p className="text-[10px] text-gray-600 text-center py-2">No absences</p>
      )}

      {hasSuspensions && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-orange-500/70 uppercase tracking-wider mb-1">Suspended</p>
          {suspensions.map((s, i) => (
            <PlayerRow key={i} player={s} badge={s.detail} badgeColor="text-orange-400/70" />
          ))}
        </div>
      )}

      {hasInjuries && (
        <div>
          <p className="text-[10px] font-semibold text-red-500/70 uppercase tracking-wider mb-1">Injured</p>
          {injuries.map((inj, i) => (
            <PlayerRow key={i} player={inj} badge={inj.reason} badgeColor="text-red-400/70" />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MatchInjuries({ homeTeam, awayTeam, injuries }) {
  if (!injuries) return null

  const homeInjuries    = injuries.home?.injuries    ?? injuries.home ?? []
  const awayInjuries    = injuries.away?.injuries    ?? injuries.away ?? []
  const homeSuspensions = injuries.home?.suspensions ?? []
  const awaySuspensions = injuries.away?.suspensions ?? []

  const hasAny = homeInjuries.length + awayInjuries.length + homeSuspensions.length + awaySuspensions.length > 0
  if (!hasAny) return null

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Injuries & Suspensions</p>
      </div>
      <div className="flex divide-x divide-gray-800">
        <TeamColumn team={homeTeam} injuries={homeInjuries} suspensions={homeSuspensions} />
        <TeamColumn team={awayTeam} injuries={awayInjuries} suspensions={awaySuspensions} />
      </div>
    </div>
  )
}
