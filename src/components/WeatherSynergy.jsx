const WEATHERS = [
  {
    id: 'rain', label: 'Hujan (Rain)', boostType: 'Water', hurtType: 'Fire',
    setterAbilities: ['drizzle'], boostAbilities: ['swift-swim'],
  },
  {
    id: 'sun', label: 'Terik (Sun)', boostType: 'Fire', hurtType: 'Water',
    setterAbilities: ['drought'], boostAbilities: ['chlorophyll'],
  },
  {
    id: 'sand', label: 'Badai Pasir (Sand)', boostType: null, hurtType: null,
    setterAbilities: ['sand-stream'], boostAbilities: ['sand-rush', 'sand-force', 'sand-veil'],
    bulkTypes: ['Rock', 'Ground', 'Steel'],
  },
  {
    id: 'snow', label: 'Salju (Snow)', boostType: null, hurtType: null,
    setterAbilities: ['snow-warning'], boostAbilities: ['slush-rush', 'ice-body', 'snow-cloak'],
    bulkTypes: ['Ice'],
  },
]

export default function WeatherSynergy({ team }) {
  const members = team.filter(Boolean)
  if (members.length === 0) return null

  const analysis = WEATHERS.map((w) => {
    const setters = members.filter((p) => (p.abilities || []).some((a) => w.setterAbilities.includes(a.urlName)))
    const boosted = members.filter((p) => (p.abilities || []).some((a) => w.boostAbilities.includes(a.urlName)))
    const typeBenefit = members.filter((p) =>
      (w.boostType && p.types.includes(w.boostType)) || (w.bulkTypes && p.types.some((t) => w.bulkTypes.includes(t)))
    )
    const typeHurt = w.hurtType ? members.filter((p) => p.types.includes(w.hurtType)) : []

    const relevantCount = new Set([...setters, ...boosted, ...typeBenefit].map((p) => p.id)).size

    return { ...w, setters, boosted, typeBenefit, typeHurt, relevantCount }
  }).sort((a, b) => b.relevantCount - a.relevantCount)

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">SINERGI CUACA / TERRAIN</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Cek apakah tim ini punya sinergi alami dengan salah satu kondisi cuaca, berdasarkan tipe dan ability anggota.
      </p>

      <div className="space-y-2">
        {analysis.map((w) => (
          <div key={w.id} className="border-2 border-[#22212B]/20 dark:border-white/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold dark:text-white">{w.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                w.relevantCount === 0
                  ? 'bg-[#22212B]/10 dark:bg-white/10 text-[#4A4858] dark:text-[#a8a6b8]'
                  : 'bg-[#7ED47E]/30 text-[#1f6b1f] dark:text-[#7ED47E]'
              }`}>
                {w.relevantCount} anggota relevan
              </span>
            </div>
            {w.setters.length > 0 && (
              <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">
                🌤 Bisa munculkan otomatis: {w.setters.map((p) => p.name).join(', ')}
              </p>
            )}
            {w.boosted.length > 0 && (
              <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">
                ⚡ Ability diuntungkan cuaca ini: {w.boosted.map((p) => p.name).join(', ')}
              </p>
            )}
            {w.typeBenefit.length > 0 && (
              <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">
                🛡 Tipe diuntungkan: {w.typeBenefit.map((p) => p.name).join(', ')}
              </p>
            )}
            {w.typeHurt.length > 0 && (
              <p className="text-[10px] text-[#9E1C2C] dark:text-[#ff8a8a]">
                ⚠ Tipe dirugikan: {w.typeHurt.map((p) => p.name).join(', ')}
              </p>
            )}
            {w.relevantCount === 0 && (
              <p className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8]">Tidak ada sinergi khusus dengan kondisi ini.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}