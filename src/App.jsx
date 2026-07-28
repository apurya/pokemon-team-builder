import { useState, useEffect } from 'react'
import TeamSlots from './components/TeamSlots.jsx'
import SearchBar from './components/SearchBar.jsx'
import PokemonGrid from './components/PokemonGrid.jsx'
import TeamStats from './components/TeamStats.jsx'
import TeamAnalysis from './components/TeamAnalysis.jsx'
import TeamSuggestions from './components/TeamSuggestions.jsx'
import { usePokemonList } from './hooks/usePokemonList.js'
import OffensiveCoverage from './components/OffensiveCoverage.jsx'
import ShareExport from './components/ShareExport.jsx'
import { useSharedTeamFromUrl } from './hooks/useSharedTeam.js'
import SpeedTier from './components/SpeedTier.jsx'
import TeamAbilities from './components/TeamAbilities.jsx'
import { useDarkMode } from './hooks/useDarkMode.js'
import { useTeamSlots } from './hooks/useTeamSlots.js'
import TeamManager from './components/TeamManager.jsx'
import ComparePanel from './components/ComparePanel.jsx'
import PokedexEntry from './components/PokedexEntry.jsx'
import EvolutionChain from './components/EvolutionChain.jsx'
import DamageCalculator from './components/DamageCalculator.jsx'
import NatureCalculator from './components/NatureCalculator.jsx'
import TeamArchetype from './components/TeamArchetype.jsx'
import Achievements from './components/Achievements.jsx'
import { useTeamHistory } from './hooks/useTeamHistory.js'
import CounterSuggestions from './components/CounterSuggestions.jsx'
import GenerationValidityChecker from './components/GenerationValidityChecker.jsx'
import MoveSetBuilder from './components/MoveSetBuilder.jsx'
import TeamRoles from './components/TeamRoles.jsx'
import WeatherSynergy from './components/WeatherSynergy.jsx'
import HeldItemSuggestions from './components/HeldItemSuggestions.jsx'
import TeamScoreCard from './components/TeamScoreCard.jsx'
import MatchupSimulator from './components/MatchupSimulator.jsx'
import TeamStatOverlay from './components/TeamStatOverlay.jsx'
import TeamRarityBadges from './components/TeamRarityBadges.jsx'
import PresetTeams from './components/PresetTeams.jsx'
import { PRESET_TEAMS } from './presetTeams.js'
import PokemonOfTheDay from './components/PokemonOfTheDay.jsx'
import AutoSaveIndicator from './components/AutoSaveIndicator.jsx'
import ShortcutsModal from './components/ShortcutsModal.jsx'
import TeamCompareTable from './components/TeamCompareTable.jsx'

function App() {
  const {
    teamList, activeTeam, setMembers, selectTeam, createTeam,
    renameTeam, duplicateTeam, deleteTeam, importSharedTeam, canCreateMore, maxSlots, setTeamTheme,
    lastSavedAt,
  } = useTeamSlots()

  const [hideUsed, setHideUsed] = useState(false)
  const usedIds = new Set(
  teamList.flatMap((t) => t.members.filter(Boolean).map((p) => p.id))
  )
  const team = activeTeam.members
  const { record: recordMembers, undo, redo, canUndo, canRedo } = useTeamHistory(team, setMembers, activeTeam.id)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeType, setActiveType] = useState('All')
  const [activeGeneration, setActiveGeneration] = useState(1)
  const { pokemonList, loading, error } = usePokemonList(activeGeneration)
  const [isDark, setIsDark] = useDarkMode()
  const [isShiny, setIsShiny] = useState(false)
  const [secondType, setSecondType] = useState('All')
  const [sortBy, setSortBy] = useState('none')
  const [abilityFilter, setAbilityFilter] = useState('')
  const [evolutionIndex, setEvolutionIndex] = useState(null)
  const [compareSelection, setCompareSelection] = useState([])
  const [flavorPokemon, setFlavorPokemon] = useState(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showFullCompare, setShowFullCompare] = useState(false)

  const { sharedTeam, loadingSharedTeam } = useSharedTeamFromUrl()

  useEffect(() => {
    if (sharedTeam) importSharedTeam(sharedTeam)
  }, [sharedTeam, importSharedTeam])

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable

      if (e.key === '/' && !isTyping) {
        e.preventDefault()
        document.getElementById('pokemon-search-input')?.focus()
        return
      }

      if (e.key === '?' && !isTyping) {
        e.preventDefault()
        setShowShortcuts((prev) => !prev)
        return
      }

      if (e.key === 'Escape') {
        if (showShortcuts) { setShowShortcuts(false); return }
        if (evolutionIndex !== null) { setEvolutionIndex(null); return }
        if (compareSelection.length > 0) { setCompareSelection([]); return }
        if (flavorPokemon) { setFlavorPokemon(null); return }
        return
      }

      if (!isTyping && /^[1-6]$/.test(e.key)) {
        const idx = Number(e.key) - 1
        if (team[idx]) {
          e.preventDefault()
          handleToggleEvolution(idx)
        }
        return
      }

      if (!isTyping && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [evolutionIndex, compareSelection, flavorPokemon, team, undo, redo, showShortcuts])

  function applyShiny(p) {
    if (!p) return p
    return isShiny && p.spriteShiny ? { ...p, sprite: p.spriteShiny } : p
  }

  const displayPokemonList = pokemonList.map(applyShiny)
  const displayTeam = team.map((p) => (p ? applyShiny(p) : p))

  function handleRemove(index) {
    recordMembers((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
    setEvolutionIndex((prev) => (prev === index ? null : prev))
  }

  function handleAdd(pokemon) {
    recordMembers((prev) => {
      if (prev.some((p) => p && p.id === pokemon.id)) return prev
      const idx = prev.findIndex((p) => p === null)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = pokemon
      return next
    })
  }

  function handleReset() {
    recordMembers(Array(6).fill(null))
    setEvolutionIndex(null)
  }

  function handleImportPreset(members) {
    recordMembers(members)
    setEvolutionIndex(null)
  }

  function handleRandomTeam() {
    if (pokemonList.length === 0) return
    const shuffled = [...pokemonList].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, Math.min(6, pokemonList.length))
    const next = Array(6).fill(null)
    picked.forEach((p, i) => { next[i] = p })
    recordMembers(next)
    setEvolutionIndex(null)
  }

  function handleToggleEvolution(index) {
    setEvolutionIndex((prev) => (prev === index ? null : index))
  }

  function handleToggleCompare(pokemon) {
    setCompareSelection((prev) => {
      const exists = prev.some((p) => p.id === pokemon.id)
      if (exists) return prev.filter((p) => p.id !== pokemon.id)
      if (prev.length >= 2) return [prev[1], pokemon] 
      return [...prev, pokemon]
    })
  }

  function handleReorder(fromIndex, toIndex) {
    recordMembers((prev) => {
      const next = [...prev]
      ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
      return next
    })
  }

  function handleToggleFlavor(pokemon) {
    setFlavorPokemon((prev) => (prev && prev.id === pokemon.id ? null : pokemon))
  }

  const hasTeam = team.some(Boolean)

  return (
    <div className="min-h-screen relative overflow-hidden brutal-stripes brutal-halftone flex justify-center px-3 py-7">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob-pulse absolute -top-14 -left-14 w-48 h-48 rotate-12 bg-[#D6293E] border-[6px] border-[#F4EEDD]" style={{ '--r': '12deg' }} />
        <div className="animate-blob-pulse absolute top-1/4 -right-20 w-56 h-56 -rotate-6 bg-[#5FD0E0] border-[6px] border-[#F4EEDD]" style={{ '--r': '-6deg', animationDelay: '1s' }} />
        <div className="animate-blob-pulse absolute bottom-10 left-[8%] w-36 h-36 rotate-45 bg-[#FFD666] border-[6px] border-[#F4EEDD]" style={{ '--r': '45deg', animationDelay: '2s' }} />
        <div className="animate-blob-pulse absolute bottom-24 right-[12%] w-28 h-28 -rotate-12 rounded-full bg-[#7ED47E] border-[6px] border-[#F4EEDD]" style={{ '--r': '-12deg', animationDelay: '0.5s' }} />
        <div className="brutal-tape w-36 top-6 left-1/3 -rotate-6" />
        <div className="brutal-tape w-28 bottom-8 right-1/4 rotate-12" />
      </div>

      <div
        className="relative w-full max-w-3xl rounded-none p-0 -rotate-[0.5deg] bg-[#22212B] border-[6px] border-[#22212B]"
        style={{ boxShadow: `14px 14px 0 0 ${activeTeam.theme || '#D6293E'}` }}
      >
        <div className="brutal-zigzag" />

        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="pokeball-logo w-12 h-12 rounded-full border-[5px] border-[#F4EEDD] bg-gradient-to-br from-[#eafcff] via-[#5FD0E0] to-[#0c454f] shadow-[4px_4px_0_0_#F4EEDD] cursor-pointer" />
            <div className="flex gap-2 ml-1">
              <span className="brutal-bolt" />
              <span className="brutal-bolt" style={{ background: '#D6293E' }} />
              <span className="brutal-bolt" style={{ background: '#7ED47E' }} />
            </div>
          </div>
          <div className="overflow-hidden w-40 sm:w-64 h-6 border-[3px] border-[#F4EEDD] animate-ticker-strobe">
            <div className="flex whitespace-nowrap animate-marquee text-[9px] font-black tracking-widest text-[#22212B] py-1">
              <span className="px-3">⚡ SUSUN TIM IMPIANMU ⚡ TANGKAP SEMUANYA ⚡ SIAP BERTARUNG ⚡</span>
              <span className="px-3">⚡ SUSUN TIM IMPIANMU ⚡ TANGKAP SEMUANYA ⚡ SIAP BERTARUNG ⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-[#F4EEDD] dark:bg-[#1a1922] rounded-none border-t-[6px] border-[#22212B] dark:border-[#F4EEDD] p-6 relative">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-4 animate-jitter-in flex-wrap">
              <span className="brutal-badge brutal-stamp inline-block bg-[#D6293E] text-[#F4EEDD] text-[11px] font-black uppercase px-3 py-1.5 border-[3px] border-[#22212B] rotate-[-8deg]">
                ★ Beta
              </span>

              <h1 className="hero-title-stack text-5xl sm:text-6xl font-black uppercase tracking-tight -rotate-1">
                <span className="layer-back">Team Builder</span>
                <span className="layer-mid">Team Builder</span>
                <span className="relative text-[#FFD666] text-stroke-brutal">Team Builder</span>
              </h1>

              <AutoSaveIndicator lastSavedAt={lastSavedAt} />
            </div>

            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={() => setShowShortcuts((prev) => !prev)}
                title="Lihat semua keyboard shortcut (?)"
                className="brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] dark:border-[#F4EEDD] bg-[#5FD0E0] text-[#22212B] transition-all"
              >
                ⌨ SHORTCUT
              </button>
              <button
                onClick={() => setIsDark((prev) => !prev)}
                className="brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] dark:border-[#F4EEDD] bg-[#FFD666] text-[#22212B] transition-all"
              >
                {isDark ? '☀ TERANG' : '🌙 GELAP'}
              </button>
              <button
                onClick={() => setIsShiny((prev) => !prev)}
                className={`brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] transition-all ${
                  isShiny ? 'bg-[#FFD666] text-[#22212B]' : 'bg-white text-[#22212B]'
                }`}
              >
                ✨ SHINY
              </button>
              <button
                onClick={handleRandomTeam}
                disabled={loading || pokemonList.length === 0}
                className="brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] bg-[#7ED47E] text-[#22212B] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                🎲 ACAK TIM
              </button>
              <button
                onClick={() => setShowFullCompare((prev) => !prev)}
                disabled={team.filter(Boolean).length < 2}
                title="Bandingkan semua anggota tim sekaligus"
                className="brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] bg-white text-[#22212B] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                📊 COMPARE
              </button>
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] bg-white text-[#22212B] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                ↶ UNDO
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
                className="brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] bg-white text-[#22212B] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                ↷ REDO
              </button>
              {hasTeam && (
                <button
                  onClick={handleReset}
                  className="brutal-shadow-sm brutal-press-sm text-[10px] font-black px-3 py-2 border-[3px] border-[#22212B] bg-[#D6293E] text-white transition-all"
                >
                  RESET TIM
                </button>
              )}
            </div>
          </div>

          <p className="text-sm font-bold text-[#22212B] dark:text-[#F4EEDD] mb-5 border-l-[6px] border-[#D6293E] pl-3 bg-[#FFD666]/20 py-2">
            Susun tim 6 Pokémon, lalu lihat kelemahan &amp; kekuatan tim secara otomatis.
          </p>

          <TeamManager
            teamList={teamList}
            activeTeam={activeTeam}
            onSelect={selectTeam}
            onCreate={createTeam}
            onRename={renameTeam}
            onDuplicate={duplicateTeam}
            onDelete={deleteTeam}
            canCreateMore={canCreateMore}
            maxSlots={maxSlots}
            onSetTheme={setTeamTheme}
          />

          <TeamSlots
            team={displayTeam}
            onRemove={handleRemove}
            evolutionIndex={evolutionIndex}
            onToggleEvolution={handleToggleEvolution}
            onReorder={handleReorder}
          />

          {evolutionIndex !== null && team[evolutionIndex] && (
            <EvolutionChain
              pokemon={applyShiny(team[evolutionIndex])}
              isShiny={isShiny}
              onEvolve={(newPokemon) => {
                recordMembers((prev) => {
                  const next = [...prev]
                  next[evolutionIndex] = newPokemon
                  return next
                })
              }}
              onClose={() => setEvolutionIndex(null)}
            />
          )}

          {loadingSharedTeam && (
            <p className="text-xs text-[#4A4858] dark:text-[#a8a6b8] mb-2">Memuat tim dari link…</p>
          )}

          <ShareExport team={displayTeam} teamName={activeTeam.name} />

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeType={activeType}
            onTypeChange={setActiveType}
            activeGeneration={activeGeneration}
            onGenerationChange={setActiveGeneration}
            secondType={secondType}
            onSecondTypeChange={setSecondType}
            sortBy={sortBy}
            onSortChange={setSortBy}
            abilityFilter={abilityFilter}
            onAbilityFilterChange={setAbilityFilter}
            hideUsed={hideUsed}
            onToggleHideUsed={setHideUsed}

          />

          <PokemonGrid
            pokemonList={displayPokemonList}
            loading={loading}
            error={error}
            searchTerm={searchTerm}
            activeType={activeType}
            team={team}
            onAdd={handleAdd}
            compareSelection={compareSelection}
            onToggleCompare={handleToggleCompare}
            flavorId={flavorPokemon?.id ?? null}
            onToggleFlavor={handleToggleFlavor}
            secondType={secondType}
            sortBy={sortBy}
            abilityFilter={abilityFilter}
            hideUsed={hideUsed}
            usedIds={usedIds}
          />

          {compareSelection.length === 2 && (
            <ComparePanel
              pokemonA={applyShiny(compareSelection[0])}
              pokemonB={applyShiny(compareSelection[1])}
              onClose={() => setCompareSelection([])}
            />
          )}

          {showFullCompare && (
            <TeamCompareTable team={displayTeam} onClose={() => setShowFullCompare(false)} />
          )}

          <PokedexEntry pokemon={applyShiny(flavorPokemon)} onClose={() => setFlavorPokemon(null)} />

          <TeamStats team={displayTeam} />

          <TeamAbilities team={displayTeam} />

          <SpeedTier team={displayTeam} pokemonList={displayPokemonList} />

          <TeamAnalysis team={displayTeam} />

          <OffensiveCoverage team={displayTeam} />

          <MoveSetBuilder team={displayTeam} />

          <WeatherSynergy team={displayTeam} />

          <TeamRoles team={displayTeam} />

          <HeldItemSuggestions team={displayTeam} />

          <TeamSuggestions team={displayTeam} pokemonList={displayPokemonList} onAdd={handleAdd} />

          <PresetTeams onImport={handleImportPreset} />

          <PokemonOfTheDay team={displayTeam} onAdd={handleAdd} />

          <CounterSuggestions team={displayTeam} pokemonList={displayPokemonList} />

          <GenerationValidityChecker team={displayTeam} />

          <TeamRarityBadges team={displayTeam} />

          <TeamStatOverlay team={displayTeam} />

          <TeamScoreCard team={displayTeam} />

          <TeamArchetype team={displayTeam} />

          <Achievements team={displayTeam} />

          <MatchupSimulator team={displayTeam} pokemonList={displayPokemonList} />

          <DamageCalculator team={displayTeam} pokemonList={displayPokemonList} />

          <NatureCalculator team={displayTeam} />
        </div>
      </div>

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

export default App