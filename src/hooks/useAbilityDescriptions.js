import { useState } from 'react'

const abilityCache = {} // urlName -> { shortEffect }

export function useAbilityDescriptions() {
  const [entries, setEntries] = useState({}) // urlName -> { loading, shortEffect, error }

  async function loadAbility(urlName) {
    if (abilityCache[urlName]) {
      setEntries((prev) => ({ ...prev, [urlName]: { loading: false, ...abilityCache[urlName] } }))
      return
    }
    if (entries[urlName]?.loading) return

    setEntries((prev) => ({ ...prev, [urlName]: { loading: true } }))

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/ability/${urlName}`)
      const data = await res.json()
      const enEntry = data.effect_entries.find((e) => e.language.name === 'en')
      const shortEffect = enEntry ? enEntry.short_effect : 'Deskripsi tidak tersedia.'
      abilityCache[urlName] = { shortEffect }
      setEntries((prev) => ({ ...prev, [urlName]: { loading: false, shortEffect } }))
    } catch {
      setEntries((prev) => ({ ...prev, [urlName]: { loading: false, error: true } }))
    }
  }

  return { entries, loadAbility }
}