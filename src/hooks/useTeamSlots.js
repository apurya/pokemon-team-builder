import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'pokemon-team-builder:teams'
const OLD_STORAGE_KEY = 'pokemon-team-builder:team'
const MAX_SLOTS = 6
export const DEFAULT_THEMES = ['#D6293E', '#3B82F6', '#7ED47E', '#FFD666', '#A040A0', '#F08030']
function emptyMembers() {
  return Array(6).fill(null)
}

function makeTeam(name, members = emptyMembers(), theme = DEFAULT_THEMES[0]) {  const id = `team-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const now = Date.now()
  return { id, name, members, theme, createdAt: now, updatedAt: now }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && parsed.teams && parsed.activeId && parsed.teams[parsed.activeId]) {
        return parsed
      }
    }
  } catch {
    // data korup, lanjut ke fallback di bawah
  }

  // Migrasi otomatis dari format lama (1 tim saja) kalau ada
  try {
    const oldRaw = localStorage.getItem(OLD_STORAGE_KEY)
    if (oldRaw) {
      const oldMembers = JSON.parse(oldRaw)
      if (Array.isArray(oldMembers) && oldMembers.length === 6) {
        const team = makeTeam('Tim 1', oldMembers)
        localStorage.removeItem(OLD_STORAGE_KEY)
        return { activeId: team.id, teams: { [team.id]: team } }
      }
    }
  } catch {
    // ignore, lanjut ke default kosong
  }

  const team = makeTeam('Tim 1')
  return { activeId: team.id, teams: { [team.id]: team } }
}

export function useTeamSlots() {
  const [state, setState] = useState(loadState)
  const [lastSavedAt, setLastSavedAt] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      setLastSavedAt(Date.now())
    } catch {
    }
  }, [state])

  const teamList = Object.values(state.teams).sort((a, b) => a.createdAt - b.createdAt)
  const activeTeam = state.teams[state.activeId] ?? teamList[0]

  const setMembers = useCallback((updater) => {
    setState((prev) => {
      const current = prev.teams[prev.activeId]
      if (!current) return prev
      const nextMembers = typeof updater === 'function' ? updater(current.members) : updater
      return {
        ...prev,
        teams: {
          ...prev.teams,
          [current.id]: { ...current, members: nextMembers, updatedAt: Date.now() },
        },
      }
    })
  }, [])

  const selectTeam = useCallback((id) => {
    setState((prev) => (prev.teams[id] ? { ...prev, activeId: id } : prev))
  }, [])

  const createTeam = useCallback((name, initialMembers) => {
    setState((prev) => {
      if (Object.keys(prev.teams).length >= MAX_SLOTS) return prev
      const team = makeTeam(name || `Tim ${Object.keys(prev.teams).length + 1}`, initialMembers)
      return { activeId: team.id, teams: { ...prev.teams, [team.id]: team } }
    })
  }, [])

  const setTeamTheme = useCallback((id, theme) => {
  setState((prev) => {
    const team = prev.teams[id]
    if (!team) return prev
    return { ...prev, teams: { ...prev.teams, [id]: { ...team, theme } } }
  })
}, [])

  const renameTeam = useCallback((id, name) => {
    setState((prev) => {
      const team = prev.teams[id]
      if (!team || !name.trim()) return prev
      return { ...prev, teams: { ...prev.teams, [id]: { ...team, name: name.trim() } } }
    })
  }, [])

  const duplicateTeam = useCallback((id) => {
    setState((prev) => {
      if (Object.keys(prev.teams).length >= MAX_SLOTS) return prev
      const source = prev.teams[id]
      if (!source) return prev
      const team = makeTeam(`${source.name} (salinan)`, [...source.members])
      return { activeId: team.id, teams: { ...prev.teams, [team.id]: team } }
    })
  }, [])

  const deleteTeam = useCallback((id) => {
    setState((prev) => {
      const remainingIds = Object.keys(prev.teams).filter((tid) => tid !== id)
      if (remainingIds.length === 0) return prev // minimal harus ada 1 tim
      const nextTeams = { ...prev.teams }
      delete nextTeams[id]
      const nextActiveId = prev.activeId === id ? remainingIds[0] : prev.activeId
      return { activeId: nextActiveId, teams: nextTeams }
    })
  }, [])

  // Dipanggil saat ada tim dari link share (?team=...)
  const importSharedTeam = useCallback((members) => {
    setState((prev) => {
      const teamCount = Object.keys(prev.teams).length
      if (teamCount < MAX_SLOTS) {
        const team = makeTeam('Tim dari Link', members)
        return { activeId: team.id, teams: { ...prev.teams, [team.id]: team } }
      }
      // Slot penuh, timpa tim yang sedang aktif
      const current = prev.teams[prev.activeId]
      return {
        ...prev,
        teams: { ...prev.teams, [current.id]: { ...current, members, updatedAt: Date.now() } },
      }
    })
  }, [])

  return {
    teamList,
    activeTeam,
    setMembers,
    selectTeam,
    createTeam,
    renameTeam,
    duplicateTeam,
    deleteTeam,
    importSharedTeam,
    setTeamTheme,
    canCreateMore: teamList.length < MAX_SLOTS,
    maxSlots: MAX_SLOTS,
    lastSavedAt,
  }
}