import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { formatFee } from '../../utils/money'

const JUNIOR_PAT = /\bU\d{2}\b|\bYouth\b|\bJuniors?\b|\bAcademy\b/i

function seasonToYear(season) {
  const m = season?.match(/^(\d{2})/)
  if (!m) return 0
  const yy = parseInt(m[1])
  return yy >= 90 ? 1900 + yy : 2000 + yy
}

function typeLabel(type) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) ?? '—'
}

function TeamCell({ name, logo, path }) {
  const inner = (
    <span className="flex items-center gap-1.5 min-w-0">
      {logo
        ? <img src={logo} alt="" style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} />
        : <span style={{ width: 16, height: 16, flexShrink: 0 }} />
      }
      <span className="truncate">{name}</span>
    </span>
  )
  if (path) return <a href={path} className="hover:text-white transition-colors">{inner}</a>
  return inner
}

function badgeClass(type) {
  if (type === 'loan')        return 'bg-blue-900/60 text-blue-300'
  if (type === 'end_of_loan') return 'bg-purple-900/60 text-purple-300'
  return 'bg-green-900/60 text-green-300'
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: '#111827', border: '1px solid #374151', borderRadius: 8,
      padding: '10px 14px', fontSize: 12, minWidth: 170, boxShadow: '0 4px 16px #0006'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {d.team_to_logo
          ? <img src={d.team_to_logo} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
          : <div style={{ width: 22, height: 22, background: '#1f2937', borderRadius: '50%' }} />
        }
        <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{d.team_to}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ color: '#6b7280' }}>
          Fee: <span style={{ color: d.fee ? '#4ade80' : '#6b7280' }}>{d.fee ?? '—'}</span>
        </div>
        {d.transfer_date && (
          <div style={{ color: '#6b7280' }}>
            Date: <span style={{ color: '#d1d5db' }}>{d.transfer_date}</span>
          </div>
        )}
        {d.transfer_type && (
          <div style={{ color: '#6b7280' }}>
            Type: <span style={{ color: '#d1d5db' }}>{typeLabel(d.transfer_type)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CustomDot(props) {
  const { cx, cy, payload, index } = props
  if (cx == null || cy == null) return null

  const { team_to_logo, fee_value } = payload
  const hasFee = fee_value > 0
  const size = 22
  const r = size / 2
  const clipId = `tclip-${index}`

  if (!team_to_logo) {
    return (
      <circle cx={cx} cy={cy} r={hasFee ? 5 : 3}
        fill={hasFee ? '#3b82f6' : '#374151'}
        stroke={hasFee ? '#93c5fd' : 'none'}
        strokeWidth={1}
      />
    )
  }

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r + 1} fill="#0f172a" stroke="#374151" strokeWidth={1} />
      <image
        href={team_to_logo}
        x={cx - r} y={cy - r}
        width={size} height={size}
        clipPath={`url(#${clipId})`}
        preserveAspectRatio="xMidYMid meet"
      />
    </g>
  )
}

function MVReferenceLine({ viewBox, date, value }) {
  if (!viewBox) return null
  const { x, y } = viewBox
  return (
    <g>
      <text x={x - 6} y={y + 4} textAnchor="end" fill="#7c3aed" fontSize={10} fontWeight={600} fontFamily="ui-sans-serif,sans-serif">
        {formatFee(value)}
      </text>
      <text x={x + 6} y={y - 6} textAnchor="start" fill="#a78bfa" fontSize={10} fontFamily="ui-sans-serif,sans-serif">
        The last estimated value
      </text>
      <text x={x + 6} y={y + 14} textAnchor="start" fill="#6b7280" fontSize={10} fontFamily="ui-sans-serif,sans-serif">
        {`Valuation Date: ${date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}`}
      </text>
    </g>
  )
}

export default function PlayerTransfers({ transfers = [], market_value, market_value_date }) {
  const withFlags  = transfers.map(t => ({ ...t, isJunior: JUNIOR_PAT.test(t.team_from) }))
  const junior     = withFlags.filter(t =>  t.isJunior).sort((a, b) => seasonToYear(b.season) - seasonToYear(a.season))
  const senior     = withFlags.filter(t => !t.isJunior)
  const seniorDesc = [...senior].sort((a, b) => seasonToYear(b.season) - seasonToYear(a.season))
  const chartData  = [...senior].sort((a, b) => seasonToYear(a.season) - seasonToYear(b.season))

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Transfers</h2>
      </div>
      <div className="flex p-4 gap-6 items-stretch">

        {/* ── Left: table ── */}
        <div className="w-1/2">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-600 uppercase">
                <th className="text-left font-medium pb-2 pr-2">Season</th>
                <th className="text-left font-medium pb-2 pr-2">From</th>
                <th className="text-left font-medium pb-2 pr-2">To</th>
                <th className="text-left font-medium pb-2 pr-2">Type</th>
                <th className="text-right font-medium pb-2">Fee</th>
              </tr>
            </thead>
            <tbody>
              {seniorDesc.map((t, i) => (
                <tr key={i} className="border-t border-gray-800/60">
                  <td className="py-2 pr-2 text-gray-500 whitespace-nowrap">{t.season ?? '—'}</td>
                  <td className="py-2 pr-2 text-gray-400"><TeamCell name={t.team_from} logo={t.team_from_logo} path={t.team_from_path} /></td>
                  <td className="py-2 pr-2 text-gray-100 font-medium"><TeamCell name={t.team_to} logo={t.team_to_logo} path={t.team_to_path} /></td>
                  <td className="py-2 pr-2">
                    <span className={`px-1.5 py-0.5 rounded ${badgeClass(t.transfer_type)}`}>
                      {typeLabel(t.transfer_type)}
                    </span>
                  </td>
                  <td className="py-2 text-right text-green-400 whitespace-nowrap">{t.fee ?? '—'}</td>
                </tr>
              ))}

              {junior.length > 0 && (
                <>
                  <tr>
                    <td colSpan={5} className="pt-4 pb-1.5">
                      <span className="text-gray-600 uppercase tracking-wider font-medium">Junior career</span>
                    </td>
                  </tr>
                  {junior.map((t, i) => (
                    <tr key={`jr-${i}`}>
                      <td className="py-1.5 pr-2 text-gray-600 whitespace-nowrap">{t.season ?? '—'}</td>
                      <td className="py-1.5 pr-2 text-gray-600"><TeamCell name={t.team_from} logo={t.team_from_logo} path={t.team_from_path} /></td>
                      <td className="py-1.5 pr-2 text-gray-500"><TeamCell name={t.team_to} logo={t.team_to_logo} path={t.team_to_path} /></td>
                      <td className="py-1.5 pr-2 text-gray-600">—</td>
                      <td className="py-1.5 text-right text-gray-600 whitespace-nowrap">{t.fee ?? '—'}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Right: chart ── */}
        <div className="w-1/2 border-l border-gray-800 pl-6 flex flex-col min-h-0">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-4">Transfer Value</p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 14, left: 6, bottom: 44 }}>
                <defs>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis
                  dataKey="season"
                  tick={{ fill: '#4b5563', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#374151' }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tickFormatter={v => formatFee(v) ?? '€0'}
                  tick={{ fill: '#4b5563', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={54}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '4 2' }}
                />
                <Area
                  type="monotone"
                  dataKey="fee_value"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  fill="url(#feeGrad)"
                  dot={(props) => <CustomDot {...props} />}
                  activeDot={false}
                />
                {market_value > 0 && (
                  <ReferenceLine
                    y={market_value}
                    stroke="#7c3aed"
                    strokeWidth={1}
                    strokeDasharray="5 3"
                    label={(props) => <MVReferenceLine {...props} date={market_value_date} value={market_value} />}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
