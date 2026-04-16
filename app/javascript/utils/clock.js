export function formatClock(rawClock, status) {
  const str = String(rawClock ?? '')
  if (str.includes('+')) {
    const [base, extra] = str.split('+').map(Number)
    return `${base}' + ${extra}`
  }
  const n = parseInt(str)
  if (isNaN(n)) return `${str}'`
  if (status === 'First half'  && n > 45)  return `45' + ${n - 45}`
  if (status === 'Second half' && n > 90)  return `90' + ${n - 90}`
  if (status === 'Extra time'  && n > 120) return `120' + ${n - 120}`
  return `${n}'`
}
