export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function fetchPokemonDetail(id) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  if (!res.ok) {
    throw new Error(`Gagal fetch Pokémon #${id}: ${res.status}`)
  }
  const data = await res.json()
  return {
    id: data.id,
    name: capitalize(data.name),
    sprite: data.sprites.front_default,
    spriteShiny: data.sprites.front_shiny,
    cry: data.cries?.latest || data.cries?.legacy || null,
    types: data.types.map((t) => capitalize(t.type.name)),
    abilities: data.abilities.map((a) => ({
      name: capitalize(a.ability.name.replace(/-/g, ' ')),
      urlName: a.ability.name,
      isHidden: a.is_hidden,
    })),
    stats: {
      hp: data.stats.find((s) => s.stat.name === 'hp').base_stat,
      attack: data.stats.find((s) => s.stat.name === 'attack').base_stat,
      defense: data.stats.find((s) => s.stat.name === 'defense').base_stat,
      spAtk: data.stats.find((s) => s.stat.name === 'special-attack').base_stat,
      spDef: data.stats.find((s) => s.stat.name === 'special-defense').base_stat,
      speed: data.stats.find((s) => s.stat.name === 'speed').base_stat,
    },
  }
}

export function playCry(url) {
  if (!url) return
  const audio = new Audio(url)
  audio.volume = 0.6
  audio.play().catch(() => {})
}