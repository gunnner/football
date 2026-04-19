import { useState } from 'react'
import { OUTCOME_STYLE } from './GoalFace'

function PlayerAvatar({ logo, name, size = 5 }) {
  const [failed, setFailed] = useState(false)
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0`
  if (logo && !failed) {
    return (
      <div className={`${cls} bg-gray-700 overflow-hidden`}>
        <img src={logo} alt={name} onError={() => setFailed(true)}
             className="w-full" style={{ height: '200%', objectFit: 'cover', objectPosition: '50% 0%' }} />
      </div>
    )
  }
  return (
    <div className={`${cls} bg-gray-700 flex items-center justify-center text-[9px]`}>👤</div>
  )
}

function parseTime(t) {
  if (!t) return 0
  const m = String(t).match(/(\d+)\s*\+\s*(\d+)/)
  return m ? parseInt(m[1]) * 100 + parseInt(m[2]) : parseInt(t) * 100
}

export function CombinedShotList({ homeShots, awayShots, homeExternalId }) {
  const all = [...homeShots, ...awayShots].sort((a, b) => parseTime(a.time) - parseTime(b.time))

  if (all.length === 0) return <p className="text-xs text-gray-600 text-center py-4">No shot data</p>

  return (
    <div className="space-y-0.5">
      {all.map((s, i) => {
        const isHome = String(s.team_external_id) === String(homeExternalId)
        const style  = OUTCOME_STYLE[s.outcome] ?? { fill: '#6b7280' }
        const nameEl = s.player_path
          ? <a href={s.player_path} className="text-gray-200 truncate hover:text-white transition-colors">{s.player_name}</a>
          : <span className="text-gray-200 truncate">{s.player_name}</span>
        return (
          <div key={i} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded hover:bg-gray-800/50 transition-colors ${isHome ? '' : 'flex-row-reverse'}`}>
            <PlayerAvatar logo={s.player_logo} name={s.player_name} size={5} />
            <span className="text-gray-500 flex-shrink-0 w-7 tabular-nums">{s.time}'</span>
            {nameEl}
            <span className="flex-shrink-0 text-[10px] font-medium" style={{ color: style.fill }}>{s.outcome}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ProbabilityBars({ predictions, homeTeam, awayTeam, isLive }) {
  if (!isLive || !predictions) return null
  const pred = predictions.live ?? predictions.prematch
  if (!pred) return null

  const rows = [
    { logo: homeTeam.logo, path: homeTeam.path, pct: parseFloat(pred.home_pct), color: 'bg-blue-500' },
    { label: 'Draw',                                pct: parseFloat(pred.draw_pct), color: 'bg-gray-500' },
    { logo: awayTeam.logo, path: awayTeam.path, pct: parseFloat(pred.away_pct), color: 'bg-red-500'  },
  ]

  return (
    <div className="bg-gray-900 rounded-xl p-4 mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-center">
        Win Probability {predictions.live ? '· Live' : '· Pre-match'}
      </p>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-8 flex justify-center items-center flex-shrink-0">
              {row.logo
                ? <a href={row.path}><img src={row.logo} className="w-5 h-5 object-contain" alt="" /></a>
                : <span className="text-xs text-gray-400">{row.label}</span>
              }
            </div>
            <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
              <div className={`h-full rounded-full ${row.color} transition-all duration-500`}
                style={{ width: `${row.pct ?? 0}%` }} />
            </div>
            <span className="text-xs text-gray-300 w-10 text-right font-medium">{row.pct?.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
