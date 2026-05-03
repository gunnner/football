import { useState, useEffect, useRef } from 'react'
import { localDateStr, today } from '../../utils/date'
import { ChevronLeft, ChevronRight } from './Icons'
import styles from './CalendarPopup.module.css'

const DAY_HEADERS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export default function CalendarPopup({ date, onChange, onClose }) {
  const selected = new Date(date + 'T00:00:00')
  const [view, setView] = useState(new Date(selected.getFullYear(), selected.getMonth(), 1))
  const ref      = useRef(null)
  const todayStr = today()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const year  = view.getFullYear()
  const month = view.getMonth()

  const days = []
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7

  for (let i = startPad - 1; i >= 0; i--) {
    days.push({ str: localDateStr(new Date(year, month, -i)), current: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ str: localDateStr(new Date(year, month, i)), current: true })
  }
  const tail = (7 - (days.length % 7)) % 7
  for (let i = 1; i <= tail; i++) {
    days.push({ str: localDateStr(new Date(year, month + 1, i)), current: false })
  }

  const monthLabel = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div ref={ref} className={styles.popup}>
      <div className={styles.header}>
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className={styles.monthNavBtn}
        >
          <ChevronLeft />
        </button>
        <span className={styles.monthLabel}>{monthLabel}</span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className={styles.monthNavBtn}
        >
          <ChevronRight />
        </button>
      </div>

      <div className={styles.dayHeaders}>
        {DAY_HEADERS.map(d => (
          <div key={d} className={styles.dayHeader}>{d}</div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {days.map(({ str, current }) => {
          const isSelected = str === date
          const isToday    = str === todayStr
          let cls = styles.dayBtn + ' '
          if (isSelected)        cls += styles.daySelected
          else if (isToday)      cls += styles.dayToday
          else if (current)      cls += styles.dayDefault
          else                   cls += styles.dayOther
          return (
            <button key={str} onClick={() => { onChange(str); onClose() }} className={cls}>
              {new Date(str + 'T00:00:00').getDate()}
            </button>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button
          onClick={() => { onChange(todayStr); onClose() }}
          className={styles.todayBtn}
        >
          Today
        </button>
      </div>
    </div>
  )
}
