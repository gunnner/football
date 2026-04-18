import MatchLastFive from './MatchLastFive'
import MatchH2H      from './MatchH2H'

// ── Coaches ───────────────────────────────────────────────────────────────────

function Coaches({ homeTeam, awayTeam, homeCoach, awayCoach }) {
  if (!homeCoach && !awayCoach) return null
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Managers</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-800">
        <div className="flex flex-col items-center gap-1 py-3 px-4">
          {homeTeam.logo && (
            <img src={homeTeam.logo} alt={homeTeam.name} className="w-6 h-6 object-contain" />
          )}
          <p className="text-sm font-medium text-gray-200 text-center">{homeCoach ?? '—'}</p>
          <p className="text-[10px] text-gray-500">{homeTeam.name}</p>
        </div>
        <div className="flex flex-col items-center gap-1 py-3 px-4">
          {awayTeam.logo && (
            <img src={awayTeam.logo} alt={awayTeam.name} className="w-6 h-6 object-contain" />
          )}
          <p className="text-sm font-medium text-gray-200 text-center">{awayCoach ?? '—'}</p>
          <p className="text-[10px] text-gray-500">{awayTeam.name}</p>
        </div>
      </div>
    </div>
  )
}

// ── Win Probability ───────────────────────────────────────────────────────────

function WinProbability({ homeTeam, awayTeam, prediction }) {
  if (!prediction) return null
  const home = prediction.home_pct
  const draw = prediction.draw_pct
  const away = prediction.away_pct
  if (home == null && draw == null && away == null) return null

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Win Probability</p>
      </div>
      <div className="px-4 py-3">
        <div className="flex text-xs text-gray-400 justify-between mb-1.5">
          <span>{homeTeam.name}</span>
          <span>Draw</span>
          <span>{awayTeam.name}</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
          {home > 0 && <div className="bg-blue-600" style={{ width: `${home}%` }} />}
          {draw > 0 && <div className="bg-gray-600" style={{ width: `${draw}%` }} />}
          {away > 0 && <div className="bg-orange-600" style={{ width: `${away}%` }} />}
        </div>
        <div className="flex text-xs font-semibold justify-between mt-1.5">
          <span className="text-blue-400">{home != null ? `${home}%` : ''}</span>
          <span className="text-gray-400">{draw != null ? `${draw}%` : ''}</span>
          <span className="text-orange-400">{away != null ? `${away}%` : ''}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function MatchOverview({
  homeTeam,
  awayTeam,
  homeCoach,
  awayCoach,
  predictions,
  lastFive,
  h2h,
  isPreMatch = false,
}) {
  return (
    <div className="space-y-3">
      <Coaches
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        homeCoach={homeCoach}
        awayCoach={awayCoach}
      />

      {isPreMatch && (
        <WinProbability
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          prediction={predictions?.prematch}
        />
      )}

      <MatchLastFive
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        lastFive={lastFive}
      />

      <MatchH2H
        matches={h2h}
        homeTeam={homeTeam}
      />
    </div>
  )
}
