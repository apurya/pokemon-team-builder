const REFERENCE_COUNT = 10

function speedPercentile(speed, pool) {
  if (pool.length === 0) return null
  const slowerOrEqual = pool.filter((p) => p.stats && p.stats.speed <= speed).length
  return Math.round((slowerOrEqual / pool.length) * 100)
}

export default function SpeedTier({ team, pokemonList }) {
  const members = team.filter(Boolean)
  if (members.length === 0 || pokemonList.length === 0) return null

  const membersWithStats = members.filter((p) => p.stats)
  const membersWithoutStats = members.filter((p) => !p.stats)
  if (membersWithStats.length === 0) return null

  const memberIds = new Set(members.map((p) => p.id))

  const references = pokemonList
    .filter((p) => !memberIds.has(p.id) && p.stats)
    .sort((a, b) => b.stats.speed - a.stats.speed)
    .slice(0, REFERENCE_COUNT)

  const combined = [
    ...membersWithStats.map((p) => ({ ...p, isTeam: true })),
    ...references.map((p) => ({ ...p, isTeam: false })),
  ].sort((a, b) => b.stats.speed - a.stats.speed)

  const maxSpeed = combined[0]?.stats.speed || 1

  const percentiles = membersWithStats.map((p) => ({
    pokemon: p,
    percentile: speedPercentile(p.stats.speed, pokemonList),
  }))
  const avgPercentile = Math.round(
    percentiles.reduce((sum, x) => sum + (x.percentile ?? 0), 0) / percentiles.length
  )

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">SPEED TIER</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Urutan base Speed timmu (disorot merah) dibanding {REFERENCE_COUNT} Pokémon tercepat lain di daftar yang sedang ditampilkan.
        {membersWithoutStats.length > 0 && ' Beberapa anggota tim tidak punya data stat (tim lama) dan tidak ikut ditampilkan.'}
      </p>
      <div className="space-y-1">
        {combined.map((p, i) => {
          const pct = Math.max(4, (p.stats.speed / maxSpeed) * 100)
          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border-2 ${
                p.isTeam ? 'border-[#22212B] dark:border-white bg-white dark:bg-[#2c2b38]' : 'border-transparent bg-white/40 dark:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-bold w-5 text-right text-[#4A4858] dark:text-[#a8a6b8]">{i + 1}</span>
              <img src={p.sprite} alt={p.name} className="w-6 h-6 [image-rendering:pixelated]" />
              <span className={`text-xs w-24 truncate ${p.isTeam ? 'font-bold dark:text-white' : 'text-[#4A4858] dark:text-[#a8a6b8]'}`}>{p.name}</span>
              <div className="flex-1 h-2 rounded bg-[#22212B]/10 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded" style={{ width: `${pct}%`, background: p.isTeam ? '#D6293E' : '#8894a8' }} />
              </div>
              <span className="text-[10px] font-semibold w-8 text-right dark:text-white">{p.stats.speed}</span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 rounded-lg border-2 border-[#22212B]/15 dark:border-white/15 bg-white/50 dark:bg-white/5 p-3">
        <h3 className="text-xs font-bold mb-2 dark:text-white">VS META (SELURUH POKÉMON DI GENERASI INI)</h3>
        <p className="text-[11px] text-[#4A4858] dark:text-[#a8a6b8] mb-2">
          Rata-rata tim kamu lebih cepat dari <span className="font-bold">{avgPercentile}%</span> Pokémon di daftar generasi yang sedang ditampilkan ({pokemonList.length} data).
        </p>
        <div className="space-y-1">
          {percentiles.map(({ pokemon, percentile }) => (
            <div key={pokemon.id} className="flex items-center gap-2 text-[11px]">
              <img src={pokemon.sprite} alt={pokemon.name} className="w-5 h-5 [image-rendering:pixelated]" />
              <span className="w-24 truncate font-semibold dark:text-white">{pokemon.name}</span>
              <div className="flex-1 h-1.5 rounded bg-[#22212B]/10 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded bg-[#3B82F6]" style={{ width: `${percentile ?? 0}%` }} />
              </div>
              <span className="w-10 text-right font-semibold dark:text-white">{percentile ?? '–'}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}