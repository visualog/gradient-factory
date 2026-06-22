'use client'

import { Lock, Shuffle, Sparkles, Unlock } from 'lucide-react'
import type { CanvasSizePreset, ExperimentLock } from '@/hooks/use-gradient-experiment'

type ExperimentToolbarProps = {
  generateVariation: () => void
  shufflePalette: () => void
  applyCanvasPreset: (presetIndex: number) => void
  experimentLocks: ExperimentLock[]
  toggleExperimentLock: (lock: ExperimentLock) => void
  sizePresets: CanvasSizePreset[]
}

const EXPERIMENT_LOCKS: ExperimentLock[] = ['points', 'style', 'warp', 'noise']
const LOCK_LABELS: Record<ExperimentLock, string> = {
  points: 'P',
  style: 'S',
  warp: 'W',
  noise: 'N',
}

export function ExperimentToolbar({
  generateVariation,
  shufflePalette,
  applyCanvasPreset,
  experimentLocks,
  toggleExperimentLock,
  sizePresets,
}: ExperimentToolbarProps) {
  const buttonClass = 'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[12px] bg-transparent px-2.5 text-xs font-medium text-[var(--pg-text)] outline-none transition-colors hover:bg-black/[0.16] focus-visible:bg-black/[0.16] focus-visible:ring-1 focus-visible:ring-white/15 active:bg-black/[0.22]'
  const compactButtonClass = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-transparent text-xs font-semibold text-[var(--pg-text)] outline-none transition-colors hover:bg-black/[0.16] focus-visible:bg-black/[0.16] focus-visible:ring-1 focus-visible:ring-white/15 active:bg-black/[0.22]'
  const lockButtonClass = (lock: ExperimentLock) =>
    `${compactButtonClass} ${experimentLocks.includes(lock) ? 'bg-[var(--pg-text)] text-[var(--pg-bg)] hover:bg-[var(--pg-text)]' : ''}`

  return (
    <div className="pointer-events-auto absolute bottom-full left-0 z-[80] mb-14 flex max-w-full flex-nowrap items-center gap-1 rounded-[14px] bg-white/[0.10] p-1.5 text-[var(--pg-text)] shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <button type="button" onClick={generateVariation} className={buttonClass} title="Generate a new variation">
        <Sparkles size={14} strokeWidth={1.9} />
        <span>Generate</span>
      </button>
      <button type="button" onClick={shufflePalette} className={buttonClass} title="Shuffle unlocked colors">
        <Shuffle size={14} strokeWidth={1.9} />
        <span>Shuffle</span>
      </button>
      <div className="mx-1 h-5 w-px bg-white/15" />
      {EXPERIMENT_LOCKS.map((lock) => (
        <button
          key={lock}
          type="button"
          onClick={() => toggleExperimentLock(lock)}
          className={lockButtonClass(lock)}
          title={experimentLocks.includes(lock) ? `Unlock ${lock}` : `Lock ${lock}`}
          aria-pressed={experimentLocks.includes(lock)}
        >
          {experimentLocks.includes(lock) ? <Lock size={12} strokeWidth={2} /> : <Unlock size={12} strokeWidth={2} />}
          <span>{LOCK_LABELS[lock]}</span>
        </button>
      ))}
      <SizePresetSelect presets={sizePresets} onChange={applyCanvasPreset} />
    </div>
  )
}

function SizePresetSelect({
  presets,
  onChange,
}: {
  presets: CanvasSizePreset[]
  onChange: (presetIndex: number) => void
}) {
  const platforms: CanvasSizePreset['platform'][] = ['Web', 'Mobile', 'Social']

  return (
    <label className="relative shrink-0">
      <span className="sr-only">Canvas size preset</span>
      <select
        defaultValue=""
        onChange={(event) => {
          const index = Number(event.target.value)
          if (Number.isNaN(index)) return
          onChange(index)
          event.currentTarget.value = ''
        }}
        className="h-8 w-[178px] rounded-[12px] border-0 bg-transparent px-2.5 text-xs font-medium text-[var(--pg-text)] outline-none transition-colors hover:bg-black/[0.16] focus:bg-black/[0.16] focus:ring-1 focus:ring-white/15"
        title="Choose canvas size"
      >
        <option value="" disabled>
          Size preset
        </option>
        {platforms.map((platform) => (
          <optgroup key={platform} label={platform}>
            {presets.map((preset, index) =>
              preset.platform === platform ? (
                <option key={`${preset.platform}-${preset.label}`} value={index}>
                  {preset.label} - {preset.width} x {preset.height}
                </option>
              ) : null
            )}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
