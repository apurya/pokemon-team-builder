import { getThreatsToTeam } from '../typeChart.js'
import { TYPE_COLORS } from '../typeColors.js'

const THREAT_COUNT = 5

export default function CounterSuggestions({ team, pokemonList }) {
  const members = team.filter(Boolean)
  if (members.length === 0 || pokemonList.length === 0) return null

  const memberIds = new Set(members.map((m) => m.id))
  const candidates = pokemonList.filter((p) => !memberIds.has(p.id))
  const threats = getThreatsToTeam(members, candidates).slice(0, THREAT_COUNT)

  if (threats.length === 0) {
    return (
      <div className="mt-6 rounded-xl border-2 border-[#22212B] dark:border-[#3a3946] bg-white/70 dark:bg-[#2c2b38]/70 p-4 text-center text-sm text-[#4A4858] dark:text-[#a8a6b8]">
        Tidak ditemukan Pokémon di daftar ini yang unggul tipe melawan timmu. Tim kamu cukup solid! 🛡️
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">APA YANG BISA NGALAHIN TIM INI</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Pokémon ini unggul tipe melawan satu atau lebih anggota timmu — waspadai kalau ketemu lawan seperti ini.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {threats.map(({ pokemon, hits }) => (
          <div key={pokemon.id} className="border-2 border-[#9E1C2C]/40 dark:border-[#D6293E]/50 rounded-lg p-2 text-center">
            <img src={pokemon.sprite} alt={pokemon.name} className="w-10 h-10 mx-auto [image-rendering:pixelated]" />
            <div className="text-[10px] font-bold mt-1 truncate dark:text-white">{pokemon.name}</div>
            <div className="flex flex-wrap gap-0.5 justify-center mt-1">
              {pokemon.types.map((t) => (
                <span key={t} className="text-[7px] font-bold text-white px-1 rounded" style={{ background: TYPE_COLORS[t] }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-1 space-y-0.5">
              {hits.map((h) => (
                <div key={h.member.id} className="text-[8px] text-[#9E1C2C] dark:text-[#ff8a8a] font-semibold truncate">
                  {h.multiplier}× vs {h.member.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}