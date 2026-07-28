import { useState } from 'react'
import { TYPE_COLORS } from '../typeColors.js'
import StatRadar from './StatRadar.jsx'

const STAT_META = [
  { key: 'hp', label: 'HP', color: '#F85888' },
  { key: 'attack', label: 'Attack', color: '#F08030' },
  { key: 'defense', label: 'Defense', color: '#6890F0' },
  { key: 'spAtk', label: 'Sp. Atk', color: '#A040A0' },
  { key: 'spDef', label: 'Sp. Def', color: '#78C850' },
  { key: 'speed', label: 'Speed', color: '#F0C020' },
]

const MAX_STAT = 180

function StatBar({ value, color }) {
  const pct = Math.min(100, (value / MAX_STAT) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 flex-1 border-[3px] border-[#22212B] bg-[#22212B]/10 overflow-hidden">
        <div className="h-full border-r-2 border-[#22212B]" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-black w-6 text-right dark:text-white">{value}</span>
    </div>
  )
}

export default function TeamStats({ team }) {
  const members = team.filter(Boolean)
  const [viewMode, setViewMode] = useState('bar')
  if (members.length === 0) return null

  return (
    <div className="mt-6 border-[4px] border-[#22212B] dark:border-[#F4EEDD] bg-[#F4EEDD]/40 dark:bg-[#1a1922] p-4" style={{ boxShadow: '6px 6px 0 0 #22212B' }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-black uppercase tracking-tight dark:text-white border-l-[5px] border-[#D6293E] pl-2 bg-[#FFD666]/30 py-1">Statistik Tim</h2>
        <div className="flex gap-1.5">
          <button
            onClick={() => setViewMode('bar')}
            className={`text-[10px] font-black uppercase px-2.5 py-1 border-[3px] border-[#22212B] transition-all ${
              viewMode === 'bar'
                ? 'bg-[#22212B] text-white shadow-[3px_3px_0_0_#FFD666]'
                : 'bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white hover:-translate-y-0.5'
            }`}
          >
            📊 Bar
          </button>
          <button
            onClick={() => setViewMode('radar')}
            className={`text-[10px] font-black uppercase px-2.5 py-1 border-[3px] border-[#22212B] transition-all ${
              viewMode === 'radar'
                ? 'bg-[#22212B] text-white shadow-[3px_3px_0_0_#FFD666]'
                : 'bg-white dark:bg-[#22212B] text-[#22212B] dark:text-white hover:-translate-y-0.5'
            }`}
          >
            🎨 Radar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {members.map((p) => {
          const total = p.stats
            ? Object.values(p.stats).reduce((a, b) => a + b, 0)
            : null
          const radarColor = p.types?.[0] ? TYPE_COLORS[p.types[0]] : '#D6293E'
          const accent = p.types?.[0] ? TYPE_COLORS[p.types[0]] : '#D6293E'
          return (
            <div key={p.id} style={{ boxShadow: `5px 5px 0 0 ${accent}` }} className="border-[3px] border-[#22212B] dark:border-[#3a3946] p-3 bg-white dark:bg-[#2c2b38]">
              <div className="flex items-center gap-2 mb-2 border-b-2 border-[#22212B]/10 dark:border-white/10 pb-2">
                <img src={p.sprite} alt={p.name} className="w-9 h-9 [image-rendering:pixelated]" />
                <span className="text-xs font-black uppercase dark:text-white">{p.name}</span>
                {total !== null && (
                  <span className="ml-auto text-[10px] font-black text-[#22212B] dark:text-white bg-[#FFD666] border-2 border-[#22212B] px-1.5">Σ {total}</span>
                )}
              </div>
              {p.stats ? (
                viewMode === 'radar' ? (
                  <StatRadar stats={p.stats} color={radarColor} />
                ) : (
                  <div className="space-y-1.5">
                    {STAT_META.map((s) => (
                      <div key={s.key} className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-[#4A4858] dark:text-[#a8a6b8] w-14 shrink-0">{s.label}</span>
                        <StatBar value={p.stats[s.key]} color={s.color} />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <p className="text-[10px] font-bold text-[#4A4858] dark:text-[#a8a6b8]">Data stat tidak tersedia.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}