import GoalFace, { OUTCOME_STYLE, ON_GOAL_OUTCOMES } from './shots/GoalFace'
import { CombinedShotList, ProbabilityBars } from './shots/ShotList'

export default function ShotMap({ shots, homeTeam, awayTeam, homeExternalId, awayExternalId, predictions, isLive }) {
  const homeShots = shots.filter(s => String(s.team_external_id) === String(homeExternalId))
  const awayShots = shots.filter(s => String(s.team_external_id) === String(awayExternalId))

  const legend = ON_GOAL_OUTCOMES.map(o => [o, OUTCOME_STYLE[o]])

  if (shots.length === 0 && !predictions) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-center text-gray-500 py-8">No shot data available yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ProbabilityBars predictions={predictions} homeTeam={homeTeam} awayTeam={awayTeam} isLive={isLive} />

      {shots.length > 0 && (
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Shot Map</p>
          </div>

          <div className="flex justify-center gap-4 pt-3 px-4">
            {legend.map(([outcome, style]) => (
              <div key={outcome} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.fill }} />
                <span className="text-xs text-gray-500">{style.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <a href={homeTeam.path} className="flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition-opacity">
                {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="w-5 h-5 object-contain" />}
                <p className="text-xs font-semibold text-gray-400">{homeTeam.name}</p>
              </a>
              <GoalFace shots={homeShots} />
              <p className="text-xs text-gray-500 text-center mt-1">{homeShots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome)).length} on target</p>
            </div>
            <div>
              <a href={awayTeam.path} className="flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition-opacity">
                {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="w-5 h-5 object-contain" />}
                <p className="text-xs font-semibold text-gray-400">{awayTeam.name}</p>
              </a>
              <GoalFace shots={awayShots} />
              <p className="text-xs text-gray-500 text-center mt-1">{awayShots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome)).length} on target</p>
            </div>
          </div>

          <div className="px-4 pb-4 border-t border-gray-800 pt-3">
            <CombinedShotList homeShots={homeShots} awayShots={awayShots} homeExternalId={homeExternalId} />
          </div>
        </div>
      )}
    </div>
  )
}
