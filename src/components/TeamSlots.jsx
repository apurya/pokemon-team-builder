import { useState } from 'react'
import { playCry } from '../pokemonApi.js'
import { TYPE_COLORS } from '../typeColors.js'

function EmptySlot({ index, isDropTarget, onDragOver, onDrop }) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative aspect-square border-[4px] border-dashed flex items-center justify-center transition-all ${
        isDropTarget ? 'border-[#D6293E] bg-[#D6293E]/10 rotate-2 scale-105' : 'border-[#22212B]/40 bg-white/60'
      }`}
    >
      <span className="absolute top-1 left-1.5 text-[9px] font-black text-[#22212B]/30">{index + 1}</span>
      <div className="brutal-plus" />
    </div>
  )
}

function FilledSlot({
  pokemon, index, onRemove, isEvolutionActive, onToggleEvolution, leaving = false,
  onDragStart, onDragOver, onDrop, isDragging, isDropTarget,
}) {
  const accent = TYPE_COLORS[pokemon.types?.[0]] || '#D6293E'
  const tilt = index % 2 === 0 ? '-rotate-1' : 'rotate-1'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{ boxShadow: isDropTarget ? undefined : `5px 5px 0 0 ${accent}` }}
      className={`relative aspect-square border-[4px] border-[#22212B] bg-[#F4EEDD] flex flex-col items-center justify-center p-2 text-center cursor-grab active:cursor-grabbing motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in hover:-translate-x-1 hover:-translate-y-1 hover:!rotate-0 ${tilt} ${
        leaving
          ? 'motion-safe:opacity-0 motion-safe:scale-75 pointer-events-none'
          : 'motion-safe:animate-[popin_0.2s_ease-out]'
      } ${isDragging ? 'opacity-40' : ''} ${isDropTarget ? 'ring-4 ring-[#D6293E] ring-offset-1 !rotate-2 scale-105' : ''}`}
    >
      <div className="absolute top-0 left-0 right-0 h-2.5 border-b-[3px] border-[#22212B]" style={{ background: accent }} />

      <span className="brutal-slot-number">{index + 1}</span>

      <button
        onClick={onRemove}
        className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#D6293E] text-white border-[3px] border-[#22212B] text-xs leading-none flex items-center justify-center font-black hover:scale-110 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6293E] shadow-[2px_2px_0_0_#22212B]"
        aria-label={`Hapus ${pokemon.name} dari tim`}
      >
        ×
      </button>
      <button
        onClick={onToggleEvolution}
        title="Lihat rantai evolusi"
        className={`absolute -bottom-2.5 -left-2.5 w-6 h-6 text-[10px] font-black border-[3px] border-[#22212B] flex items-center justify-center transition-all hover:scale-110 shadow-[2px_2px_0_0_#22212B] ${
          isEvolutionActive ? 'bg-[#D6293E] text-white' : 'bg-white text-[#22212B]'
        }`}
      >
        🧬
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); playCry(pokemon.cry) }}
        disabled={!pokemon.cry}
        title={pokemon.cry ? 'Dengar suara cry' : 'Suara tidak tersedia'}
        className={`absolute -bottom-2.5 -right-2.5 w-6 h-6 text-[10px] font-black border-[3px] flex items-center justify-center transition-all hover:scale-110 ${
          pokemon.cry ? 'border-[#22212B] bg-white text-[#22212B] shadow-[2px_2px_0_0_#22212B]' : 'border-[#22212B]/20 bg-white/50 text-[#22212B]/20 cursor-not-allowed'
        }`}
      >
        🔊
      </button>
      {pokemon.sprite ? (
        <img src={pokemon.sprite} alt={pokemon.name} className="w-13 h-13 mt-1.5 [image-rendering:pixelated] drop-shadow-md" />
      ) : (
        <div className="w-12 h-12 border-[3px] border-[#22212B]/30 bg-[#22212B]/10" />
      )}
      <div className="text-[10px] font-black uppercase mt-1.5 truncate w-full">{pokemon.name}</div>
      <div className="flex flex-wrap gap-1 justify-center mt-1">
        {pokemon.types?.map((t) => (
          <span
            key={t}
            className="text-[6px] font-black uppercase text-white px-1 py-0.5 border border-[#22212B]"
            style={{ background: TYPE_COLORS[t] }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TeamSlots({ team, onRemove, evolutionIndex, onToggleEvolution, onReorder }) {
  const [removingIndex, setRemovingIndex] = useState(null)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [dropTargetIndex, setDropTargetIndex] = useState(null)

  function handleRemoveClick(i) {
    if (removingIndex === i) return
    setRemovingIndex(i)
    setTimeout(() => {
      onRemove(i)
      setRemovingIndex((prev) => (prev === i ? null : prev))
    }, 150)
  }

  function handleDragStart(i) {
    setDraggingIndex(i)
  }

  function handleDragOver(e, i) {
    e.preventDefault()
    if (draggingIndex !== null && draggingIndex !== i) setDropTargetIndex(i)
  }

  function handleDrop(e, i) {
    e.preventDefault()
    if (draggingIndex !== null && draggingIndex !== i) {
      onReorder(draggingIndex, i)
    }
    setDraggingIndex(null)
    setDropTargetIndex(null)
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6 pt-2" onDragEnd={() => { setDraggingIndex(null); setDropTargetIndex(null) }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const pokemon = team[i]
        return pokemon ? (
          <FilledSlot
            key={pokemon.id ?? i}
            pokemon={pokemon}
            index={i}
            onRemove={() => handleRemoveClick(i)}
            isEvolutionActive={evolutionIndex === i}
            onToggleEvolution={() => onToggleEvolution(i)}
            leaving={removingIndex === i}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            isDragging={draggingIndex === i}
            isDropTarget={dropTargetIndex === i}
          />
        ) : (
          <EmptySlot
            key={`empty-${i}`}
            index={i}
            isDropTarget={dropTargetIndex === i}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
          />
        )
      })}
    </div>
  )
}