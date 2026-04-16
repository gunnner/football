// API response (after backend flattening):
// [{ bookmakerId, bookmakerName, type, market, values: [{odd, value}] }, ...]
//
// Market naming: "Full Time Result", "Total Goals 2.5", "Asian Handicap -1/+1",
//                "Total Corners 9.5", "Total Cards 3.5", "Correct Score 0 : 0", etc.

const LINE_MARKET_RE = /^(Total Goals|Total Corners|Total Cards|Asian Handicap|Correct Score)\s+(.+)$/

// Minimum bookmakers required to show a line (filters out obscure lines)
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
  if (odd == null) return <td className="px-3 py-2 text-center text-gray-700 text-sm">—</td>
  return (
    <td className={`px-3 py-2 text-center font-mono text-sm tabular-nums ${best ? 'text-green-400 font-semibold' : 'text-gray-300'}`}>
      {Number(odd).toFixed(2)}
    </td>
  )
}

// ── Simple market (no line in name) ──────────────────────────────────────────
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
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{base}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium w-40">Bookmaker</th>
              {cols.map(c => (
                <th key={c} className="px-3 py-2 text-center text-xs text-gray-500 font-medium">
                  {colLabel(c, homeTeam, awayTeam)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {rows.map(([name, odds]) => (
              <tr key={name} className="hover:bg-gray-800/30">
                <td className="px-3 py-2 text-sm text-gray-300 whitespace-nowrap">{name}</td>
                {cols.map(c => <OddsCell key={c} odd={odds[c]} best={toNum(odds[c]) === bestOdd[c]} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Line market (Total Goals / Asian Handicap / Corners / Cards) ──────────────
function LineMarketTable({ base, lineGroups, homeTeam, awayTeam }) {
  const lines = Object.keys(lineGroups)
    .filter(l => lineGroups[l].length >= MIN_BOOKMAKERS)
    .sort(sortLine)

  if (!lines.length) return null

  // All cols are the same across lines for a given base market
  const firstEntries = lineGroups[lines[0]]
  const valSet       = new Set()
  firstEntries.forEach(e => e.values.forEach(v => valSet.add(v.value)))
  const cols = [...valSet].sort()

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{base}</p>
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
            <div className={`px-4 py-1.5 bg-gray-800/50 ${li > 0 ? 'border-t border-gray-800' : ''}`}>
              <p className="text-xs font-medium text-gray-400">{line}</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/60">
                  <th className="px-3 py-1.5 text-left text-xs text-gray-600 font-medium w-40">Bookmaker</th>
                  {cols.map(c => (
                    <th key={c} className="px-3 py-1.5 text-center text-xs text-gray-600 font-medium">
                      {colLabel(c, homeTeam, awayTeam)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {rows.map(([name, odds]) => (
                  <tr key={name} className="hover:bg-gray-800/30">
                    <td className="px-3 py-1.5 text-sm text-gray-300 whitespace-nowrap">{name}</td>
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MatchOdds({ bookmakers, homeTeam, awayTeam }) {
  if (!bookmakers?.length) return null

  // Split into simple markets and line markets
  const simple    = {}   // base → [entry]
  const lineGroup = {}   // base → { line → [entry] }

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
    <div className="space-y-3">
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
      <p className="text-[10px] text-gray-600 text-center pb-1">Odds for informational purposes only</p>
    </div>
  )
}
