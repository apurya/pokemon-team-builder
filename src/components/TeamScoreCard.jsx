import { useTeamMoves } from '../hooks/useTeamMoves.js'
import { ALL_TYPES, getTeamTypeCounts, getOffensiveCoverage } from '../typeChart.js'

const MAX_SPEED_REF = 150

function gradeFor(score) {
  if (score >= 85) return { grade: 'S', color: '#FFD666' }
  if (score >= 70) return { grade: 'A', color: '#7ED47E' }
  if (score >= 55) return { grade: 'B', color: '#3B82F6' }
  if (score >= 40) return { grade: 'C', color: '#FFA500' }
  return { grade: 'D', color: '#D6293E' }
}

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-[#4A4858] dark:text-[#a8a6b8]">{label}</span>
        <span className="font-bold dark:text-white">{value.toFixed(0)}/100</span>
      </div>
      <div className="h-2 rounded bg-[#22212B]/10 dark:bg-white/10 overflow-hidden">
        <div className="h-full rounded bg-[#D6293E]" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  )
}

export default function TeamScoreCard({ team }) {
  const members = team.filter(Boolean)
  const membersWithStats = members.filter((p) => p.stats)
  const movesByMember = useTeamMoves(members)

  if (members.length === 0) return null

  const anyLoading = members.some((p) => !movesByMember[p.id] || movesByMember[p.id].loading)

  // --- Skor defensif: seberapa banyak tipe yang jadi kelebihan (resist/immune) vs kelemahan (weak) ---
  const { weakCount, resistCount, immuneCount } = getTeamTypeCounts(members)
  const netAdvantageTypes = ALL_TYPES.filter((t) => (resistCount[t] + immuneCount[t]) > weakCount[t]).length
  const defensiveScore = (netAdvantageTypes / ALL_TYPES.length) * 100

  // --- Skor ofensif: seberapa banyak tipe lawan yang bisa dipukul >=2x oleh moveset tim ---
  const { bestMultiplier } = getOffensiveCoverage(members, movesByMember)
  const coveredTypes = ALL_TYPES.filter((t) => bestMultiplier[t] >= 2).length
  const offensiveScore = (coveredTypes / ALL_TYPES.length) * 100

  // --- Skor speed: rata-rata base Speed tim relatif ke referensi kasar 150 ---
  const avgSpeed = membersWithStats.length > 0
    ? membersWithStats.reduce((sum, p) => sum + p.stats.speed, 0) / membersWithStats.length
    : 0
  const speedScore = Math.min(100, (avgSpeed / MAX_SPEED_REF) * 100)

  const totalScore = (defensiveScore + offensiveScore + speedScore) / 3
  const { grade, color } = gradeFor(totalScore)

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">TEAM SCORE CARD</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Ringkasan skor tim dari 3 aspek: pertahanan tipe, cakupan serangan, dan kecepatan rata-rata.
      </p>

      {anyLoading ? (
        <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-4 bg-white/70 dark:bg-[#2c2b38]/70 text-center text-xs text-[#4A4858] dark:text-[#a8a6b8] animate-pulse">
          Menghitung skor ofensif dari movepool tim… (butuh data gerakan dari PokeAPI)
        </div>
      ) : (
        <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-4 bg-white/70 dark:bg-[#2c2b38]/70">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-full border-4 border-[#22212B] flex items-center justify-center text-xl font-bold text-[#22212B]"
              style={{ background: color }}
            >
              {grade}
            </div>
            <div>
              <div className="text-sm font-bold dark:text-white">Skor Total: {totalScore.toFixed(0)}/100</div>
              <div className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">Berdasarkan {members.length} anggota tim</div>
            </div>
          </div>
          <div className="space-y-2">
            <ScoreBar label="Pertahanan Tipe" value={defensiveScore} />
            <ScoreBar label="Cakupan Serangan" value={offensiveScore} />
            <ScoreBar label="Kecepatan Rata-rata" value={speedScore} />
          </div>
        </div>
      )}
    </div>
  )
}