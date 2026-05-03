import { useState }         from 'react'
import { usePlayerData }   from '../../hooks/usePlayerData'
import { calcAge }         from '../../utils/player'
import { formatMarketValue } from '../../utils/money'
import Skeleton            from '../ui/Skeleton'
import PlayerTransfers     from './PlayerTransfers'
import styles              from './PlayerShow.module.css'

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className={styles.stack}>
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonTop}>
          <Skeleton className={styles.skeletonAvatar} />
          <div className={styles.skeletonLines}>
            <Skeleton style={{ height: '1.75rem', width: '12rem' }} />
            <Skeleton style={{ height: '1rem', width: '8rem' }} />
            <Skeleton style={{ height: '1rem', width: '6rem' }} />
          </div>
        </div>
        <div className={styles.skeletonGrid}>
          {[...Array(8)].map((_, i) => <Skeleton key={i} style={{ height: '2.5rem' }} />)}
        </div>
      </div>
      <div className={styles.skeletonBlock} />
      <div className={styles.skeletonBlock2} />
    </div>
  )
}

// ── Rating badge ──────────────────────────────────────────────────────────────

function RatingBadge({ rating }) {
  const [show, setShow] = useState(false)
  if (!rating) return null

  const r     = Math.min(parseFloat(rating), 10)
  const score = r.toFixed(2)
  const colorClass = r >= 8 ? styles.ratingScoreGreen : r >= 7 ? styles.ratingScoreYellow : styles.ratingScoreGray

  return (
    <div className={styles.ratingBadge}
         onMouseEnter={() => setShow(true)}
         onMouseLeave={() => setShow(false)}>
      <span className={`${styles.ratingScore} ${colorClass}`}>{score}</span>
      <span className={styles.ratingLabel}>Avg season rating</span>
      {show && (
        <span className={styles.ratingTooltip}>
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
      <div className={styles.avatarWrap}>
        <img src={logo} alt={name} onError={() => setFailed(true)} className={styles.avatarImg} />
      </div>
    )
  }
  return (
    <div className={styles.avatarFallback}>
      <span>👤</span>
    </div>
  )
}

function MetaCell({ label, children }) {
  return (
    <div>
      <p className={styles.metaLabel}>{label}</p>
      <div style={{ marginTop: '0.25rem' }}>{children}</div>
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
    <div className={styles.headerCard}>
      <RatingBadge rating={meta?.average_rating} />

      <div className={styles.headerTop}>
        <PlayerAvatar logo={attrs.logo} name={attrs.name} />
        <div className={styles.headerInfo}>
          <h1 className={styles.playerName}>{attrs.name}</h1>
          {attrs.full_name && attrs.full_name !== attrs.name && (
            <p className={styles.playerFullName}>{attrs.full_name}</p>
          )}
          {meta?.current_team && (
            <a href={meta.current_team.path} className={styles.teamLink}>
              {meta.current_team.logo && (
                <img src={meta.current_team.logo} alt={meta.current_team.name} className={styles.teamLogo} />
              )}
              <span className={styles.teamName}>{meta.current_team.name}</span>
            </a>
          )}
          {(profile.joined_at || profile.contract_expiry) && (
            <div className={styles.contractRow}>
              {profile.joined_at && <span>Joined {profile.joined_at}</span>}
              {profile.joined_at && profile.contract_expiry && <span className={styles.contractDot}>·</span>}
              {profile.contract_expiry && <span>Contract until {profile.contract_expiry}</span>}
            </div>
          )}
        </div>
      </div>

      <div className={styles.metaGrid1}>
        <MetaCell label="Citizenship">
          {profile.citizenship
            ? (
              <div className={styles.citizenshipList}>
                {profile.citizenship.split(', ').map((country, i) => (
                  <div key={i} className={styles.citizenshipRow}>
                    {meta?.flags?.[i] && (
                      <img src={meta.flags[i]} alt="" className={styles.flagImg} />
                    )}
                    <span className={styles.metaValue}>{country}</span>
                  </div>
                ))}
              </div>
            )
            : <span className={styles.metaValue}>—</span>
          }
        </MetaCell>
        <MetaCell label="Born">
          <p className={styles.metaValue}>{profile.birth_date ?? '—'}</p>
          {profile.birth_place && <p className={styles.metaSub}>{profile.birth_place}</p>}
        </MetaCell>
        <MetaCell label="Age">
          <p className={styles.metaValue}>{age ?? '—'}</p>
        </MetaCell>
        <MetaCell label="Height">
          <p className={styles.metaValue}>{profile.height ?? '—'}</p>
        </MetaCell>
      </div>

      <div className={styles.metaGrid2}>
        <MetaCell label="Position">
          <p className={styles.metaValue}>{profile.main_position ?? '—'}</p>
        </MetaCell>
        <MetaCell label="Shirt Number">
          <p className={styles.metaValue}>{meta?.shirt_number ?? '—'}</p>
        </MetaCell>
        <MetaCell label="Preferred foot">
          <p className={styles.metaValue}>
            {profile.foot ? profile.foot.charAt(0).toUpperCase() + profile.foot.slice(1) : '—'}
          </p>
        </MetaCell>
        <MetaCell label="Latest Transfer Value">
          <p className={styles.metaValue}>{mvText ?? '—'}</p>
        </MetaCell>
      </div>
    </div>
  )
}

// ── Statistics ────────────────────────────────────────────────────────────────

function PlayerStatistics({ stats }) {
  if (!stats?.length) return null
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsHeader}>
        <h2 className={styles.statsTitle}>Statistics</h2>
      </div>
      {stats.map((stat, i) => (
        <div key={i} className={styles.statRow}>
          <div className={styles.statRowMeta}>
            <span className={styles.statLeague}>{stat.league} {stat.season}</span>
            <span className={styles.statClub}>{stat.club}</span>
          </div>
          <div className={styles.statNums}>
            {[
              { val: stat.goals,        label: 'Goals' },
              { val: stat.assists,      label: 'Assists' },
              { val: stat.games_played, label: 'Games' },
              { val: stat.yellow_cards, label: 'Yellow' },
            ].map(({ val, label }) => (
              <div key={label}>
                <p className={styles.statNum}>{val}</p>
                <p className={styles.statNumLabel}>{label}</p>
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
  if (error)   return <p style={{ color: 'var(--color-red)', padding: '1rem' }}>{error}</p>

  const mv = meta?.market_value

  return (
    <>
      <PlayerHeader player={player} meta={meta} />
      {transfers.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <PlayerTransfers transfers={transfers} market_value={mv?.value} market_value_date={mv?.recorded_date} />
        </div>
      )}
      <PlayerStatistics stats={stats} />
    </>
  )
}
