'use client'

import { useEffect, useRef, useState } from 'react'
import { Lock, Plus, Unlock, X } from 'lucide-react'
import { PALETTE_BASE_COLOR_COUNT, PALETTE_MAX_COLOR_COUNT } from '@/lib/gradient-model'
import { CONTROL_SURFACE_CLASS } from '@/lib/perimeter-controls'

const QUICK_COLORS = ['#FF2E78', '#F15BD9', '#73E8FF', '#7FEAFF', '#5369FF', '#7B35FF', '#58F079', '#D8FF18', '#FF7A30', '#FF4214', '#FFFFFF', '#050505']

export function CanvasColorChips({
  colors,
  updateColor,
  addColor,
  removeColor,
  lockedColorIndexes,
  toggleColorLock,
  showLocks,
}: {
  colors: string[]
  updateColor: (index: number, value: string) => void
  addColor: () => void
  removeColor: (index: number) => void
  lockedColorIndexes: number[]
  toggleColorLock: (index: number) => void
  showLocks: boolean
}) {
  const emptySlotCount = Math.max(0, PALETTE_MAX_COLOR_COUNT - colors.length)
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (activeColorIndex === null) return
    const close = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setActiveColorIndex(null)
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [activeColorIndex])

  return (
    <div
      ref={pickerRef}
      data-testid="canvas-color-chips"
      className={`pointer-events-auto flex items-center gap-2 px-3 ${CONTROL_SURFACE_CLASS}`}
    >
      {colors.map((color, index) => (
        <span key={`${color}-${index}`} className="group/palette-chip relative block h-5 w-5 shrink-0">
          {showLocks ? (
            <button
              type="button"
              onClick={() => toggleColorLock(index)}
              className={`absolute -left-1.5 -top-1.5 z-10 grid h-3.5 w-3.5 place-items-center rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.35)] transition-opacity hover:opacity-100 focus-visible:opacity-100 group-hover/palette-chip:opacity-100 ${lockedColorIndexes.includes(index) ? 'bg-[var(--pg-text)] text-[var(--pg-bg)] opacity-100' : 'bg-black/65 text-white opacity-0'}`}
              title={lockedColorIndexes.includes(index) ? `Unlock color ${index + 1}` : `Lock color ${index + 1}`}
              aria-label={lockedColorIndexes.includes(index) ? `Unlock color ${index + 1}` : `Lock color ${index + 1}`}
            >
              {lockedColorIndexes.includes(index) ? <Lock size={8} strokeWidth={2.2} /> : <Unlock size={8} strokeWidth={2.2} />}
            </button>
          ) : null}
          <button
            type="button"
            className={`block h-5 w-5 cursor-pointer rounded-full border border-white/45 shadow-[0_4px_14px_rgba(0,0,0,0.35)] ring-1 ring-black/25 transition-transform hover:scale-110 focus-within:scale-110 focus-within:ring-2 focus-within:ring-white ${lockedColorIndexes.includes(index) ? 'outline outline-1 outline-offset-2 outline-white/70' : ''}`}
            style={{ backgroundColor: color }}
            title={`Choose color ${index + 1}`}
            aria-label={`Choose color ${index + 1}`}
            onClick={() => setActiveColorIndex(activeColorIndex === index ? null : index)}
          >
          </button>
          {activeColorIndex === index ? (
            <ColorChipPanel color={color} index={index} updateColor={updateColor} close={() => setActiveColorIndex(null)} />
          ) : null}
          {index >= PALETTE_BASE_COLOR_COUNT ? (
            <button
              type="button"
              onClick={() => removeColor(index)}
              className="absolute -right-1.5 -top-1.5 z-10 grid h-3.5 w-3.5 place-items-center rounded-full bg-[var(--pg-text)] text-[var(--pg-bg)] opacity-0 shadow-[0_3px_8px_rgba(0,0,0,0.35)] transition-opacity hover:opacity-100 focus-visible:opacity-100 group-hover/palette-chip:opacity-100"
              title={`Remove color ${index + 1}`}
              aria-label={`Remove color ${index + 1}`}
            >
              <X size={9} strokeWidth={2.2} />
            </button>
          ) : null}
        </span>
      ))}
      {Array.from({ length: emptySlotCount }).map((_, index) => (
        <button
          key={`empty-color-${index}`}
          type="button"
          onClick={addColor}
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-dashed border-white/35 text-[var(--pg-text)] opacity-70 transition-[background-color,border-color,opacity,transform] hover:scale-110 hover:border-white/70 hover:bg-black/[0.16] hover:opacity-100 focus-visible:scale-110 focus-visible:border-white/70 focus-visible:bg-black/[0.16] focus-visible:opacity-100 focus-visible:outline-none"
          title="Add color"
          aria-label="Add color"
        >
          <Plus size={12} strokeWidth={2} />
        </button>
      ))}
    </div>
  )
}

function normalizeHex(value: string) {
  const compact = value.replace(/[^0-9a-f]/gi, '').slice(0, 6).toUpperCase()
  return compact.length === 6 ? `#${compact}` : null
}

function ColorChipPanel({
  color,
  index,
  updateColor,
  close,
}: {
  color: string
  index: number
  updateColor: (index: number, value: string) => void
  close: () => void
}) {
  const [draft, setDraft] = useState(color.replace('#', '').toUpperCase())

  useEffect(() => {
    setDraft(color.replace('#', '').toUpperCase())
  }, [color])

  const commit = (value: string) => {
    const next = normalizeHex(value)
    if (next) updateColor(index, next)
  }

  return (
    <div className="absolute bottom-full left-0 z-[70] mb-2 w-[188px] rounded-[12px] border border-white/10 bg-[#151820]/95 p-2.5 text-[var(--pg-text)] shadow-[0_16px_42px_rgba(0,0,0,0.38)] backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-7 w-7 shrink-0 rounded-[9px] border border-white/20 shadow-[0_6px_18px_rgba(0,0,0,0.32)]" style={{ backgroundColor: color }} />
        <input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value.toUpperCase())
            commit(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') close()
            if (event.key === 'Escape') close()
          }}
          className="h-8 min-w-0 flex-1 rounded-[8px] bg-white/[0.07] px-2 text-xs font-semibold uppercase tabular-nums outline-none transition-colors focus:bg-white/[0.10] focus:ring-1 focus:ring-white/15"
          aria-label={`Hex color ${index + 1}`}
        />
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {QUICK_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => {
              updateColor(index, swatch)
              close()
            }}
            className="h-5 w-5 rounded-full border border-white/25 shadow-[0_4px_10px_rgba(0,0,0,0.28)] outline-none transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-white"
            style={{ backgroundColor: swatch }}
            aria-label={`Set color ${swatch}`}
          />
        ))}
      </div>
    </div>
  )
}
