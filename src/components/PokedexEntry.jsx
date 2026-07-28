import { useEffect, useState } from 'react'

const cache = new Map() // cache in-memory biar ga fetch ulang tiap toggle

function cleanFlavorText(text) {
  return text.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim()
}

async function fetchSpeciesInfo(id) {
  if (cache.has(id)) return cache.get(id)

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  if (!res.ok) throw new Error('fetch failed')
  const data = await res.json()

  const enEntries = data.flavor_text_entries.filter((e) => e.language.name === 'en')
  const flavorText = enEntries.length > 0
    ? cleanFlavorText(enEntries[Math.floor(Math.random() * enEntries.length)].flavor_text)
    : null

  const genusEntry = data.genera.find((g) => g.language.name === 'en')
  const genus = genusEntry ? genusEntry.genus : null

  const result = { flavorText, genus }
  cache.set(id, result)
  return result
}

export default function PokedexEntry({ pokemon, onClose }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!pokemon) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setInfo(null)

    fetchSpeciesInfo(pokemon.id)
      .then((result) => { if (!cancelled) setInfo(result) })
      .catch(() => { if (!cancelled) setError('Gagal memuat deskripsi Pokédex.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [pokemon])

  if (!pokemon) return null

  return (
    <div className="mt-6 border-2 border-[#22212B] dark:border-[#3a3946] rounded-xl bg-white dark:bg-[#2c2b38] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold dark:text-white">📖 POKEDEX</h2>
        <button
          onClick={onClose}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-2 border-[#22212B] dark:border-white bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white hover:opacity-80 transition-colors"
        >
          ✕ Tutup
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <img src={pokemon.sprite} alt={pokemon.name} className="w-14 h-14 [image-rendering:pixelated]" />
        <div>
          <div className="text-sm font-bold dark:text-white">{pokemon.name}</div>
          {info?.genus && (
            <div className="text-[11px] text-[#4A4858] dark:text-[#a8a6b8]">{info.genus}</div>
          )}
        </div>
      </div>

      {loading && <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8]">Memuat deskripsi…</p>}
      {error && <p className="text-xs text-[#9E1C2C]">{error}</p>}
      {!loading && !error && info?.flavorText && (
        <p className="text-[12px] leading-relaxed italic dark:text-[#e5e4ec]">
          "{info.flavorText}"
        </p>
      )}
      {!loading && !error && info && !info.flavorText && (
        <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8]">Deskripsi tidak tersedia untuk Pokémon ini.</p>
      )}
    </div>
  )
}