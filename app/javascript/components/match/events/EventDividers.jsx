import styles from './EventDividers.module.css'

export function SystemRow({ label, sub }) {
  return (
    <div className={styles.systemRow}>
      <div className={styles.line} />
      <div style={{ textAlign: 'center' }}>
        <span className={styles.systemLabel}>{label}</span>
        {sub && <span className={styles.systemSub}>{sub}</span>}
      </div>
      <div className={styles.line} />
    </div>
  )
}

export function SectionDivider({ title, isLive }) {
  return (
    <div className={styles.sectionDivider}>
      <span className={styles.sectionTitle}>{title}</span>
      {isLive && (
        <span className={styles.liveDot}>
          <span className={styles.dot} />
          <span className={styles.liveLabel}>LIVE</span>
        </span>
      )}
    </div>
  )
}
