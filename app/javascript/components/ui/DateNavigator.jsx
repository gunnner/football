import { ChevronLeft, ChevronRight } from './Icons'
import { today, shiftDate } from '../../utils/date'
import styles from './DateNavigator.module.css'

function formatDay(iso) {
  const d = new Date(iso + 'T00:00:00')
  return {
    weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase(),
    day:     d.getDate(),
    month:   d.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

export default function DateNavigator({ date, onChange }) {
  // Show 2 days before and 2 days after the selected date (5 total)
  const offsets = [-2, -1, 0, 1, 2]
  const dates   = offsets.map(n => shiftDate(date, n))

  return (
    <div className={styles.root}>
      <button className={styles.navBtn} onClick={() => onChange(shiftDate(date, -1))} aria-label="Previous day">
        <ChevronLeft />
      </button>

      <div className={styles.strip}>
        {dates.map(iso => {
          const { weekday, day, month } = formatDay(iso)
          const isActive = iso === date
          return (
            <button
              key={iso}
              className={`${styles.dayBtn}${isActive ? ` ${styles.dayBtnActive}` : ''}`}
              onClick={() => onChange(iso)}
            >
              <span className={styles.weekday}>{weekday}</span>
              <span className={styles.dayNum}>{day} {month}</span>
            </button>
          )
        })}
      </div>

      <button className={styles.navBtn} onClick={() => onChange(shiftDate(date, 1))} aria-label="Next day">
        <ChevronRight />
      </button>
    </div>
  )
}
