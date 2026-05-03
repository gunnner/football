import styles from './MatchOdds.module.css'

const LINE_MARKET_RE = /^(Total Goals|Total Corners|Total Cards|Asian Handicap|Correct Score)\s+(.+)$/
const MIN_BOOKMAKERS = 3
const SKIP_BASE = new Set(['Correct Score'])

const BASE_ORDER = [
  'Full Time Result',
  'Both Teams To Score',
  'Total Goals',
  'First Team To Score',
  'Asian Handicap',
  'Clean Sheet',
  'Odd or Even',
  'Total Corners',
  'Total Cards',
]

function parseMarket(str) {
  const m = str.match(LINE_MARKET_RE)
  return m ? { base: m[1], line: m[2] } : { base: str, line: null }
}

function sortLine(a, b) {
  const na = parseFloat(a.replace(/[^0-9.]/g, ''))
  const nb = parseFloat(b.replace(/[^0-9.]/g, ''))
  if (!isNaN(na) && !isNaN(nb)) return na - nb
  return a.localeCompare(b)
}

function baseOrder(base) {
  const i = BASE_ORDER.indexOf(base)
  return i === -1 ? BASE_ORDER.length : i
}

function colLabel(value, homeTeam, awayTeam) {
  if (value === 'Home' && homeTeam?.name) return homeTeam.name
  if (value === 'Away' && awayTeam?.name) return awayTeam.name
  return value
}

const toNum = v => (v == null || isNaN(Number(v))) ? Infinity : Number(v)

function OddsCell({ odd, best }) {
  if (odd == null) return <td className={styles.tdOddEmpty}>—</td>
  return (
    <td className={`${styles.tdOdd}${best ? ` ${styles.tdOddBest}` : ''}`}>
      {Number(odd).toFixed(2)}
    </td>
  )
}

function SimpleMarketTable({ base, entries, homeTeam, awayTeam }) {
  const valSet = new Set()
  entries.forEach(e => e.values.forEach(v => valSet.add(v.value)))
  const cols = [...valSet].sort()

  const byBm = {}
  entries.forEach(e => {
    byBm[e.bookmakerName] ??= {}
    e.values.forEach(({ value, odd }) => { byBm[e.bookmakerName][value] = odd })
  })

  const rows    = Object.entries(byBm).sort(([a], [b]) => a.localeCompare(b))
  const bestOdd = Object.fromEntries(cols.map(c => [c, Math.min(...rows.map(([, o]) => toNum(o[c])))]))

  return (
    <div className={styles.marketCard}>
      <div className={styles.marketHeader}>
        <p className={styles.marketTitle}>{base}</p>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th scope="col" className={styles.thBookmaker}>Bookmaker</th>
              {cols.map(c => (
                <th scope="col" key={c} className={styles.thValue}>{colLabel(c, homeTeam, awayTeam)}</th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {rows.map(([name, odds]) => (
              <tr key={name}>
                <td className={styles.tdBookmaker}>{name}</td>
                {cols.map(c => <OddsCell key={c} odd={odds[c]} best={toNum(odds[c]) === bestOdd[c]} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LineMarketTable({ base, lineGroups, homeTeam, awayTeam }) {
  const lines = Object.keys(lineGroups)
    .filter(l => lineGroups[l].length >= MIN_BOOKMAKERS)
    .sort(sortLine)

  if (!lines.length) return null

  const firstEntries = lineGroups[lines[0]]
  const valSet       = new Set()
  firstEntries.forEach(e => e.values.forEach(v => valSet.add(v.value)))
  const cols = [...valSet].sort()

  return (
    <div className={styles.marketCard}>
      <div className={styles.marketHeader}>
        <p className={styles.marketTitle}>{base}</p>
      </div>

      {lines.map((line, li) => {
        const entries = lineGroups[line]
        const byBm    = {}
        entries.forEach(e => {
          byBm[e.bookmakerName] ??= {}
          e.values.forEach(({ value, odd }) => { byBm[e.bookmakerName][value] = odd })
        })
        const rows    = Object.entries(byBm).sort(([a], [b]) => a.localeCompare(b))
        const bestOdd = Object.fromEntries(cols.map(c => [c, Math.min(...rows.map(([, o]) => toNum(o[c])))]))

        return (
          <div key={line}>
            <div className={`${styles.lineGroupHeader}${li > 0 ? ` ${styles.lineGroupBorder}` : ''}`}>
              <p className={styles.lineLabel}>{line}</p>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.thSmall}>Bookmaker</th>
                  {cols.map(c => (
                    <th scope="col" key={c} className={styles.thSmallValue}>{colLabel(c, homeTeam, awayTeam)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={styles.tbodyLast}>
                {rows.map(([name, odds]) => (
                  <tr key={name}>
                    <td className={styles.tdSmall}>{name}</td>
                    {cols.map(c => <OddsCell key={c} odd={odds[c]} best={toNum(odds[c]) === bestOdd[c]} />)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

export default function MatchOdds({ bookmakers, homeTeam, awayTeam }) {
  if (!bookmakers?.length) return null

  const simple    = {}
  const lineGroup = {}

  bookmakers.forEach(entry => {
    if (!entry.values?.length) return
    const { base, line } = parseMarket(entry.market)
    if (SKIP_BASE.has(base)) return

    if (line === null) {
      ;(simple[base] ??= []).push(entry)
    } else {
      lineGroup[base] ??= {}
      ;(lineGroup[base][line] ??= []).push(entry)
    }
  })

  const allBases = [
    ...Object.keys(simple),
    ...Object.keys(lineGroup),
  ].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => baseOrder(a) - baseOrder(b))

  if (!allBases.length) return null

  return (
    <div className={styles.stack}>
      {allBases.map(base => {
        if (lineGroup[base]) {
          return (
            <LineMarketTable
              key={base}
              base={base}
              lineGroups={lineGroup[base]}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
            />
          )
        }
        return (
          <SimpleMarketTable
            key={base}
            base={base}
            entries={simple[base]}
            homeTeam={homeTeam}
            awayTeam={awayTeam}
          />
        )
      })}
      <p className={styles.disclaimer}>Odds for informational purposes only</p>
    </div>
  )
}
