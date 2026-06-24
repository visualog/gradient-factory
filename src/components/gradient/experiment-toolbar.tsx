'use client'

import type { Dispatch, PointerEvent, SetStateAction } from 'react'
import { Lock, Shuffle, Sparkles, Unlock } from 'lucide-react'
import type { ExperimentLock } from '@/hooks/use-gradient-experiment'
import { GRADIENT_MASK_EFFECTS, GRADIENT_MASK_LABELS, type GradientMaskEffect } from '@/lib/gradient-mask-effects'
import { GRADIENT_STEPS_MAX, stepAmountFromSliderValue, stepSliderValueFromAmount } from '@/lib/gradient-step-blend'
import { CONTROL_SURFACE_CLASS } from '@/lib/perimeter-controls'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ExperimentToolbarProps = {
  generateVariation: () => void
  shufflePalette: () => void
  experimentLocks: ExperimentLock[]
  toggleExperimentLock: (lock: ExperimentLock) => void
  mask: GradientMaskEffect
  setMask: Dispatch<SetStateAction<GradientMaskEffect>>
  steps: number
  setSteps: Dispatch<SetStateAction<number>>
}

const EXPERIMENT_LOCKS: ExperimentLock[] = ['points', 'style', 'warp', 'noise']
const LOCK_LABELS: Record<ExperimentLock, string> = {
  points: 'P',
  style: 'S',
  warp: 'W',
  noise: 'N',
}
const STEP_TRACK_START = { x: 70, y: 18 }
const STEP_TRACK_CURVE_START = { x: 154, y: 18 }
const STEP_TRACK_ARC_RADIUS = 104
const STEP_TRACK_ARC_END_ANGLE = Math.asin(56 / STEP_TRACK_ARC_RADIUS)
const STEP_TRACK_CURVE_END = {
  x: STEP_TRACK_CURVE_START.x + STEP_TRACK_ARC_RADIUS * Math.sin(STEP_TRACK_ARC_END_ANGLE),
  y: STEP_TRACK_CURVE_START.y + STEP_TRACK_ARC_RADIUS * (1 - Math.cos(STEP_TRACK_ARC_END_ANGLE)),
}
const STEP_SURFACE_PATH = 'M 12 0 H 154 A 112 112 0 0 1 222 26 V 42 H 210 A 12 12 0 0 1 198 30 V 36 H 12 A 12 12 0 0 1 0 24 V 12 A 12 12 0 0 1 12 0 Z'
const STEP_TRACK_STRAIGHT_LENGTH = STEP_TRACK_CURVE_START.x - STEP_TRACK_START.x
const STEP_TRACK_CURVE_LENGTH = STEP_TRACK_ARC_RADIUS * STEP_TRACK_ARC_END_ANGLE
const STEP_TRACK_TOTAL_LENGTH = STEP_TRACK_STRAIGHT_LENGTH + STEP_TRACK_CURVE_LENGTH
const STEP_TRACK_STRAIGHT_RATIO = STEP_TRACK_STRAIGHT_LENGTH / STEP_TRACK_TOTAL_LENGTH

export function ExperimentToolbar({
  generateVariation,
  shufflePalette,
  experimentLocks,
  toggleExperimentLock,
  mask,
  setMask,
  steps,
  setSteps,
}: ExperimentToolbarProps) {
  const buttonClass = 'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[12px] bg-transparent px-2.5 text-xs font-medium text-[var(--pg-text)] outline-none transition-colors hover:bg-black/[0.16] focus-visible:bg-black/[0.16] focus-visible:ring-1 focus-visible:ring-white/15 active:bg-black/[0.22]'
  const compactButtonClass = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-transparent text-xs font-semibold text-[var(--pg-text)] outline-none transition-colors hover:bg-black/[0.16] focus-visible:bg-black/[0.16] focus-visible:ring-1 focus-visible:ring-white/15 active:bg-black/[0.22]'
  const lockButtonClass = (lock: ExperimentLock) =>
    `${compactButtonClass} ${experimentLocks.includes(lock) ? 'bg-[var(--pg-text)] text-[var(--pg-bg)] hover:bg-[var(--pg-text)]' : ''}`

  return (
    <div className="pointer-events-auto absolute bottom-full left-0 z-[80] mb-14 flex max-w-full flex-nowrap items-center gap-1.5 text-[var(--pg-text)]">
      <div className={`flex flex-nowrap items-center gap-1 px-1.5 ${CONTROL_SURFACE_CLASS}`}>
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
      <div className={`flex w-[124px] items-center px-1.5 ${CONTROL_SURFACE_CLASS}`}>
        <Select value={mask} onValueChange={(value) => setMask(value as GradientMaskEffect)}>
          <SelectTrigger aria-label="Mask effect" className="h-8 w-full rounded-[10px] bg-transparent px-2 text-xs hover:bg-transparent focus:bg-transparent focus:ring-0 data-[state=open]:bg-transparent data-[state=open]:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {GRADIENT_MASK_EFFECTS.map((option) => (
              <SelectItem key={option} value={option}>
                {GRADIENT_MASK_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <StepsCornerSlider steps={steps} setSteps={setSteps} />
    </div>
  )
}

function arcPoint(t: number) {
  const angle = STEP_TRACK_ARC_END_ANGLE * t
  return {
    x: STEP_TRACK_CURVE_START.x + STEP_TRACK_ARC_RADIUS * Math.sin(angle),
    y: STEP_TRACK_CURVE_START.y + STEP_TRACK_ARC_RADIUS * (1 - Math.cos(angle)),
  }
}

function stepsPoint(progress: number) {
  if (progress <= STEP_TRACK_STRAIGHT_RATIO) {
    const t = progress / STEP_TRACK_STRAIGHT_RATIO
    return { x: STEP_TRACK_START.x + STEP_TRACK_STRAIGHT_LENGTH * t, y: STEP_TRACK_START.y }
  }

  return arcPoint((progress - STEP_TRACK_STRAIGHT_RATIO) / (1 - STEP_TRACK_STRAIGHT_RATIO))
}

function stepsProgressPath(progress: number) {
  if (progress <= 0) return ''
  if (progress <= STEP_TRACK_STRAIGHT_RATIO) {
    const point = stepsPoint(progress)
    return `M ${STEP_TRACK_START.x} ${STEP_TRACK_START.y} L ${point.x} ${point.y}`
  }

  const point = arcPoint((progress - STEP_TRACK_STRAIGHT_RATIO) / (1 - STEP_TRACK_STRAIGHT_RATIO))

  return `M ${STEP_TRACK_START.x} ${STEP_TRACK_START.y} L ${STEP_TRACK_CURVE_START.x} ${STEP_TRACK_CURVE_START.y} A ${STEP_TRACK_ARC_RADIUS} ${STEP_TRACK_ARC_RADIUS} 0 0 1 ${point.x} ${point.y}`
}

function valueFromStepsPointer(event: PointerEvent<SVGSVGElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const curveStartX = STEP_TRACK_CURVE_START.x
  const straightProgress = Math.max(0, Math.min(1, (x - STEP_TRACK_START.x) / STEP_TRACK_STRAIGHT_LENGTH))

  if (x <= curveStartX) return Math.round(straightProgress * STEP_TRACK_STRAIGHT_RATIO * GRADIENT_STEPS_MAX)

  const angle = Math.atan2(x - curveStartX, STEP_TRACK_ARC_RADIUS - (y - STEP_TRACK_CURVE_START.y))
  const curveProgress = Math.max(0, Math.min(1, angle / STEP_TRACK_ARC_END_ANGLE))
  const progress = STEP_TRACK_STRAIGHT_RATIO + curveProgress * (1 - STEP_TRACK_STRAIGHT_RATIO)

  return Math.round(Math.max(0, Math.min(1, progress)) * GRADIENT_STEPS_MAX)
}

function StepsCornerSlider({
  steps,
  setSteps,
}: {
  steps: number
  setSteps: Dispatch<SetStateAction<number>>
}) {
  const sliderValue = stepSliderValueFromAmount(steps)
  const progress = sliderValue / GRADIENT_STEPS_MAX
  const thumb = stepsPoint(progress)
  const progressPath = stepsProgressPath(progress)
  const trackPath = `M ${STEP_TRACK_START.x} ${STEP_TRACK_START.y} L ${STEP_TRACK_CURVE_START.x} ${STEP_TRACK_CURVE_START.y} A ${STEP_TRACK_ARC_RADIUS} ${STEP_TRACK_ARC_RADIUS} 0 0 1 ${STEP_TRACK_CURVE_END.x} ${STEP_TRACK_CURVE_END.y}`

  const update = (event: PointerEvent<SVGSVGElement>) => {
    event.preventDefault()
    setSteps(stepAmountFromSliderValue(valueFromStepsPointer(event)))
  }

  const release = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <svg
      className="group/steps-slider h-[48px] w-[236px] shrink-0 self-start touch-none overflow-visible text-[var(--pg-text)] drop-shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
      viewBox="0 0 236 48"
      aria-label="Steps"
      role="slider"
      aria-valuemin={0}
      aria-valuemax={GRADIENT_STEPS_MAX}
      aria-valuenow={sliderValue}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        update(event)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId) || event.buttons === 1) update(event)
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <path
        d={STEP_SURFACE_PATH}
        className="cursor-pointer fill-white/[0.10] transition-colors group-hover/steps-slider:fill-white/[0.06] group-active/steps-slider:fill-white/[0.08]"
      />
      <text x="12" y="22" className="pointer-events-none fill-current text-[11px] font-medium opacity-80">Steps</text>
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" strokeLinecap="round" pathLength={100} />
      {progressPath ? <path d={progressPath} fill="none" stroke="var(--pg-accent)" strokeWidth="6" strokeLinecap="round" /> : null}
      <circle cx={thumb.x} cy={thumb.y} r="7" className="cursor-grab active:cursor-grabbing" fill="var(--pg-text)" stroke="var(--pg-bg)" strokeWidth="1.5" />
    </svg>
  )
}
