const ROLE_INFO = {
  Sweeper: { color: '#D6293E', desc: 'Speed & attack tinggi — masuk buat langsung menekan lawan.' },
  Wall: { color: '#3B82F6', desc: 'Bulk sangat tinggi, attack rendah — bertahan lama, bukan penyerang.' },
  Tank: { color: '#7ED47E', desc: 'Bulk & attack sama-sama solid — bisa menyerang sambil tetap tahan pukulan.' },
  Attacker: { color: '#FFA500', desc: 'Attack/Sp. Atk sangat tinggi tapi tidak terlalu bulky atau cepat.' },
  Support: { color: '#8894a8', desc: 'Stat cukup merata — biasanya cocok untuk peran utility/status di tim nyata.' },
}

function classifyRole(p) {
  const s = p.stats
  const atk = Math.max(s.attack, s.spAtk)
  const bulk = (s.defense + s.spDef + s.hp) / 3
  const speed = s.speed

  if (speed >= 100 && atk >= 100) return 'Sweeper'
  if (bulk >= 100 && atk < 80) return 'Wall'
  if (bulk >= 85 && atk >= 85) return 'Tank'
  if (atk >= 110) return 'Attacker'
  return 'Support'
}

export default function TeamRoles({ team }) {
  const members = team.filter((p) => p && p.stats)
  if (members.length === 0) return null

  const classified = members.map((p) => ({ pokemon: p, role: classifyRole(p) }))

  const counts = {}
  classified.forEach(({ role }) => { counts[role] = (counts[role] || 0) + 1 })

  const warnings = []
  if ((counts.Sweeper || 0) >= Math.ceil(members.length * 0.7) && members.length >= 3) {
    warnings.push('Tim ini didominasi Sweeper — rentan kalau kena serangan balik lebih dulu, karena minim yang bisa menahan.')
  }
  if (!counts.Wall && !counts.Tank && members.length >= 4) {
    warnings.push('Tidak ada anggota bertipe Wall/Tank — tim ini mungkin kesulitan menahan serangan lawan yang kuat.')
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">PERAN TIAP ANGGOTA TIM</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Klasifikasi kasar berdasarkan base stat: Sweeper, Wall, Tank, Attacker, atau Support.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {classified.map(({ pokemon, role }) => (
          <div key={pokemon.id} className="border-2 border-[#22212B]/20 dark:border-white/20 rounded-lg p-2 text-center">
            <img src={pokemon.sprite} alt={pokemon.name} className="w-9 h-9 mx-auto [image-rendering:pixelated]" />
            <div className="text-[10px] font-bold mt-1 truncate dark:text-white">{pokemon.name}</div>
            <span
              className="inline-block mt-1 text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
              style={{ background: ROLE_INFO[role].color }}
              title={ROLE_INFO[role].desc}
            >
              {role}
            </span>
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <p key={i} className="text-[10px] text-[#9E1C2C] dark:text-[#ff8a8a]">⚠ {w}</p>
          ))}
        </div>
      )}
    </div>
  )
}