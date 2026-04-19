import { getHalf, getTimelinePosition } from '../../../utils/eventTime'

export const HT_POS = 50
export const FINISHED_STATUSES = new Set(['Full time', 'Finished', 'Finished AET', 'Finished AP'])

export function getAbsPos(event) {
  const half = getHalf(event.time)
  const rel  = getTimelinePosition(event.time, half) / 100
  return half === 1
    ? rel * HT_POS
    : HT_POS + rel * (100 - HT_POS)
}

export function buildGroups(evts) {
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
  for (let i = 1; i < groups.length; i++) {
    const prev = groups[i - 1]
    if (groups[i].pos - prev.pos < 6) {
      groups[i].lane = (prev.lane + 1) % 2
    }
  }
  return groups
}

export function currentMinutePos(matchStatus, clock) {
  const min      = parseInt(clock) || 0
  const isFirst  = matchStatus === 'First half'
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

export function tooltipText(e) {
  if (e.event_type === 'Substitution') return null
  if (e.assisting_player_name) return `Assist: ${e.assisting_player_name}`
  if (e.event_type === 'Penalty') return 'Penalty'
  return null
}

export function subLastName(name) {
  if (!name) return null
  return name.split(' ').pop()
}
