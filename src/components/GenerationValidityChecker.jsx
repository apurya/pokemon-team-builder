import { useState } from 'react'
import { GENERATIONS, getIntroducedGeneration } from '../generations.js'

export default function GenerationValidityChecker({ team }) {
  const [targetGen, setTargetGen] = useState(9)
  const members = team.filter(Boolean)
  if (members.length === 0) return null

  const checked = members.map((p) => {
    const introducedGen = getIntroducedGeneration(p.id)
    return { pokemon: p, introducedGen, available: introducedGen <= targetGen }
  })

  const allAvailable = checked.every((c) => c.available)
  const unavailableCount = checked.filter((c) => !c.available).length

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h2 className="text-sm font-bold dark:text-white">CEK VALIDITAS LINTAS GENERASI</h2>
        <select
          value={targetGen}
          onChange={(e) => setTargetGen(Number(e.target.value))}
          className="text-[10px] font-semibold border-2 border-[#22212B] dark:border-white/40 dark:bg-[#2c2b38] dark:text-white rounded-full px-2 py-1"
        >
          {GENERATIONS.filter((g) => g.id !== 'all').map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Cek apakah semua anggota tim sudah "ada" di generasi yang dipilih — berguna kalau mau main game generasi tertentu.
        Perkiraan berdasarkan nomor National Dex, belum memperhitungkan form/versi regional secara detail.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {checked.map(({ pokemon, introducedGen, available }) => (
          <div
            key={pokemon.id}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 border-2 ${
              available ? 'border-[#7ED47E] bg-[#7ED47E]/10' : 'border-[#9E1C2C] bg-[#9E1C2C]/10'
            }`}
          >
            <img src={pokemon.sprite} alt={pokemon.name} className="w-6 h-6 [image-rendering:pixelated]" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold truncate dark:text-white">{pokemon.name}</div>
              <div className="text-[9px] text-[#4A4858] dark:text-[#a8a6b8]">Gen {introducedGen}</div>
            </div>
            <span className="ml-auto text-xs">{available ? '✅' : '❌'}</span>
          </div>
        ))}
      </div>
      <div
        className={`text-xs font-semibold rounded-lg px-3 py-2 text-center ${
          allAvailable
            ? 'bg-[#7ED47E]/20 text-[#1f6b1f] dark:text-[#7ED47E]'
            : 'bg-[#9E1C2C]/10 text-[#9E1C2C] dark:text-[#ff8a8a]'
        }`}
      >
        {allAvailable
          ? `Tim ini valid dimainkan di game ${GENERATIONS.find((g) => g.id === targetGen)?.label}. 🎉`
          : `${unavailableCount} anggota belum tersedia di generasi ini — belum diperkenalkan sampai generasi tersebut.`}
      </div>
    </div>
  )
}