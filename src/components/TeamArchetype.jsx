export default function TeamArchetype({ team }) {
  const members = team.filter(Boolean)
  if (members.length === 0) return null

  const avg = (key) => members.reduce((sum, p) => sum + (p.stats?.[key] ?? 0), 0) / members.length

  const avgSpeed = avg('speed')
  const avgAttack = Math.max(avg('attack'), avg('spAtk'))
  const avgDefense = (avg('defense') + avg('spDef')) / 2
  const avgHp = avg('hp')

  let archetype = 'Balanced'
  let description = 'Tim ini punya campuran menyerang dan bertahan yang cukup merata.'

  if (avgSpeed >= 95 && avgAttack >= avgDefense) {
    archetype = 'Offensive Sweep'
    description = 'Tim ini cenderung cepat dan mengandalkan tekanan serangan tinggi untuk menang lebih dulu.'
  } else if (avgDefense >= avgAttack + 10 && avgHp >= 80 && avgSpeed < 90) {
    archetype = 'Stall'
    description = 'Tim ini punya daya tahan tinggi, cenderung bermain sabar dan mengandalkan kelelahan lawan.'
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-3 dark:text-white">GAYA BERMAIN TIM</h2>
      <div className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-4 bg-white/70 dark:bg-[#2c2b38]/70">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#22212B] text-white">{archetype}</span>
        </div>
        <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">{description}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[9px] text-[#4A4858] dark:text-[#a8a6b8]">Avg Speed</div>
            <div className="text-sm font-bold dark:text-white">{avgSpeed.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-[9px] text-[#4A4858] dark:text-[#a8a6b8]">Avg Attack</div>
            <div className="text-sm font-bold dark:text-white">{avgAttack.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-[9px] text-[#4A4858] dark:text-[#a8a6b8]">Avg Defense</div>
            <div className="text-sm font-bold dark:text-white">{avgDefense.toFixed(0)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}