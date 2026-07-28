function suggestItem(p) {
  const s = p.stats
  const atk = Math.max(s.attack, s.spAtk)
  const bulk = (s.defense + s.spDef + s.hp) / 3

  if (bulk >= 100) {
    return { item: 'Leftovers', reason: 'Bulk tinggi — cocok buat recovery pasif tiap turun HP.' }
  }
  if (s.speed >= 100 && atk >= 100) {
    return { item: 'Choice Scarf / Life Orb', reason: 'Speed dan attack sama-sama tinggi — cocok jadi sweeper cepat.' }
  }
  if (atk >= 110 && s.hp < 75) {
    return { item: 'Life Orb', reason: 'Attack sangat tinggi tapi HP pas-pasan — damage boost sepadan dengan recoil-nya.' }
  }
  if (atk >= 100) {
    return { item: 'Choice Band / Choice Specs', reason: 'Attack tinggi dan konsisten — cocok all-in ke damage maksimal.' }
  }
  if (s.hp < 70 && bulk < 70) {
    return { item: 'Focus Sash', reason: 'HP dan bulk rendah — Focus Sash jaga dari one-shot selama HP masih penuh.' }
  }
  return { item: 'Leftovers', reason: 'Pilihan aman default untuk sustain jangka panjang.' }
}

export default function HeldItemSuggestions({ team }) {
  const members = team.filter((p) => p && p.stats)
  if (members.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">SARAN HELD ITEM</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Rekomendasi kasar berdasarkan base stat — bukan pengganti analisis moveset/EV lengkap.
      </p>

      <div className="space-y-2">
        {members.map((p) => {
          const { item, reason } = suggestItem(p)
          return (
            <div key={p.id} className="flex items-center gap-3 border-2 border-[#22212B]/20 dark:border-white/20 rounded-lg p-2">
              <img src={p.sprite} alt={p.name} className="w-9 h-9 [image-rendering:pixelated]" />
              <div className="min-w-0">
                <div className="text-xs font-bold dark:text-white">{p.name}</div>
                <div className="text-[10px] font-semibold text-[#9E1C2C] dark:text-[#ff8a8a]">{item}</div>
                <div className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">{reason}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}