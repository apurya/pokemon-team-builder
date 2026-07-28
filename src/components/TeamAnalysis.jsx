import { useState } from 'react'
import { ALL_TYPES, multiplierAgainst, getTeamTypeCounts } from '../typeChart.js'
import { TYPE_COLORS } from '../typeColors.js'
import TypeCoverageWheel from './TypeCoverageWheel.jsx'

function cellStyle(m) {
  if (m === 0) return 'bg-[#8894a8] text-white font-black'
  if (m === 4) return 'bg-[#c0392b] text-white font-black'
  if (m === 2) return 'bg-[#f2a58c] text-[#5c1c10] font-black'
  if (m === 0.5) return 'bg-[#bfe3b0] text-[#274d19] font-bold'
  if (m === 0.25) return 'bg-[#7fbf6a] text-[#1c3814] font-black'
  return 'text-[#22212B]/40 dark:text-white/30'
}

function cellLabel(m) {
  if (m === 1) return '·'
  if (m === 0) return '0'
  return `x${m}`
}

export default function TeamAnalysis({ team }) {
  const members = team.filter(Boolean)
  const [viewMode, setViewMode] = useState('table')

  if (members.length === 0) {
    return (
      <div className="mt-6 border-[4px] border-dashed border-[#22212B]/40 dark:border-white/20 bg-white/50 dark:bg-[#2c2b38]/50 p-6 text-center text-sm font-bold text-[#4A4858] dark:text-[#a8a6b8]">
        Tambahkan minimal 1 Pokémon ke tim untuk melihat analisis kelemahan &amp; kekuatan.
      </div>
    )
  }

  const { weakCount, resistCount, immuneCount } = getTeamTypeCounts(members)

  const weakList = ALL_TYPES.filter((t) => weakCount[t] > 0).sort((a, b) => weakCount[b] - weakCount[a])
  const strongList = ALL_TYPES.filter((t) => resistCount[t] + immuneCount[t] > 0)
    .sort((a, b) => (resistCount[b] + immuneCount[b]) - (resistCount[a] + immuneCount[a]))

  return (
    <div className="mt-6 border-[4px] border-[#22212B] dark:border-[#F4EEDD] bg-[#F4EEDD]/40 dark:bg-[#1a1922] p-4" style={{ boxShadow: '6px 6px 0 0 #22212B' }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-black uppercase tracking-tight dark:text-white border-l-[5px] border-[#D6293E] pl-2 bg-[#FFD666]/30 py-1">Analisis Tim</h2>
        <div className="flex border-[3px] border-[#22212B] dark:border-white overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`text-[10px] font-black uppercase px-2.5 py-1 transition-colors ${
              viewMode === 'table' ? 'bg-[#22212B] text-white' : 'bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white'
            }`}
          >
            📋 Tabel
          </button>
          <button
            onClick={() => setViewMode('wheel')}
            className={`text-[10px] font-black uppercase px-2.5 py-1 transition-colors border-l-[3px] border-[#22212B] dark:border-white ${
              viewMode === 'wheel' ? 'bg-[#22212B] text-white' : 'bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white'
            }`}
          >
            🎡 Wheel
          </button>
        </div>
      </div>

      {viewMode === 'wheel' && (
        <div className="mb-4 border-[3px] border-[#22212B] dark:border-[#3a3946] bg-white dark:bg-[#2c2b38] p-3">
          <TypeCoverageWheel
            weakCount={weakCount}
            resistCount={resistCount}
            immuneCount={immuneCount}
            memberCount={members.length}
          />
        </div>
      )}

      {viewMode === 'table' && (
      <div className="overflow-x-auto border-[3px] border-[#22212B] dark:border-[#3a3946] mb-4 bg-white dark:bg-[#2c2b38]" style={{ boxShadow: '4px 4px 0 0 #22212B' }}>
        <table className="w-full text-[11px] border-collapse min-w-[480px]">
          <thead>
            <tr className="bg-[#22212B] text-white">
              <th className="text-left px-2 py-1.5 font-black uppercase">Serangan ⬇ / Tim ➡</th>
              {members.map((p) => (
                <th key={p.id} className="px-1 py-1.5">
                  <img src={p.sprite} alt={p.name} title={p.name} className="w-5 h-5 mx-auto [image-rendering:pixelated]" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_TYPES.map((atk) => (
              <tr key={atk}>
                <th
                  className="text-left px-2 py-1 font-black uppercase whitespace-nowrap border-l-[5px] dark:text-white"
                  style={{ borderColor: TYPE_COLORS[atk] }}
                >
                  {atk}
                </th>
                {members.map((p) => {
                  const m = multiplierAgainst(atk, p.types)
                  return (
                    <td key={p.id} className={`text-center border border-[#22212B]/15 dark:border-white/10 py-1 ${cellStyle(m)}`}>
                      {cellLabel(m)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <div className="flex flex-wrap gap-2 text-[10px] font-bold text-[#4A4858] dark:text-[#a8a6b8] mb-4">
        <span className="flex items-center gap-1 border-2 border-[#22212B] px-1.5 py-0.5 bg-white dark:bg-[#2c2b38]"><i className="w-3 h-3 border border-[#22212B] bg-[#c0392b] inline-block" /> 4× lemah</span>
        <span className="flex items-center gap-1 border-2 border-[#22212B] px-1.5 py-0.5 bg-white dark:bg-[#2c2b38]"><i className="w-3 h-3 border border-[#22212B] bg-[#f2a58c] inline-block" /> 2× lemah</span>
        <span className="flex items-center gap-1 border-2 border-[#22212B] px-1.5 py-0.5 bg-white dark:bg-[#2c2b38]"><i className="w-3 h-3 border border-[#22212B] bg-[#bfe3b0] inline-block" /> 0.5× tahan</span>
        <span className="flex items-center gap-1 border-2 border-[#22212B] px-1.5 py-0.5 bg-white dark:bg-[#2c2b38]"><i className="w-3 h-3 border border-[#22212B] bg-[#7fbf6a] inline-block" /> 0.25× tahan</span>
        <span className="flex items-center gap-1 border-2 border-[#22212B] px-1.5 py-0.5 bg-white dark:bg-[#2c2b38]"><i className="w-3 h-3 border border-[#22212B] bg-[#8894a8] inline-block" /> 0× kebal</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="border-[3px] border-[#22212B] dark:border-[#3a3946] p-3 bg-white dark:bg-[#2c2b38]/70" style={{ boxShadow: '4px 4px 0 0 #D6293E' }}>
          <h3 className="text-xs font-black uppercase mb-2 dark:text-white">⚠ Kelemahan Terbesar</h3>
          {weakList.length === 0 ? (
            <p className="text-xs font-bold text-[#4A4858] dark:text-[#a8a6b8]">Tidak ada kelemahan besar 🎉</p>
          ) : (
            weakList.slice(0, 8).map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs py-1 border-b-2 border-[#22212B]/10 dark:border-white/10 last:border-0">
                <span className="text-[9px] font-black text-white px-1.5 py-0.5 border-2 border-[#22212B]" style={{ background: TYPE_COLORS[t] }}>{t}</span>
                <span className="ml-auto font-black dark:text-white">{weakCount[t]}/{members.length} lemah</span>
              </div>
            ))
          )}
        </div>

        <div className="border-[3px] border-[#22212B] dark:border-[#3a3946] p-3 bg-white dark:bg-[#2c2b38]/70" style={{ boxShadow: '4px 4px 0 0 #7ED47E' }}>
          <h3 className="text-xs font-black uppercase mb-2 dark:text-white">🛡 Pertahanan Terkuat</h3>
          {strongList.length === 0 ? (
            <p className="text-xs font-bold text-[#4A4858] dark:text-[#a8a6b8]">Belum ada resistensi menonjol</p>
          ) : (
            strongList.slice(0, 8).map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs py-1 border-b-2 border-[#22212B]/10 dark:border-white/10 last:border-0">
                <span className="text-[9px] font-black text-white px-1.5 py-0.5 border-2 border-[#22212B]" style={{ background: TYPE_COLORS[t] }}>{t}</span>
                <span className="ml-auto font-black dark:text-white">
                  {resistCount[t]} tahan{immuneCount[t] ? ` · ${immuneCount[t]} kebal` : ''}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}