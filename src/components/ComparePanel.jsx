import { TYPE_COLORS } from '../typeColors.js'
import { multiplierAgainst } from '../typeChart.js'

const STAT_META = [
  { key: 'hp', label: 'HP', color: '#F85888' },
  { key: 'attack', label: 'ATK', color: '#F08030' },
  { key: 'defense', label: 'DEF', color: '#6890F0' },
  { key: 'spAtk', label: 'SP.A', color: '#A040A0' },
  { key: 'spDef', label: 'SP.D', color: '#78C850' },
  { key: 'speed', label: 'SPD', color: '#F0C020' },
]

const MAX_STAT = 180

function bestOffense(attacker, defender) {
  let best = 0
  let bestType = attacker.types[0]
  attacker.types.forEach((atk) => {
    const m = multiplierAgainst(atk, defender.types)
    if (m > best) {
      best = m
      bestType = atk
    }
  })
  return { multiplier: best, type: bestType }
}

function describeMultiplier(m) {
  if (m >= 4) return 'Sangat efektif'
  if (m === 2) return 'Efektif'
  if (m === 1) return 'Normal'
  if (m === 0) return 'Tidak berpengaruh'
  if (m === 0.25) return 'Sangat tidak efektif'
  return 'Kurang efektif'
}

function formatMultiplier(m) {
  if (m === 0.25) return '¼×'
  if (m === 0.5) return '½×'
  return `${m}×`
}

function StatRow({ label, a, b, color }) {
  const aPct = Math.min(100, (a / MAX_STAT) * 100)
  const bPct = Math.min(100, (b / MAX_STAT) * 100)
  const aWins = a > b
  const bWins = b > a

  return (
    <div className="grid grid-cols-[1fr_40px_1fr] items-center gap-2">
      <div className="flex items-center justify-end gap-2">
        <span className={`text-[10px] font-black ${aWins ? 'dark:text-white' : 'text-[#4A4858] dark:text-[#a8a6b8]'}`}>
          {a}
        </span>
        <div className="h-2.5 w-20 border-2 border-[#22212B] bg-[#22212B]/10 dark:bg-white/10 overflow-hidden flex justify-end">
          <div className="h-full" style={{ width: `${aPct}%`, background: color }} />
        </div>
      </div>
      <span className="text-[9px] text-center font-black text-[#4A4858] dark:text-[#a8a6b8]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-20 border-2 border-[#22212B] bg-[#22212B]/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full" style={{ width: `${bPct}%`, background: color }} />
        </div>
        <span className={`text-[10px] font-black ${bWins ? 'dark:text-white' : 'text-[#4A4858] dark:text-[#a8a6b8]'}`}>
          {b}
        </span>
      </div>
    </div>
  )
}

function PokemonHeader({ p, accent }) {
  const total = Object.values(p.stats).reduce((a, b) => a + b, 0)
  return (
    <div className="flex flex-col items-center text-center border-[3px] border-[#22212B] bg-white dark:bg-[#2c2b38] p-3" style={{ boxShadow: `4px 4px 0 0 ${accent}` }}>
      <img src={p.sprite} alt={p.name} className="w-16 h-16 [image-rendering:pixelated]" />
      <span className="text-xs font-black uppercase dark:text-white">{p.name}</span>
      <div className="flex gap-1 mt-1.5">
        {p.types.map((t) => (
          <span
            key={t}
            className="text-[8px] font-black text-white px-1.5 py-0.5 border-2 border-[#22212B]"
            style={{ background: TYPE_COLORS[t] }}
          >
            {t}
          </span>
        ))}
      </div>
      <span className="text-[10px] font-black text-[#22212B] dark:text-white mt-1.5 bg-[#FFD666] border-2 border-[#22212B] px-1.5">Σ {total}</span>
    </div>
  )
}

export default function ComparePanel({ pokemonA, pokemonB, onClose }) {
  if (!pokemonA || !pokemonB) return null

  const accentA = TYPE_COLORS[pokemonA.types?.[0]] || '#D6293E'
  const accentB = TYPE_COLORS[pokemonB.types?.[0]] || '#5FD0E0'
  const aOff = bestOffense(pokemonA, pokemonB)
  const bOff = bestOffense(pokemonB, pokemonA)
  const aFaster = pokemonA.stats.speed > pokemonB.stats.speed
  const bFaster = pokemonB.stats.speed > pokemonA.stats.speed
  const edge = (aOff.multiplier - bOff.multiplier) + (aFaster ? 0.5 : bFaster ? -0.5 : 0)

  return (
    <div className="mt-6 border-[4px] border-[#22212B] dark:border-[#F4EEDD] bg-[#F4EEDD]/50 dark:bg-[#2c2b38] p-4" style={{ boxShadow: '6px 6px 0 0 #22212B' }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-black uppercase dark:text-white bg-[#FFD666] border-2 border-[#22212B] px-2 py-0.5">⚖ Perbandingan</h2>
        <button
          onClick={onClose}
          className="text-[10px] font-black uppercase px-2.5 py-1 border-[3px] border-[#22212B] dark:border-white bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white shadow-[2px_2px_0_0_#22212B] hover:-translate-y-0.5 transition-all"
        >
          ✕ Tutup
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <PokemonHeader p={pokemonA} accent={accentA} />
        <PokemonHeader p={pokemonB} accent={accentB} />
      </div>

      <div className="space-y-2 mb-4 border-[3px] border-[#22212B] bg-white dark:bg-[#22212B]/40 p-3">
        {STAT_META.map((s) => (
          <StatRow
            key={s.key}
            label={s.label}
            a={pokemonA.stats[s.key]}
            b={pokemonB.stats[s.key]}
            color={s.color}
          />
        ))}
      </div>

      <div className="border-[3px] border-[#22212B] bg-white/70 dark:bg-[#2c2b38]/70 p-3 space-y-1.5">
        <p className="text-[11px] font-medium dark:text-[#e5e4ec]">
          ⚔ <strong className="font-black">{pokemonA.name}</strong> menyerang <strong className="font-black">{pokemonB.name}</strong> pakai tipe{' '}
          <strong className="font-black">{aOff.type}</strong>: {describeMultiplier(aOff.multiplier)} ({formatMultiplier(aOff.multiplier)})
        </p>
        <p className="text-[11px] font-medium dark:text-[#e5e4ec]">
          ⚔ <strong className="font-black">{pokemonB.name}</strong> menyerang <strong className="font-black">{pokemonA.name}</strong> pakai tipe{' '}
          <strong className="font-black">{bOff.type}</strong>: {describeMultiplier(bOff.multiplier)} ({formatMultiplier(bOff.multiplier)})
        </p>
        <p className="text-[11px] font-medium dark:text-[#e5e4ec]">
          🏃 {aFaster ? pokemonA.name : bFaster ? pokemonB.name : 'Keduanya sama cepat'}
          {(aFaster || bFaster) && ' lebih cepat, kemungkinan menyerang duluan.'}
        </p>
        <p className="text-[11px] font-bold text-[#4A4858] dark:text-[#a8a6b8] pt-1 border-t-2 border-[#22212B]/10 dark:border-white/10">
          {edge > 0.4 && `Berdasarkan tipe & kecepatan, ${pokemonA.name} sedikit lebih diunggulkan di matchup ini.`}
          {edge < -0.4 && `Berdasarkan tipe & kecepatan, ${pokemonB.name} sedikit lebih diunggulkan di matchup ini.`}
          {edge >= -0.4 && edge <= 0.4 && 'Matchup ini cukup seimbang berdasarkan tipe & kecepatan.'}
          {' '}<span className="italic font-medium">(Perkiraan kasar, belum menghitung damage/ability/item sungguhan.)</span>
        </p>
      </div>
    </div>
  )
}