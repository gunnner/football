import { useState } from 'react'
import styles from './GoalFace.module.css'

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

// Missed shots outside the goal frame — map to outer column (left/centre/right)
function normalizeMissedCol(zone) {
  if (!zone) return 'centre'
  const z = zone.toLowerCase()
  if (z.includes('left'))  return 'left'
  if (z.includes('right')) return 'right'
  return 'centre'
}

export const OUTCOME_STYLE = {
  'Goal':    { fill: '#22c55e', label: 'Goal' },
  'Saved':   { fill: '#eab308', label: 'Saved' },
  'Blocked': { fill: '#ef4444', label: 'Blocked' },
  'Missed':  { fill: '#6b7280', label: 'Missed' },
  'Post':    { fill: '#f97316', label: 'Post' },
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

// SVG layout constants
// Goal frame: x=15..135, y=14..64  (width=120, height=50)
// Outer miss zones above: y=4..13  (height=9)
// Outer miss zones sides: x=4..14 and x=136..146
const GX = 15      // goal left x
const GY = 14      // goal top y
const GW = 120     // goal width
const GH = 50      // goal height
const CW = GW / 3  // cell width
const CH = GH / 3  // cell height

const MISS_H   = 9          // height of above-goal miss strip
const SVG_W    = GX + GW + GX            // symmetric padding
const SVG_H    = GY + GH + 4

export const ON_GOAL_OUTCOMES = ['Goal', 'Saved', 'Blocked']

// Three outer columns above the goal
const OUTER_COLS = [
  { key: 'left',   x: GX,            label: '←' },
  { key: 'centre', x: GX + CW,       label: '↑' },
  { key: 'right',  x: GX + CW * 2,   label: '→' },
]

export default function GoalFace({ shots }) {
  const [tooltip, setTooltip] = useState(null)

  const onGoal  = shots.filter(s => ON_GOAL_OUTCOMES.includes(s.outcome))
  const missed  = shots.filter(s => s.outcome === 'Missed')

  // Map on-goal shots to 3×3 grid
  const byZone = {}
  onGoal.forEach(s => {
    const zone = normalizeZone(s.goal_target)
    if (!zone) return
    if (!byZone[zone]) byZone[zone] = { counts: {}, shots: [] }
    byZone[zone].counts[s.outcome] = (byZone[zone].counts[s.outcome] || 0) + 1
    byZone[zone].shots.push(s)
  })

  // Map missed shots to outer columns (left / centre / right)
  const missedByCol = { left: [], centre: [], right: [] }
  missed.forEach(s => {
    const col = normalizeMissedCol(s.goal_target)
    missedByCol[col].push(s)
  })

  const totalMissed = missed.length

  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className={styles.svg}>

        {/* ── Outer miss zones above the goal ── */}
        {totalMissed > 0 && OUTER_COLS.map(({ key, x }) => {
          const shots = missedByCol[key]
          if (!shots.length) return null
          const tooltipLines = [{ outcome: 'Missed', label: `${shots.length} Missed` }]
          return (
            <g key={`miss-top-${key}`}
              onMouseEnter={e => setTooltip({ zone: 'Off target', lines: tooltipLines, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: 'pointer' }}>
              <rect x={x} y={GY - MISS_H} width={CW} height={MISS_H - 1}
                fill="#1c2433" stroke="#334155" strokeWidth="0.5" rx="0.5" />
              <text x={x + CW / 2} y={GY - MISS_H / 2}
                textAnchor="middle" dominantBaseline="central"
                fontSize="4.5" fill="#6b7280" fontWeight="bold">
                {shots.length}
              </text>
            </g>
          )
        })}


        {/* ── Goal background ── */}
        <rect x={GX} y={GY} width={GW} height={GH} fill="#0f172a" />

        {/* ── 3×3 inner grid ── */}
        {ZONE_GRID.map(({ zone, col, row }) => {
          const zoneData = byZone[zone] || { counts: {}, shots: [] }
          const counts   = zoneData.counts
          const total    = ON_GOAL_OUTCOMES.reduce((s, o) => s + (counts[o] || 0), 0)
          const cx = GX + col * CW
          const cy = GY + row * CH

          const BAR_H = 3.5
          const BAR_Y = cy + CH - BAR_H - 1
          const BAR_X = cx + 1
          const BAR_W = CW - 2
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
              <rect x={cx} y={cy} width={CW} height={CH} fill="#1e293b" stroke="#334155" strokeWidth="0.5" />

              {total > 0 && (
                <text x={cx + CW / 2} y={cy + (CH - BAR_H - 1) / 2}
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

        {/* ── Goal frame (white posts & crossbar) ── */}
        <rect x={GX - 2}      y={GY - 2}      width={3}      height={GH + 4} fill="white" rx="0.75" />
        <rect x={GX + GW - 1} y={GY - 2}      width={3}      height={GH + 4} fill="white" rx="0.75" />
        <rect x={GX - 2}      y={GY - 2}      width={GW + 4} height={3}      fill="white" rx="0.75" />
      </svg>

      {tooltip && (
        <div className={styles.tooltip}
          style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}>
          <p className={styles.tooltipZone}>{tooltip.zone}</p>
          {tooltip.lines.map((l, i) => (
            <p key={i} className={styles.tooltipLine} style={{ color: OUTCOME_STYLE[l.outcome]?.fill ?? '#e5e7eb' }}>{l.label}</p>
          ))}
        </div>
      )}
    </div>
  )
}
