import { useState, useEffect } from 'react'

export function usePlayerData(playerId) {
  const [player,    setPlayer]    = useState(null)
  const [meta,      setMeta]      = useState(null)
  const [stats,     setStats]     = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/players/${playerId}`).then(r => r.json()),
      fetch(`/api/v1/players/${playerId}/statistics`).then(r => r.json()),
      fetch(`/api/v1/players/${playerId}/transfers`).then(r => r.json()),
    ])
      .then(([playerRes, statsRes, transfersRes]) => {
        setPlayer(playerRes.data)
        setMeta(playerRes.meta)
        setStats(statsRes.data ?? [])
        setTransfers(transfersRes.data ?? [])
        setLoading(false)
      })
      .catch(err => {
        console.error('usePlayerData error:', err)
        setError('Failed to load player data.')
        setLoading(false)
      })
  }, [playerId])

  return { player, meta, stats, transfers, loading, error }
}
