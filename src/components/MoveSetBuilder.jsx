import { useState } from 'react'
import { useTeamMoves } from '../hooks/useTeamMoves.js'
import { TYPE_COLORS } from '../typeColors.js'

const MAX_MOVES = 4

export default function MoveSetBuilder({ team }) {
  const members = team.filter(Boolean)
  const movesByMember = useTeamMoves(members)
  const [selected, setSelected] = useState({}) // { [pokemonId]: string[] }

  if (members.length === 0) return null

  function toggleMove(pokemonId, moveName) {
    setSelected((prev) => {
      const current = prev[pokemonId] || []
      if (current.includes(moveName)) {
        return { ...prev, [pokemonId]: current.filter((m) => m !== moveName) }
      }
      if (current.length >= MAX_MOVES) return prev
      return { ...prev, [pokemonId]: [...current, moveName] }
    })
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">MOVE SET BUILDER</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Pilih maksimal {MAX_MOVES} gerakan menyerang per anggota dari movepool level-up-nya.
      </p>

      <div className="space-y-3">
        {members.map((p) => {
          const info = movesByMember[p.id]
          const picked = selected[p.id] || []
          const pickedTypes = [...new Set(
            picked.map((name) => info?.moves.find((m) => m.name === name)?.type).filter(Boolean)
          )]

          return (
            <div key={p.id} className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-3 bg-white/70 dark:bg-[#2c2b38]/70">
              <div className="flex items-center gap-2 mb-2">
                <img src={p.sprite} alt={p.name} className="w-8 h-8 [image-rendering:pixelated]" />
                <span className="text-xs font-bold dark:text-white">{p.name}</span>
                <span className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8] ml-auto">{picked.length}/{MAX_MOVES} dipilih</span>
              </div>

              {info?.loading && <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">Memuat movepool…</p>}
              {info?.error && <p className="text-[10px] text-[#D6293E]">Gagal memuat gerakan.</p>}

              {info && !info.loading && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {info.moves.length === 0 && (
                    <span className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">Tidak ada gerakan menyerang level-up.</span>
                  )}
                  {info.moves.map((m) => {
                    const isPicked = picked.includes(m.name)
                    const disabled = !isPicked && picked.length >= MAX_MOVES
                    return (
                      <button
                        key={m.name}
                        onClick={() => toggleMove(p.id, m.name)}
                        disabled={disabled}
                        className={`text-[10px] font-semibold px-2 py-1 rounded-full border-2 transition-colors ${
                          isPicked
                            ? 'border-[#22212B] text-white'
                            : 'border-[#22212B]/20 dark:border-white/20 bg-white dark:bg-transparent dark:text-white hover:border-[#22212B]'
                        } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                        style={isPicked ? { background: TYPE_COLORS[m.type] } : {}}
                      >
                        {m.name} · {m.type} · {m.power}
                      </button>
                    )
                  })}
                </div>
              )}

              {picked.length > 0 && (
                <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">
                  Cakupan tipe moveset: {pickedTypes.map((t) => (
                    <span key={t} className="font-bold" style={{ color: TYPE_COLORS[t] }}> {t}</span>
                  ))}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}