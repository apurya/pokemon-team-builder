import { GENERATIONS } from '../generations.js'
import { TYPE_COLORS } from '../typeColors.js'

const ALL_TYPES = [
  "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison",
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
  "Steel", "Fairy",
]

const SORT_OPTIONS = [
  { value: 'none', label: 'Urutan Default' },
  { value: 'total', label: 'Total Stat' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Attack' },
  { value: 'defense', label: 'Defense' },
  { value: 'spAtk', label: 'Sp. Atk' },
  { value: 'spDef', label: 'Sp. Def' },
  { value: 'speed', label: 'Speed' },
]

export default function SearchBar({
  searchTerm, onSearchChange = () => {},
  activeType, onTypeChange = () => {},
  activeGeneration, onGenerationChange = () => {},
  secondType = 'All', onSecondTypeChange = () => {},
  sortBy = 'none', onSortChange = () => {},
  abilityFilter = '', onAbilityFilterChange = () => {},
  hideUsed = false, onToggleHideUsed = () => {},
}) {

  const chips = ["All", ...ALL_TYPES]
  const inputBase = "border-[3px] border-[#22212B] bg-white text-[#22212B] placeholder:text-[#4A4858] focus:outline-none focus:shadow-[3px_3px_0_0_#D6293E] transition-shadow"

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
            🔍
          </span>
          <input
            type="text"
            id="pokemon-search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama atau nomor Pokédex… ( / )"
            className={`w-full pl-9 pr-3 py-2.5 font-bold text-sm ${inputBase}`}
          />
        </div>
        <select
          value={activeGeneration}
          onChange={(e) => {
            const v = e.target.value
            onGenerationChange(v === 'all' ? 'all' : Number(v))
          }}
          className={`px-2 py-2.5 text-xs font-black uppercase ${inputBase}`}
        >
          {GENERATIONS.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <select
          value={secondType}
          onChange={(e) => onSecondTypeChange(e.target.value)}
          title="Filter tipe kedua (AND)"
          className={`px-2 py-1.5 text-[10px] font-black uppercase ${inputBase}`}
        >
          <option value="All">+ Tipe kedua…</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>AND {t}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          title="Urutkan berdasarkan stat"
          className={`px-2 py-1.5 text-[10px] font-black uppercase ${inputBase}`}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>↓ {s.label}</option>
          ))}
        </select>

        <input
          type="text"
          value={abilityFilter}
          onChange={(e) => onAbilityFilterChange(e.target.value)}
          placeholder="Filter ability…"
          className={`flex-1 min-w-[110px] px-2.5 py-1.5 text-[10px] font-bold ${inputBase}`}
        />
      </div>

      <button
        onClick={() => onToggleHideUsed(!hideUsed)}
        title="Sembunyikan Pokémon yang sudah pernah dipakai di tim manapun"
        className={`px-2.5 py-1.5 border-[3px] border-[#22212B] text-[10px] font-black uppercase transition-all mb-3 ${
          hideUsed
            ? 'bg-[#22212B] text-white shadow-[3px_3px_0_0_#FFD666]'
            : 'bg-white text-[#22212B] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#22212B]'
        }`}
      >
        🆕 Belum Dipakai
      </button>

      <div className="flex flex-wrap gap-1.5">
        {chips.map((type) => {
          const isActive = activeType === type
          const color = TYPE_COLORS[type]
          return (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              style={isActive && color ? { background: color, boxShadow: `3px 3px 0 0 #22212B` } : undefined}
              className={`text-[10px] font-black uppercase px-2.5 py-1 border-[3px] border-[#22212B] transition-all hover:-translate-y-0.5 ${
                isActive
                  ? 'text-white' + (color ? '' : ' bg-[#22212B]')
                  : 'bg-white text-[#22212B] hover:shadow-[2px_2px_0_0_#22212B]'
              }`}
            >
              {type}
            </button>
          )
        })}
      </div>
    </div>
  )
}