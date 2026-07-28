import { useState } from 'react'
import { multiplierAgainst } from '../typeChart.js'
import { TYPE_COLORS } from '../typeColors.js'

const MAX_ENEMY = 6

export default function MatchupSimulator({ team, pokemonList }) {
  const members = team.filter(Boolean)
  const [enemyTeam, setEnemyTeam] = useState([])
  const [search, setSearch] = useState('')

  if (members.length === 0) return null

  const suggestions = search.trim()
    ? pokemonList
        .filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
        .filter((p) => !enemyTeam.some((e) => e.id === p.id))
        .slice(0, 6)
    : []

  function addEnemy(p) {
    if (enemyTeam.length >= MAX_ENEMY) return
    setEnemyTeam((prev) => [...prev, p])
    setSearch('')
  }

  function removeEnemy(id) {
    setEnemyTeam((prev) => prev.filter((p) => p.id !== id))
  }

  // Untuk tiap pasangan (anggota kita vs musuh), tentukan siapa yang unggul tipe secara defensif
  function matchupResult(mine, enemy) {
    const enemyBestVsMine = Math.max(...enemy.types.map((t) => multiplierAgainst(t, mine.types)))
    const mineBestVsEnemy = Math.max(...mine.types.map((t) => multiplierAgainst(t, enemy.types)))
    if (mineBestVsEnemy > enemyBestVsMine) return 'win'
    if (enemyBestVsMine > mineBestVsEnemy) return 'lose'
    return 'draw'
  }

  const results = enemyTeam.length > 0
    ? members.map((mine) => {
        const vs = enemyTeam.map((enemy) => ({ enemy, outcome: matchupResult(mine, enemy) }))
        const wins = vs.filter((v) => v.outcome === 'win').length
        const losses = vs.filter((v) => v.outcome === 'lose').length
        return { mine, vs, wins, losses }
      })
    : []

  const totalWins = results.reduce((s, r) => s + r.wins, 0)
  const totalLosses = results.reduce((s, r) => s + r.losses, 0)

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">SIMULASI MATCHUP VS TIM LAWAN</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Susun tim lawan custom, lalu lihat siapa yang unggul tipe secara head-to-head (berdasarkan tipe saja, bukan moveset/stat).
      </p>

      <div className="mb-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {enemyTeam.map((p) => (
            <span key={p.id} className="flex items-center gap-1 text-[10px] font-semibold border-2 border-[#22212B]/30 rounded-full pl-1 pr-2 py-0.5 dark:text-white">
              <img src={p.sprite} alt={p.name} className="w-4 h-4 [image-rendering:pixelated]" />
              {p.name}
              <button onClick={() => removeEnemy(p.id)} className="ml-1 text-[#9E1C2C]">×</button>
            </span>
          ))}
          {enemyTeam.length === 0 && (
            <span className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">Belum ada anggota tim lawan.</span>
          )}
        </div>

        {enemyTeam.length < MAX_ENEMY && (
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Pokémon buat tim lawan…"
              className="w-full sm:w-72 px-2 py-1.5 rounded-lg border-2 border-[#22212B] text-xs bg-white"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full sm:w-72 border-2 border-[#22212B] rounded-lg bg-white shadow-lg max-h-40 overflow-y-auto">
                {suggestions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addEnemy(p)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:bg-[#22212B]/5"
                  >
                    <img src={p.sprite} alt={p.name} className="w-6 h-6 [image-rendering:pixelated]" />
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <>
          <div className="text-center mb-3">
            <span className="text-sm font-bold dark:text-white">
              Rekor keunggulan tipe: {totalWins}W – {totalLosses}L – {members.length * enemyTeam.length - totalWins - totalLosses}D
            </span>
          </div>
          <div className="space-y-2">
            {results.map(({ mine, vs, wins, losses }) => (
              <div key={mine.id} className="border-2 border-[#22212B]/20 dark:border-white/20 rounded-lg p-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <img src={mine.sprite} alt={mine.name} className="w-7 h-7 [image-rendering:pixelated]" />
                  <span className="text-xs font-bold dark:text-white">{mine.name}</span>
                  <span className="ml-auto text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8]">{wins}W-{losses}L</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {vs.map(({ enemy, outcome }) => (
                    <span
                      key={enemy.id}
                      title={`${mine.name} vs ${enemy.name}`}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${
                        outcome === 'win' ? 'bg-[#7ED47E]' : outcome === 'lose' ? 'bg-[#9E1C2C]' : 'bg-[#8894a8]'
                      }`}
                    >
                      {enemy.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}