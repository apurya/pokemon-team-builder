import { multiplierAgainst, ALL_TYPES } from '../typeChart.js'

const BADGES = [
  {
    id: 'monotype',
    label: 'Monotype Master',
    icon: '🎯',
    check: (members) => members.length >= 2 &&
    members.every((p) => p.types.length === 1) &&
    members.every((p) => p.types[0] === members[0].types[0]),  },
  {
    id: 'perfect-balance',
    label: 'Perfect Balance',
    icon: '🛡',
    check: (members) => members.length >= 3 && !ALL_TYPES.some((atk) =>
      members.some((p) => multiplierAgainst(atk, p.types) === 4)
    ),
  },
  {
    id: 'speed-demon',
    label: 'Speed Demon',
    icon: '⚡',
    check: (members) => members.length >= 1 &&
      members.reduce((sum, p) => sum + (p.stats?.speed ?? 0), 0) / members.length > 100,
  },
  {
    id: 'tank-squad',
    label: 'Tank Squad',
    icon: '🧱',
    check: (members) => members.length >= 1 &&
      members.reduce((sum, p) => sum + (p.stats?.hp ?? 0), 0) / members.length > 90,
  },
  {
    id: 'full-house',
    label: 'Full House',
    icon: '⭐',
    check: (members) => members.length === 6,
  },
]

export default function Achievements({ team }) {
  const members = team.filter(Boolean)
  if (members.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-3 dark:text-white">PENCAPAIAN TIM</h2>
      <div className="flex flex-wrap gap-2">
        {BADGES.map((badge) => {
          const unlocked = badge.check(members)
          return (
            <div
              key={badge.id}
              title={unlocked ? 'Terbuka!' : 'Belum terbuka'}
              className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full border-2 border-[#22212B] transition-opacity ${
                unlocked
                  ? 'bg-[#FFD666] text-[#22212B]'
                  : 'bg-white/40 dark:bg-[#2c2b38]/40 text-[#22212B]/40 dark:text-white/30 opacity-60'
              }`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}