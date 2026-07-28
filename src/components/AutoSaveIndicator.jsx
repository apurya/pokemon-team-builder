import { useEffect, useState } from 'react'

export default function AutoSaveIndicator({ lastSavedAt }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!lastSavedAt) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(t)
  }, [lastSavedAt])

  if (!lastSavedAt) return null

  return (
    <span
      className={`text-[10px] font-semibold text-[#4A4858] dark:text-[#a8a6b8] transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      ✓ Tersimpan otomatis
    </span>
  )
}