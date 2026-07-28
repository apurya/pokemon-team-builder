import { TYPE_COLORS } from '../typeColors.js'

const STAT_META = [
  { key: 'hp', label: 'HP' },
  { key: 'attack', label: 'ATK' },
  { key: 'defense', label: 'DEF' },
  { key: 'spAtk', label: 'SP.A' },
  { key: 'spDef', label: 'SP.D' },
  { key: 'speed', label: 'SPD' },
]

export default function TeamCompareTable({ team, onClose }) {
  const members = team.filter(Boolean)
  if (members.length < 2) return null

  const totals = members.map((p) => Object.values(p.stats).reduce((a, b) => a + b, 0))

  return (
    <div className="mt-6 border-2 border-[#22212B] dark:border-[#3a3946] rounded-xl bg-white dark:bg-[#2c2b38] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold dark:text-white">📊 PERBANDINGAN TIM ({members.length})</h2>
        <button
          onClick={onClose}
          className="text-[10px] font-semibold px-2.5 py-1 rounded-full border-2 border-[#22212B] dark:border-white bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white hover:opacity-80 transition-colors"
        >
          ✕ Tutup
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse min-w-[420px]">
          <thead>
            <tr>
              <th className="text-left p-1.5 font-semibold text-[#4A4858] dark:text-[#a8a6b8]">Stat</th>
              {members.map((p) => (
                <th key={p.id} className="p-1.5 text-center">
                  <div className="flex flex-col items-center">
                    <img src={p.sprite} alt={p.name} className="w-8 h-8 [image-rendering:pixelated]" />
                    <span className="font-bold dark:text-white truncate max-w-[64px]">{p.name}</span>
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {p.types.map((t) => (
                        <span
                          key={t}
                          className="text-[6px] font-bold text-white px-1 rounded"
                          style={{ background: TYPE_COLORS[t] }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STAT_META.map((s) => {
              const values = members.map((p) => p.stats[s.key])
              const max = Math.max(...values)
              return (
                <tr key={s.key} className="border-t border-[#22212B]/10 dark:border-white/10">
                  <td className="p-1.5 font-semibold text-[#4A4858] dark:text-[#a8a6b8]">{s.label}</td>
                  {values.map((v, i) => (
                    <td
                      key={members[i].id}
                      className={`p-1.5 text-center ${
                        v === max ? 'font-bold text-[#22212B] dark:text-white' : 'text-[#4A4858] dark:text-[#a8a6b8]'
                      }`}
                    >
                      {v}
                    </td>
                  ))}
                </tr>
              )
            })}
            <tr className="border-t-2 border-[#22212B]/20 dark:border-white/20">
              <td className="p-1.5 font-bold dark:text-white">TOTAL</td>
              {totals.map((t, i) => {
                const max = Math.max(...totals)
                return (
                  <td
                    key={members[i].id}
                    className={`p-1.5 text-center font-bold ${
                      t === max ? 'text-[#22212B] dark:text-white' : 'text-[#4A4858] dark:text-[#a8a6b8]'
                    }`}
                  >
                    {t}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}