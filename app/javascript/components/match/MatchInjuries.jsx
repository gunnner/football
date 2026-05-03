import styles from './MatchInjuries.module.css'

function PlayerRow({ player, badge, badgeCls }) {
  const nameEl = player.player_path ? (
    <a href={player.player_path} className={styles.playerLink}>{player.player_name}</a>
  ) : (
    <span className={styles.playerName}>{player.player_name}</span>
  )

  return (
    <div className={styles.playerRow}>
      {player.player_logo ? (
        <div className={styles.playerAvatar}>
          <img src={player.player_logo} alt={player.player_name} className={styles.playerAvatarImg} />
        </div>
      ) : (
        <div className={styles.playerAvatarFallback}>👤</div>
      )}
      <div className={styles.playerInfo}>
        {nameEl}
        <p className={badgeCls}>{badge}</p>
      </div>
    </div>
  )
}

function TeamColumn({ team, injuries, suspensions, wrapCls }) {
  const hasInjuries    = injuries.length > 0
  const hasSuspensions = suspensions.length > 0

  return (
    <div className={`${styles.col}${wrapCls ? ` ${wrapCls}` : ''}`}>
      <div className={styles.colTeamRow}>
        {team.logo && <img src={team.logo} alt={team.name} className={styles.colTeamLogo} />}
        {team.path ? (
          <a href={team.path} className={styles.colTeamLink}>{team.name}</a>
        ) : (
          <span className={styles.colTeamName}>{team.name}</span>
        )}
      </div>

      {!hasInjuries && !hasSuspensions && (
        <p className={styles.noAbsences}>No absences</p>
      )}

      {hasSuspensions && (
        <div className={styles.suspendedSection}>
          <p className={`${styles.sectionLabel} ${styles.suspendedLabel}`}>Suspended</p>
          {suspensions.map((s, i) => (
            <PlayerRow key={i} player={s} badge={s.detail} badgeCls={styles.playerBadgeSuspended} />
          ))}
        </div>
      )}

      {hasInjuries && (
        <div>
          <p className={`${styles.sectionLabel} ${styles.injuredLabel}`}>Injured</p>
          {injuries.map((inj, i) => (
            <PlayerRow key={i} player={inj} badge={inj.reason} badgeCls={styles.playerBadgeInjured} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MatchInjuries({ homeTeam, awayTeam, injuries }) {
  if (!injuries) return null

  const homeInjuries    = injuries.home?.injuries    ?? injuries.home ?? []
  const awayInjuries    = injuries.away?.injuries    ?? injuries.away ?? []
  const homeSuspensions = injuries.home?.suspensions ?? []
  const awaySuspensions = injuries.away?.suspensions ?? []

  const hasAny = homeInjuries.length + awayInjuries.length + homeSuspensions.length + awaySuspensions.length > 0
  if (!hasAny) return null

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.cardTitle}>Injuries & Suspensions</p>
      </div>
      <div className={styles.cols}>
        <TeamColumn team={homeTeam} injuries={homeInjuries} suspensions={homeSuspensions} />
        <TeamColumn team={awayTeam} injuries={awayInjuries} suspensions={awaySuspensions} wrapCls={styles.colDivide} />
      </div>
    </div>
  )
}
