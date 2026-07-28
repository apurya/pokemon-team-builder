import { useEffect, useRef, useState } from 'react'

const moveDetailCache = {} // moveName -> { name, type, power, damageClass }
const moveListCache = {}   // pokemonId -> array of level-up move names

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

async function fetchLevelUpMoveNames(pokemonId) {
  if (moveListCache[pokemonId]) return moveListCache[pokemonId]
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
  const data = await res.json()
  const names = data.moves
    .filter((m) => m.version_group_details.some((v) => v.move_learn_method.name === 'level-up'))
    .map((m) => m.move.name)
  moveListCache[pokemonId] = names
  return names
}

async function fetchMoveDetail(moveName) {
  if (moveDetailCache[moveName]) return moveDetailCache[moveName]
  const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`)
  const data = await res.json()
  const detail = {
    name: capitalize(data.name.replace(/-/g, ' ')),
    type: capitalize(data.type.name),
    power: data.power,
    damageClass: data.damage_class?.name ?? 'status',
  }
  moveDetailCache[moveName] = detail
  return detail
}

export function useTeamMoves(members) {
  const [movesByMember, setMovesByMember] = useState({})
  const fetchedRef = useRef(new Set())

  useEffect(() => {
    let cancelled = false

    members.forEach(async (p) => {
      if (fetchedRef.current.has(p.id)) return
      fetchedRef.current.add(p.id)

      setMovesByMember((prev) => ({ ...prev, [p.id]: { loading: true, attackTypes: [], moves: [] } }))

      try {
        const moveNames = await fetchLevelUpMoveNames(p.id)
        const details = await Promise.all(moveNames.map(fetchMoveDetail))
        const attackMoves = details.filter((m) => m.damageClass !== 'status' && m.power)
        const attackTypes = [...new Set(attackMoves.map((m) => m.type))]

        if (!cancelled) {
          setMovesByMember((prev) => ({
            ...prev,
            [p.id]: { loading: false, attackTypes, moves: attackMoves },
          }))
        }
      } catch {
        if (!cancelled) {
          setMovesByMember((prev) => ({
            ...prev,
            [p.id]: { loading: false, attackTypes: [], moves: [], error: true },
          }))
        }
      }
    })

    return () => { cancelled = true }
  }, [members.map((p) => p.id).join(',')])

  return movesByMember
}