import PlayerLink from '../../ui/PlayerLink'
import { EVENT_ICONS, GOAL_TYPES, CARD_TYPES, SUB_TYPES } from '../../../constants/matchEvents'

function AssistSVG() {
  return (
    <svg width="10" height="10" viewBox="-3.5 -3.5 7 7" className="inline-block flex-shrink-0 align-middle">
      <circle r="3.5" fill="#3b82f6" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="3.5" fontWeight="bold" fill="white">A</text>
    </svg>
  )
}

function eventLabel(event) {
  if (GOAL_TYPES.has(event.event_type)) {
    if (event.event_type === 'Own Goal') return 'Own goal'
    if (event.event_type === 'Penalty')  return 'Goal (pen)'
    return 'Goal'
  }
  if (CARD_TYPES.has(event.event_type)) return event.event_type
  if (SUB_TYPES.has(event.event_type))  return 'Substitution'
  return event.event_type
}

export default function EventRow({ event, isHome, isNew }) {
  const icon  = EVENT_ICONS[event.event_type] || { emoji: '•' }
  const label = eventLabel(event)
  const isSub = SUB_TYPES.has(event.event_type)

  const content = (
    <div className={`flex items-center gap-3 ${isHome ? '' : 'flex-row-reverse'}`}>
      <span className="text-lg leading-none flex-shrink-0">{icon.emoji}</span>
      {isSub ? (
        <div className={isHome ? '' : 'text-right'}>
          <p className="text-xs text-green-400 font-semibold leading-snug">
            ↑ {event.assisting_player_path
              ? <a href={event.assisting_player_path} className="font-semibold hover:text-blue-400 transition-colors">{event.substituted_player || event.assisting_player_name || '—'}</a>
              : (event.substituted_player || '—')
            }
          </p>
          <p className="text-xs text-red-400 leading-snug">
            ↓ {event.player_path
              ? <a href={event.player_path} className="font-semibold hover:text-blue-400 transition-colors">{event.player_name || '—'}</a>
              : (event.player_name || '—')
            }
          </p>
        </div>
      ) : (
        <div className={isHome ? '' : 'text-right'}>
          <PlayerLink
            name={event.player_name}
            path={event.player_path}
            className="text-xs font-semibold text-gray-100 hover:text-blue-400 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          {event.assisting_player_name && (
            <p className={`text-xs text-gray-500 mt-0.5 flex items-center gap-1 ${isHome ? '' : 'flex-row-reverse justify-end'}`}>
              <AssistSVG />
              <PlayerLink
                name={event.assisting_player_name}
                path={event.assisting_player_path}
                className="text-xs font-semibold text-gray-100 hover:text-blue-400 transition-colors"
              />
            </p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className={`flex items-center gap-3 py-2.5 border-b border-gray-800 last:border-0 transition-colors hover:bg-gray-800/60 ${isNew ? 'bg-blue-900/20' : ''}`}>
      <div className="flex-1">{isHome && content}</div>
      <div className="w-12 text-center flex-shrink-0">
        <span className="text-xs font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">{event.time}'</span>
      </div>
      <div className="flex-1 flex justify-end">{!isHome && content}</div>
    </div>
  )
}
