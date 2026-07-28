import { useEffect, useRef, useState } from 'react'
import { fetchPokemonDetail } from '../pokemonApi.js'

function idFromUrl(url) {
  const parts = url.split('/').filter(Boolean)
  return Number(parts[parts.length - 1])
}

async function fetchSpeciesIdsForGeneration(generationId) {
  const res = await fetch(`https://pokeapi.co/api/v2/generation/${generationId}`)
  const data = await res.json()
  return data.pokemon_species.map((s) => idFromUrl(s.url))
}

async function fetchAllSpeciesIds() {
  const ids = await Promise.all(
    Array.from({ length: 9 }, (_, i) => fetchSpeciesIdsForGeneration(i + 1))
  )
  return ids.flat()
}

export function usePokemonList(generationId = 1) {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cacheRef = useRef({})

  useEffect(() => {
    let cancelled = false

    async function fetchGeneration() {
      if (cacheRef.current[generationId]) {
        setPokemonList(cacheRef.current[generationId])
        setLoading(false)
        setError(null)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const ids = generationId === 'all'
          ? await fetchAllSpeciesIds()
          : await fetchSpeciesIdsForGeneration(generationId)

        const results = await Promise.allSettled(ids.map(fetchPokemonDetail))
        const details = results
          .filter((r) => r.status === 'fulfilled')
          .map((r) => r.value)

        if (!cancelled) {
          details.sort((a, b) => a.id - b.id)

          if (details.length === 0) {
            setError('Gagal memuat data dari PokeAPI. Coba refresh halaman.')
          } else {
            cacheRef.current[generationId] = details
            setPokemonList(details)
          }
        }
      } catch (err) {
        if (!cancelled) setError('Gagal memuat data dari PokeAPI. Coba refresh halaman.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchGeneration()
    return () => { cancelled = true }
  }, [generationId])

  return { pokemonList, loading, error }
}