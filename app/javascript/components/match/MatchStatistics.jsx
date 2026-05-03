import { useState } from 'react'
import { PLAYER_TABS, GENERAL_SECTIONS } from '../../constants/statisticsTabs'
import PlayerTable from './statistics/PlayerTable'
import styles from './MatchStatistics.module.css'

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
    <div className={styles.statRow}>
      <div className={styles.statRowLabels}>
        <span className={styles.statValueHome}>{formatStatValue(name, homeRaw)}</span>
        <span className={styles.statName}>{name}</span>
        <span className={styles.statValueAway}>{formatStatValue(name, awayRaw)}</span>
      </div>
      <div className={styles.statBar}>
        <div className={styles.statBarHome} style={{ width: `${homePct}%` }} />
        <div className={styles.statBarAway} style={{ width: `${100 - homePct}%` }} />
      </div>
    </div>
  )
}

function SectionCard({ title, stats, statsByName }) {
  const available = stats.filter(s => statsByName[s])
  if (!available.length) return null
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      <div className={styles.sectionBody}>
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
    return <p className={styles.noData}>No statistics yet</p>
  }
  const statsByName = statistics.reduce((acc, s) => {
    if (!acc[s.display_name]) acc[s.display_name] = {}
    if (s.team_external_id === homeTeam.external_id) acc[s.display_name].home = s.value
    else acc[s.display_name].away = s.value
    return acc
  }, {})

  return (
    <>
      <div className={styles.teamsHeader}>
        <div className={styles.teamHeaderItem}>
          <div className={styles.teamDotHome} />
          <a href={homeTeam.path} className={styles.teamLinkHome}>{homeTeam.name}</a>
        </div>
        <div className={styles.teamHeaderItem}>
          <a href={awayTeam.path} className={styles.teamLinkAway}>{awayTeam.name}</a>
          <div className={styles.teamDotAway} />
        </div>
      </div>
      <div className={styles.statsCols}>
        {[GENERAL_SECTIONS.filter((_, i) => i % 2 === 0), GENERAL_SECTIONS.filter((_, i) => i % 2 === 1)].map((col, ci) => (
          <div key={ci} className={styles.statsCol}>
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
    return <p className={styles.noData}>No player data yet</p>
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
      <div className={styles.playerTabsBar}>
        <div className={styles.playerTabsScroll}>
          {visibleTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`${styles.playerTab} ${activeTab === t.key ? styles.playerTabActive : styles.playerTabInactive}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.teamFilterBtns}>
          {[['both', 'Both'], ['home', 'Home'], ['away', 'Away']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTeamFilter(val)}
              className={`${styles.filterBtn} ${teamFilter === val ? styles.filterBtnActive : styles.filterBtnInactive}`}
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
    <div className={styles.card}>
      <div className={styles.viewTabs}>
        {[['general', 'General Team Stats'], ['players', 'Player Stats']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`${styles.viewTab} ${activeView === key ? styles.viewTabActive : styles.viewTabInactive}`}
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
