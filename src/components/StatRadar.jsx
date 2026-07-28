const STAT_META = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'spAtk', label: 'SP.A' },
  { key: 'spDef', label: 'SP.D' },
  { key: 'speed', label: 'SPD' },
]

const MAX_STAT = 180
const SIZE = 160
const CENTER = SIZE / 2
const RADIUS = 55

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

export default function StatRadar({ stats, color = '#D6293E' }) {
  const dataPoints = STAT_META.map((s, i) => pointFor(i, stats[s.key]))
  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[170px] mx-auto">
      {/* Grid ring 25/50/75/100% */}
      {[0.25, 0.5, 0.75, 1].map((frac) => (
        <polygon
          key={frac}
          points={ringPoints(frac)}
          fill="none"
          className="stroke-[#22212B]/10 dark:stroke-white/10"
          strokeWidth="1"
        />
      ))}

      {/* Garis sumbu dari tengah ke tiap sudut */}
      {STAT_META.map((_, i) => {
        const angle = angleFor(i)
        return (
          <line
            key={i}
            x1={CENTER} y1={CENTER}
            x2={CENTER + RADIUS * Math.cos(angle)}
            y2={CENTER + RADIUS * Math.sin(angle)}
            className="stroke-[#22212B]/10 dark:stroke-white/10"
            strokeWidth="1"
          />
        )
      })}

      {/* Bentuk stat Pokémon */}
      <polygon points={polygonPoints} fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />
      ))}

      {/* Label tiap sumbu */}
      {STAT_META.map((s, i) => {
        const angle = angleFor(i)
        const lx = CENTER + (RADIUS + 14) * Math.cos(angle)
        const ly = CENTER + (RADIUS + 14) * Math.sin(angle)
        return (
          <text
            key={s.key}
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="700"
            className="fill-[#4A4858] dark:fill-[#a8a6b8]"
          >
            {s.label}
          </text>
        )
      })}
    </svg>
  )
}