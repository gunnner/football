import styles from './MatchNews.module.css'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function MatchNews({ news }) {
  if (!news || news.length === 0) {
    return <div className={styles.noData}>No news available</div>
  }

  return (
    <div className={styles.stack}>
      {news.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.article}
        >
          {article.image_url && (
            <img
              src={article.image_url}
              alt=""
              className={styles.thumbnail}
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
          <div className={styles.body}>
            <p className={styles.title}>{article.title}</p>
            <p className={styles.time}>{timeAgo(article.published_at)}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
