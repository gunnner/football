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

// ── Stadium row with capacity tooltip ────────────────────────────────────────

function StadiumRow({ name, capacity }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500 w-14 flex-shrink-0">Stadium</span>
      <div className="relative flex items-center gap-1 cursor-default"
           onMouseEnter={() => setHovered(true)}
           onMouseLeave={() => setHovered(false)}>
        <span className="text-gray-200">{name}</span>
        {capacity && (
          <>
            <span className="text-gray-600 text-[10px] leading-none">ⓘ</span>
            {hovered && (
              <div className="absolute bottom-full mb-1.5 left-0 z-10 bg-gray-800 border border-gray-700
                              rounded-lg px-2.5 py-1.5 text-xs text-gray-300 shadow-xl whitespace-nowrap pointer-events-none">
                Capacity: {formatNumber(capacity)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
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

// ── Small team logo (used in NextMatchCard) ───────────────────────────────────

function SmallTeamLogo({ logo, name }) {
  const [failed, setFailed] = useState(false)
  if (logo && !failed) {
    return (
      <img src={logo} alt={name} className="w-9 h-9 object-contain flex-shrink-0"
           onError={() => setFailed(true)} />
    )
  }
  return <div className="w-9 h-9 bg-gray-700 rounded-lg flex-shrink-0" />
}

// ── Next Match ────────────────────────────────────────────────────────────────

function NextMatchCard({ nextMatch }) {
  if (!nextMatch) return null

  const { match, homeTeam, awayTeam, league } = nextMatch
  const matchDate = new Date(match.attributes.date)
  const isValid   = !isNaN(matchDate.getTime())
  const dateStr   = isValid ? matchDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }) : '—'
  const timeStr   = isValid ? matchDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="flex flex-col gap-2 items-start">
      <span className="text-xs text-gray-500">Next match</span>
      <a href={`/matches/${match.id}`} className="flex items-center gap-3 group">
        <SmallTeamLogo logo={homeTeam.logo} name={homeTeam.name} />
        <div className="flex flex-col items-center text-center flex-shrink-0 min-w-[4.5rem]">
          {league?.id && league?.name ? (
            <a href={`/leagues/${league.id}`}
               className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors leading-tight mb-0.5"
               onClick={e => e.stopPropagation()}>
              {league.logo && <img src={league.logo} alt={league.name} className="w-3 h-3 object-contain" />}
              <span>{league.name}</span>
            </a>
          ) : (
            <span className="text-[10px] text-gray-500 leading-tight">{dateStr}</span>
          )}
          <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors leading-tight">{timeStr}</span>
          {league?.id && <span className="text-[10px] text-gray-500 leading-tight mt-0.5">{dateStr}</span>}
        </div>
        <SmallTeamLogo logo={awayTeam.logo} name={awayTeam.name} />
      </a>
    </div>
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
  const score      = Math.min(parseFloat(rating), 10).toFixed(2)
  const posMeta    = POSITION_META[position]
  const posShort   = posMeta?.short ?? position ?? null
  const posColor   = posMeta?.color ?? 'text-gray-400 bg-gray-400/10'
  const ratingColor = rating >= 8 ? 'text-green-400' : rating >= 7 ? 'text-yellow-400' : 'text-gray-300'

  return (
    <div className="relative flex-shrink-0 flex flex-col gap-2 bg-gray-800 rounded-xl px-3 py-2 cursor-default min-w-[10rem]"
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}>
      {/* Label + rating in top row */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-gray-500">Top rated player</span>
        <span className={`text-lg font-bold ${ratingColor}`}>{score}</span>
      </div>
      {/* Player row */}
      <div className="flex items-center gap-2">
        {logo
          ? (
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
              <img src={logo} alt={name} className="w-full" style={{ height: '200%', objectFit: 'cover', objectPosition: '50% 0%' }}
                   onError={e => { e.target.closest('div').replaceWith(Object.assign(document.createElement('span'), { textContent: '👤', className: 'text-sm' })) }} />
            </div>
          )
          : <span className="text-sm">👤</span>
        }
        <div className="flex flex-col gap-0.5 min-w-0">
          {posShort && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded self-start ${posColor}`}>{posShort}</span>
          )}
          {name && (
            <a href={id ? `/players/${id}` : undefined}
               className="text-xs text-gray-300 hover:text-white transition-colors truncate max-w-[8rem]"
               onClick={e => e.stopPropagation()}>
              {name}
            </a>
          )}
        </div>
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

function TeamHeader({ attrs, form, avgPlayerRate, nextMatch, leagues }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 md:p-6 mb-4">
      {/* Logo + name — always on top on mobile */}
      <div className="flex items-center gap-4 mb-4 xl:hidden">
        <TeamLogo logo={attrs.logo} name={attrs.name} />
        <h1 className="text-xl font-bold text-white">{attrs.name}</h1>
      </div>

      <div className="flex flex-wrap xl:flex-nowrap items-start xl:items-center gap-4 xl:gap-6">

        {/* Logo + name — desktop only inline */}
        <div className="hidden xl:flex items-center gap-4 flex-shrink-0">
          <TeamLogo logo={attrs.logo} name={attrs.name} />
          <h1 className="text-2xl font-bold text-white">{attrs.name}</h1>
        </div>

        {/* Divider */}
        <div className="hidden xl:block w-px self-stretch bg-gray-800 flex-shrink-0" />

        {/* Team info */}
        <div className="flex flex-col gap-1 flex-shrink-0 text-xs">
          {attrs.country && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 w-14 flex-shrink-0">Country</span>
              <div className="flex items-center gap-1">
                {attrs.country_logo && <img src={attrs.country_logo} alt={attrs.country} className="w-4 h-3 object-cover flex-shrink-0" />}
                <span className="text-gray-200">{attrs.country}</span>
              </div>
            </div>
          )}
          {leagues?.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 w-14 flex-shrink-0">League</span>
              <div className="flex items-center gap-2">
                {leagues.map(l => (
                  <a key={l.id} href={`/leagues/${l.id}`}
                     className="flex items-center gap-1 hover:text-white transition-colors text-gray-200">
                    {l.logo && <img src={l.logo} alt={l.name} className="w-3.5 h-3.5 object-contain" />}
                    <span>{l.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {attrs.venue_city && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 w-14 flex-shrink-0">City</span>
              <span className="text-gray-200">{attrs.venue_city}</span>
            </div>
          )}
          {attrs.founded && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 w-14 flex-shrink-0">Founded</span>
              <span className="text-gray-200">{attrs.founded}</span>
            </div>
          )}
          {attrs.venue_name && (
            <StadiumRow name={attrs.venue_name} capacity={attrs.venue_capacity} />
          )}
          {attrs.coach_name && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 w-14 flex-shrink-0">Coach</span>
              <span className="text-gray-200">{attrs.coach_name}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden xl:block w-px self-stretch bg-gray-800 flex-shrink-0" />

        {/* Last 5 */}
        {form?.length > 0 && (
          <div className="flex flex-col gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500">Last 5 matches</span>
            <div className="flex items-center gap-2">
              {form.map(m => <FormBadge key={m.id} match={m} />)}
            </div>
          </div>
        )}

        {/* Divider */}
        {nextMatch && form?.length > 0 && (
          <div className="hidden xl:block w-px self-stretch bg-gray-800 flex-shrink-0" />
        )}

        {/* Next match */}
        {nextMatch && <NextMatchCard nextMatch={nextMatch} />}

        {/* Spacer — pushes rating to the right on desktop */}
        <div className="hidden xl:block flex-1" />

        {/* Top rated player */}
        <AvgRatingBadge avgPlayerRate={avgPlayerRate} />

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeNextMatch(matches, included) {
  if (!matches?.length || !included?.length) return null

  const teamsById   = {}
  const leaguesById = {}
  included.forEach(item => {
    if (item.type === 'team')   teamsById[item.id]   = item.attributes
    if (item.type === 'league') leaguesById[item.id] = { id: item.id, ...item.attributes }
  })

  const upcoming = matches.filter(m => matchPhase(m.attributes.status) === 'upcoming')
  if (!upcoming.length) return null

  const next     = [...upcoming].sort((a, b) => new Date(a.attributes.date) - new Date(b.attributes.date))[0]
  const homeId   = next.relationships?.home_team?.data?.id
  const awayId   = next.relationships?.away_team?.data?.id
  const leagueId = next.relationships?.league?.data?.id

  return {
    match:    next,
    homeTeam: teamsById[homeId]   ?? {},
    awayTeam: teamsById[awayId]   ?? {},
    league:   leagueId ? leaguesById[leagueId] : null,
  }
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function TeamShow({ teamId }) {
  const { team, form, avgPlayerRate, leagues, stats, matches, included, loading, error } = useTeamData(teamId)

  if (loading) return <LoadingSkeleton />
  if (error)   return <p className="text-red-400 p-4">{error}</p>

  const attrs     = team?.attributes ?? {}
  const nextMatch = computeNextMatch(matches, included)

  return (
    <>
      <TeamHeader attrs={attrs} form={form} avgPlayerRate={avgPlayerRate} nextMatch={nextMatch} leagues={leagues} />
      <TeamStatistics stat={stats[0]} />
      <TeamRecentMatches matches={matches} included={included} teamId={teamId} />
    </>
  )
}
