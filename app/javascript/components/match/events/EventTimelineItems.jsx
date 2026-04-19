import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { EVENT_ICONS, EVENT_DOT_COLORS } from '../../../constants/matchEvents'
import { labelTransform } from '../../../utils/eventTime'
import { tooltipText, subLastName } from './eventTimelineUtils'

export function EventLabel({ e, isAbove, lastName }) {
  const isSub = e.event_type === 'Substitution'
  const tip   = tooltipText(e)

  if (isSub) {
    return (
      <div className="flex flex-col items-center whitespace-nowrap">
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] leading-none">{(EVENT_ICONS['Substitution'] || { emoji: '🔄' }).emoji}</span>
          {lastName(e) && <span className="text-[9px] text-green-400 leading-snug">↑ {lastName(e)}</span>}
        </div>
        {e.substituted_player && (
          <span className="text-[9px] text-red-400 leading-snug">↓ {subLastName(e.substituted_player)}</span>
        )}
      </div>
    )
  }

  return (
    <div className="group/evt relative flex items-center gap-0.5 whitespace-nowrap cursor-default"
         style={{ flexDirection: isAbove ? 'row-reverse' : 'row' }}>
      <span className="text-[10px] leading-none">{(EVENT_ICONS[e.event_type] || { emoji: '•' }).emoji}</span>
      {lastName(e) && <span className="text-[9px] text-gray-300 leading-snug">{lastName(e)}</span>}
      {tip && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 hidden group-hover/evt:block z-20 bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-[9px] text-gray-300 whitespace-nowrap shadow-lg">
          {tip}
        </div>
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
         className="flex items-center gap-0.5 cursor-default whitespace-nowrap"
         onMouseEnter={handleEnter}
         onMouseLeave={() => setPos(null)}>
      <span className="text-[10px] leading-none">{subIcon}</span>
      <span className="text-[9px] text-gray-400 leading-snug">×{subs.length}</span>
      {pos && createPortal(
        <div style={{
               position:  'fixed',
               top:       pos.top,
               left:      pos.left,
               transform: pos.flip ? 'translate(-50%, -100%)' : 'translateX(-50%)',
               zIndex:    9999,
               boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
             }}
             className="bg-gray-950 border border-gray-700 rounded px-2 py-1 pointer-events-none">
          {subs.map((e, i) => (
            <div key={i} className="flex flex-col items-start py-0.5 border-b border-gray-700 last:border-0">
              {e.player_name        && <span className="text-[9px] text-green-400 whitespace-nowrap">↑ {e.player_name}</span>}
              {e.substituted_player && <span className="text-[9px] text-red-400 whitespace-nowrap">↓ {e.substituted_player}</span>}
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

      <div key={key} style={labelStyle} className="relative flex flex-col items-center text-center">
        {isAbove ? (
          <>
            {nonSubs.map((e, i) => <EventLabel key={i} e={e} isAbove={true} lastName={lastName} />)}
            {subs.length > 0 && <SubsCompact subs={subs} isAbove={true} />}
            <span className="text-[9px] text-gray-500 leading-none">{evts[0].time}'</span>
          </>
        ) : (
          <>
            <span className="text-[9px] text-gray-500 leading-none">{evts[0].time}'</span>
            {nonSubs.map((e, i) => <EventLabel key={i} e={e} isAbove={false} lastName={lastName} />)}
            {subs.length > 0 && <SubsCompact subs={subs} isAbove={false} />}
          </>
        )}
      </div>
    </>
  )
}
