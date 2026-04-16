export function parseMinute(time) {
  if (!time) return 0
  const s = String(time).replace("'", '')
  const [base, extra] = s.split('+').map(Number)
  return (base || 0) * 100 + (extra || 0)
}

export function getHalf(time) {
  const base = parseInt(String(time).replace("'", '').split('+')[0]) || 0
  return base <= 45 ? 1 : 2
}

// Returns 0–100 within a half (first: 0–50 min → 0–100; second: 45–100 min → 0–100)
export function getTimelinePosition(time, half) {
  const s = String(time).replace("'", '')
  const [base, extra] = s.split('+').map(Number)
  const totalMin = (base || 0) + (extra || 0)
  if (half === 1) return Math.min((totalMin / 50) * 100, 98)
  return Math.min(((totalMin - 45) / 55) * 100, 98)
}

export function labelTransform(pos) {
  if (pos < 5)  return 'none'
  if (pos > 92) return 'translateX(-100%)'
  return 'translateX(-50%)'
}
