import { useState, useEffect } from 'react'

export function useFetch(url, { transform } = {}) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!url) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (!cancelled) {
          setData(transform ? transform(d) : d)
          setLoading(false)
        }
      })
      .catch(e => { if (!cancelled) { setError(e); setLoading(false) } })
    return () => { cancelled = true }
  }, [url])

  return { data, loading, error }
}
