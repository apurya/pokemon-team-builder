import { useEffect, useState } from 'react'
import { fetchPokemonDetail } from '../pokemonApi.js'

export function useSharedTeamFromUrl() {
  const [sharedTeam, setSharedTeam] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('team')
    if (!raw) return

    const ids = raw.split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 6)
    if (ids.length === 0) return

    let cancelled = false
    setLoading(true)

    Promise.all(ids.map((id) => fetchPokemonDetail(id).catch(() => null)))
      .then((results) => {
        if (cancelled) return
        const team = Array(6).fill(null)
        results.forEach((p, i) => { if (p) team[i] = p })
        setSharedTeam(team)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    // Bersihkan query param supaya tidak reload tim ini terus tiap refresh
    window.history.replaceState({}, '', window.location.pathname)

    return () => { cancelled = true }
  }, [])

  return { sharedTeam, loadingSharedTeam: loading }
}