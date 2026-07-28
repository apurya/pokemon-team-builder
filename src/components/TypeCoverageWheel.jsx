import { ALL_TYPES } from '../typeChart.js'
import { TYPE_COLORS } from '../typeColors.js'

const GAP_DEG = 3
const SECTOR_DEG = 360 / ALL_TYPES.length
const CENTER = 160
const INNER_R = 46
const RESIST_RING_W = 14
const WEAK_OUTER_R = 150

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// Bikin path "irisan donat" (annular sector) dari innerR ke outerR, antara dua sudut
function donutSectorPath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const startInner = polarToCartesian(cx, cy, innerR, endAngle)
  const endInner = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return [
    'M', startOuter.x, startOuter.y,
    'A', outerR, outerR, 0, largeArc, 1, endOuter.x, endOuter.y,
    'L', startInner.x, startInner.y,
    'A', innerR, innerR, 0, largeArc, 0, endInner.x, endInner.y,
    'Z',
  ].join(' ')
}

export default function TypeCoverageWheel({ weakCount, resistCount, immuneCount, memberCount }) {
  if (memberCount === 0) return null

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 320 320" className="w-full max-w-[320px]">
        {/* Ring dasar (tanpa kelemahan / resistensi) biar tetap kelihatan bentuk lingkaran penuh */}
        {ALL_TYPES.map((t, i) => {
          const startAngle = i * SECTOR_DEG + GAP_DEG / 2
          const endAngle = startAngle + (SECTOR_DEG - GAP_DEG)
          return (
            <path
              key={`base-${t}`}
              d={donutSectorPath(CENTER, CENTER, INNER_R, WEAK_OUTER_R, startAngle, endAngle)}
              className="fill-[#22212B]/5 dark:fill-white/5"
            />
          )
        })}

        {/* Petal luar: makin panjang & makin gelap = makin banyak anggota tim yang lemah ke tipe ini */}
        {ALL_TYPES.map((t, i) => {
          const startAngle = i * SECTOR_DEG + GAP_DEG / 2
          const endAngle = startAngle + (SECTOR_DEG - GAP_DEG)
          const ratio = weakCount[t] / memberCount
          if (ratio === 0) return null
          const outerR = INNER_R + (WEAK_OUTER_R - INNER_R) * ratio
          return (
            <path
              key={`weak-${t}`}
              d={donutSectorPath(CENTER, CENTER, INNER_R, outerR, startAngle, endAngle)}
              fill="#D6293E"
              opacity={0.35 + ratio * 0.65}
            />
          )
        })}

        {/* Ring dalam hijau: makin panjang = makin banyak anggota tim yang tahan/kebal ke tipe ini */}
        {ALL_TYPES.map((t, i) => {
          const startAngle = i * SECTOR_DEG + GAP_DEG / 2
          const endAngle = startAngle + (SECTOR_DEG - GAP_DEG)
          const ratio = (resistCount[t] + immuneCount[t]) / memberCount
          if (ratio === 0) return null
          const outerR = INNER_R - 2
          const innerR = outerR - RESIST_RING_W * ratio
          return (
            <path
              key={`resist-${t}`}
              d={donutSectorPath(CENTER, CENTER, innerR, outerR, startAngle, endAngle)}
              fill="#4a9e4a"
              opacity={0.5 + ratio * 0.5}
            />
          )
        })}

        {/* Chip warna tipe + label singkat di luar wheel */}
        {ALL_TYPES.map((t, i) => {
          const midAngle = i * SECTOR_DEG + SECTOR_DEG / 2
          const pos = polarToCartesian(CENTER, CENTER, WEAK_OUTER_R + 18, midAngle)
          return (
            <g key={`label-${t}`}>
              <circle cx={pos.x} cy={pos.y} r="3" fill={TYPE_COLORS[t]} />
              <text
                x={pos.x}
                y={pos.y + 11}
                textAnchor="middle"
                className="fill-[#22212B] dark:fill-white"
                style={{ fontSize: '7.5px', fontWeight: 600 }}
              >
                {t.slice(0, 4)}
              </text>
            </g>
          )
        })}

        <circle cx={CENTER} cy={CENTER} r={INNER_R - 4} className="fill-white dark:fill-[#2c2b38] stroke-[#22212B] dark:stroke-[#3a3946]" strokeWidth="2" />
        <text x={CENTER} y={CENTER - 4} textAnchor="middle" className="fill-[#22212B] dark:fill-white" style={{ fontSize: '10px', fontWeight: 700 }}>
          {memberCount}
        </text>
        <text x={CENTER} y={CENTER + 10} textAnchor="middle" className="fill-[#4A4858] dark:fill-[#a8a6b8]" style={{ fontSize: '8px' }}>
          anggota
        </text>
      </svg>

      <div className="flex flex-wrap justify-center gap-3 text-[10px] text-[#4A4858] dark:text-[#a8a6b8] mt-2">
        <span className="flex items-center gap-1">
          <i className="w-3 h-3 rounded-full bg-[#D6293E] inline-block" /> Petal luar = kelemahan (makin panjang/gelap makin rawan)
        </span>
        <span className="flex items-center gap-1">
          <i className="w-3 h-3 rounded-full bg-[#4a9e4a] inline-block" /> Ring dalam = resistensi/kebal
        </span>
      </div>
    </div>
  )
}