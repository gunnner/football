import { useState }       from 'react'
import { useTeamData }    from '../../hooks/useTeamData'
import { matchPhase }     from '../../constants/matchStatus'
import Skeleton           from '../ui/Skeleton'
import styles             from './TeamShow.module.css'

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
    <div className={styles.stadiumRow}>
      <span className={styles.infoLabel}>Stadium</span>
      <div className={styles.stadiumInfo}
           onMouseEnter={() => setHovered(true)}
           onMouseLeave={() => setHovered(false)}>
        <span className={styles.stadiumName}>{name}</span>
        {capacity && (
          <>
            <span className={styles.infoIcon}>ⓘ</span>
            {hovered && (
              <div className={styles.capacityTooltip}>
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
    <div className={styles.skeletonStack}>
      <div className={styles.skeletonCard}>
        <div className={styles.skeletonTop}>
          <Skeleton style={{ width: '5rem', height: '5rem', flexShrink: 0 }} />
          <div className={styles.skeletonInfo}>
            <Skeleton style={{ height: '1.75rem', width: '10rem' }} />
            <Skeleton style={{ height: '1rem', width: '16rem' }} />
            <div className={styles.skeletonBtns}>
              {[...Array(5)].map((_, i) => <Skeleton key={i} style={{ width: '2.5rem', height: '3.5rem' }} />)}
            </div>
          </div>
        </div>
      </div>
      <Skeleton style={{ height: '10rem', borderRadius: '12px' }} />
      <Skeleton style={{ height: '16rem', borderRadius: '12px' }} />
    </div>
  )
}

// ── Team logo ─────────────────────────────────────────────────────────────────

function TeamLogo({ logo, name }) {
  const [failed, setFailed] = useState(false)
  if (logo && !failed) {
    return (
      <img src={logo} alt={name} className={styles.teamLogoImg}
           onError={() => setFailed(true)} />
    )
  }
  return (
    <div className={styles.teamLogoFallback}>
      <span>👤</span>
    </div>
  )
}

// ── Form badge ────────────────────────────────────────────────────────────────

function FormBadge({ match }) {
  const [hovered, setHovered] = useState(false)
  const resultClass = match.result === 'W' ? styles.formBadgeW : match.result === 'D' ? styles.formBadgeD : styles.formBadgeL
  const tooltip = `${match.date} · ${match.home_team_name} ${match.score} ${match.away_team_name}`

  return (
    <a href={match.path} className={styles.formBadgeLink}
       onMouseEnter={() => setHovered(true)}
       onMouseLeave={() => setHovered(false)}>
      {match.opponent_logo
        ? <img src={match.opponent_logo} alt={match.opponent_name} className={styles.formBadgeLogo} />
        : <div className={styles.formBadgeLogoFallback} />
      }
      <span className={`${styles.formBadgeScore} ${resultClass}`}>{match.score}</span>
      {hovered && (
        <span className={styles.formBadgeTooltip}>{tooltip}</span>
      )}
    </a>
  )
}

// ── Small team logo (used in NextMatchCard) ───────────────────────────────────

function SmallTeamLogo({ logo, name }) {
  const [failed, setFailed] = useState(false)
  if (logo && !failed) {
    return (
      <img src={logo} alt={name} className={styles.smallLogoImg}
           onError={() => setFailed(true)} />
    )
  }
  return <div className={styles.smallLogoFallback} />
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
    <div className={styles.nextMatchWrap}>
      <span className={styles.nextMatchLabel}>Next match</span>
      <a href={`/matches/${match.id}`} className={styles.nextMatchLink}>
        <SmallTeamLogo logo={homeTeam.logo} name={homeTeam.name} />
        <div className={styles.nextMatchCenter}>
          {league?.id && league?.name ? (
            <a href={`/leagues/${league.id}`}
               className={styles.leagueLink}
               onClick={e => e.stopPropagation()}>
              {league.logo && <img src={league.logo} alt={league.name} className={styles.leagueLinkLogo} />}
              <span>{league.name}</span>
            </a>
          ) : (
            <span className={styles.nextMatchDateSmall}>{dateStr}</span>
          )}
          <span className={styles.nextMatchTime}>{timeStr}</span>
          {league?.id && <span className={styles.nextMatchDateBottom}>{dateStr}</span>}
        </div>
        <SmallTeamLogo logo={awayTeam.logo} name={awayTeam.name} />
      </a>
    </div>
  )
}

// ── Position meta ─────────────────────────────────────────────────────────────

const POSITION_META = {
  'Goalkeeper':         { short: 'GK',  cls: styles.posGk  },
  'Defender':           { short: 'DEF', cls: styles.posDef },
  'Centre-Back':        { short: 'CB',  cls: styles.posDef },
  'Left-Back':          { short: 'LB',  cls: styles.posDef },
  'Right-Back':         { short: 'RB',  cls: styles.posDef },
  'Midfielder':         { short: 'MID', cls: styles.posMid },
  'Defensive Midfield': { short: 'DM',  cls: styles.posMid },
  'Central Midfield':   { short: 'CM',  cls: styles.posMid },
  'Attacking Midfield': { short: 'AM',  cls: styles.posMid },
  'Attacker':           { short: 'ATT', cls: styles.posAtt },
  'Forward':            { short: 'FWD', cls: styles.posAtt },
  'Left Winger':        { short: 'LW',  cls: styles.posAtt },
  'Right Winger':       { short: 'RW',  cls: styles.posAtt },
  'Centre-Forward':     { short: 'CF',  cls: styles.posAtt },
}

function AvgRatingBadge({ avgPlayerRate }) {
  const [hovered, setHovered] = useState(false)
  if (!avgPlayerRate?.rating) return null

  const { id, name, logo, position, rating } = avgPlayerRate
  const score      = Math.min(parseFloat(rating), 10).toFixed(2)
  const posMeta    = POSITION_META[position]
  const posShort   = posMeta?.short ?? position ?? null
  const posClass   = posMeta?.cls ?? ''
  const ratingClass = parseFloat(rating) >= 8
    ? styles.avgRatingScoreGreen
    : parseFloat(rating) >= 7
      ? styles.avgRatingScoreYellow
      : styles.avgRatingScoreGray

  return (
    <div className={styles.avgRatingWrap}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}>
      <div className={styles.avgRatingTopRow}>
        <span className={styles.avgRatingLabel}>Top rated player</span>
        <span className={`${styles.avgRatingScore} ${ratingClass}`}>{score}</span>
      </div>
      <div className={styles.avgRatingPlayerRow}>
        {logo
          ? (
            <div className={styles.avgRatingPhoto}>
              <img src={logo} alt={name} className={styles.avgRatingPhotoImg}
                   onError={e => { e.target.closest('div').replaceWith(Object.assign(document.createElement('span'), { textContent: '👤', style: 'font-size:0.875rem' })) }} />
            </div>
          )
          : <span style={{ fontSize: '0.875rem' }}>👤</span>
        }
        <div className={styles.avgRatingPlayerInfo}>
          {posShort && (
            <span className={`${styles.posBadge} ${posClass}`}>{posShort}</span>
          )}
          {name && (
            <a href={id ? `/players/${id}` : undefined}
               className={styles.avgRatingPlayerName}
               onClick={e => e.stopPropagation()}>
              {name}
            </a>
          )}
        </div>
      </div>
      {hovered && (
        <div className={styles.avgRatingTooltip}>
          The player's highest average rating based on all competitions in the current season
        </div>
      )}
    </div>
  )
}

// ── Team Header ───────────────────────────────────────────────────────────────

function TeamHeader({ attrs, form, avgPlayerRate, nextMatch, leagues }) {
  return (
    <div className={styles.headerCard}>
      {/* Logo + name — always on top on mobile */}
      <div className={styles.mobileLogoRow}>
        <TeamLogo logo={attrs.logo} name={attrs.name} />
        <h1 className={styles.mobileName}>{attrs.name}</h1>
      </div>

      <div className={styles.headerRow}>

        {/* Logo + name — desktop only inline */}
        <div className={styles.desktopLogoBlock}>
          <TeamLogo logo={attrs.logo} name={attrs.name} />
          <h1 className={styles.desktopName}>{attrs.name}</h1>
        </div>

        <div className={styles.divider} />

        {/* Team info */}
        <div className={styles.teamInfoList}>
          {attrs.country && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Country</span>
              <div className={styles.infoRow}>
                {attrs.country_logo && <img src={attrs.country_logo} alt={attrs.country} className={styles.infoFlagImg} />}
                <span className={styles.infoValue}>{attrs.country}</span>
              </div>
            </div>
          )}
          {leagues?.length > 0 && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>League</span>
              <div className={styles.leagueLinks}>
                {leagues.map(l => (
                  <a key={l.id} href={`/leagues/${l.id}`} className={styles.leagueInfoLink}>
                    {l.logo && <img src={l.logo} alt={l.name} className={styles.leagueInfoLinkLogo} />}
                    <span>{l.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          {attrs.venue_city && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>City</span>
              <span className={styles.infoValue}>{attrs.venue_city}</span>
            </div>
          )}
          {attrs.founded && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Founded</span>
              <span className={styles.infoValue}>{attrs.founded}</span>
            </div>
          )}
          {attrs.venue_name && (
            <StadiumRow name={attrs.venue_name} capacity={attrs.venue_capacity} />
          )}
          {attrs.coach_name && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Coach</span>
              <span className={styles.infoValue}>{attrs.coach_name}</span>
            </div>
          )}
        </div>

        <div className={styles.divider} />

        {/* Last 5 */}
        {form?.length > 0 && (
          <div className={styles.form}>
            <span className={styles.formLabel}>Last 5 matches</span>
            <div className={styles.formList}>
              {form.map(m => <FormBadge key={m.id} match={m} />)}
            </div>
          </div>
        )}

        {nextMatch && form?.length > 0 && <div className={styles.divider} />}

        {/* Next match */}
        {nextMatch && <NextMatchCard nextMatch={nextMatch} />}

        {/* Spacer — pushes rating to the right on desktop */}
        <div className={styles.spacer} />

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
    <div className={styles.statsCard}>
      <div className={styles.statsHeader}>
        <h2 className={styles.statsTitle}>{stat.league_name} {seasonLabel(stat.season)}</h2>
      </div>
      <div>
        {rows.map((row, idx) => {
          const diff = row.gf - row.ga
          return (
            <div key={row.label} className={`${styles.statsRow}${idx > 0 ? ` ${styles.statsDivider}` : ''}`}>
              <div className={styles.statsRowLabel}>{row.label}</div>
              <div className={styles.statsCell}>{row.p} <span className={styles.statsCellXs}>P</span></div>
              <div className={styles.statsCellW}>{row.w} <span className={styles.statsCellXs} style={{ fontWeight: 'normal' }}>W</span></div>
              <div className={styles.statsCellD}>{row.d} <span className={styles.statsCellXs} style={{ fontWeight: 'normal' }}>D</span></div>
              <div className={styles.statsCellL}>{row.l} <span className={styles.statsCellXs} style={{ fontWeight: 'normal' }}>L</span></div>
              <div className={styles.statsGoals}>
                {row.gf}:{row.ga}
                <span className={diff >= 0 ? styles.statsDiffPos : styles.statsDiffNeg}>
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
    <div className={styles.recentCard}>
      <div className={styles.recentHeader}>
        <h2 className={styles.recentTitle}>Recent Matches</h2>
      </div>
      {!matches?.length
        ? <p className={styles.recentEmpty}>No matches found</p>
        : matches.map(match => {
            const a        = match.attributes
            const homeId   = match.relationships?.home_team?.data?.id
            const awayId   = match.relationships?.away_team?.data?.id
            const homeTeam = teamsById[homeId] ?? {}
            const awayTeam = teamsById[awayId] ?? {}
            const isHome   = String(homeId) === String(teamId)
            const phase    = matchPhase(a.status)

            return (
              <a key={match.id} href={`/matches/${match.id}`} className={styles.recentMatchLink}>
                <div className={styles.recentMatchRow}>
                  <div className={styles.recentMatchGrid}>
                    <span className={`${styles.recentHomeTeam} ${isHome ? styles.recentHomeTeamActive : styles.recentHomeTeamMuted}`}>
                      {homeTeam.name ?? '—'}
                    </span>
                    <div>
                      {phase !== 'upcoming'
                        ? <span className={styles.recentScore}>{a.score_current || '-'}</span>
                        : <span className={styles.recentDate}>
                            {new Date(a.date).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                      }
                    </div>
                    <span className={`${styles.recentAwayTeam} ${!isHome ? styles.recentAwayTeamActive : styles.recentAwayTeamMuted}`}>
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
  if (error)   return <p style={{ color: 'var(--color-red)', padding: '1rem' }}>{error}</p>

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
