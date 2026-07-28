const SHORTCUTS = [
  { keys: '/', desc: 'Fokus ke kolom pencarian Pokémon' },
  { keys: '1 – 6', desc: 'Buka/tutup rantai evolusi anggota tim di slot itu' },
  { keys: 'Esc', desc: 'Tutup panel yang sedang terbuka (evolusi, compare, pokedex, cheatsheet ini)' },
  { keys: 'Ctrl + Z', desc: 'Undo perubahan tim terakhir' },
  { keys: 'Ctrl + Shift + Z', desc: 'Redo perubahan tim' },
  { keys: '?', desc: 'Buka/tutup daftar shortcut ini' },
]

export default function ShortcutsModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#22212B]/70 px-4 brutal-halftone"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border-[4px] border-[#22212B] dark:border-[#F4EEDD] bg-[#F4EEDD] dark:bg-[#2c2b38] p-4 rotate-1"
        style={{ boxShadow: '8px 8px 0 0 #22212B' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3.5 -rotate-1">
          <h2 className="text-sm font-black uppercase dark:text-white bg-[#FFD666] border-2 border-[#22212B] px-2 py-0.5">⌨ Keyboard Shortcut</h2>
          <button
            onClick={onClose}
            className="text-[10px] font-black uppercase px-2.5 py-1 border-[3px] border-[#22212B] dark:border-white bg-[#D6293E] text-white shadow-[2px_2px_0_0_#22212B] hover:-translate-y-0.5 transition-all"
          >
            ✕ Tutup
          </button>
        </div>
        <div className="space-y-2 -rotate-1">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center gap-3 border-b-2 border-[#22212B]/10 dark:border-white/10 pb-2 last:border-0 last:pb-0">
              <kbd className="shrink-0 min-w-[68px] text-center text-[10px] font-black px-2 py-1.5 border-[3px] border-[#22212B] bg-white dark:bg-[#17161f] dark:border-white/40 dark:text-white shadow-[2px_2px_0_0_#22212B]">
                {s.keys}
              </kbd>
              <span className="text-[11px] font-bold text-[#22212B] dark:text-[#a8a6b8]">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}