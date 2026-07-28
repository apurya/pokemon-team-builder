export const GENERATIONS = [
  { id: 'all', label: 'Semua Generasi' },
  { id: 1, label: 'Gen 1 · Kanto' },
  { id: 2, label: 'Gen 2 · Johto' },
  { id: 3, label: 'Gen 3 · Hoenn' },
  { id: 4, label: 'Gen 4 · Sinnoh' },
  { id: 5, label: 'Gen 5 · Unova' },
  { id: 6, label: 'Gen 6 · Kalos' },
  { id: 7, label: 'Gen 7 · Alola' },
  { id: 8, label: 'Gen 8 · Galar' },
  { id: 9, label: 'Gen 9 · Paldea' },
]

export const GENERATION_DEX_RANGES = [
  { gen: 1, max: 151 },
  { gen: 2, max: 251 },
  { gen: 3, max: 386 },
  { gen: 4, max: 493 },
  { gen: 5, max: 649 },
  { gen: 6, max: 721 },
  { gen: 7, max: 809 },
  { gen: 8, max: 905 },
  { gen: 9, max: 1025 },
]

export function getIntroducedGeneration(id) {
  const found = GENERATION_DEX_RANGES.find((r) => id <= r.max)
  return found ? found.gen : GENERATION_DEX_RANGES[GENERATION_DEX_RANGES.length - 1].gen
}