import { useState } from 'react'
import { PRESET_TEAMS } from '../presetTeams.js'
import { fetchPokemonDetail } from '../pokemonApi.js'

export default function PresetTeams({ onImport }) {
  const [loadingId, setLoadingId] = useState(null)
  const [errorId, setErrorId] = useState(null)

  async function handleLoad(preset) {
    setLoadingId(preset.id)
    setErrorId(null)
    try {
      const results = await Promise.allSettled(preset.pokemonIds.map(fetchPokemonDetail))
      const members = results.map((r) => (r.status === 'fulfilled' ? r.value : null))
      const padded = [...members, ...Array(6).fill(null)].slice(0, 6)
      onImport(padded)
    } catch {
      setErrorId(preset.id)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">TIM SERUPA / PRESET</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Coba mulai dari tim jadi buat inspirasi — memuat preset akan menimpa tim yang sedang aktif.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRESET_TEAMS.map((preset) => (
          <div key={preset.id} className="border-2 border-[#22212B]/20 dark:border-white/20 rounded-lg p-3">
            <div className="text-xs font-bold dark:text-white mb-0.5">{preset.name}</div>
            <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8] mb-2">{preset.description}</p>
            <button
              onClick={() => handleLoad(preset)}
              disabled={loadingId === preset.id}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-2 border-[#22212B] dark:border-white bg-white dark:bg-transparent dark:text-white hover:bg-[#22212B] hover:text-white transition-colors disabled:opacity-50"
            >
              {loadingId === preset.id ? 'Memuat…' : '📥 Muat Tim Ini'}
            </button>
            {errorId === preset.id && (
              <p className="text-[9px] text-[#D6293E] mt-1">Gagal memuat sebagian Pokémon, coba lagi.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}