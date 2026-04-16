import { POSITION_COLORS } from '../../../constants/positions'
import { BADGE_SVG, badgeForEvent } from './badges'

const W          = 520
const H          = 220
const GK_OFFSET  = 30
const CTR_MARGIN = 18
const R          = 8
const PAD_V      = 36
const MAX_PLAYER_GAP = 44

function EventBadges({ events }) {
  const seen   = new Set()
  const badges = []
  for (const e of events) {
    const b = badgeForEvent(e)
    if (!b) continue
    const dedupeKey = b.key.replace(/-\d+$/, '')
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    badges.push(b)
    if (badges.length === 3) break
  }
  return badges.map((b, i) => (
    <g key={b.key} transform={`translate(${R - 3 + i * 8}, ${-(R + 2)})`}>
      {BADGE_SVG[b.svgKey]}
      {b.time != null && (
        <text textAnchor="middle" y="-6" fontSize="4" fill="rgba(255,255,255,0.7)">{b.time}'</text>
      )}
    </g>
  ))
}

function PlayerDot({ player, x, y, eventMap }) {
  const color        = POSITION_COLORS[player.position] || '#6b7280'
  const lastName     = player.name.split(' ').pop()
  const label        = `${player.number}. ${lastName.length > 12 ? lastName.slice(0, 9) + '…' : lastName}`
  const playerEvents = eventMap[player.id] || []
  const clipId       = `clip-${player.id ?? `${x}-${y}`}`

  const inner = (
    <>
      <circle r={R} fill="#0f172a" stroke={color} strokeWidth="0.7" opacity="0.95" />
      {player.logo
        ? <image href={player.logo} x={-R} y={-R} width={R * 2} height={R * 4}
                 clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMin slice" />
        : <text textAnchor="middle" dominantBaseline="central" fontSize="8">👤</text>
      }
      <text textAnchor="middle" y={R + 7} fontSize="5.5" fill="rgba(255,255,255,0.82)">{label}</text>
      {playerEvents.length > 0 && <EventBadges events={playerEvents} />}
    </>
  )

  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <clipPath id={clipId}><circle r={R} /></clipPath>
      </defs>
      {player.path
        ? <a href={player.path} style={{ cursor: 'pointer' }}>{inner}</a>
        : inner
      }
    </g>
  )
}

function TeamPlayers({ rows, isHome, eventMap }) {
  const halfUsable = W / 2 - GK_OFFSET - CTR_MARGIN
  const innerH     = (H - PAD_V * 2) * 0.88

  return rows.map((row, rowIndex) => {
    const t = rows.length > 1 ? rowIndex / (rows.length - 1) : 0.5
    const x = isHome
      ? GK_OFFSET + t * halfUsable
      : W - GK_OFFSET - t * halfUsable

    const count  = row.length
    const spread = count === 1 ? 0 : Math.min(innerH, (count - 1) * MAX_PLAYER_GAP)
    const topY   = H / 2 - spread / 2

    return row.map((player, colIndex) => {
      const y = count === 1
        ? H / 2
        : topY + (colIndex / (count - 1)) * spread
      return (
        <PlayerDot
          key={player.id ?? `${rowIndex}-${colIndex}`}
          player={player} x={x} y={y} eventMap={eventMap}
        />
      )
    })
  })
}

export default function PitchSVG({ homeRows, awayRows, eventMap }) {
  const cx = W / 2
  const cy = H / 2
  const paW = 62, paH = 108, paY = (H - paH) / 2
  const gaW = 22, gaH =  56, gaY = (H - gaH) / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg overflow-hidden">
      <defs>
        <clipPath id="pitch-clip">
          <rect x="0" y="0" width={W} height={H} />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill="#0d4a1a" />
      {Array.from({ length: 10 }).map((_, i) => (
        <rect key={i} x={i * (W / 10)} y="0" width={W / 10} height={H}
              fill={i % 2 === 0 ? 'rgba(0,0,0,0.07)' : 'transparent'} />
      ))}
      <rect x="8" y="8" width={W - 16} height={H - 16} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <line x1={cx} y1="8" x2={cx} y2={H - 8} stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r="28" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.4)" />
      <rect x="8" y={paY} width={paW} height={paH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <rect x="8" y={gaY} width={gaW} height={gaH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <rect x={W - 8 - paW} y={paY} width={paW} height={paH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <rect x={W - 8 - gaW} y={gaY} width={gaW} height={gaH} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
      <g clipPath="url(#pitch-clip)">
        <TeamPlayers rows={homeRows} isHome={true}  eventMap={eventMap} />
        <TeamPlayers rows={awayRows} isHome={false} eventMap={eventMap} />
      </g>
    </svg>
  )
}
