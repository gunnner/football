import { useState }       from 'react'
import { useTeamData }    from '../../hooks/useTeamData'
import { matchPhase }     from '../../constants/matchStatus'
import Skeleton           from '../ui/Skeleton'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatNumber(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-US')
}

function seasonLabel(season) {
  if (!season) return ''
  return `${season}/${String(season + 1).slice(-2)}`
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex gap-5">
          <Skeleton className="w-20 h-20 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
            <div className="flex gap-2 mt-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-10 h-14" />)}
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

// ── Team logo ─────────────────────────────────────────────────────────────────

function TeamLogo({ logo, name }) {
  const [failed, setFailed] = useState(false)
  if (logo && !failed) {
    return (
      <img src={logo} alt={name} className="w-20 h-20 object-contain flex-shrink-0"
           onError={() => setFailed(true)} />
    )
  }
  return (
    <div className="w-20 h-20 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
      <span className="text-3xl">👤</span>
    </div>
  )
}

// ── Form badge ────────────────────────────────────────────────────────────────

function FormBadge({ match }) {
  const [hovered, setHovered] = useState(false)
  const color   = match.result === 'W' ? 'bg-green-500' : match.result === 'D' ? 'bg-yellow-500' : 'bg-red-500'
  const tooltip = `${match.date} · ${match.home_team_name} ${match.score} ${match.away_team_name}`

  return (
    <a href={match.path} className="relative flex flex-col items-center gap-1"
       onMouseEnter={() => setHovered(true)}
       onMouseLeave={() => setHovered(false)}>
      {match.opponent_logo
        ? <img src={match.opponent_logo} alt={match.opponent_name} className="w-8 h-8 object-contain" />
        : <div className="w-8 h-8 rounded-full bg-gray-700" />
      }
      <span className={`${color} text-white text-xs font-bold px-1.5 py-0.5 rounded`}>
        {match.score}
      </span>
      {hovered && (
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                         bg-gray-800 border border-gray-700 text-gray-100 text-xs rounded px-2 py-1
                         whitespace-nowrap z-50 shadow-lg pointer-events-none">
          {tooltip}
        </span>
      )}
    </a>
  )
}

// ── Position meta ─────────────────────────────────────────────────────────────

const POSITION_META = {
  'Goalkeeper':         { short: 'GK',  color: 'text-orange-400 bg-orange-400/10' },
  'Defender':           { short: 'DEF', color: 'text-blue-400 bg-blue-400/10' },
  'Centre-Back':        { short: 'CB',  color: 'text-blue-400 bg-blue-400/10' },
  'Left-Back':          { short: 'LB',  color: 'text-blue-400 bg-blue-400/10' },
  'Right-Back':         { short: 'RB',  color: 'text-blue-400 bg-blue-400/10' },
  'Midfielder':         { short: 'MID', color: 'text-green-400 bg-green-400/10' },
  'Defensive Midfield': { short: 'DM',  color: 'text-green-400 bg-green-400/10' },
  'Central Midfield':   { short: 'CM',  color: 'text-green-400 bg-green-400/10' },
  'Attacking Midfield': { short: 'AM',  color: 'text-green-400 bg-green-400/10' },
  'Attacker':           { short: 'ATT', color: 'text-red-400 bg-red-400/10' },
  'Forward':            { short: 'FWD', color: 'text-red-400 bg-red-400/10' },
  'Left Winger':        { short: 'LW',  color: 'text-red-400 bg-red-400/10' },
  'Right Winger':       { short: 'RW',  color: 'text-red-400 bg-red-400/10' },
  'Centre-Forward':     { short: 'CF',  color: 'text-red-400 bg-red-400/10' },
}

function AvgRatingBadge({ avgPlayerRate }) {
  const [hovered, setHovered] = useState(false)
  if (!avgPlayerRate?.rating) return null

  const { id, name, logo, position, rating } = avgPlayerRate
  const score      = parseFloat(rating).toFixed(2)
  const posMeta    = POSITION_META[position]
  const posShort   = posMeta?.short ?? position ?? null
  const posColor   = posMeta?.color ?? 'text-gray-400 bg-gray-400/10'
  const ratingColor = rating >= 8 ? 'text-green-400' : rating >= 7 ? 'text-yellow-400' : 'text-gray-300'

  return (
    <div className="relative flex-shrink-0 flex flex-col items-center bg-gray-800 rounded-xl px-3 py-2 cursor-default"
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}>
      <span className={`text-2xl font-bold ${ratingColor}`}>{score}</span>
      <span className="text-[10px] text-gray-500 mt-0.5 mb-1.5">Top rated player</span>
      <div className="flex items-center gap-1.5">
        {posShort && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${posColor}`}>{posShort}</span>
        )}
        {logo
          ? (
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
              <img src={logo} alt={name} className="w-full" style={{ height: '200%', objectFit: 'cover', objectPosition: '50% 0%' }}
                   onError={e => { e.target.closest('div').replaceWith(Object.assign(document.createElement('span'), { textContent: '👤', className: 'text-xs' })) }} />
            </div>
          )
          : <span className="text-xs">👤</span>
        }
        {name && (
          <a href={id ? `/players/${id}` : undefined}
             className="text-xs text-gray-300 hover:text-white transition-colors truncate max-w-[7rem]"
             onClick={e => e.stopPropagation()}>
            {name}
          </a>
        )}
      </div>
      {hovered && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-800 border border-gray-700
                        text-gray-200 text-xs rounded-lg px-3 py-2 shadow-xl z-50 pointer-events-none">
          The player's highest average rating based on all competitions in the current season
        </div>
      )}
    </div>
  )
}

// ── Team Header ───────────────────────────────────────────────────────────────

function TeamHeader({ attrs, form, avgPlayerRate }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-4">
      <div className="flex items-start gap-5">
        <TeamLogo logo={attrs.logo} name={attrs.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-white mb-1">{attrs.name}</h1>
            <AvgRatingBadge avgPlayerRate={avgPlayerRate} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
            {attrs.country    && <span>{attrs.country}</span>}
            {attrs.founded    && <span>Est. {attrs.founded}</span>}
            {attrs.coach_name && <span>Coach: <span className="text-gray-200">{attrs.coach_name}</span></span>}
            {attrs.venue_name && (
              <span>
                {attrs.venue_name}
                {attrs.venue_city     && `, ${attrs.venue_city}`}
                {attrs.venue_capacity && <span className="text-gray-500"> · {formatNumber(attrs.venue_capacity)}</span>}
              </span>
            )}
          </div>
          {form?.length > 0 && (
            <div className="mt-3">
              <span className="text-xs text-gray-500 block mb-2">Last 5 matches</span>
              <div className="flex items-end gap-2">
                {form.map(m => <FormBadge key={m.id} match={m} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Statistics ────────────────────────────────────────────────────────────────

function TeamStatistics({ stat }) {
  if (!stat) return null

  const rows = [
    { label: 'Total', p: stat.total_played, w: stat.total_wins, d: stat.total_draws, l: stat.total_loses, gf: stat.total_scored, ga: stat.total_received },
    { label: 'Home',  p: stat.home_played,  w: stat.home_wins,  d: stat.home_draws,  l: stat.home_loses,  gf: stat.home_scored,  ga: stat.home_received  },
    { label: 'Away',  p: stat.away_played,  w: stat.away_wins,  d: stat.away_draws,  l: stat.away_loses,  gf: stat.away_scored,  ga: stat.away_received  },
  ]

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          {stat.league_name} {seasonLabel(stat.season)}
        </h2>
      </div>
      <div className="divide-y divide-gray-800">
        {rows.map(row => {
          const diff = row.gf - row.ga
          return (
            <div key={row.label} className="grid grid-cols-7 px-4 py-3 items-center text-sm">
              <div className="text-gray-400 font-medium">{row.label}</div>
              <div className="text-center text-gray-400">{row.p} <span className="text-gray-600 text-xs">P</span></div>
              <div className="text-center text-green-400 font-semibold">{row.w} <span className="text-gray-600 text-xs font-normal">W</span></div>
              <div className="text-center text-yellow-400 font-semibold">{row.d} <span className="text-gray-600 text-xs font-normal">D</span></div>
              <div className="text-center text-red-400 font-semibold">{row.l} <span className="text-gray-600 text-xs font-normal">L</span></div>
              <div className="text-center text-white font-bold col-span-2">
                {row.gf}:{row.ga}
                <span className={`text-xs font-normal ml-1 ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({diff >= 0 ? '+' : ''}{diff})
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Recent Matches ────────────────────────────────────────────────────────────

function TeamRecentMatches({ matches, included, teamId }) {
  const teamsById = {}
  included?.forEach(item => {
    if (item.type === 'team') teamsById[item.id] = item.attributes
  })

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recent Matches</h2>
      </div>
      {!matches?.length
        ? <p className="text-center text-gray-500 py-8">No matches found</p>
        : matches.map(match => {
            const a        = match.attributes
            const homeId   = match.relationships?.home_team?.data?.id
            const awayId   = match.relationships?.away_team?.data?.id
            const homeTeam = teamsById[homeId] ?? {}
            const awayTeam = teamsById[awayId] ?? {}
            const isHome   = String(homeId) === String(teamId)
            const phase    = matchPhase(a.status)

            return (
              <a key={match.id} href={`/matches/${match.id}`} className="block">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800
                                last:border-0 hover:bg-gray-800 transition-colors">
                  <div className="flex-1 grid grid-cols-3 items-center gap-2">
                    <span className={`text-sm text-right ${isHome ? 'text-white font-semibold' : 'text-gray-400'}`}>
                      {homeTeam.name ?? '—'}
                    </span>
                    <div className="text-center">
                      {phase !== 'upcoming'
                        ? <span className="text-sm font-bold text-white">{a.score_current || '-'}</span>
                        : <span className="text-xs text-gray-500">
                            {new Date(a.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                      }
                    </div>
                    <span className={`text-sm ${!isHome ? 'text-white font-semibold' : 'text-gray-400'}`}>
                      {awayTeam.name ?? '—'}
                    </span>
                  </div>
                </div>
              </a>
            )
          })
      }
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function TeamShow({ teamId }) {
  const { team, form, avgPlayerRate, stats, matches, included, loading, error } = useTeamData(teamId)

  if (loading) return <LoadingSkeleton />
  if (error)   return <p className="text-red-400 p-4">{error}</p>

  const attrs = team?.attributes ?? {}

  return (
    <>
      <TeamHeader attrs={attrs} form={form} avgPlayerRate={avgPlayerRate} />
      <TeamStatistics stat={stats[0]} />
      <TeamRecentMatches matches={matches} included={included} teamId={teamId} />
    </>
  )
}
