import { useEffect, useState } from 'react'
import { fetchPokemonDetail } from '../pokemonApi.js'
import { GENERATION_DEX_RANGES } from '../generations.js'
import { TYPE_COLORS } from '../typeColors.js'

const flavorCache = new Map()

function cleanFlavorText(text) {
  return text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim()
}

async function fetchDailyFlavor(id) {
  if (flavorCache.has(id)) return flavorCache.get(id)
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  if (!res.ok) return null
  const data = await res.json()
  const enEntries = data.flavor_text_entries.filter((e) => e.language.name === 'en')
  const text = enEntries.length > 0 ? cleanFlavorText(enEntries[0].flavor_text) : null
  flavorCache.set(id, text)
  return text
}

// Hash tanggal (YYYY-MM-DD) jadi angka konsisten sepanjang hari itu
function hashDateToId(dateStr, maxId) {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0
  }
  return (hash % maxId) + 1
}

export default function PokemonOfTheDay({ team, onAdd }) {
  const [pokemon, setPokemon] = useState(null)
  const [flavor, setFlavor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(false)
      try {
        const today = new Date().toISOString().slice(0, 10)
        const maxId = GENERATION_DEX_RANGES[GENERATION_DEX_RANGES.length - 1].max
        const id = hashDateToId(today, maxId)
        const [detail, flavorText] = await Promise.all([fetchPokemonDetail(id), fetchDailyFlavor(id)])
        if (!cancelled) {
          setPokemon(detail)
          setFlavor(flavorText)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="mt-6 border-2 border-[#22212B]/20 dark:border-white/20 rounded-lg p-3 text-center text-xs text-[#4A4858] dark:text-[#a8a6b8] animate-pulse">
        Memuat Pokémon hari ini…
      </div>
    )
  }
  if (error || !pokemon) return null

  const members = team.filter(Boolean)
  const inTeam = members.some((p) => p.id === pokemon.id)
  const isFull = members.length >= 6

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">✨ POKÉMON HARI INI</h2>
      <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-3 bg-white/70 dark:bg-[#2c2b38]/70 flex gap-3">
        <img src={pokemon.sprite} alt={pokemon.name} className="w-16 h-16 [image-rendering:pixelated] shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold dark:text-white">{pokemon.name}</span>
            {pokemon.types.map((t) => (
              <span key={t} className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded" style={{ background: TYPE_COLORS[t] }}>
                {t}
              </span>
            ))}
          </div>
          {flavor && <p className="text-[11px] italic text-[#4A4858] dark:text-[#a8a6b8] mb-2">"{flavor}"</p>}
          <button
            onClick={() => onAdd(pokemon)}
            disabled={inTeam || isFull}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-2 border-[#22212B] dark:border-white bg-white dark:bg-transparent dark:text-white hover:bg-[#22212B] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {inTeam ? '✓ Sudah di tim' : '+ Tambah ke Tim'}
          </button>
        </div>
      </div>
    </div>
  )
}