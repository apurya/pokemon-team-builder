import { useEffect, useState } from 'react'
import { multiplierAgainst } from '../typeChart.js'

const moveListCache = {}
const moveDetailCache = {}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function fetchDamagingMoves(pokemonId) {
  if (moveListCache[pokemonId]) return moveListCache[pokemonId]
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
  const data = await res.json()
  const moveNames = data.moves
    .filter((m) => m.version_group_details.some((v) => v.move_learn_method.name === 'level-up'))
    .map((m) => m.move.name)

  const details = await Promise.all(moveNames.map(async (name) => {
    if (moveDetailCache[name]) return moveDetailCache[name]
    const r = await fetch(`https://pokeapi.co/api/v2/move/${name}`)
    const d = await r.json()
    const detail = {
      name: capitalize(d.name.replace(/-/g, ' ')),
      type: capitalize(d.type.name),
      power: d.power,
      damageClass: d.damage_class?.name ?? 'status',
    }
    moveDetailCache[name] = detail
    return detail
  }))

  const damaging = details.filter((m) => m.damageClass !== 'status' && m.power)
  moveListCache[pokemonId] = damaging
  return damaging
}

function statAtLevel50Hp(base) {
  return Math.floor((2 * base + 31) * 50 / 100) + 50 + 10
}

function statAtLevel50(base) {
  return Math.floor((Math.floor((2 * base + 31) * 50 / 100) + 5) * 1)
}

function calcDamageRange({ power, attackStat, defenseStat, stab, typeMultiplier }) {
  const base = Math.floor(Math.floor((2 * 50 / 5 + 2) * power * attackStat / defenseStat) / 50) + 2
  const modifier = stab * typeMultiplier
  const min = Math.max(0, Math.floor(base * 0.85 * modifier))
  const max = Math.max(0, Math.floor(base * 1.0 * modifier))
  return { min, max }
}

export default function DamageCalculator({ team, pokemonList }) {
  const members = team.filter(Boolean)

  const allCandidates = (() => {
    const map = new Map()
    ;[...members, ...pokemonList].forEach((p) => { if (p && !map.has(p.id)) map.set(p.id, p) })
    return [...map.values()]
  })()

  const [attackerId, setAttackerId] = useState('')
  const [defenderId, setDefenderId] = useState('')
  const [moveName, setMoveName] = useState('')
  const [moves, setMoves] = useState([])
  const [loadingMoves, setLoadingMoves] = useState(false)

  const attacker = allCandidates.find((p) => String(p.id) === String(attackerId))
  const defender = allCandidates.find((p) => String(p.id) === String(defenderId))

  useEffect(() => {
    setMoveName('')
    setMoves([])
    if (!attacker) return
    let cancelled = false
    setLoadingMoves(true)
    fetchDamagingMoves(attacker.id)
      .then((res) => { if (!cancelled) { setMoves(res); setLoadingMoves(false) } })
      .catch(() => { if (!cancelled) setLoadingMoves(false) })
    return () => { cancelled = true }
  }, [attacker?.id])

  if (members.length === 0) return null

  const move = moves.find((m) => m.name === moveName)

  let result = null
  if (attacker && defender && move) {
    const isPhysical = move.damageClass === 'physical'
    const attackStat = statAtLevel50(isPhysical ? attacker.stats.attack : attacker.stats.spAtk)
    const defenseStat = statAtLevel50(isPhysical ? defender.stats.defense : defender.stats.spDef)
    const stab = attacker.types.includes(move.type) ? 1.5 : 1
    const typeMultiplier = multiplierAgainst(move.type, defender.types)
    const { min, max } = calcDamageRange({ power: move.power, attackStat, defenseStat, stab, typeMultiplier })
    const defenderHp = statAtLevel50Hp(defender.stats.hp)
    result = {
      min, max, defenderHp,
      minPct: Math.min(100, (min / defenderHp) * 100),
      maxPct: Math.min(100, (max / defenderHp) * 100),
      typeMultiplier,
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">KALKULATOR DAMAGE</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Estimasi damage antar Pokémon (asumsi level 50, IV 31, EV 0, nature netral). Perkiraan kasar, bukan pengganti kalkulator kompetitif penuh.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] block mb-1">Penyerang</label>
          <select
            value={attackerId}
            onChange={(e) => setAttackerId(e.target.value)}
            className="w-full px-2 py-2 rounded-lg border-2 border-[#22212B] text-xs bg-white"
          >
            <option value="">Pilih Pokémon…</option>
            {allCandidates.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] block mb-1">Bertahan</label>
          <select
            value={defenderId}
            onChange={(e) => setDefenderId(e.target.value)}
            className="w-full px-2 py-2 rounded-lg border-2 border-[#22212B] text-xs bg-white"
          >
            <option value="">Pilih Pokémon…</option>
            {allCandidates.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {attacker && (
        <div className="mb-3">
          <label className="text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] block mb-1">Gerakan {attacker.name}</label>
          <select
            value={moveName}
            onChange={(e) => setMoveName(e.target.value)}
            disabled={loadingMoves}
            className="w-full px-2 py-2 rounded-lg border-2 border-[#22212B] text-xs bg-white disabled:opacity-50"
          >
            <option value="">{loadingMoves ? 'Memuat movepool…' : 'Pilih gerakan…'}</option>
            {moves.map((m) => (
              <option key={m.name} value={m.name}>{m.name} ({m.type}, Pow {m.power})</option>
            ))}
          </select>
        </div>
      )}

      {result && (
        <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-3 bg-white/70 dark:bg-[#2c2b38]/70">
          <p className="text-xs dark:text-white mb-1">
            <strong>{move.name}</strong> dari {attacker.name} ke {defender.name}:
          </p>
          <p className="text-sm font-bold dark:text-white">
            {result.min}–{result.max} damage ({result.minPct.toFixed(1)}%–{result.maxPct.toFixed(1)}% HP)
          </p>
          <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8] mt-1">
            Efektivitas tipe: ×{result.typeMultiplier} {result.maxPct >= 100 ? '· Bisa KO satu hit!' : ''}
          </p>
        </div>
      )}
    </div>
  )
}