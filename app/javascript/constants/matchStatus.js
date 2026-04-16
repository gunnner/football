export const LIVE_STATUSES     = ['First half', 'Second half', 'Extra time', 'Half time', 'Break time', 'Penalties', 'In progress']
export const FINISHED_STATUSES = ['Finished', 'Finished after penalties', 'Finished after extra time']

const LIVE_SET     = new Set(LIVE_STATUSES)
const FINISHED_SET = new Set(FINISHED_STATUSES)

export function matchPhase(status) {
  if (LIVE_SET.has(status))     return 'live'
  if (FINISHED_SET.has(status)) return 'finished'
  return 'upcoming'
}
