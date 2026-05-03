import PlayerLink from '../../ui/PlayerLink'
import { EVENT_ICONS, GOAL_TYPES, CARD_TYPES, SUB_TYPES } from '../../../constants/matchEvents'
import styles from './EventRow.module.css'

function AssistSVG() {
  return (
    <svg width="10" height="10" viewBox="-3.5 -3.5 7 7" style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle' }}>
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

  const innerCls = isHome ? styles.inner : styles.innerRev

  const content = (
    <div className={innerCls}>
      <span className={styles.icon}>{icon.emoji}</span>
      {isSub ? (
        <div className={isHome ? styles.eventInfo : styles.eventInfoRight}>
          <p className={styles.subIn}>
            ↑ {event.assisting_player_path
              ? <a href={event.assisting_player_path} className={styles.subLink}>{event.substituted_player || event.assisting_player_name || '—'}</a>
              : (event.substituted_player || '—')
            }
          </p>
          <p className={styles.subOut}>
            ↓ {event.player_path
              ? <a href={event.player_path} className={styles.subLink}>{event.player_name || '—'}</a>
              : (event.player_name || '—')
            }
          </p>
        </div>
      ) : (
        <div className={isHome ? styles.eventInfo : styles.eventInfoRight}>
          <PlayerLink
            name={event.player_name}
            path={event.player_path}
            className={styles.playerName}
          />
          <p className={styles.eventLabel}>{label}</p>
          {event.assisting_player_name && (
            <p className={isHome ? styles.assistRow : styles.assistRowRev}>
              <AssistSVG />
              <PlayerLink
                name={event.assisting_player_name}
                path={event.assisting_player_path}
                className={styles.playerName}
              />
            </p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className={`${styles.row}${isNew ? ` ${styles.rowNew}` : ''}`}>
      <div className={styles.homeSide}>{isHome && content}</div>
      <div className={styles.timeCell}>
        <span className={styles.timeBadge}>{event.time}'</span>
      </div>
      <div className={styles.awaySide}>{!isHome && content}</div>
    </div>
  )
}
