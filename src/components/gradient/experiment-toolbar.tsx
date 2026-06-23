'use client'

import { Lock, Shuffle, Sparkles, Unlock } from 'lucide-react'
import type { ExperimentLock } from '@/hooks/use-gradient-experiment'

type ExperimentToolbarProps = {
  generateVariation: () => void
  shufflePalette: () => void
  experimentLocks: ExperimentLock[]
  toggleExperimentLock: (lock: ExperimentLock) => void
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
  experimentLocks,
  toggleExperimentLock,
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
    </div>
  )
}
