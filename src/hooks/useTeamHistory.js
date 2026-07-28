import { useEffect, useState } from 'react'

const MAX_HISTORY = 20

// Hook kecil buat undo/redo perubahan anggota tim.
// `currentMembers` = state members yang sedang aktif sekarang (dari useTeamSlots).
// `setMembers` = setter dari useTeamSlots.
// `resetKey` = nilai yang kalau berubah (misal ganti tim aktif) akan mengosongkan history,
// supaya undo/redo gak "bocor" nyambung antar tim yang berbeda.
export function useTeamHistory(currentMembers, setMembers, resetKey) {
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])

  useEffect(() => {
    setPast([])
    setFuture([])
  }, [resetKey])

  // Panggil ini alih-alih setMembers langsung setiap kali mengubah anggota tim,
  // supaya state sebelumnya kesimpan ke history.
  function record(nextMembersOrUpdater) {
    setPast((prev) => [...prev.slice(-(MAX_HISTORY - 1)), currentMembers])
    setFuture([])
    setMembers(nextMembersOrUpdater)
  }

  function undo() {
    setPast((prev) => {
      if (prev.length === 0) return prev
      const previous = prev[prev.length - 1]
      setFuture((f) => [currentMembers, ...f].slice(0, MAX_HISTORY))
      setMembers(previous)
      return prev.slice(0, -1)
    })
  }

  function redo() {
    setFuture((prev) => {
      if (prev.length === 0) return prev
      const next = prev[0]
      setPast((p) => [...p, currentMembers].slice(-MAX_HISTORY))
      setMembers(next)
      return prev.slice(1)
    })
  }

  return { record, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 }
}