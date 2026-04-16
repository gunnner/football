import { useCountdown } from '../../../hooks/useCountdown'

export default function CountdownStrip({ matchDateIso }) {
  const { days, hours, minutes, seconds, reached } = useCountdown(matchDateIso, true)
  if (reached) return null

  const parts = days > 0
    ? [{ v: days, l: 'days' }, { v: hours, l: 'hrs' }, { v: minutes, l: 'min' }]
    : [{ v: hours, l: 'hrs' }, { v: minutes, l: 'min' }, { v: seconds, l: 'sec' }]

  return (
    <div className="flex items-end justify-center gap-4 mt-3">
      {parts.map(({ v, l }, i) => (
        <div key={l} className="flex items-end gap-0.5">
          <span className="text-2xl font-bold font-mono text-white leading-none">
            {String(v).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 mb-0.5">{l}</span>
          {i < parts.length - 1 && (
            <span className="text-gray-600 font-bold text-xl leading-none ml-2">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
