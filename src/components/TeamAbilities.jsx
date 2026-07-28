import { useAbilityDescriptions } from '../hooks/useAbilityDescriptions.js'

export default function TeamAbilities({ team }) {
  const members = team.filter(Boolean)
  const { entries, loadAbility } = useAbilityDescriptions()

  const membersWithAbilities = members.filter((p) => p.abilities?.length)
  if (membersWithAbilities.length === 0) return null

  return (
    <div className="mt-6">
      <h2 className="text-sm font-bold mb-1 dark:text-white">ABILITY TIM</h2>
      <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-3">
        Klik salah satu ability untuk lihat deskripsinya (teks asli dari PokeAPI, berbahasa Inggris).
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {membersWithAbilities.map((p) => (
          <div key={p.id} className="border-2 border-[#22212B] dark:border-[#3a3946] rounded-lg p-3 bg-white/70 dark:bg-[#2c2b38]/70">
            <div className="flex items-center gap-2 mb-2">
              <img src={p.sprite} alt={p.name} className="w-7 h-7 [image-rendering:pixelated]" />
              <span className="text-xs font-bold dark:text-white">{p.name}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {p.abilities.map((a) => (
                <button
                  key={a.urlName}
                  onClick={() => loadAbility(a.urlName)}
                  className="text-[10px] font-semibold px-2 py-1 rounded-full border-2 border-[#22212B] bg-white hover:bg-[#22212B] hover:text-white transition-colors"
                  title={a.isHidden ? 'Hidden Ability' : undefined}
                >
                  {a.name}{a.isHidden ? ' (H)' : ''}
                </button>
              ))}
            </div>
            {p.abilities.map((a) => {
              const entry = entries[a.urlName]
              if (!entry) return null
              return (
                <p key={a.urlName} className="text-[10px] text-[#4A4858] dark:text-[#a8a6b8] mt-2">
                  <span className="font-semibold dark:text-white">{a.name}:</span>{' '}
                  {entry.loading ? 'Memuat…' : entry.error ? 'Gagal memuat deskripsi.' : entry.shortEffect}
                </p>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}