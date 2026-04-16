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
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <p className="text-center text-gray-500 py-8">No news available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {news.map((article, i) => (
        <a
          key={i}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex gap-3 bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-colors p-3"
        >
          {article.image_url && (
            <img
              src={article.image_url}
              alt=""
              className="w-24 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-800"
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-100 line-clamp-2 leading-snug">{article.title}</p>
            <p className="text-xs text-gray-500 mt-1">{timeAgo(article.published_at)}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
