import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { EVENT_ICONS, EVENT_DOT_COLORS } from '../../../constants/matchEvents'
import { getHalf, getTimelinePosition, labelTransform } from '../../../utils/eventTime'

const TIMELINE_H      = 140
const LEFT_COL        = 36  // team logo column + gap
const HT_POS          = 50  // HT divider at exactly 50% of sub-container
const FINISHED_STATUSES = new Set(['Full time', 'Finished', 'Finished AET', 'Finished AP'])


function getAbsPos(event) {
  const half = getHalf(event.time)
  const rel  = getTimelinePosition(event.time, half) / 100
  // First half: 0..50%, second half: 50..100%
  return half === 1
    ? rel * HT_POS
    : HT_POS + rel * (100 - HT_POS)
}

function buildGroups(evts) {
  // Deduplicate: same time + event_type + player_name
  const seen = new Set()
  const deduped = evts.filter(e => {
    const key = `${e.time}|${e.event_type}|${e.player_name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const sorted = deduped
    .map(e => ({ event: e, pos: getAbsPos(e) }))
    .sort((a, b) => a.pos - b.pos)
  const groups = []
  for (const item of sorted) {
    const last = groups[groups.length - 1]
    if (last && item.pos - last.pos < 1.5) {
      last.events.push(item.event)
    } else {
      groups.push({ pos: item.pos, events: [item.event], lane: 0 })
    }
  }
  // Assign lanes to avoid label overlap: nearby groups alternate heights
  for (let i = 1; i < groups.length; i++) {
    const prev = groups[i - 1]
    if (groups[i].pos - prev.pos < 6) {
      groups[i].lane = (prev.lane + 1) % 2
    }
  }
  return groups
}

function currentMinutePos(matchStatus, clock) {
  const min      = parseInt(clock) || 0
  const isFirst  = ['First half'].includes(matchStatus)
  const isSecond = ['Second half', 'Extra time'].includes(matchStatus)
  if (isFirst) {
    if (!min) return null
    const rel = Math.min(min / 50, 1)
    return rel * HT_POS
  }
  if (isSecond) {
    if (!min) return HT_POS
    const rel = Math.min((min - 45) / 55, 1)
    return HT_POS + rel * (100 - HT_POS)
  }
  return null
}

function tooltipText(e) {
  if (e.event_type === 'Substitution') return null  // shown inline
  if (e.assisting_player_name) return `Assist: ${e.assisting_player_name}`
  if (e.event_type === 'Penalty') return 'Penalty'
  return null
}

function subLastName(name) {
  if (!name) return null
  return name.split(' ').pop()
}

function EventLabel({ e, isAbove, lastName }) {
  const isSub = e.event_type === 'Substitution'
  const tip   = tooltipText(e)

  if (isSub) {
    // player_name = who comes ON (green ↑), substituted_player = who goes OFF (red ↓)
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

function SubsCompact({ subs, isAbove }) {
  const [pos, setPos] = useState(null)
  const anchorRef     = useRef(null)
  const subIcon       = (EVENT_ICONS['Substitution'] || { emoji: '🔄' }).emoji

  function handleEnter() {
    if (!anchorRef.current) return
    const r = anchorRef.current.getBoundingClientRect()
    // Always anchor to top — above: below the trigger, below: above the trigger
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

function EventGroup({ group, side }) {
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
      {/* Dot on the line */}
      <div style={{
        position: 'absolute', left: `${pos}%`, top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '8px', height: '8px', borderRadius: '50%',
        background: dotColor, border: '2px solid #111827', zIndex: 3,
      }} />

      {/* Connector */}
      {lane > 0 && <div style={connectorStyle} />}

      {/* Label */}
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

export default function EventTimeline({ events, homeTeamExternalId, homeTeam, awayTeam, isLive, matchStatus, clock }) {
  // Ticking clock — increments every 60s during live play (same pattern as MatchScore)
  const [tickClock, setTickClock] = useState(clock)
  const tickRef = useRef(null)

  // Sync with incoming clock prop (from WS updates)
  useEffect(() => { setTickClock(clock) }, [clock])

  // Tick every minute during live, non-HT, non-FT
  const clockStr0    = String(clock ?? '')
  const isOvertime0  = clockStr0.includes('+')
  const isHalfTime0  = ['Half time', 'Break time'].includes(matchStatus)
  const isTicking    = isLive && !isHalfTime0 && !isOvertime0 && !['Full time', 'Finished', 'Finished AET', 'Finished AP'].includes(matchStatus)

  useEffect(() => {
    if (!isTicking) { clearInterval(tickRef.current); return }
    tickRef.current = setInterval(() => {
      setTickClock(prev => {
        const n = parseInt(prev)
        return isNaN(n) ? prev : String(n + 1)
      })
    }, 60000)
    return () => clearInterval(tickRef.current)
  }, [isTicking])

  const clockStr = String(tickClock ?? '')
  const clockMin = parseInt(clockStr) || 0
  const isOvertime = clockStr.includes('+')
  // Only normalise HT — end of match is determined solely by API status, never by clock
  const effectiveStatus = (!isOvertime && matchStatus === 'First half' && clockMin >= 45) ? 'Half time'
                        : matchStatus

  const isHalfTime     = ['Half time', 'Break time'].includes(effectiveStatus)
  const firstHalfLive  = isLive && effectiveStatus === 'First half'
  const halfTimeLive   = isLive && isHalfTime
  const secondHalfLive = isLive && ['Second half', 'Extra time'].includes(effectiveStatus)
  const matchStarted   = isLive || FINISHED_STATUSES.has(effectiveStatus) || events.length > 0
  const matchFinished  = FINISHED_STATUSES.has(effectiveStatus)

  const homeGroups = buildGroups(events.filter(e => e.team_external_id === homeTeamExternalId))
  const awayGroups = buildGroups(events.filter(e => e.team_external_id !== homeTeamExternalId))

  const livePos = isLive ? currentMinutePos(effectiveStatus, tickClock) : null

  return (
    <div>
      {/* Header: spacer for team column, then First Half / Second Half each half of sub-container */}
      <div className="flex text-[10px] text-gray-600 mb-0.5">
        <div style={{ width: `${LEFT_COL}px`, flexShrink: 0 }} />
        <div className="flex flex-1">
          <div className="flex items-center gap-1 justify-center w-1/2">
            First Half
            {firstHalfLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />}
          </div>
          <div className="flex items-center gap-1 justify-center w-1/2">
            {halfTimeLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />}
            Second Half
            {secondHalfLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />}
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="relative" style={{ height: `${TIMELINE_H}px` }}>

        {/* Team names — overlaid on line */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col z-10" style={{ width: `${LEFT_COL}px` }}>
          <div className="flex-1 flex items-center justify-center">
            {homeTeam?.logo
              ? <a href={homeTeam?.path}><img src={homeTeam.logo} className="w-5 h-5 object-contain" alt={homeTeam?.name} /></a>
              : <span className="text-[9px] text-gray-500">{homeTeam?.name}</span>
            }
          </div>
          <div className="flex-1 flex items-center justify-center">
            {awayTeam?.logo
              ? <a href={awayTeam?.path}><img src={awayTeam.logo} className="w-5 h-5 object-contain" alt={awayTeam?.name} /></a>
              : <span className="text-[9px] text-gray-500">{awayTeam?.name}</span>
            }
          </div>
        </div>

        {/* Events sub-container — all % positions are relative to this area */}
        <div style={{ position: 'absolute', left: `${LEFT_COL}px`, right: 0, top: 0, bottom: 0, overflow: 'visible' }}>

          {/* Timeline line — inside sub-container so all % align */}
          <div className="absolute inset-x-0 bg-gray-700"
               style={{ top: '50%', height: '2px', transform: 'translateY(-50%)', zIndex: 0 }} />

          {/* KO — left edge (0%) */}
          {matchStarted && (
            <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}>
              <div className="w-2 h-2 rounded-full bg-gray-500 border border-gray-700" />
              <span className="absolute bottom-full mb-0.5 left-0 text-[8px] text-gray-500 whitespace-nowrap">Kick Off</span>
            </div>
          )}

          {/* HT — exactly at 50% of sub-container */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(75,85,99,0.5)', zIndex: 1 }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', zIndex: 5, background: '#111827', padding: '0 2px' }}>
            <span className="text-[8px] text-gray-500">HT</span>
          </div>

          {/* FT — right edge (100%) */}
          {matchFinished && (
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}>
              <div className="w-2 h-2 rounded-full bg-gray-500 border border-gray-700" />
              <span className="absolute bottom-full mb-0.5 right-0 text-[8px] text-gray-500 whitespace-nowrap">Full Time</span>
            </div>
          )}

          {livePos !== null && (() => {
            const allGroups = [...homeGroups, ...awayGroups]
            const tooClose = allGroups.some(g => Math.abs(g.pos - livePos) < 0.5)
            return !tooClose && (
              <div className="group/live" style={{ position: 'absolute', left: `${livePos}%`, top: '50%', transform: 'translate(-50%, -50%)', zIndex: 4 }}>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-gray-900" />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover/live:block bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-[9px] text-red-400 whitespace-nowrap shadow-lg z-20">
                  {clockMin}'
                </div>
              </div>
            )
          })()}
          {homeGroups.map((g, i) => <EventGroup key={i} group={g} side="home" />)}
          {awayGroups.map((g, i) => <EventGroup key={i} group={g} side="away" />)}
        </div>
      </div>
    </div>
  )
}
