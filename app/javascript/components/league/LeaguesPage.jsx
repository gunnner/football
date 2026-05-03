import { useState, useEffect } from 'react'
import { ChevronRight } from '../ui/Icons'
import Skeleton from '../ui/Skeleton'
import styles from './LeaguesPage.module.css'

function LeagueRow({ league }) {
  const a = league.attributes
  return (
    <a href={`/leagues/${league.id}`} className={styles.rowLink}>
      <div className={styles.row}>
        <div className={styles.rowInner}>
          {a.logo
            ? <img src={a.logo} alt="" className={styles.leagueLogo} />
            : <div className={styles.leagueLogoFallback} />
          }
          <span className={styles.leagueName}>{a.name}</span>
          <span className={styles.chevron}><ChevronRight /></span>
        </div>
      </div>
    </a>
  )
}

export default function LeaguesPage() {
  const [groups,  setGroups]  = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/leagues?per_page=50')
      .then(r => r.json())
      .then(d => {
        const leagues = d.data ?? []
        const grouped = {}
        leagues.forEach(l => {
          const country = l.attributes.country_name ?? 'Other'
          if (!grouped[country]) grouped[country] = []
          grouped[country].push(l)
        })
        setGroups(grouped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.skeletonStack}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.skeletonGroup}>
            <Skeleton style={{ height: '2.25rem', borderRadius: `${8}px ${8}px 0 0` }} />
            <Skeleton style={{ height: '3rem', borderRadius: `0 0 ${8}px ${8}px`, marginTop: '2px' }} />
          </div>
        ))}
      </div>
    )
  }

  if (Object.keys(groups).length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyIcon}>🏆</p>
        <p className={styles.emptyText}>No leagues found</p>
      </div>
    )
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Leagues</h1>
      <div className={styles.stack}>
        {Object.entries(groups).map(([country, leagues]) => (
          <div key={country} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupTitle}>{country}</span>
            </div>
            {leagues.map(l => <LeagueRow key={l.id} league={l} />)}
          </div>
        ))}
      </div>
    </>
  )
}
