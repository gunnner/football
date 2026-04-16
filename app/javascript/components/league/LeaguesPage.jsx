import { useState, useEffect } from 'react'
import { ChevronRight } from '../ui/Icons'

function Skeleton({ className }) {
  return <div className={`bg-gray-800 animate-pulse rounded ${className}`} />
}

function LeagueRow({ league }) {
  const a = league.attributes
  return (
    <a href={`/leagues/${league.id}`} className="block">
      <div className="bg-gray-900 hover:bg-gray-800 transition-colors px-4 py-3
                      border-b border-gray-800 last:rounded-b-lg last:border-0">
        <div className="flex items-center gap-3">
          {a.logo
            ? <img src={a.logo} alt="" className="w-7 h-7 object-contain flex-shrink-0" />
            : <div className="w-7 h-7 bg-gray-700 rounded flex-shrink-0" />
          }
          <span className="flex-1 text-sm font-medium text-gray-100">{a.name}</span>
          <ChevronRight />
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
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-9 rounded-t-lg rounded-b-none" />
            <Skeleton className="h-12 rounded-t-none rounded-b-lg mt-0.5" />
          </div>
        ))}
      </div>
    )
  }

  if (Object.keys(groups).length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-4">🏆</p>
        <p className="text-lg">No leagues found</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white mb-6">Leagues</h1>
      <div className="space-y-2">
        {Object.entries(groups).map(([country, leagues]) => (
          <div key={country} className="mb-2">
            <div className="bg-gray-800 px-4 py-2 rounded-t-lg">
              <span className="text-sm font-semibold text-gray-300">{country}</span>
            </div>
            {leagues.map(l => <LeagueRow key={l.id} league={l} />)}
          </div>
        ))}
      </div>
    </>
  )
}
