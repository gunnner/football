import { POSITION_ORDER } from '../../../constants/positions'
import { BADGE_SVG, SUB_ON_SVG, badgeForEvent } from './badges'
import styles from './SubstitutesList.module.css'

function SubBadge({ type, isSubOn }) {
  if (isSubOn) return <svg width="16" height="16" viewBox="-3.5 -3.5 7 7" style={{ flexShrink: 0 }}>{SUB_ON_SVG}</svg>
  const b = badgeForEvent({ type })
  if (!b) return null
  return <svg width="16" height="16" viewBox="-3.5 -3.5 7 7" style={{ flexShrink: 0 }}>{BADGE_SVG[b.svgKey]}</svg>
}

export default function SubstitutesList({ lineup, eventMap }) {
  if (!lineup?.substitutes?.length) return null

  const sorted = [...lineup.substitutes].sort((a, b) =>
    (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9)
  )

  return (
    <div className={styles.list}>
      {sorted.map(player => {
        const allEvents   = eventMap[player.id] || []
        const subOnEvent  = allEvents.find(e => e._sub_on)
        const otherEvents = allEvents.filter(e => !e._assist && !e._sub_on && e.type !== 'Substitution')
        return (
          <div key={player.id ?? player.name} className={styles.playerRow}>
            {player.logo
              ? (
                <div className={styles.avatar}>
                  <img src={player.logo} alt={player.name} className={styles.avatarImg} />
                </div>
              )
              : <div className={styles.avatarFallback}>👤</div>
            }
            {player.path
              ? <a href={player.path} className={styles.playerLink}>{player.number}. {player.name}</a>
              : <span className={styles.playerName}>{player.number}. {player.name}</span>
            }
            {subOnEvent && (
              <span className={styles.eventBadge}>
                <SubBadge isSubOn />
                {subOnEvent.time && <span className={styles.eventTime}>{subOnEvent.time}'</span>}
              </span>
            )}
            {otherEvents.map((e, i) => (
              <span key={i} className={styles.eventBadge}>
                <SubBadge type={e.type} />
                {e.time && <span className={styles.eventTime}>{e.time}'</span>}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
