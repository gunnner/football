import { POSITION_ORDER } from '../../../constants/positions'
import { BADGE_SVG, SUB_ON_SVG, badgeForEvent } from './badges'

function SubBadge({ type, isSubOn }) {
  if (isSubOn) return <svg width="16" height="16" viewBox="-3.5 -3.5 7 7" className="flex-shrink-0">{SUB_ON_SVG}</svg>
  const b = badgeForEvent({ type })
  if (!b) return null
  return <svg width="16" height="16" viewBox="-3.5 -3.5 7 7" className="flex-shrink-0">{BADGE_SVG[b.svgKey]}</svg>
}

export default function SubstitutesList({ lineup, eventMap }) {
  if (!lineup?.substitutes?.length) return null

  const sorted = [...lineup.substitutes].sort((a, b) =>
    (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9)
  )

  return (
    <div className="space-y-1">
      {sorted.map(player => {
        const allEvents   = eventMap[player.id] || []
        const subOnEvent  = allEvents.find(e => e._sub_on)
        const otherEvents = allEvents.filter(e => !e._assist && !e._sub_on && e.type !== 'Substitution')
        return (
          <div key={player.id ?? player.name} className="flex items-center gap-2 py-0.5">
            {player.logo
              ? (
                <div className="w-6 h-6 rounded-full flex-shrink-0 bg-gray-800 overflow-hidden">
                  <img src={player.logo} alt={player.name} className="w-full" style={{ height: '200%', objectFit: 'cover', objectPosition: '50% 0%' }} />
                </div>
              )
              : <div className="w-6 h-6 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-xs">👤</div>
            }
            {player.path
              ? <a href={player.path} className="text-gray-300 truncate hover:text-blue-400 transition-colors" style={{ fontSize: '13px' }}>{player.number}. {player.name}</a>
              : <span className="text-gray-300 truncate" style={{ fontSize: '13px' }}>{player.number}. {player.name}</span>
            }
            {subOnEvent && (
              <span className="flex items-center gap-0.5 flex-shrink-0">
                <SubBadge isSubOn />
                {subOnEvent.time && <span className="text-gray-500" style={{ fontSize: '10px' }}>{subOnEvent.time}'</span>}
              </span>
            )}
            {otherEvents.map((e, i) => (
              <span key={i} className="flex items-center gap-0.5 flex-shrink-0">
                <SubBadge type={e.type} />
                {e.time && <span className="text-gray-500" style={{ fontSize: '10px' }}>{e.time}'</span>}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
