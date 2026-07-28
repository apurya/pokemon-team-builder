import { useTeamMoves } from '../hooks/useTeamMoves.js'
import { ALL_TYPES, getOffensiveCoverage } from '../typeChart.js'
import { TYPE_COLORS } from '../typeColors.js'

export default function OffensiveCoverage({ team }) {
  const members = team.filter(Boolean)
  const movesByMember = useTeamMoves(members)

  if (members.length === 0) return null

  const anyLoading = members.some((p) => !movesByMember[p.id] || movesByMember[p.id].loading)

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">CAKUPAN OFENSIF</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Berdasarkan movepool level-up asli tiap Pokémon — tipe lawan apa saja yang bisa dipukul efektif, dan mana yang belum tercover.
      </p>

      {anyLoading ? (
        <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-4 bg-white/70 dark:bg-[#2c2b38]/70 text-center text-xs text-[#4A4858] dark:text-[#a8a6b8] animate-pulse">
          Memuat data gerakan tiap Pokémon… (bisa makan waktu beberapa detik, banyak data yang diambil dari PokeAPI)
        </div>
      ) : (
        <CoverageResult members={members} movesByMember={movesByMember} />
      )}
    </div>
  )
}

function CoverageResult({ members, movesByMember }) {
  const { bestMultiplier, coveredBy } = getOffensiveCoverage(members, movesByMember)

  const covered = ALL_TYPES.filter((t) => bestMultiplier[t] >= 2)
    .sort((a, b) => coveredBy[b].length - coveredBy[a].length)
  const blindSpots = ALL_TYPES.filter((t) => bestMultiplier[t] < 2)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-3 bg-white/70 dark:bg-[#2c2b38]/70">
        <h3 className="text-xs font-bold mb-2 dark:text-white">⚔ Tercover</h3>
        {covered.length === 0 ? (
          <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8]">Belum ada tipe yang tercover efektif.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {covered.map((t) => (
              <span
                key={t}
                className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded"
                style={{ background: TYPE_COLORS[t] }}
                title={coveredBy[t].map((c) => `${c.member.name} (${c.atkType} x${c.multiplier})`).join(', ')}
              >
                {t} ×2
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-3 bg-white/70 dark:bg-[#2c2b38]/70">
        <h3 className="text-xs font-bold mb-2 dark:text-white">🕳 Blind Spot</h3>
        {blindSpots.length === 0 ? (
          <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8]">Tim ini bisa menyerang efektif ke semua tipe! 🎉</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {blindSpots.map((t) => (
              <span
                key={t}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded border-2 dark:bg-[#1c1b24]"
                style={{ borderColor: TYPE_COLORS[t], color: TYPE_COLORS[t] }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}