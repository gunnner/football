import { useState } from 'react'
import { PLAYER_TABS, GENERAL_SECTIONS } from '../../constants/statisticsTabs'
import PlayerTable from './statistics/PlayerTable'

// ── General Team Stats ────────────────────────────────────────────────────────

function formatStatValue(name, raw) {
  if (raw == null) return '-'
  if (name === 'Possession') {
    const n = parseFloat(raw) || 0
    return `${n < 1 ? Math.round(n * 100) : Math.round(n)}%`
  }
  const num = parseFloat(raw)
  if (!isNaN(num) && Number.isInteger(num)) return num
  if (!isNaN(num)) return parseFloat(num.toFixed(2))
  return raw
}

function StatBar({ name, homeRaw, awayRaw }) {
  const home    = parseFloat(homeRaw) || 0
  const away    = parseFloat(awayRaw) || 0
  const total   = home + away || 1
  const homePct = Math.round((home / total) * 100)
  return (
    <div className="py-2 border-b border-gray-800/50 last:border-0">
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="font-semibold text-gray-100 w-12">{formatStatValue(name, homeRaw)}</span>
        <span className="text-gray-500 text-xs text-center flex-1 px-1 truncate">{name}</span>
        <span className="font-semibold text-gray-100 w-12 text-right">{formatStatValue(name, awayRaw)}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        <div className="rounded-l-full bg-blue-500" style={{ width: `${homePct}%` }} />
        <div className="rounded-r-full bg-red-500"  style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  )
}

function SectionCard({ title, stats, statsByName }) {
  const available = stats.filter(s => statsByName[s])
  if (!available.length) return null
  return (
    <div className="bg-gray-800/40 rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-700/50">
        <span className="text-sm font-bold text-gray-200 uppercase tracking-wide">{title}</span>
      </div>
      <div className="px-3">
        {available.map(name => (
          <StatBar key={name} name={name}
            homeRaw={statsByName[name]?.home}
            awayRaw={statsByName[name]?.away}
          />
        ))}
      </div>
    </div>
  )
}

function GeneralStats({ homeTeam, awayTeam, statistics }) {
  if (!statistics?.length) {
    return <p className="text-center text-gray-500 py-8">No statistics yet</p>
  }
  const statsByName = statistics.reduce((acc, s) => {
    if (!acc[s.display_name]) acc[s.display_name] = {}
    if (s.team_external_id === homeTeam.external_id) acc[s.display_name].home = s.value
    else acc[s.display_name].away = s.value
    return acc
  }, {})

  return (
    <>
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
          <a href={homeTeam.path} className="text-sm font-semibold text-gray-100 hover:text-blue-400 transition-colors">{homeTeam.name}</a>
        </div>
        <div className="flex items-center gap-2">
          <a href={awayTeam.path} className="text-sm font-semibold text-gray-100 hover:text-red-400 transition-colors">{awayTeam.name}</a>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" />
        </div>
      </div>
      <div className="p-3 flex gap-3">
        {[GENERAL_SECTIONS.filter((_, i) => i % 2 === 0), GENERAL_SECTIONS.filter((_, i) => i % 2 === 1)].map((col, ci) => (
          <div key={ci} className="flex-1 flex flex-col gap-3">
            {col.map(s => <SectionCard key={s.title} title={s.title} stats={s.stats} statsByName={statsByName} />)}
          </div>
        ))}
      </div>
    </>
  )
}

// ── Player Stats ──────────────────────────────────────────────────────────────

function PlayerStats({ players }) {
  const [activeTab,  setActiveTab]  = useState('main')
  const [teamFilter, setTeamFilter] = useState('both')

  if (!players?.length) {
    return <p className="text-center text-gray-500 py-8">No player data yet</p>
  }

  const hasPenalties    = players.some(p => (p.penalties_total || 0) >= 1)
  const visibleTabs     = PLAYER_TABS.filter(t => t.penaltiesOnly ? hasPenalties : true)
  const tab             = visibleTabs.find(t => t.key === activeTab) || visibleTabs[0]
  const filteredPlayers = players.filter(p => {
    if (teamFilter === 'home') return p.is_home_team
    if (teamFilter === 'away') return !p.is_home_team
    return true
  })

  return (
    <div>
      <div className="flex items-end justify-between gap-0.5 px-3 pt-3 border-b border-gray-800">
        <div className="flex gap-0.5 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
          {visibleTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                'px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                activeTab === t.key
                  ? 'text-white border-blue-500'
                  : 'text-gray-500 hover:text-gray-300 border-transparent',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 pb-2 flex-shrink-0">
          {[['both', 'Both'], ['home', 'Home'], ['away', 'Away']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTeamFilter(val)}
              className={[
                'px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap',
                teamFilter === val
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-700',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <PlayerTable key={`${activeTab}-${teamFilter}`} tab={tab} players={filteredPlayers} />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function MatchStatistics({ homeTeam, awayTeam, statistics, boxScores }) {
  const [activeView, setActiveView] = useState('general')

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex border-b border-gray-800">
        {[['general', 'General Team Stats'], ['players', 'Player Stats']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={[
              'flex-1 py-3 text-sm font-medium transition-colors',
              activeView === key
                ? 'text-white border-b-2 border-blue-500 bg-gray-800/40'
                : 'text-gray-500 hover:text-gray-300',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
      {activeView === 'general'
        ? <GeneralStats homeTeam={homeTeam} awayTeam={awayTeam} statistics={statistics} />
        : <PlayerStats players={boxScores} />
      }
    </div>
  )
}
