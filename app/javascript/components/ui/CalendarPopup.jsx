import { useState, useEffect, useRef } from 'react'
import { localDateStr, today, shiftDate } from '../../utils/date'
import { ChevronLeft, ChevronRight } from './Icons'

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
    <div
      ref={ref}
      className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2
                 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-3 w-64"
    >
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setView(new Date(year, month - 1, 1))}
          className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft />
        </button>
        <span className="text-sm font-semibold text-white">{monthLabel}</span>
        <button
          onClick={() => setView(new Date(year, month + 1, 1))}
          className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map(d => (
          <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map(({ str, current }) => {
          const isSelected = str === date
          const isToday    = str === todayStr
          let cls = 'text-center text-sm py-1.5 rounded-lg transition-colors '
          if (isSelected)   cls += 'bg-blue-600 text-white font-semibold'
          else if (isToday) cls += 'text-blue-400 font-semibold hover:bg-gray-800'
          else if (current) cls += 'text-gray-200 hover:bg-gray-800'
          else              cls += 'text-gray-600 hover:bg-gray-800'
          return (
            <button key={str} onClick={() => { onChange(str); onClose() }} className={cls}>
              {new Date(str + 'T00:00:00').getDate()}
            </button>
          )
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-800">
        <button
          onClick={() => { onChange(todayStr); onClose() }}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  )
}
