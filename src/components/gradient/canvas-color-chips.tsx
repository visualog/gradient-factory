'use client'

import { Lock, Plus, Unlock, X } from 'lucide-react'
import { PALETTE_BASE_COLOR_COUNT, PALETTE_MAX_COLOR_COUNT } from '@/lib/gradient-model'

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

  return (
    <div
      data-testid="canvas-color-chips"
      className="pointer-events-auto flex h-9 items-center gap-2 rounded-[12px] bg-white/[0.10] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
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
          <label
            className={`block h-5 w-5 cursor-pointer rounded-full border border-white/45 shadow-[0_4px_14px_rgba(0,0,0,0.35)] ring-1 ring-black/25 transition-transform hover:scale-110 focus-within:scale-110 focus-within:ring-2 focus-within:ring-white ${lockedColorIndexes.includes(index) ? 'outline outline-1 outline-offset-2 outline-white/70' : ''}`}
            style={{ backgroundColor: color }}
            title={`Choose color ${index + 1}`}
          >
            <input
              type="color"
              value={color}
              onChange={(event) => updateColor(index, event.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label={`Choose color ${index + 1}`}
            />
          </label>
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
