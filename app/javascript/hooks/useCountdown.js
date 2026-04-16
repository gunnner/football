import { useState, useEffect } from 'react'

export function useCountdown(targetIso, active) {
  const [diff, setDiff] = useState(0)

  useEffect(() => {
    if (!active || !targetIso) return
    const target = new Date(targetIso).getTime()
    const tick = () => setDiff(Math.max(0, target - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetIso, active])

  const total   = Math.floor(diff / 1000)
  const days    = Math.floor(total / 86400)
  const hours   = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return { days, hours, minutes, seconds, reached: diff === 0 }
}
