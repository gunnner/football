import { useState } from 'react'

// goalTarget zones from the API map to a 3×3 grid on the goal face.
// "Close*" = close-range, mapped to Low zones.
const ZONE_COORDS = {
  'Low Left':    true, 'Low Centre':  true, 'Low Right':   true,
  'Mid Left':    true, 'Mid Centre':  true, 'Mid Right':   true,
  'High Left':   true, 'High Centre': true, 'High Right':  true,
  'CloseLeft':   true, 'CloseRight':  true, 'CloseCentre': true,
}

// Normalize Close* → Low*
function normalizeZone(zone) {
  if (!zone) return null
  if (zone === 'CloseLeft')   return 'Low Left'
  if (zone === 'CloseRight')  return 'Low Right'
  if (zone === 'CloseCentre') return 'Low Centre'
  return ZONE_COORDS[zone] ? zone : null
}

const OUTCOME_STYLE = {
  'Goal':    { fill: '#22c55e', label: 'Goal' },
  'Saved':   { fill: '#eab308', label: 'Saved' },
  'Blocked': { fill: '#ef4444', label: 'Blocked' },
  'Missed':  { fill: '#6b7280', label: 'Missed' },
}

// Zone grid — 3 cols × 3 rows inside viewBox 0 0 150 60 (interior x=5..145, y=5..55)
const ZONE_GRID = [
  { zone: 'High Left',   col: 0, row: 0 },
  { zone: 'High Centre', col: 1, row: 0 },
  { zone: 'High Right',  col: 2, row: 0 },
  { zone: 'Mid Left',    col: 0, row: 1 },
  { zone: 'Mid Centre',  col: 1, row: 1 },
  { zone: 'Mid Right',   col: 2, row: 1 },
  { zone: 'Low Left',    col: 0, row: 2 },
  { zone: 'Low Centre',  col: 1, row: 2 },
  { zone: 'Low Right',   col: 2, row: 2 },
]

const CELL_W = 140 / 3
const CELL_H = 50  / 3
const ON_GOAL_OUTCOMES = ['Goal', 'Saved', 'Blocked']

function GoalFace({ shots }) {
  const [tooltip, setTooltip] = useState(null)

  // Only Goal/Saved/Blocked go on the goal face — Missed excluded
  const onGoal = shots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome))

  const byZone = {}
  onGoal.forEach(s => {
    const zone = normalizeZone(s.goal_target)
    if (!zone) return
    if (!byZone[zone]) byZone[zone] = {}
    byZone[zone][s.outcome] = (byZone[zone][s.outcome] || 0) + 1
  })

  return (
    <div className="relative">
      <svg viewBox="0 0 150 60" className="w-full max-w-sm mx-auto overflow-visible">
        {/* Net background */}
        <rect x="5" y="5" width="140" height="50" fill="#0f172a" />

        {/* 3×3 zone cells */}
        {ZONE_GRID.map(({ zone, col, row }) => {
          const counts = byZone[zone] || {}
          const total  = ON_GOAL_OUTCOMES.reduce((s, o) => s + (counts[o] || 0), 0)
          const cx = 5 + col * CELL_W
          const cy = 5 + row * CELL_H

          const BAR_H = 3.5
          const BAR_Y = cy + CELL_H - BAR_H - 1
          const BAR_X = cx + 1
          const BAR_W = CELL_W - 2
          let xOffset = BAR_X

          const tooltipLines = total > 0
            ? ON_GOAL_OUTCOMES.filter(o => counts[o]).map(o => `${counts[o]} ${o}`)
            : []

          return (
            <g
              key={zone}
              onMouseEnter={e => total > 0 && setTooltip({ zone, lines: tooltipLines, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: total > 0 ? 'pointer' : 'default' }}
            >
              <rect x={cx} y={cy} width={CELL_W} height={CELL_H} fill="#1e293b" stroke="#334155" strokeWidth="0.5" />

              {total > 0 && (
                <text x={cx + CELL_W / 2} y={cy + (CELL_H - BAR_H - 1) / 2}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="5.5" fontWeight="bold" fill="white">
                  {total}
                </text>
              )}

              {total > 0 && ON_GOAL_OUTCOMES.map(outcome => {
                const count = counts[outcome] || 0
                if (count === 0) return null
                const segW = (count / total) * BAR_W
                const seg = <rect key={outcome} x={xOffset} y={BAR_Y} width={segW} height={BAR_H} fill={OUTCOME_STYLE[outcome].fill} rx="0.5" />
                xOffset += segW
                return seg
              })}
            </g>
          )
        })}

        {/* Goalposts */}
        <rect x="3"   y="3" width="4"   height="53" fill="#9ca3af" rx="1" />
        <rect x="143" y="3" width="4"   height="53" fill="#9ca3af" rx="1" />
        <rect x="3"   y="3" width="144" height="4"  fill="#9ca3af" rx="1" />
      </svg>

      {/* Custom tooltip */}
      {tooltip && (
        <div className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}>
          <p className="text-gray-400 font-semibold mb-1">{tooltip.zone}</p>
          {tooltip.lines.map(l => <p key={l} className="text-gray-200">{l}</p>)}
        </div>
      )}
    </div>
  )
}

function MissedList({ shots, isHome }) {
  const missed = shots.filter(s => s.outcome === 'Missed')
  if (missed.length === 0) return null

  return (
    <div className={`text-xs text-gray-500 mt-1 ${isHome ? '' : 'text-right'}`}>
      <span className="font-medium text-gray-400">{missed.length} missed</span>
      {' — '}
      {missed.map((s, i) => (
        <span key={i}>{s.player_name}{s.time ? ` ${s.time}` : ''}{i < missed.length - 1 ? ', ' : ''}</span>
      ))}
    </div>
  )
}

function ShotList({ shots, isHome }) {
  const onGoal = shots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome))
  if (onGoal.length === 0) return <p className="text-xs text-gray-600 text-center py-4">No shots on target</p>

  return (
    <div className="space-y-1">
      {onGoal.map((s, i) => {
        const style = OUTCOME_STYLE[s.outcome] ?? { fill: '#6b7280' }
        return (
          <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${isHome ? '' : 'flex-row-reverse text-right'}`}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.fill }} />
            <span className="text-gray-400 flex-shrink-0">{s.time}</span>
            {s.player_path
              ? <a href={s.player_path} className="text-gray-200 truncate hover:text-white hover:underline">{s.player_name}</a>
              : <span className="text-gray-200 truncate">{s.player_name}</span>
            }
            <span className="text-gray-500 flex-shrink-0">{s.outcome}</span>
          </div>
        )
      })}
    </div>
  )
}

function ProbabilityBars({ predictions, homeTeam, awayTeam, isLive }) {
  if (!isLive || !predictions) return null
  const pred = predictions.live ?? predictions.prematch
  if (!pred) return null

  const rows = [
    { label: homeTeam.name, pct: parseFloat(pred.home_pct), color: 'bg-blue-500' },
    { label: 'Draw',        pct: parseFloat(pred.draw_pct), color: 'bg-gray-500' },
    { label: awayTeam.name, pct: parseFloat(pred.away_pct), color: 'bg-red-500'  },
  ]

  return (
    <div className="bg-gray-900 rounded-xl p-4 mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">
        Win Probability {predictions.live ? '· Live' : '· Pre-match'}
      </p>
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24 truncate text-right">{row.label}</span>
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className={`h-full rounded-full ${row.color} transition-all duration-500`}
                style={{ width: `${row.pct ?? 0}%` }} />
            </div>
            <span className="text-xs text-gray-300 w-10 text-right font-medium">{row.pct?.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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

          {/* Legend */}
          <div className="flex justify-center gap-4 pt-3 px-4">
            {legend.map(([outcome, style]) => (
              <div key={outcome} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: style.fill }} />
                <span className="text-xs text-gray-500">{style.label}</span>
              </div>
            ))}
          </div>

          {/* Shot maps side by side */}
          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <a href={homeTeam.path} className="flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition-opacity">
                {homeTeam.logo && <img src={homeTeam.logo} alt={homeTeam.name} className="w-5 h-5 object-contain" />}
                <p className="text-xs font-semibold text-gray-400">{homeTeam.name}</p>
              </a>
              <GoalFace shots={homeShots} />
              <p className="text-xs text-gray-500 text-center mt-1">{homeShots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome)).length} on target</p>
              <MissedList shots={homeShots} isHome />
            </div>
            <div>
              <a href={awayTeam.path} className="flex items-center justify-center gap-2 mb-2 hover:opacity-80 transition-opacity">
                {awayTeam.logo && <img src={awayTeam.logo} alt={awayTeam.name} className="w-5 h-5 object-contain" />}
                <p className="text-xs font-semibold text-gray-400">{awayTeam.name}</p>
              </a>
              <GoalFace shots={awayShots} />
              <p className="text-xs text-gray-500 text-center mt-1">{awayShots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome)).length} on target</p>
              <MissedList shots={awayShots} isHome={false} />
            </div>
          </div>

          {/* Shot lists — only on target */}
          <div className="grid grid-cols-2 gap-4 px-4 pb-4 border-t border-gray-800 pt-3">
            <ShotList shots={homeShots} isHome />
            <ShotList shots={awayShots} isHome={false} />
          </div>
        </div>
      )}
    </div>
  )
}
