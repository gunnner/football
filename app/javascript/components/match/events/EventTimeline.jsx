import { EVENT_ICONS, EVENT_DOT_COLORS, SHORT_LABELS } from '../../../constants/matchEvents'
import { getHalf, getTimelinePosition, labelTransform } from '../../../utils/eventTime'

const TIMELINE_H = 120
const FH_END     = 47
const SH_START   = 53

function getAbsPos(event, hasSecondHalf) {
  const half = getHalf(event.time)
  const rel  = getTimelinePosition(event.time, half) / 100
  if (!hasSecondHalf) return rel * 100
  return half === 1
    ? rel * FH_END
    : SH_START + rel * (100 - SH_START)
}

function buildGroups(evts, hasSecondHalf) {
  const sorted = evts
    .map(e => ({ event: e, pos: getAbsPos(e, hasSecondHalf) }))
    .sort((a, b) => a.pos - b.pos)
  const groups = []
  for (const item of sorted) {
    const last = groups[groups.length - 1]
    if (last && item.pos - last.pos < 3) {
      last.events.push(item.event)
    } else {
      groups.push({ pos: item.pos, events: [item.event] })
    }
  }
  return groups
}

function EventGroup({ group, side }) {
  const { pos, events: evts } = group
  const isAbove   = side === 'home'
  const dotColor  = EVENT_DOT_COLORS[evts[0].event_type] || '#6b7280'
  const key       = `${side}-${pos.toFixed(1)}`
  const transform = labelTransform(pos)
  const lastName  = (e) => e.player_name ? e.player_name.split(' ').pop() : null

  const dot = (
    <div style={{
      position: 'absolute',
      ...(isAbove
        ? { top: '100%', left: '50%', transform: 'translateX(-50%)' }
        : { bottom: '100%', left: '50%', transform: 'translateX(-50%)' }),
      width: '8px', height: '8px', borderRadius: '50%',
      background: dotColor, border: '2px solid #111827', zIndex: 2,
    }} />
  )

  if (isAbove) {
    return (
      <div key={key} style={{ position: 'absolute', left: `${pos}%`, bottom: 'calc(50% + 4px)', transform }}
           className="relative flex flex-col items-center text-center">
        {dot}
        {evts.length === 1 && (
          <span className="text-[9px] text-gray-500 leading-none">{SHORT_LABELS[evts[0].event_type] || evts[0].event_type}</span>
        )}
        {evts.map((e, i) => (
          <div key={i} className="flex items-center gap-0.5 flex-row-reverse">
            <span className="text-[10px] leading-none">{(EVENT_ICONS[e.event_type] || { emoji: '•' }).emoji}</span>
            {lastName(e) && <span className="text-[9px] text-gray-300 max-w-[48px] truncate leading-snug">{lastName(e)}</span>}
          </div>
        ))}
        <span className="text-[9px] text-gray-400 leading-none">{evts[0].time}'</span>
      </div>
    )
  }

  return (
    <div key={key} style={{ position: 'absolute', left: `${pos}%`, top: 'calc(50% + 4px)', transform }}
         className="relative flex flex-col items-center text-center">
      {dot}
      <span className="text-[9px] text-gray-400 leading-none">{evts[0].time}'</span>
      {evts.map((e, i) => (
        <div key={i} className="flex items-center gap-0.5">
          <span className="text-[10px] leading-none">{(EVENT_ICONS[e.event_type] || { emoji: '•' }).emoji}</span>
          {lastName(e) && <span className="text-[9px] text-gray-300 max-w-[48px] truncate leading-snug">{lastName(e)}</span>}
        </div>
      ))}
      {evts.length === 1 && (
        <span className="text-[9px] text-gray-500 leading-none">{SHORT_LABELS[evts[0].event_type] || evts[0].event_type}</span>
      )}
    </div>
  )
}

export default function EventTimeline({ events, homeTeamExternalId, homeTeam, awayTeam, isLive, matchStatus }) {
  const hasSecondHalf  = events.some(e => getHalf(e.time) === 2)
  const firstHalfLive  = isLive && ['First half', 'Half time'].includes(matchStatus)
  const secondHalfLive = isLive && !firstHalfLive

  const homeGroups = buildGroups(events.filter(e => e.team_external_id === homeTeamExternalId), hasSecondHalf)
  const awayGroups = buildGroups(events.filter(e => e.team_external_id !== homeTeamExternalId), hasSecondHalf)

  return (
    <div>
      <div className="flex text-[10px] text-gray-600 mb-0.5" style={{ paddingLeft: '74px' }}>
        {hasSecondHalf ? (
          <>
            <div className="flex items-center gap-1 justify-center" style={{ width: `${FH_END}%` }}>
              First Half
              {firstHalfLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />}
            </div>
            <div style={{ width: `${SH_START - FH_END}%` }} />
            <div className="flex items-center gap-1 justify-center" style={{ width: `${100 - SH_START}%` }}>
              Second Half
              {secondHalfLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-1 justify-center">
            First Half
            {firstHalfLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block" />}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col flex-shrink-0" style={{ width: '70px', height: `${TIMELINE_H}px` }}>
          <div className="flex-1 flex items-center gap-1.5 overflow-hidden min-w-0">
            {homeTeam?.logo && <img src={homeTeam.logo} className="w-4 h-4 object-contain flex-shrink-0" alt="" />}
            <a href={homeTeam?.path} className="text-[9px] text-gray-400 hover:text-gray-200 truncate transition-colors leading-tight">{homeTeam?.name}</a>
          </div>
          <div className="h-px bg-gray-700 flex-shrink-0" />
          <div className="flex-1 flex items-center gap-1.5 overflow-hidden min-w-0">
            {awayTeam?.logo && <img src={awayTeam.logo} className="w-4 h-4 object-contain flex-shrink-0" alt="" />}
            <a href={awayTeam?.path} className="text-[9px] text-gray-400 hover:text-gray-200 truncate transition-colors leading-tight">{awayTeam?.name}</a>
          </div>
        </div>

        <div className="flex-1 relative overflow-visible" style={{ height: `${TIMELINE_H}px` }}>
          <div className="absolute inset-x-0 bg-gray-700"
               style={{ top: '50%', height: '2px', transform: 'translateY(-50%)' }} />
          {hasSecondHalf && (
            <>
              <div className="absolute inset-y-0 w-px bg-gray-600/50"
                   style={{ left: '50%', transform: 'translateX(-50%)' }} />
              <div className="absolute bg-gray-900 px-0.5 z-10"
                   style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <span className="text-[8px] text-gray-500">HT</span>
              </div>
            </>
          )}
          {homeGroups.map((g, i) => <EventGroup key={i} group={g} side="home" />)}
          {awayGroups.map((g, i) => <EventGroup key={i} group={g} side="away" />)}
        </div>
      </div>
    </div>
  )
}
