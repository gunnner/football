import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { EVENT_ICONS, EVENT_DOT_COLORS } from '../../../constants/matchEvents'
import { labelTransform } from '../../../utils/eventTime'
import { tooltipText, subLastName } from './eventTimelineUtils'
import styles from './EventTimelineItems.module.css'

export function EventLabel({ e, isAbove, lastName }) {
  const isSub = e.event_type === 'Substitution'
  const tip   = tooltipText(e)

  if (isSub) {
    return (
      <div className={styles.subWrap}>
        <div className={styles.subRow}>
          <span className={styles.eventIcon}>{(EVENT_ICONS['Substitution'] || { emoji: '🔄' }).emoji}</span>
          {lastName(e) && <span className={styles.subNameIn}>↑ {lastName(e)}</span>}
        </div>
        {e.substituted_player && (
          <span className={styles.subNameOut}>↓ {subLastName(e.substituted_player)}</span>
        )}
      </div>
    )
  }

  return (
    <div className={styles.eventLabelWrap}
         style={{ flexDirection: isAbove ? 'row-reverse' : 'row' }}>
      <span className={styles.eventIcon}>{(EVENT_ICONS[e.event_type] || { emoji: '•' }).emoji}</span>
      {lastName(e) && <span className={styles.eventName}>{lastName(e)}</span>}
      {tip && (
        <div className={styles.eventTooltip}>{tip}</div>
      )}
    </div>
  )
}

export function SubsCompact({ subs, isAbove }) {
  const [pos, setPos] = useState(null)
  const anchorRef     = useRef(null)
  const subIcon       = (EVENT_ICONS['Substitution'] || { emoji: '🔄' }).emoji

  function handleEnter() {
    if (!anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    setPos({
      top:  isAbove ? r.bottom + 4 : r.top - 4,
      left: r.left + r.width / 2,
      flip: !isAbove,
    })
  }

  return (
    <div ref={anchorRef}
         className={styles.subsCompactWrap}
         onMouseEnter={handleEnter}
         onMouseLeave={() => setPos(null)}>
      <span className={styles.subsIcon}>{subIcon}</span>
      <span className={styles.subsCount}>×{subs.length}</span>
      {pos && createPortal(
        <div style={{
               position:  'fixed',
               top:       pos.top,
               left:      pos.left,
               transform: pos.flip ? 'translate(-50%, -100%)' : 'translateX(-50%)',
               zIndex:    9999,
               background: '#030712',
               border: '1px solid var(--color-border)',
               borderRadius: '4px',
               padding: '4px 8px',
               boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
             }}
             className={styles.subsPopup}>
          {subs.map((e, i) => (
            <div key={i} className={styles.subsPopupItem}>
              {e.player_name        && <span className={styles.subIn}>↑ {e.player_name}</span>}
              {e.substituted_player && <span className={styles.subOut}>↓ {e.substituted_player}</span>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

export function EventGroup({ group, side }) {
  const { pos, events: evts, lane = 0 } = group
  const isAbove   = side === 'home'
  const dotColor  = EVENT_DOT_COLORS[evts[0].event_type] || '#6b7280'
  const key       = `${side}-${pos.toFixed(1)}`
  const transform = labelTransform(pos)
  const lastName  = (e) => e.player_name ? e.player_name.split(' ').pop() : null
  const labelOffset = 12 + lane * 22

  const subs    = evts.filter(e => e.event_type === 'Substitution')
  const nonSubs = evts.filter(e => e.event_type !== 'Substitution')

  const labelStyle = isAbove
    ? { position: 'absolute', left: `${pos}%`, bottom: `calc(50% + ${labelOffset}px)`, transform }
    : { position: 'absolute', left: `${pos}%`, top: `calc(50% + ${labelOffset}px)`, transform }

  const connectorStyle = isAbove
    ? { position: 'absolute', left: `${pos}%`, bottom: '50%', width: '1px', background: dotColor, opacity: 0.3,
        height: `${labelOffset}px`, transform: 'translateX(-50%)' }
    : { position: 'absolute', left: `${pos}%`, top: '50%', width: '1px', background: dotColor, opacity: 0.3,
        height: `${labelOffset}px`, transform: 'translateX(-50%)' }

  return (
    <>
      <div style={{
        position: 'absolute', left: `${pos}%`, top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '8px', height: '8px', borderRadius: '50%',
        background: dotColor, border: '2px solid #111827', zIndex: 3,
      }} />

      {lane > 0 && <div style={connectorStyle} />}

      <div key={key} style={labelStyle} className={styles.groupLabel}>
        {isAbove ? (
          <>
            {nonSubs.map((e, i) => <EventLabel key={i} e={e} isAbove={true} lastName={lastName} />)}
            {subs.length > 0 && <SubsCompact subs={subs} isAbove={true} />}
            <span className={styles.timeLabel}>{evts[0].time}'</span>
          </>
        ) : (
          <>
            <span className={styles.timeLabel}>{evts[0].time}'</span>
            {nonSubs.map((e, i) => <EventLabel key={i} e={e} isAbove={false} lastName={lastName} />)}
            {subs.length > 0 && <SubsCompact subs={subs} isAbove={false} />}
          </>
        )}
      </div>
    </>
  )
}
