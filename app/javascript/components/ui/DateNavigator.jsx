import { useState } from 'react'
import { today, shiftDate } from '../../utils/date'
import { ChevronLeft, ChevronRight } from './Icons'
import CalendarPopup from './CalendarPopup'

function formatDate(iso) {
  if (iso === today()) return 'Today'
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
}

export default function DateNavigator({ date, onChange }) {
  const [showCal, setShowCal] = useState(false)
  const label     = formatDate(date)
  const isToday   = date === today()
  const fullLabel = isToday
    ? null
    : new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={() => onChange(shiftDate(date, -1))}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft />
      </button>

      <div className="w-52 text-center relative">
        <button onClick={() => setShowCal(v => !v)} className="text-center hover:opacity-70 transition-opacity">
          <h1 className="text-base font-semibold text-white">{label}</h1>
          {fullLabel && <p className="text-xs text-gray-500">{fullLabel}</p>}
        </button>
        {showCal && (
          <CalendarPopup date={date} onChange={onChange} onClose={() => setShowCal(false)} />
        )}
      </div>

      <button
        onClick={() => onChange(shiftDate(date, 1))}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronRight />
      </button>
    </div>
  )
}
