import { useState, useMemo } from 'react'
import { POSITION_ABBR, POSITION_COLOR_CLASS } from '../../../constants/positions'

const STATS_POSITION_ORDER = { Forward: 1, Midfielder: 2, Defender: 3, Goalkeeper: 4 }

function SortIcon({ active, dir }) {
  if (!active) return <span className="text-gray-700 ml-0.5 text-xs">⇅</span>
  return <span className="text-blue-400 ml-0.5 text-xs">{dir === 'desc' ? '↓' : '↑'}</span>
}

function splitLabel(label) {
  const words = label.split(' ')
  const parts = []
  let current = words[0]
  for (let i = 1; i < words.length; i++) {
    if (/^[%#‰]+$/.test(words[i])) {
      current = current + ' ' + words[i]
    } else {
      parts.push(current)
      current = words[i]
    }
  }
  parts.push(current)
  return parts
}

const fmt = (v, pct = false) => {
  if (v == null || v === '') return '-'
  const n = parseFloat(v)
  if (isNaN(n)) return '-'
  if (pct) return `${Math.round(n)}%`
  return Number.isInteger(n) ? n : parseFloat(n.toFixed(2))
}

export default function PlayerTable({ tab, players }) {
  const noGoals = tab.key === 'attack' && !players.some(p => (p.goals_scored || 0) > 0)

  const effectiveColumns = useMemo(() => {
    if (!noGoals) return tab.columns
    const cols = [...tab.columns]
    const gi = cols.findIndex(c => c.key === 'goals_scored')
    const xi = cols.findIndex(c => c.key === 'expected_goals')
    if (gi !== -1 && xi !== -1) [cols[gi], cols[xi]] = [cols[xi], cols[gi]]
    return cols
  }, [tab.columns, noGoals])

  const [sortKey, setSortKey] = useState(noGoals ? 'expected_goals' : tab.defaultSort)
  const [sortDir, setSortDir] = useState(tab.defaultDir || 'desc')

  const rows = useMemo(() => {
    const filtered = players
      .filter(p => (p.minutes_played || 0) >= 1 || (p.cards_yellow || 0) > 0 || (p.cards_red || 0) > 0 || (p.cards_second_yellow || 0) > 0)
      .filter(p => tab.gkOnly ? p.position === 'Goalkeeper' : true)
      .filter(p => tab.penaltiesOnly ? (p.penalties_total || 0) >= 1 : true)

    return [...filtered].sort((a, b) => {
      if (sortKey === 'position') {
        const ao = STATS_POSITION_ORDER[a.position] ?? 5
        const bo = STATS_POSITION_ORDER[b.position] ?? 5
        return sortDir === 'asc' ? ao - bo : bo - ao
      }
      if (sortKey === 'team_name') {
        const ao = a.is_home_team ? 0 : 1
        const bo = b.is_home_team ? 0 : 1
        return sortDir === 'asc' ? ao - bo : bo - ao
      }
      if (sortKey === 'player_name') {
        const cmp = (a.player_name || '').localeCompare(b.player_name || '')
        return sortDir === 'asc' ? cmp : -cmp
      }
      const av = a[sortKey], bv = b[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const diff = parseFloat(av) - parseFloat(bv)
      return sortDir === 'desc' ? -diff : diff
    })
  }, [players, sortKey, sortDir, tab.gkOnly, tab.penaltiesOnly])

  const handleSort = (col) => {
    if (col.noSort) return
    if (sortKey === col.key) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(col.key)
      setSortDir(col.key === 'position' || col.key === 'team_name' ? 'asc' : 'desc')
    }
  }

  const gridTemplate = effectiveColumns.map(c => c.w).join(' ')

  if (!rows.length) return <p className="text-center text-gray-500 py-8">No data</p>

  return (
    <div className="grid px-3" style={{ gridTemplateColumns: gridTemplate, columnGap: '0.75rem' }}>
      {/* Header */}
      <div className="col-span-full grid py-2 border-b border-gray-800 bg-gray-900"
           style={{ gridTemplateColumns: 'subgrid', gridColumn: '1 / -1' }}>
        {effectiveColumns.map(col => (
          <div
            key={col.key}
            onClick={() => handleSort(col)}
            className={[
              'flex items-center justify-center text-xs font-semibold text-gray-500 uppercase tracking-wider select-none',
              col.noSort ? '' : 'cursor-pointer hover:text-gray-300',
            ].join(' ')}
          >
            {!col.noSort && <span className="invisible ml-0.5 text-xs">⇅</span>}
            {col.tooltip ? (
              <span className="relative group/tip leading-tight text-center">
                <span className="border-b border-dashed border-gray-500 cursor-help">
                  {splitLabel(col.label).map((part, i, arr) => (
                    <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
                  ))}
                </span>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                 px-2 py-1 bg-gray-700 text-gray-100 text-xs font-normal
                                 normal-case tracking-normal rounded whitespace-nowrap
                                 pointer-events-none z-50 shadow-lg
                                 opacity-0 group-hover/tip:opacity-100
                                 transition-opacity duration-150 delay-150">
                  {col.tooltip}
                </span>
              </span>
            ) : (
              <span className="leading-tight text-center">
                {splitLabel(col.label).map((part, i, arr) => (
                  <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
                ))}
              </span>
            )}
            {!col.noSort && <SortIcon active={sortKey === col.key} dir={sortDir} />}
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((p, i) => (
        <div
          key={`${p.player_id || p.player_name}-${i}`}
          className="col-span-full grid py-2.5 border-b border-gray-800/60 last:border-0 hover:bg-gray-800/40 transition-colors items-center"
          style={{ gridTemplateColumns: 'subgrid', gridColumn: '1 / -1' }}
        >
          {effectiveColumns.map(col => {
            const val = p[col.key]

            if (col.key === 'player_name') {
              const content = (
                <div className="flex items-center gap-2 min-w-0 pl-4">
                  {p.player_logo
                    ? <img src={p.player_logo} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-5 h-5 rounded-full bg-gray-700 flex-shrink-0" />
                  }
                  <span className="text-sm text-gray-200 truncate">
                    {p.is_captain ? <span className="text-yellow-400 mr-0.5 text-xs">©</span> : null}
                    {val}
                    {p.is_substitute ? <span className="text-green-600 text-xs ml-1" title="Substituted in">sub</span> : null}
                  </span>
                </div>
              )
              return (
                <div key={col.key} className="min-w-0">
                  {p.player_path
                    ? <a href={p.player_path} className="hover:opacity-80 transition-opacity">{content}</a>
                    : content
                  }
                </div>
              )
            }

            if (col.key === 'team_name') {
              const logo = p.team_logo
                ? <img src={p.team_logo} alt={val || ''} title={val || ''} className="w-6 h-6 object-contain" />
                : <div className="w-6 h-6 rounded-full bg-gray-700" title={val || ''} />
              return (
                <div key={col.key} className="flex justify-center">
                  {p.team_path
                    ? <a href={p.team_path} className="hover:opacity-75 transition-opacity">{logo}</a>
                    : logo
                  }
                </div>
              )
            }

            if (col.key === 'match_rating') {
              if (val == null) return <div key={col.key} className="flex items-center justify-center text-gray-600 text-sm">-</div>
              const r = parseFloat(val)
              const color = r >= 8 ? 'text-green-400' : r >= 7 ? 'text-blue-400' : r >= 6 ? 'text-gray-200' : 'text-red-400'
              return <div key={col.key} className={`flex items-center justify-center text-sm font-bold ${color}`}>{r.toFixed(2)}</div>
            }

            if (col.key === 'position') {
              const color = POSITION_COLOR_CLASS[val] || 'text-gray-500'
              return <div key={col.key} className={`flex items-center justify-center text-xs font-semibold ${color}`}>{POSITION_ABBR[val] || val || '-'}</div>
            }

            return (
              <div
                key={col.key}
                className={[
                  'text-sm flex items-center',
                  col.align === 'center' ? 'justify-center' : 'justify-start',
                  sortKey === col.key ? 'text-white font-semibold' : 'text-gray-300',
                ].join(' ')}
              >
                {fmt(val, col.pct)}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
