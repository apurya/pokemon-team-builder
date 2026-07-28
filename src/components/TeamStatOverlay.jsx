import { TYPE_COLORS } from '../typeColors.js'

const STAT_META = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'spAtk', label: 'SP.A' },
  { key: 'spDef', label: 'SP.D' },
  { key: 'speed', label: 'SPD' },
]

const MAX_STAT = 180
const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 80

function angleFor(index) {
  return (Math.PI * 2 * index) / STAT_META.length - Math.PI / 2
}

function pointFor(index, value) {
  const r = (Math.min(value, MAX_STAT) / MAX_STAT) * RADIUS
  const angle = angleFor(index)
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) }
}

function ringPoints(frac) {
  return STAT_META.map((_, i) => {
    const angle = angleFor(i)
    const r = RADIUS * frac
    return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`
  }).join(' ')
}

export default function TeamStatOverlay({ team }) {
  const members = team.filter((p) => p && p.stats)
  if (members.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">DISTRIBUSI STAT TIM (GABUNGAN)</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Semua anggota tim ditumpuk dalam satu radar, biar kelihatan tim ini "berat" di stat apa secara keseluruhan.
      </p>

      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[280px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map((frac) => (
          <polygon key={frac} points={ringPoints(frac)} fill="none" className="stroke-[#22212B]/10 dark:stroke-white/10" strokeWidth="1" />
        ))}
        {STAT_META.map((_, i) => {
          const angle = angleFor(i)
          return (
            <line
              key={i} x1={CENTER} y1={CENTER}
              x2={CENTER + RADIUS * Math.cos(angle)} y2={CENTER + RADIUS * Math.sin(angle)}
              className="stroke-[#22212B]/10 dark:stroke-white/10" strokeWidth="1"
            />
          )
        })}

        {members.map((p) => {
          const color = p.types?.[0] ? TYPE_COLORS[p.types[0]] : '#D6293E'
          const points = STAT_META.map((s, i) => pointFor(i, p.stats[s.key]))
          return (
            <polygon
              key={p.id}
              points={points.map((pt) => `${pt.x},${pt.y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeOpacity="0.85"
            />
          )
        })}

        {STAT_META.map((s, i) => {
          const angle = angleFor(i)
          const lx = CENTER + (RADIUS + 16) * Math.cos(angle)
          const ly = CENTER + (RADIUS + 16) * Math.sin(angle)
          return (
            <text key={s.key} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" className="fill-[#4A4858] dark:fill-[#a8a6b8]">
              {s.label}
            </text>
          )
        })}
      </svg>

      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {members.map((p) => (
          <span key={p.id} className="flex items-center gap-1 text-[10px] font-semibold dark:text-white">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.types?.[0] ? TYPE_COLORS[p.types[0]] : '#D6293E' }} />
            {p.name}
          </span>
        ))}
      </div>
    </div>
  )
}