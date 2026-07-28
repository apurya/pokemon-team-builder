import { useEffect, useRef, useState } from 'react'

const rarityCache = {} // pokemonId -> { isLegendary, isMythical, isBaby }

async function fetchRarity(id) {
  if (rarityCache[id]) return rarityCache[id]
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  if (!res.ok) throw new Error(`Gagal fetch species #${id}`)
  const data = await res.json()
  const rarity = {
    isLegendary: data.is_legendary,
    isMythical: data.is_mythical,
    isBaby: data.is_baby,
  }
  rarityCache[id] = rarity
  return rarity
}

export function useSpeciesRarity(members) {
  const [rarityById, setRarityById] = useState({})
  const fetchedRef = useRef(new Set())

  useEffect(() => {
    let cancelled = false

    members.forEach(async (p) => {
      if (fetchedRef.current.has(p.id)) return
      fetchedRef.current.add(p.id)

      try {
        const rarity = await fetchRarity(p.id)
        if (!cancelled) setRarityById((prev) => ({ ...prev, [p.id]: rarity }))
      } catch {
        if (!cancelled) setRarityById((prev) => ({ ...prev, [p.id]: null }))
      }
    })

    return () => { cancelled = true }
  }, [members.map((p) => p.id).join(',')])

  return rarityById
}