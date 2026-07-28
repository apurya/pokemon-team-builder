import { useState } from 'react'

const NATURES = {
  Hardy: {}, Docile: {}, Serious: {}, Bashful: {}, Quirky: {},
  Lonely: { up: 'attack', down: 'defense' },
  Adamant: { up: 'attack', down: 'spAtk' },
  Naughty: { up: 'attack', down: 'spDef' },
  Brave: { up: 'attack', down: 'speed' },
  Bold: { up: 'defense', down: 'attack' },
  Impish: { up: 'defense', down: 'spAtk' },
  Lax: { up: 'defense', down: 'spDef' },
  Relaxed: { up: 'defense', down: 'speed' },
  Modest: { up: 'spAtk', down: 'attack' },
  Mild: { up: 'spAtk', down: 'defense' },
  Rash: { up: 'spAtk', down: 'spDef' },
  Quiet: { up: 'spAtk', down: 'speed' },
  Calm: { up: 'spDef', down: 'attack' },
  Gentle: { up: 'spDef', down: 'defense' },
  Careful: { up: 'spDef', down: 'spAtk' },
  Sassy: { up: 'spDef', down: 'speed' },
  Timid: { up: 'speed', down: 'attack' },
  Hasty: { up: 'speed', down: 'defense' },
  Jolly: { up: 'speed', down: 'spAtk' },
  Naive: { up: 'speed', down: 'spDef' },
}

const STAT_LABELS = { hp: 'HP', attack: 'Attack', defense: 'Defense', spAtk: 'Sp. Atk', spDef: 'Sp. Def', speed: 'Speed' }

function computeHp(base, level, iv, ev) {
  if (!base) return 0
  return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10
}

function computeStat(base, level, iv, ev, natureMult) {
  return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * natureMult)
}

const DEFAULT_BASE = { hp: 100, attack: 100, defense: 100, spAtk: 100, spDef: 100, speed: 100 }
const DEFAULT_31 = { hp: 31, attack: 31, defense: 31, spAtk: 31, spDef: 31, speed: 31 }
const DEFAULT_0 = { hp: 0, attack: 0, defense: 0, spAtk: 0, spDef: 0, speed: 0 }

export default function NatureCalculator({ team = [] }) {
  const members = team.filter((p) => p && p.stats)

  const [level, setLevel] = useState(50)
  const [nature, setNature] = useState('Hardy')
  const [base, setBase] = useState(DEFAULT_BASE)
  const [iv, setIv] = useState(DEFAULT_31)
  const [ev, setEv] = useState(DEFAULT_0)
  const [sourceId, setSourceId] = useState('')

  const natureInfo = NATURES[nature]

  function multFor(stat) {
    if (!natureInfo?.up) return 1
    if (natureInfo.up === stat) return 1.1
    if (natureInfo.down === stat) return 0.9
    return 1
  }

  // --- Fitur baru: prefill base stat dari anggota tim yang dipilih ---
  function handleSourceChange(id) {
    setSourceId(id)
    if (!id) { setBase(DEFAULT_BASE); return }
    const p = members.find((m) => String(m.id) === id)
    if (p) setBase({ ...p.stats })
  }

  const totalEv = Object.values(ev).reduce((a, b) => a + b, 0)

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">KALKULATOR NATURE / EV / IV</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Hitung stat akhir Pokémon berdasarkan level, nature, EV, dan IV.
        {members.length > 0 && ' Pilih anggota tim di bawah untuk otomatis mengisi base stat aslinya.'}
      </p>

      {members.length > 0 && (
        <div className="mb-3">
          <label className="text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] block mb-1">Isi base stat dari anggota tim (opsional)</label>
          <select
            value={sourceId}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full sm:w-64 px-2 py-1.5 rounded-lg border-2 border-[#22212B] text-xs bg-white"
          >
            <option value="">— Base stat manual (semua 100) —</option>
            {members.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-3">
        <div>
          <label className="text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] block mb-1">Level</label>
          <input
            type="number" min="1" max="100" value={level}
            onChange={(e) => setLevel(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
            className="w-20 px-2 py-1.5 rounded-lg border-2 border-[#22212B] text-xs bg-white"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] block mb-1">Nature</label>
          <select
            value={nature} onChange={(e) => setNature(e.target.value)}
            className="px-2 py-1.5 rounded-lg border-2 border-[#22212B] text-xs bg-white"
          >
            {Object.keys(NATURES).map((n) => (
              <option key={n} value={n}>
                {n}{NATURES[n].up ? ` (+${STAT_LABELS[NATURES[n].up]} / -${STAT_LABELS[NATURES[n].down]})` : ' (Netral)'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] block mb-1">Total EV</span>
          <span className={`text-xs font-bold ${totalEv > 510 ? 'text-[#D6293E]' : 'dark:text-white'}`}>{totalEv}/510</span>
        </div>
      </div>

      <div className="overflow-x-auto border-2 border-[#22212B] dark:border-[#3a3946] rounded-xl">
        <table className="w-full text-[11px] border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-[#22212B] text-white">
              <th className="text-left px-2 py-1.5">Stat</th>
              <th className="px-2 py-1.5">Base</th>
              <th className="px-2 py-1.5">IV</th>
              <th className="px-2 py-1.5">EV</th>
              <th className="px-2 py-1.5">Hasil</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(STAT_LABELS).map((stat) => {
              const result = stat === 'hp'
                ? computeHp(base[stat], level, iv[stat], ev[stat])
                : computeStat(base[stat], level, iv[stat], ev[stat], multFor(stat))
              const mult = multFor(stat)
              return (
                <tr key={stat} className="border-t border-[#22212B]/10 dark:border-white/10">
                  <td className="px-2 py-1.5 font-semibold dark:text-white">
                    {STAT_LABELS[stat]}
                    {mult === 1.1 && <span className="text-[#c0392b]"> ▲</span>}
                    {mult === 0.9 && <span className="text-[#2b6dc0]"> ▼</span>}
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" min="1" max="255" value={base[stat]}
                      onChange={(e) => setBase((prev) => ({ ...prev, [stat]: Math.max(1, Math.min(255, Number(e.target.value) || 1)) }))}
                      className="w-14 px-1 py-1 rounded border border-[#22212B]/30 text-center" />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" min="0" max="31" value={iv[stat]}
                      onChange={(e) => setIv((prev) => ({ ...prev, [stat]: Math.max(0, Math.min(31, Number(e.target.value) || 0)) }))}
                      className="w-14 px-1 py-1 rounded border border-[#22212B]/30 text-center" />
                  </td>
                  <td className="px-1 py-1">
                    <input type="number" min="0" max="252" value={ev[stat]}
                      onChange={(e) => setEv((prev) => ({ ...prev, [stat]: Math.max(0, Math.min(252, Number(e.target.value) || 0)) }))}
                      className="w-14 px-1 py-1 rounded border border-[#22212B]/30 text-center" />
                  </td>
                  <td className="px-2 py-1.5 text-center font-bold dark:text-white">{result}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {totalEv > 510 && (
        <p className="text-[10px] text-[#D6293E] mt-1.5">⚠ Total EV melebihi batas maksimal 510.</p>
      )}
    </div>
  )
}