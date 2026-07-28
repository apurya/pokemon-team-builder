import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pokemon-team-builder:dark-mode'

function getInitialDarkMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(getInitialDarkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark))
    } catch {
      // localStorage tidak tersedia, lewati saja
    }
  }, [isDark])

  return [isDark, setIsDark]
}