import { useSpeciesRarity } from '../hooks/useSpeciesRarity.js'

function badgeFor(rarity) {
  if (!rarity) return null
  if (rarity.isMythical) return { label: '✨ Mythical', color: '#F0C020' }
  if (rarity.isLegendary) return { label: '⭐ Legendary', color: '#A040A0' }
  if (rarity.isBaby) return { label: '🍼 Baby', color: '#F85888' }
  return null
}

export default function TeamRarityBadges({ team }) {
  const members = team.filter(Boolean)
  const rarityById = useSpeciesRarity(members)

  if (members.length === 0) return null

  const specialCount = members.filter((p) => {
    const r = rarityById[p.id]
    return r && (r.isLegendary || r.isMythical)
  }).length

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">STATUS KELANGKAAN</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        {specialCount > 0
          ? `Tim ini punya ${specialCount} Pokémon Legendary/Mythical.`
          : 'Tim ini semuanya Pokémon reguler — tidak ada Legendary/Mythical.'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {members.map((p) => {
          const rarity = rarityById[p.id]
          const badge = badgeFor(rarity)
          return (
            <div key={p.id} className="flex items-center gap-2 border-2 border-[#22212B]/20 dark:border-white/20 rounded-lg p-2">
              <img src={p.sprite} alt={p.name} className="w-8 h-8 [image-rendering:pixelated]" />
              <div className="min-w-0">
                <div className="text-[10px] font-bold truncate dark:text-white">{p.name}</div>
                {rarity === undefined && <div className="text-[9px] text-[#4A4858] dark:text-[#a8a6b8]">Memuat…</div>}
                {badge ? (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: badge.color }}>
                    {badge.label}
                  </span>
                ) : (
                  rarity !== undefined && <span className="text-[9px] text-[#4A4858] dark:text-[#a8a6b8]">Reguler</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}