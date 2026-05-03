import { useState, useMemo } from 'react'
import { POSITION_ABBR, POSITION_COLOR } from '../../../constants/positions'
import styles from './PlayerTable.module.css'

const STATS_POSITION_ORDER = { Forward: 1, Midfielder: 2, Defender: 3, Goalkeeper: 4 }

function SortIcon({ active, dir }) {
  if (!active) return <span className={styles.sortIconInactive}>⇅</span>
  return <span className={styles.sortIconActive}>{dir === 'desc' ? '↓' : '↑'}</span>
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

  if (!rows.length) return <p className={styles.noData}>No data</p>

  return (
    <div role="table" className={styles.grid} style={{ gridTemplateColumns: gridTemplate, columnGap: '0.75rem' }}>
      {/* Header */}
      <div role="rowgroup">
      <div role="row"
           className={styles.headerRow}
           style={{ gridTemplateColumns: 'subgrid', gridColumn: '1 / -1' }}>
        {effectiveColumns.map(col => (
          <div
            role="columnheader"
            aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : (col.noSort ? undefined : 'none')}
            key={col.key}
            onClick={() => handleSort(col)}
            className={`${styles.headerCell}${col.noSort ? '' : ` ${styles.headerCellSortable}`}`}
          >
            {!col.noSort && <span className={styles.sortIconInvisible}>⇅</span>}
            {col.tooltip ? (
              <div className={styles.tooltipWrap}>
                <span className={styles.tooltipTrigger}>
                  {splitLabel(col.label).map((part, i, arr) => (
                    <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
                  ))}
                </span>
                <span className={styles.tooltipPopup}>{col.tooltip}</span>
              </div>
            ) : (
              <span className={styles.labelWrap}>
                {splitLabel(col.label).map((part, i, arr) => (
                  <span key={i}>{part}{i < arr.length - 1 && <br />}</span>
                ))}
              </span>
            )}
            {!col.noSort && <SortIcon active={sortKey === col.key} dir={sortDir} />}
          </div>
        ))}
      </div>
      </div>

      {/* Rows */}
      <div role="rowgroup">
      {rows.map((p, i) => (
        <div
          role="row"
          key={`${p.player_id || p.player_name}-${i}`}
          className={styles.dataRow}
          style={{ gridTemplateColumns: 'subgrid', gridColumn: '1 / -1' }}
        >
          {effectiveColumns.map(col => {
            const val = p[col.key]

            if (col.key === 'player_name') {
              const content = (
                <div className={styles.playerCell}>
                  {p.player_logo
                    ? (
                      <div className={styles.playerAvatar}>
                        <img src={p.player_logo} alt="" className={styles.playerAvatarImg} />
                      </div>
                    )
                    : <div className={styles.playerAvatarFallback}>👤</div>
                  }
                  <span className={styles.playerName}>
                    {p.is_captain ? <span className={styles.captainBadge}>©</span> : null}
                    {val}
                    {p.is_substitute ? <span className={styles.subBadge} title="Substituted in">sub</span> : null}
                  </span>
                </div>
              )
              return (
                <div role="cell" key={col.key} style={{ minWidth: 0 }}>
                  {p.player_path
                    ? <a href={p.player_path} className={styles.playerLink}>{content}</a>
                    : content
                  }
                </div>
              )
            }

            if (col.key === 'team_name') {
              const logo = p.team_logo
                ? <img src={p.team_logo} alt={val || ''} title={val || ''} className={styles.teamLogo} />
                : <div className={styles.teamLogoFallback} title={val || ''} />
              return (
                <div role="cell" key={col.key} className={styles.teamCell}>
                  {p.team_path
                    ? <a href={p.team_path} className={styles.teamLink}>{logo}</a>
                    : logo
                  }
                </div>
              )
            }

            if (col.key === 'match_rating') {
              if (val == null) return <div role="cell" key={col.key} className={`${styles.ratingCell} ${styles.ratingEmpty}`}>-</div>
              const r = Math.min(parseFloat(val), 10)
              const ratingCls = r >= 8 ? styles.ratingGreen : r >= 7 ? styles.ratingBlue : r >= 6 ? styles.ratingGray : styles.ratingRed
              return <div role="cell" key={col.key} className={`${styles.ratingCell} ${ratingCls}`}>{r.toFixed(2)}</div>
            }

            if (col.key === 'position') {
              const color = POSITION_COLOR[val] || '#6b7280'
              return <div role="cell" key={col.key} className={styles.posCell} style={{ color }}>{POSITION_ABBR[val] || val || '-'}</div>
            }

            return (
              <div
                role="cell"
                key={col.key}
                className={`${styles.statCell} ${col.align === 'center' ? styles.statCellCenter : styles.statCellLeft} ${sortKey === col.key ? styles.statActive : styles.statDefault}`}
              >
                {fmt(val, col.pct)}
              </div>
            )
          })}
        </div>
      ))}
      </div>
    </div>
  )
}
