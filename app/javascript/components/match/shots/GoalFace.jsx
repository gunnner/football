import { useState } from 'react'

export const ZONE_COORDS = {
  'Low Left':    true, 'Low Centre':  true, 'Low Right':   true,
  'Mid Left':    true, 'Mid Centre':  true, 'Mid Right':   true,
  'High Left':   true, 'High Centre': true, 'High Right':  true,
  'CloseLeft':   true, 'CloseRight':  true, 'CloseCentre': true,
}

export function normalizeZone(zone) {
  if (!zone) return null
  if (zone === 'CloseLeft')   return 'Low Left'
  if (zone === 'CloseRight')  return 'Low Right'
  if (zone === 'CloseCentre') return 'Low Centre'
  return ZONE_COORDS[zone] ? zone : null
}

export const OUTCOME_STYLE = {
  'Goal':    { fill: '#22c55e', label: 'Goal' },
  'Saved':   { fill: '#eab308', label: 'Saved' },
  'Blocked': { fill: '#ef4444', label: 'Blocked' },
  'Missed':  { fill: '#6b7280', label: 'Missed' },
}

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
export const ON_GOAL_OUTCOMES = ['Goal', 'Saved', 'Blocked']

export default function GoalFace({ shots }) {
  const [tooltip, setTooltip] = useState(null)

  const onGoal = shots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome))

  const byZone = {}
  onGoal.forEach(s => {
    const zone = normalizeZone(s.goal_target)
    if (!zone) return
    if (!byZone[zone]) byZone[zone] = { counts: {}, shots: [] }
    byZone[zone].counts[s.outcome] = (byZone[zone].counts[s.outcome] || 0) + 1
    byZone[zone].shots.push(s)
  })

  return (
    <div className="relative">
      <svg viewBox="0 0 150 60" className="w-full max-w-sm mx-auto overflow-visible">
        <rect x="5" y="5" width="140" height="50" fill="#0f172a" />

        {ZONE_GRID.map(({ zone, col, row }) => {
          const zoneData = byZone[zone] || { counts: {}, shots: [] }
          const counts   = zoneData.counts
          const total    = ON_GOAL_OUTCOMES.reduce((s, o) => s + (counts[o] || 0), 0)
          const cx = 5 + col * CELL_W
          const cy = 5 + row * CELL_H

          const BAR_H = 3.5
          const BAR_Y = cy + CELL_H - BAR_H - 1
          const BAR_X = cx + 1
          const BAR_W = CELL_W - 2
          let xOffset = BAR_X

          const tooltipLines = total > 0
            ? ON_GOAL_OUTCOMES.filter(o => counts[o]).flatMap(o => {
                if (o === 'Goal') {
                  return zoneData.shots
                    .filter(s => s.outcome === 'Goal')
                    .map(s => {
                      const name   = s.player_name ? s.player_name.split(' ').pop() : null
                      const detail = [name, s.time ? `${s.time}'` : null].filter(Boolean).join(' ')
                      return { outcome: o, label: detail ? `Goal — ${detail}` : 'Goal' }
                    })
                }
                return [{ outcome: o, label: `${counts[o]} ${o}` }]
              })
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
                const seg  = <rect key={outcome} x={xOffset} y={BAR_Y} width={segW} height={BAR_H} fill={OUTCOME_STYLE[outcome].fill} rx="0.5" />
                xOffset += segW
                return seg
              })}
            </g>
          )
        })}

        <rect x="3"   y="3" width="4"   height="53" fill="#9ca3af" rx="1" />
        <rect x="143" y="3" width="4"   height="53" fill="#9ca3af" rx="1" />
        <rect x="3"   y="3" width="144" height="4"  fill="#9ca3af" rx="1" />
      </svg>

      {tooltip && (
        <div className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}>
          <p className="text-gray-400 font-semibold mb-1">{tooltip.zone}</p>
          {tooltip.lines.map((l, i) => (
            <p key={i} style={{ color: OUTCOME_STYLE[l.outcome]?.fill ?? '#e5e7eb' }}>{l.label}</p>
          ))}
        </div>
      )}
    </div>
  )
}
