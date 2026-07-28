import { useState } from 'react'
import { TYPE_COLORS } from '../typeColors.js'
import { ALL_TYPES, getTeamTypeCounts } from '../typeChart.js'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const r = Math.max(0, Math.min(255, (num >> 16) + amt))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt))
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt))
  return `rgb(${r}, ${g}, ${b})`
}

function getDominantType(members) {
  const count = {}
  members.forEach((p) => p.types.forEach((t) => { count[t] = (count[t] || 0) + 1 }))
  const sorted = Object.keys(count).sort((a, b) => count[b] - count[a])
  return sorted[0] ?? members[0]?.types?.[0] ?? 'Normal'
}

function bestAbility(p) {
  const found = (p.abilities || []).find((a) => !a.isHidden) ?? p.abilities?.[0]
  return found?.name ?? '—'
}

function statTotal(p) {
  return p.stats ? Object.values(p.stats).reduce((a, b) => a + b, 0) : 0
}

// ---- Lapisan 1: gambar isi kartu tim di ukuran natural (grid 3 kolom) ----
async function drawContentCanvas(members, teamName, weakList, strongList, extraInfo = null) {  const cols = 3
  const rows = Math.ceil(members.length / cols) || 1
  const cellW = 240
  const cellH = 240
  const padding = 24
  const titleH = 64
  const footerH = 78

  const canvas = document.createElement('canvas')
  canvas.width = cellW * cols + padding * 2
  canvas.height = titleH + cellH * rows + footerH + padding * 2
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#F4EEDD'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#22212B'
  ctx.font = 'bold 26px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(teamName ? teamName.toUpperCase() : 'POKEMON TEAM BUILDER', padding, padding + 28)
  ctx.font = '13px sans-serif'
  ctx.fillStyle = '#4A4858'
  ctx.fillText('Pokémon Team Builder', padding, padding + 48)

  const images = await Promise.all(members.map((p) => loadImage(p.sprite)))

  members.forEach((p, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = padding + col * cellW
    const y = titleH + padding + row * cellH

    ctx.strokeStyle = '#22212B'
    ctx.lineWidth = 3
    ctx.strokeRect(x + 8, y + 8, cellW - 16, cellH - 16)

    const img = images[i]
    const spriteSize = 84
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, x + (cellW - spriteSize) / 2, y + 14, spriteSize, spriteSize)

    ctx.fillStyle = '#22212B'
    ctx.font = 'bold 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(p.name, x + cellW / 2, y + 14 + spriteSize + 20)

    let typeY = y + 14 + spriteSize + 40
    const totalTypeWidth = p.types.reduce((w, t) => w + ctx.measureText(t).width + 24, 0)
    let typeX = x + (cellW - totalTypeWidth) / 2
    ctx.font = 'bold 10px sans-serif'
    p.types.forEach((t) => {
      const label = t
      const w = ctx.measureText(label).width + 16
      ctx.fillStyle = TYPE_COLORS[t] ?? '#888'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(typeX, typeY - 11, w, 17, 8)
      else ctx.rect(typeX, typeY - 11, w, 17)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'left'
      ctx.fillText(label, typeX + 8, typeY + 1)
      typeX += w + 8
    })

    ctx.textAlign = 'center'
    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#4A4858'
    ctx.fillText(`Total Stat: ${statTotal(p)}`, x + cellW / 2, y + cellH - 34)
    ctx.font = 'italic 10px sans-serif'
    ctx.fillText(bestAbility(p), x + cellW / 2, y + cellH - 18)
  })

  // ---- Footer: ringkasan kelemahan & kekuatan tim ----
  const footerY = titleH + cellH * rows + padding + 26
  ctx.textAlign = 'left'
  ctx.font = 'bold 12px sans-serif'
  ctx.fillStyle = '#c0392b'
  ctx.fillText(
    `⚠ Kelemahan: ${weakList.length ? weakList.slice(0, 4).join(', ') : 'Tidak ada kelemahan besar'}`,
    padding, footerY,
  )
  ctx.fillStyle = '#2f7d32'
  ctx.fillText(
    `🛡 Tahan: ${strongList.length ? strongList.slice(0, 4).join(', ') : '—'}`,
    padding, footerY + 22,
  )
if (extraInfo?.scoreLabel) {
    ctx.fillStyle = '#22212B'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(`⭐ Skor Tim: ${extraInfo.scoreLabel}`, padding, footerY + 44)
  }

  return canvas
}

// ---- Lapisan 2: tempatkan kartu ke kanvas final sesuai rasio (Square / Wide) + background bertema ----
async function composeFinalCanvas(members, teamName, weakList, strongList, aspect) {
  const content = await drawContentCanvas(members, teamName, weakList, strongList)

  const target = aspect === 'wide' ? { w: 1200, h: 630 } : { w: 1080, h: 1080 }
  const canvas = document.createElement('canvas')
  canvas.width = target.w
  canvas.height = target.h
  const ctx = canvas.getContext('2d')

  const dominantType = getDominantType(members)
  const baseColor = TYPE_COLORS[dominantType] ?? '#D6293E'
  const gradient = ctx.createLinearGradient(0, 0, target.w, target.h)
  gradient.addColorStop(0, shadeColor(baseColor, 20))
  gradient.addColorStop(1, shadeColor(baseColor, -35))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, target.w, target.h)

  const margin = 40
  const availW = target.w - margin * 2
  const availH = target.h - margin * 2
  const scale = Math.min(availW / content.width, availH / content.height, 1)
  const drawW = content.width * scale
  const drawH = content.height * scale
  const dx = (target.w - drawW) / 2
  const dy = (target.h - drawH) / 2

  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 24
  ctx.drawImage(content, dx, dy, drawW, drawH)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  ctx.textAlign = 'right'
  ctx.font = '13px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('dibuat dengan Pokémon Team Builder', target.w - 20, target.h - 16)

  return canvas
}

export default function ShareExport({ team, teamName }) {
  const members = team.filter(Boolean)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [aspect, setAspect] = useState('square')

  if (members.length === 0) return null

  const { weakCount, resistCount, immuneCount } = getTeamTypeCounts(members)
  const weakList = ALL_TYPES.filter((t) => weakCount[t] > 0).sort((a, b) => weakCount[b] - weakCount[a])
  const strongList = ALL_TYPES.filter((t) => resistCount[t] + immuneCount[t] > 0)
    .sort((a, b) => (resistCount[b] + immuneCount[b]) - (resistCount[a] + immuneCount[a]))

  async function handleCopyLink() {
    const ids = members.map((p) => p.id).join(',')
    const url = `${window.location.origin}${window.location.pathname}?team=${ids}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Salin link berikut:', url)
    }
  }

  async function handleDownloadImage() {
    setExporting(true)
    setImgError(false)
    try {
      const canvas = await composeFinalCanvas(members, teamName, weakList, strongList, aspect)
      const link = document.createElement('a')
      link.download = `pokemon-team-${aspect}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      setImgError(true)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={handleCopyLink}
          className="text-[11px] font-semibold px-3 py-2 rounded-full border-2 border-[#22212B] bg-white hover:bg-[#22212B] hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6293E]"
        >
          {copied ? '✓ Link disalin!' : '🔗 Salin Link Tim'}
        </button>

        <div className="flex rounded-full border-2 border-[#22212B] overflow-hidden">
          <button
            onClick={() => setAspect('square')}
            className={`text-[10px] font-semibold px-2.5 py-2 transition-colors ${
              aspect === 'square' ? 'bg-[#22212B] text-white' : 'bg-white text-[#22212B]'
            }`}
          >
            ◻ Square
          </button>
          <button
            onClick={() => setAspect('wide')}
            className={`text-[10px] font-semibold px-2.5 py-2 transition-colors ${
              aspect === 'wide' ? 'bg-[#22212B] text-white' : 'bg-white text-[#22212B]'
            }`}
          >
            ▭ Wide
          </button>
        </div>

        <button
          onClick={handleDownloadImage}
          disabled={exporting}
          className="text-[11px] font-semibold px-3 py-2 rounded-full border-2 border-[#22212B] bg-white hover:bg-[#22212B] hover:text-white transition-colors disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6293E]"
        >
          {exporting ? 'Membuat gambar…' : '🖼 Unduh sebagai Gambar'}
        </button>
      </div>
      {imgError && (
        <p className="w-full text-[10px] text-[#D6293E] mt-1.5">
          Gagal membuat gambar (kemungkinan masalah CORS pada sprite). Coba lagi atau pakai "Salin Link".
        </p>
      )}
    </div>
  )
}