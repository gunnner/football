export function formatFee(v) {
  if (!v || v === 0) return null
  if (v >= 1_000_000) {
    const n = v / 1_000_000
    return `€${Number.isInteger(n) ? n : n.toFixed(1)}M`
  }
  if (v >= 1_000) return `€${Math.floor(v / 1_000)}K`
  return `€${v}`
}

export function formatMarketValue(mv) {
  if (!mv) return null
  const { value, currency } = mv
  if (!value) return null
  const c = currency ?? '€'
  if (value >= 1_000_000) {
    const n = value / 1_000_000
    return `${c}${Number.isInteger(n) ? n : n.toFixed(1)}M`
  }
  if (value >= 1_000) return `${c}${Math.floor(value / 1_000)}K`
  return `${c}${value}`
}
