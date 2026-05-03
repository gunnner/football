import { useCountdown } from '../../../hooks/useCountdown'
import styles from './CountdownStrip.module.css'

export default function CountdownStrip({ matchDateIso }) {
  const { days, hours, minutes, seconds, reached } = useCountdown(matchDateIso, true)
  if (reached) return null

  const parts = days > 0
    ? [{ v: days, l: 'days' }, { v: hours, l: 'hrs' }, { v: minutes, l: 'min' }]
    : [{ v: hours, l: 'hrs' }, { v: minutes, l: 'min' }, { v: seconds, l: 'sec' }]

  const label = parts.map(({ v, l }) => `${String(v).padStart(2, '0')} ${l}`).join('  ·  ')

  return (
    <p className={styles.strip}>Starts in: {label}</p>
  )
}
