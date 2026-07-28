import { useState } from 'react'
import { TYPE_COLORS } from '../typeColors.js'
import { playCry } from '../pokemonApi.js'

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="border-[4px] border-[#22212B]/15 p-2 overflow-hidden">
          <div className="w-11 h-11 mx-auto rounded-full skeleton-shimmer" />
          <div className="h-2 w-3/4 mx-auto mt-2 skeleton-shimmer" />
          <div className="h-2 w-1/2 mx-auto mt-1.5 skeleton-shimmer" />
        </div>
      ))}
    </div>
  )
}

export default function PokemonGrid({
  pokemonList, loading, error, searchTerm, activeType, team, onAdd,
  compareSelection = [], onToggleCompare = () => {},
  flavorId = null, onToggleFlavor = () => {},
  secondType = 'All', sortBy = 'none', abilityFilter = '',
  hideUsed = false, usedIds = new Set(),
}) {
  const [bouncingId, setBouncingId] = useState(null)

  function handlePlayCry(p) {
    playCry(p.cry)
    if (!p.cry) return
    setBouncingId(p.id)
    setTimeout(() => setBouncingId((prev) => (prev === p.id ? null : prev)), 450)
  }

  const filtered = pokemonList.filter((p) => {
    const term = searchTerm.trim().toLowerCase().replace(/^#/, '')
    const matchesName = p.name.toLowerCase().includes(term)
    const matchesNumber = term !== '' && /^\d+$/.test(term) && String(p.id).includes(term)
    const matchesSearch = matchesName || matchesNumber
    const matchesType = activeType === 'All' || p.types.includes(activeType)
    const matchesSecondType = secondType === 'All' || p.types.includes(secondType)
    const matchesAbility = !abilityFilter.trim() ||
      (p.abilities || []).some((a) => a.name.toLowerCase().includes(abilityFilter.trim().toLowerCase()))
    const matchesUsed = !hideUsed || !usedIds.has(p.id)
    return matchesSearch && matchesType && matchesSecondType && matchesAbility && matchesUsed
  })

  const sorted = sortBy === 'none' ? filtered : [...filtered].sort((a, b) => {
    const statValue = (p) => sortBy === 'total'
      ? Object.values(p.stats || {}).reduce((sum, v) => sum + v, 0)
      : (p.stats?.[sortBy] ?? 0)
    return statValue(b) - statValue(a)
  })

  if (loading) {
    return (
      <div className="border-[4px] border-[#22212B] bg-white p-3">
        <SkeletonGrid />
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-[4px] border-[#22212B] bg-white p-6 text-center text-sm font-black text-[#9E1C2C]">
        {error}
      </div>
    )
  }

  return (
    <div className="scrollbar-thin max-h-72 overflow-y-auto border-[4px] border-[#22212B] bg-white p-3" style={{ boxShadow: '6px 6px 0 0 #22212B' }}>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {sorted.map((p, i) => {
          const inTeam = team.some((t) => t && t.id === p.id)
          const isFull = team.every((t) => t !== null)
          const disabled = inTeam || isFull
          const accent = TYPE_COLORS[p.types?.[0]] || '#22212B'

          const compareIndex = compareSelection.findIndex((c) => c && c.id === p.id)
          const isComparing = compareIndex !== -1

          return (
            <div
              key={p.id}
              className="relative animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i, 20) * 20}ms` }}
            >
              <button
                onClick={() => onAdd(p)}
                disabled={disabled}
                style={{ boxShadow: disabled ? undefined : `4px 4px 0 0 ${accent}` }}
                className={`brutal-card-frame brutal-corner-cut relative w-full p-2 pt-3 text-center overflow-hidden transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6293E] ${
                  disabled
                    ? 'opacity-35 cursor-not-allowed border-[#22212B]/20'
                    : 'hover:-translate-x-1 hover:-translate-y-1'
                } ${isComparing ? 'ring-4 ring-offset-1 ring-[#3B82F6]' : ''}`}
              >
                {/* nomor dex pojok, gaya trading-card */}
                <span className="absolute top-1 left-1 text-[7px] font-black brutal-number-tag text-[#22212B]/50">
                  #{String(p.id).padStart(3, '0')}
                </span>

                <span className="absolute top-0 left-0 right-0 h-2 border-b-[3px] border-[#22212B]" style={{ background: accent }} />

                <img
                  src={p.sprite}
                  alt={p.name}
                  className={`w-12 h-12 mx-auto mt-1.5 [image-rendering:pixelated] drop-shadow-sm ${
                    bouncingId === p.id ? 'motion-safe:animate-[cry-bounce_0.45s_ease-in-out]' : ''
                  }`}
                />
                <div className="text-[10px] font-black uppercase mt-1.5 truncate">{p.name}</div>
                <div className="flex flex-wrap gap-1 justify-center mt-1.5">
                  {p.types.map((t) => (
                    <span
                      key={t}
                      className="text-[7px] font-black uppercase text-white px-1.5 py-0.5 border-2 border-[#22212B]"
                      style={{ background: TYPE_COLORS[t] }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </button>

              <button
                onClick={() => onToggleCompare(p)}
                title="Bandingkan Pokémon ini"
                className={`absolute -top-2.5 -right-2.5 w-6 h-6 text-[10px] font-black border-[3px] border-[#22212B] flex items-center justify-center transition-all hover:scale-110 ${
                  isComparing ? 'bg-[#3B82F6] text-white shadow-[2px_2px_0_0_#22212B]' : 'bg-white text-[#22212B]/60 shadow-[2px_2px_0_0_#22212B]'
                }`}
              >
                {isComparing ? compareIndex + 1 : '⚖'}
              </button>

              <button
                onClick={() => onToggleFlavor(p)}
                title="Lihat deskripsi Pokedex"
                className={`absolute -bottom-2.5 -left-2.5 w-6 h-6 text-[10px] font-black border-[3px] border-[#22212B] flex items-center justify-center transition-all hover:scale-110 shadow-[2px_2px_0_0_#22212B] ${
                  flavorId === p.id ? 'bg-[#7ED47E] text-[#22212B]' : 'bg-white text-[#22212B]/60'
                }`}
              >
                ℹ
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handlePlayCry(p) }}
                disabled={!p.cry}
                title={p.cry ? 'Dengar suara cry' : 'Suara tidak tersedia'}
                className={`absolute -bottom-2.5 -right-2.5 w-6 h-6 text-[10px] font-black border-[3px] flex items-center justify-center transition-all hover:scale-110 ${
                  p.cry ? 'border-[#22212B] bg-white text-[#22212B]/60 shadow-[2px_2px_0_0_#22212B]' : 'border-[#22212B]/20 bg-white/50 text-[#22212B]/20 cursor-not-allowed'
                }`}
              >
                🔊
              </button>
            </div>
          )
        })}
      </div>
      {sorted.length === 0 && (
        <p className="text-center text-xs font-black text-[#4A4858] py-6 border-[3px] border-dashed border-[#22212B]/30 mt-2">
          Tidak ada Pokémon yang cocok. Coba ubah filter, ya!
        </p>
      )}
    </div>
  )
}