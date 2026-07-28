import { useState } from 'react'
import { DEFAULT_THEMES } from '../hooks/useTeamSlots.js'

export default function TeamManager({
  teamList, activeTeam, onSelect, onCreate, onRename, onDuplicate, onDelete, canCreateMore, maxSlots,
  onSetTheme,
}) {
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [paletteFor, setPaletteFor] = useState(null)

  function startRename(team) {
    setEditingId(team.id)
    setEditValue(team.name)
  }

  function commitRename() {
    if (editingId) onRename(editingId, editValue)
    setEditingId(null)
  }

  return (
    <div className="mb-5 border-[4px] border-[#22212B] dark:border-[#F4EEDD] bg-white/60 dark:bg-[#1a1922] p-3" style={{ boxShadow: '5px 5px 0 0 #22212B' }}>
      <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
        <h2 className="text-[11px] font-black uppercase tracking-tight text-[#22212B] dark:text-white bg-[#FFD666] border-2 border-[#22212B] px-2 py-0.5">
          Tim Tersimpan ({teamList.length}/{maxSlots})
        </h2>
        <button
          onClick={() => onCreate()}
          disabled={!canCreateMore}
          className="text-[10px] font-black uppercase px-2.5 py-1 border-[3px] border-[#22212B] dark:border-white bg-[#7ED47E] text-[#22212B] shadow-[2px_2px_0_0_#22212B] hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
        >
          + Tim Baru
        </button>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {teamList.map((team) => {
          const isActive = team.id === activeTeam.id
          const filledCount = team.members.filter(Boolean).length
          const accent = team.theme || '#D6293E'
          return (
            <div key={team.id} className="relative">
              <div
                className={`flex items-center gap-1.5 border-[3px] border-[#22212B] pl-1.5 pr-1.5 py-1 transition-all ${
                  isActive ? 'bg-white dark:bg-[#2c2b38] -rotate-1' : 'bg-white/70 dark:bg-[#2c2b38]/70 opacity-80'
                }`}
                style={isActive ? { boxShadow: `4px 4px 0 0 ${accent}` } : {}}
              >
                <button
                  onClick={() => setPaletteFor((prev) => (prev === team.id ? null : team.id))}
                  title="Ganti warna tema tim"
                  className="w-4 h-4 border-2 border-[#22212B] shrink-0"
                  style={{ background: accent }}
                />
                {editingId === team.id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename() }}
                    className="text-[11px] font-black bg-transparent border-b-2 border-[#22212B] dark:border-white dark:text-white outline-none w-24"
                  />
                ) : (
                  <button
                    onClick={() => onSelect(team.id)}
                    onDoubleClick={() => startRename(team)}
                    className="text-[11px] font-black uppercase whitespace-nowrap dark:text-white"
                    style={isActive ? { color: accent } : {}}
                    title="Klik untuk pindah tim, klik dua kali untuk ganti nama"
                  >
                    {team.name} <span className="opacity-60 font-bold normal-case">({filledCount}/6)</span>
                  </button>
                )}
                <button
                  onClick={() => onDuplicate(team.id)}
                  title="Duplikat tim"
                  className="w-5 h-5 flex items-center justify-center border-2 border-[#22212B]/0 hover:border-[#22212B] text-[10px] dark:text-white transition-colors"
                >
                  ⎘
                </button>
                {teamList.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus tim "${team.name}"?`)) onDelete(team.id)
                    }}
                    title="Hapus tim"
                    className="w-5 h-5 flex items-center justify-center border-2 border-transparent hover:border-[#D6293E] text-[10px] font-black text-[#9E1C2C] dark:text-[#ff8080] transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>

              {paletteFor === team.id && (
                <div className="absolute z-10 mt-1.5 flex gap-1.5 p-2 border-[3px] border-[#22212B] bg-white" style={{ boxShadow: '3px 3px 0 0 #22212B' }}>
                  {DEFAULT_THEMES.map((color) => (
                    <button
                      key={color}
                      onClick={() => { onSetTheme(team.id, color); setPaletteFor(null) }}
                      className="w-5 h-5 border-2 border-[#22212B] hover:scale-110 transition-transform"
                      style={{ background: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}