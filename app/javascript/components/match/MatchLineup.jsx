import { POSITION_COLORS } from '../../constants/positions'
import { BADGE_SVG, SUB_ON_SVG } from './lineup/badges'
import PitchSVG        from './lineup/PitchSVG'
import SubstitutesList from './lineup/SubstitutesList'

function buildEventMap(events) {
  const map = {}
  for (const e of events) {
    if (e.player_external_id) {
      ;(map[e.player_external_id] ||= []).push(e)
    }
    if (e.assisting_player_external_id) {
      const tag = e.type === 'Substitution' ? { ...e, _sub_on: true } : { ...e, _assist: true }
      ;(map[e.assisting_player_external_id] ||= []).push(tag)
    }
  }
  return map
}

function LastKnownBanner({ homeLineup, awayLineup }) {
  const src = homeLineup?.source_match ?? awayLineup?.source_match
  return (
    <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-3 py-2.5">
      <span className="text-yellow-500 text-sm shrink-0">⚠</span>
      <div className="text-xs text-yellow-400/90">
        <span className="font-semibold">Last known lineup</span>
        {src && (
          <span className="text-yellow-500/70 ml-1">
            — from {src.home_team} vs {src.away_team} ({src.date})
          </span>
        )}
        <p className="text-yellow-600/80 mt-0.5">Official lineup has not been announced yet.</p>
      </div>
    </div>
  )
}

const EVENT_LEGEND = [
  { svgKey: 'goal',    label: 'Goal' },
  { svgKey: 'ownGoal', label: 'Own goal' },
  { svgKey: 'assist',  label: 'Assist' },
  { svgKey: 'yellow',  label: 'Yellow card' },
  { svgKey: 'red',     label: 'Red card' },
  { svgKey: 'sub',     label: 'Substituted' },
]

export default function MatchLineup({ homeTeam, awayTeam, lineups, events = [], lastKnown = false }) {
  if (!lineups || lineups.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-center text-gray-500 py-8">No lineups yet</p>
      </div>
    )
  }

  const eventMap   = buildEventMap(events)
  const homeLineup = lineups.find(l => l.team_external_id === homeTeam.external_id)
  const awayLineup = lineups.find(l => l.team_external_id === awayTeam.external_id)
  const homeRows   = homeLineup?.initial_lineup || []
  const awayRows   = awayLineup?.initial_lineup || []
  const hasSubs    = !lastKnown && (homeLineup?.substitutes?.length > 0 || awayLineup?.substitutes?.length > 0)
  const hasEvents  = events.length > 0

  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-3">
      {lastKnown && <LastKnownBanner homeLineup={homeLineup} awayLineup={awayLineup} />}

      <div className="flex justify-between items-center text-xs">
        <span className="font-semibold text-gray-200">
          {homeTeam.path
            ? <a href={homeTeam.path} className="hover:text-blue-400 transition-colors">{homeTeam.name}</a>
            : homeTeam.name
          }
          {homeLineup?.formation && (
            <span className="text-gray-500 font-normal ml-1">· {homeLineup.formation}</span>
          )}
        </span>
        <span className="font-semibold text-gray-200 text-right">
          {awayLineup?.formation && (
            <span className="text-gray-500 font-normal mr-1">{awayLineup.formation} ·</span>
          )}
          {awayTeam.path
            ? <a href={awayTeam.path} className="hover:text-blue-400 transition-colors">{awayTeam.name}</a>
            : awayTeam.name
          }
        </span>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {Object.entries(POSITION_COLORS).map(([pos, color]) => (
          <div key={pos} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-xs text-gray-500">{pos}</span>
          </div>
        ))}
      </div>

      {hasEvents && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {EVENT_LEGEND.map(({ svgKey, label }) => (
            <div key={svgKey} className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="-3.5 -3.5 7 7" className="flex-shrink-0">
                {BADGE_SVG[svgKey]}
              </svg>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="-3.5 -3.5 7 7" className="flex-shrink-0">
              {SUB_ON_SVG}
            </svg>
            <span className="text-xs text-gray-500">Came on</span>
          </div>
        </div>
      )}

      <PitchSVG homeRows={homeRows} awayRows={awayRows} eventMap={eventMap} />

      {hasSubs && (
        <div className="border-t border-gray-800 pt-3">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">Substitutes</p>
          <div className="flex justify-center gap-12">
            <SubstitutesList lineup={homeLineup} eventMap={eventMap} />
            <div className="w-px bg-gray-800 self-stretch" />
            <SubstitutesList lineup={awayLineup} eventMap={eventMap} />
          </div>
        </div>
      )}
    </div>
  )
}
