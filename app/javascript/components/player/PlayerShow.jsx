import { useState }         from 'react'
import { usePlayerData }   from '../../hooks/usePlayerData'
import { calcAge }         from '../../utils/player'
import { formatMarketValue } from '../../utils/money'
import Skeleton            from '../ui/Skeleton'
import PlayerTransfers     from './PlayerTransfers'

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-start gap-5 mb-8">
          <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
      <div className="bg-gray-900 rounded-xl h-48" />
      <div className="bg-gray-900 rounded-xl h-32" />
    </div>
  )
}

// ── Rating badge ──────────────────────────────────────────────────────────────

function RatingBadge({ rating }) {
  const [show, setShow] = useState(false)
  if (!rating) return null

  const score = parseFloat(rating).toFixed(2)
  const color = rating >= 8 ? 'text-green-400' : rating >= 7 ? 'text-yellow-400' : 'text-gray-300'

  return (
    <div className="absolute flex flex-col items-center bg-gray-800 rounded-xl px-3 py-2 cursor-default"
         style={{ top: '1.25rem', right: '1.25rem' }}
         onMouseEnter={() => setShow(true)}
         onMouseLeave={() => setShow(false)}>
      <span className={`text-2xl font-bold ${color}`}>{score}</span>
      <span className="text-[10px] text-gray-500 mt-0.5">Avg season rating</span>
      {show && (
        <span className="absolute top-full mt-1 right-0 w-64 bg-gray-800 border border-gray-700
                         text-gray-200 text-xs rounded-lg px-3 py-2 leading-snug z-50 shadow-xl pointer-events-none">
          The player's average match rating across all competitions in the current season
        </span>
      )}
    </div>
  )
}

// ── Player avatar ─────────────────────────────────────────────────────────────

function PlayerAvatar({ logo, name }) {
  const [failed, setFailed] = useState(false)
  if (logo && !failed) {
    return (
      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
        <img src={logo} alt={name} onError={() => setFailed(true)}
             style={{ width: '100%', height: 'auto' }} />
      </div>
    )
  }
  return (
    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
      <span className="text-3xl">👤</span>
    </div>
  )
}

function MetaCell({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  )
}

// ── Player Header ─────────────────────────────────────────────────────────────

function PlayerHeader({ player, meta }) {
  const profile = player?.included?.find(i => i.type === 'player_profile')?.attributes ?? {}
  const attrs   = player?.data?.attributes ?? {}
  const age     = calcAge(profile.birth_date)
  const mvText  = formatMarketValue(meta?.market_value)

  return (
    <div className="bg-gray-900 rounded-xl p-6 mb-4 relative">
      <RatingBadge rating={meta?.average_rating} />

      <div className="flex items-start gap-5">
        <PlayerAvatar logo={attrs.logo} name={attrs.name} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{attrs.name}</h1>
          {attrs.full_name && attrs.full_name !== attrs.name && (
            <p className="text-sm text-gray-500 mt-0.5">{attrs.full_name}</p>
          )}
          {meta?.current_team && (
            <div className="flex items-center gap-1.5 mt-1">
              <a href={meta.current_team.path} className="flex items-center gap-1.5 group">
                {meta.current_team.logo && (
                  <img src={meta.current_team.logo} alt={meta.current_team.name} className="w-5 h-5 object-contain" />
                )}
                <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
                  {meta.current_team.name}
                </span>
              </a>
            </div>
          )}
          {(profile.joined_at || profile.contract_expiry) && (
            <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
              {profile.joined_at && <span>Joined {profile.joined_at}</span>}
              {profile.joined_at && profile.contract_expiry && <span className="text-gray-700">·</span>}
              {profile.contract_expiry && <span>Contract until {profile.contract_expiry}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-x-4 border-t border-gray-800" style={{ marginTop: '2rem', paddingTop: '2rem', paddingBottom: '1.5rem' }}>
        <MetaCell label="Citizenship">
          {profile.citizenship
            ? (
              <div className="flex flex-col gap-1">
                {profile.citizenship.split(', ').map((country, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {meta?.flags?.[i] && (
                      <img src={meta.flags[i]} alt="" className="w-5 h-4 object-cover rounded-sm" />
                    )}
                    <span className="text-sm text-gray-100">{country}</span>
                  </div>
                ))}
              </div>
            )
            : <span className="text-sm text-gray-100">—</span>
          }
        </MetaCell>
        <MetaCell label="Born">
          <p className="text-sm text-gray-100">{profile.birth_date ?? '—'}</p>
          {profile.birth_place && <p className="text-xs text-gray-500 mt-0.5">{profile.birth_place}</p>}
        </MetaCell>
        <MetaCell label="Age">
          <p className="text-sm text-gray-100">{age ?? '—'}</p>
        </MetaCell>
        <MetaCell label="Height">
          <p className="text-sm text-gray-100">{profile.height ?? '—'}</p>
        </MetaCell>
      </div>

      <div className="grid grid-cols-4 gap-x-4 pt-6 border-t border-gray-800">
        <MetaCell label="Position">
          <p className="text-sm text-gray-100">{profile.main_position ?? '—'}</p>
        </MetaCell>
        <MetaCell label="Shirt Number">
          <p className="text-sm text-gray-100">{meta?.shirt_number ?? '—'}</p>
        </MetaCell>
        <MetaCell label="Preferred foot">
          <p className="text-sm text-gray-100">
            {profile.foot ? profile.foot.charAt(0).toUpperCase() + profile.foot.slice(1) : '—'}
          </p>
        </MetaCell>
        <MetaCell label="Latest Transfer Value">
          <p className="text-sm text-gray-100">{mvText ?? '—'}</p>
        </MetaCell>
      </div>
    </div>
  )
}

// ── Statistics ────────────────────────────────────────────────────────────────

function PlayerStatistics({ stats }) {
  if (!stats?.length) return null
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Statistics</h2>
      </div>
      {stats.map((stat, i) => (
        <div key={i} className="px-4 py-3 border-b border-gray-800 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{stat.league} {stat.season}</span>
            <span className="text-xs text-gray-500">{stat.club}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { val: stat.goals,        label: 'Goals' },
              { val: stat.assists,      label: 'Assists' },
              { val: stat.games_played, label: 'Games' },
              { val: stat.yellow_cards, label: 'Yellow' },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className="text-lg font-bold text-white">{val}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function PlayerShow({ playerId }) {
  const { player, meta, stats, transfers, loading, error } = usePlayerData(playerId)

  if (loading) return <LoadingSkeleton />
  if (error)   return <p className="text-red-400 p-4">{error}</p>

  const mv = meta?.market_value

  return (
    <>
      <PlayerHeader player={player} meta={meta} />
      {transfers.length > 0 && (
        <div className="mb-4">
          <PlayerTransfers transfers={transfers} market_value={mv?.value} market_value_date={mv?.recorded_date} />
        </div>
      )}
      <PlayerStatistics stats={stats} />
    </>
  )
}
