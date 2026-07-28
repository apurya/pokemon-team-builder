import { ALL_TYPES, multiplierAgainst, getTeamTypeCounts } from '../typeChart.js'
import { TYPE_COLORS } from '../typeColors.js'

const SUGGESTION_COUNT = 5

export default function TeamSuggestions({ team, pokemonList, onAdd }) {
  const members = team.filter(Boolean)
  const isFull = team.every((p) => p !== null)

  if (members.length === 0 || isFull || pokemonList.length === 0) return null

  const { weakCount } = getTeamTypeCounts(members)
  const weakTypes = ALL_TYPES.filter((t) => weakCount[t] > 0)

  if (weakTypes.length === 0) {
    return (
      <div className="mt-6 rounded-xl border-2 border-[#22212B] dark:border-[#3a3946] bg-white/70 dark:bg-[#2c2b38]/70 p-4 text-center text-sm text-[#4A4858] dark:text-[#a8a6b8]">
        Tim ini belum punya kelemahan tipe yang signifikan — tidak ada saran khusus saat ini. 🎉
      </div>
    )
  }

  const candidates = pokemonList
    .filter((p) => !members.some((m) => m.id === p.id))
    .map((p) => {
      let score = 0
      const covers = []
      weakTypes.forEach((t) => {
        const m = multiplierAgainst(t, p.types)
        if (m === 0) { score += weakCount[t] * 1.5; covers.push(t) }
        else if (m < 1) { score += weakCount[t]; covers.push(t) }
      })
      return { pokemon: p, covers, score }
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, SUGGESTION_COUNT)

  if (candidates.length === 0) {
    return (
      <div className="mt-6 rounded-xl border-2 border-[#22212B] dark:border-[#3a3946] bg-white/70 dark:bg-[#2c2b38]/70 p-4 text-center text-sm text-[#4A4858] dark:text-[#a8a6b8]">
        Belum ditemukan Pokémon yang cocok untuk menutup kelemahan tim ini.
      </div>
    )
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">SARAN UNTUK TIM</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Pokémon ini tahan atau kebal terhadap tipe yang jadi kelemahan terbesar timmu. Klik untuk langsung menambahkan.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {candidates.map(({ pokemon, covers }) => (
          <button
            key={pokemon.id}
            onClick={() => onAdd(pokemon)}
            className="border-2 border-[#22212B]/20 dark:border-white/20 hover:border-[#22212B] dark:hover:border-white rounded-lg p-2 text-center transition-transform motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6293E]"
          >
            <img src={pokemon.sprite} alt={pokemon.name} className="w-10 h-10 mx-auto [image-rendering:pixelated]" />
            <div className="text-[10px] font-bold mt-1 truncate dark:text-white">{pokemon.name}</div>
            <div className="flex flex-wrap gap-0.5 justify-center mt-1">
              {covers.map((t) => (
                <span
                  key={t}
                  className="text-[7px] font-bold text-white px-1 rounded"
                  style={{ background: TYPE_COLORS[t] }}
                  title={`Tahan/kebal terhadap ${t}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}