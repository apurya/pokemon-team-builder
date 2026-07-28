import { useEffect, useState } from 'react'
import { fetchPokemonDetail } from '../pokemonApi.js'

const chainCache = new Map()
const detailCache = new Map()

function idFromUrl(url) {
  const parts = url.split('/').filter(Boolean)
  return Number(parts[parts.length - 1])
}

async function getDetail(id) {
  if (detailCache.has(id)) return detailCache.get(id)
  const detail = await fetchPokemonDetail(id)
  detailCache.set(id, detail)
  return detail
}

function parseChainNode(node) {
  return {
    id: idFromUrl(node.species.url),
    name: node.species.name,
    evolvesTo: node.evolves_to.map(parseChainNode),
  }
}

function findPath(node, targetId, ancestors = []) {
  if (node.id === targetId) {
    return { ancestors, current: node, nextOptions: node.evolvesTo }
  }
  for (const child of node.evolvesTo) {
    const result = findPath(child, targetId, [...ancestors, node])
    if (result) return result
  }
  return null
}

async function fetchChainForPokemon(pokemonId) {
  if (chainCache.has(pokemonId)) return chainCache.get(pokemonId)
  const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`)
  const species = await speciesRes.json()
  const chainRes = await fetch(species.evolution_chain.url)
  const chainData = await chainRes.json()
  const root = parseChainNode(chainData.chain)
  chainCache.set(pokemonId, root)
  return root
}

function Badge({ detail, isCurrent, clickable, onClick, isShiny }) {
  const src = detail ? (isShiny && detail.spriteShiny ? detail.spriteShiny : detail.sprite) : null

  return (
    <button
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      style={isCurrent ? { boxShadow: '4px 4px 0 0 #D6293E' } : {}}
      className={`flex flex-col items-center px-2.5 py-2 border-[3px] transition-all ${
        isCurrent
          ? 'border-[#22212B] bg-[#FFD666] -rotate-1'
          : clickable
            ? 'border-[#22212B]/30 bg-white dark:bg-[#2c2b38] hover:border-[#22212B] motion-safe:hover:-translate-y-1 hover:shadow-[3px_3px_0_0_#22212B] cursor-pointer'
            : 'border-[#22212B]/20 bg-white/60 dark:bg-[#2c2b38]/60 opacity-70'
      }`}
    >
      {src ? (
        <img src={src} alt={detail.name} className="w-11 h-11 [image-rendering:pixelated]" />
      ) : (
        <div className="w-11 h-11 border-2 border-[#22212B]/20 bg-[#22212B]/10 animate-pulse" />
      )}
      <span className="text-[9px] font-black uppercase mt-1 dark:text-white">{detail?.name ?? '...'}</span>
      {clickable && !isCurrent && (
        <span className="text-[8px] font-bold text-[#D6293E]">Evolusi →</span>
      )}
    </button>
  )
}

export default function EvolutionChain({ pokemon, onEvolve, onClose, isShiny = false }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [path, setPath] = useState(null)
  const [details, setDetails] = useState({})

  useEffect(() => {
    if (!pokemon) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setPath(null)

    fetchChainForPokemon(pokemon.id)
      .then(async (root) => {
        const found = findPath(root, pokemon.id)
        if (!found) throw new Error('not found')
        if (cancelled) return
        setPath(found)

        const allNodes = [...found.ancestors, found.current, ...found.nextOptions]
        const result = {}
        await Promise.all(allNodes.map(async (node) => {
          result[node.id] = await getDetail(node.id)
        }))
        if (!cancelled) setDetails(result)
      })
      .catch(() => { if (!cancelled) setError('Gagal memuat rantai evolusi.') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [pokemon?.id])

  if (!pokemon) return null

  return (
    <div className="mt-4 mb-6 border-[4px] border-[#22212B] dark:border-[#F4EEDD] bg-[#F4EEDD]/50 dark:bg-[#2c2b38] p-4" style={{ boxShadow: '6px 6px 0 0 #22212B' }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-black uppercase dark:text-white bg-[#FFD666] border-2 border-[#22212B] px-2 py-0.5">🧬 Rantai Evolusi — {pokemon.name}</h2>
        <button
          onClick={onClose}
          className="text-[10px] font-black uppercase px-2.5 py-1 border-[3px] border-[#22212B] dark:border-white bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white shadow-[2px_2px_0_0_#22212B] hover:-translate-y-0.5 transition-all"
        >
          ✕ Tutup
        </button>
      </div>

      {loading && <p className="text-xs font-bold text-[#4A4858] dark:text-[#a8a6b8]">Memuat rantai evolusi…</p>}
      {error && <p className="text-xs font-bold text-[#9E1C2C]">{error}</p>}

      {!loading && !error && path && (
        <div className="flex flex-wrap items-center gap-3">
          {path.ancestors.map((node) => (
            <div key={node.id} className="flex items-center gap-3">
              <Badge detail={details[node.id]} isCurrent={false} clickable={false} isShiny={isShiny} />
              <span className="text-[#22212B] dark:text-white font-black text-lg">→</span>
            </div>
          ))}

          <Badge detail={details[path.current.id]} isCurrent clickable={false} isShiny={isShiny} />

          {path.nextOptions.length > 0 && <span className="text-[#22212B] dark:text-white font-black text-lg">→</span>}

          {path.nextOptions.map((node) => (
            <Badge
              key={node.id}
              detail={details[node.id]}
              isCurrent={false}
              clickable={Boolean(details[node.id])}
              onClick={() => details[node.id] && onEvolve(details[node.id])}
              isShiny={isShiny}
            />
          ))}

          {path.ancestors.length === 0 && path.nextOptions.length === 0 && (
            <p className="text-xs font-bold text-[#4A4858] dark:text-[#a8a6b8]">Pokémon ini tidak berevolusi.</p>
          )}
        </div>
      )}
    </div>
  )
}