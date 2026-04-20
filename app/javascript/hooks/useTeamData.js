import { useState, useEffect } from 'react'

export function useTeamData(teamId) {
  const [team,          setTeam]          = useState(null)
  const [form,          setForm]          = useState([])
  const [avgPlayerRate, setAvgPlayerRate] = useState(null)
  const [leagues,       setLeagues]       = useState([])
  const [stats,         setStats]         = useState([])
  const [matches,       setMatches]       = useState([])
  const [included,      setIncluded]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/teams/${teamId}`).then(r => r.json()),
      fetch(`/api/v1/teams/${teamId}/statistics`).then(r => r.json()),
      fetch(`/api/v1/teams/${teamId}/matches`).then(r => r.json()),
    ])
      .then(([teamRes, statsRes, matchesRes]) => {
        setTeam(teamRes.data?.data)
        setForm(teamRes.meta?.form ?? [])
        setAvgPlayerRate(teamRes.meta?.avg_player_rate ?? null)
        setLeagues(teamRes.meta?.leagues ?? [])
        setStats(statsRes.data ?? [])
        setMatches(matchesRes.data ?? [])
        setIncluded(matchesRes.included ?? [])
        setLoading(false)
      })
      .catch(err => {
        console.error('useTeamData error:', err)
        setError('Failed to load team data.')
        setLoading(false)
      })
  }, [teamId])

  return { team, form, avgPlayerRate, leagues, stats, matches, included, loading, error }
}
