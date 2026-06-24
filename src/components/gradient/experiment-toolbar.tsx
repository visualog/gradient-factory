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
const STEP_TRACK_CURVE_START = { x: 176, y: 18 }
const STEP_TRACK_CURVE_END = { x: 206, y: 31 }
const STEP_TRACK_CONTROL_1 = { x: 190, y: 18 }
const STEP_TRACK_CONTROL_2 = { x: 205, y: 20 }
const STEP_TRACK_STRAIGHT_LENGTH = STEP_TRACK_CURVE_START.x - STEP_TRACK_START.x
const STEP_TRACK_CURVE_LENGTH = 34
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
    <div className="pointer-events-auto absolute bottom-full left-0 z-[80] mb-14 flex max-w-full flex-nowrap items-center gap-2 text-[var(--pg-text)]">
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

function cubicPoint(t: number) {
  const mt = 1 - t
  return {
    x: mt ** 3 * STEP_TRACK_CURVE_START.x + 3 * mt ** 2 * t * STEP_TRACK_CONTROL_1.x + 3 * mt * t ** 2 * STEP_TRACK_CONTROL_2.x + t ** 3 * STEP_TRACK_CURVE_END.x,
    y: mt ** 3 * STEP_TRACK_CURVE_START.y + 3 * mt ** 2 * t * STEP_TRACK_CONTROL_1.y + 3 * mt * t ** 2 * STEP_TRACK_CONTROL_2.y + t ** 3 * STEP_TRACK_CURVE_END.y,
  }
}

function splitCubic(t: number) {
  const p01 = lerpPoint(STEP_TRACK_CURVE_START, STEP_TRACK_CONTROL_1, t)
  const p12 = lerpPoint(STEP_TRACK_CONTROL_1, STEP_TRACK_CONTROL_2, t)
  const p23 = lerpPoint(STEP_TRACK_CONTROL_2, STEP_TRACK_CURVE_END, t)
  const p012 = lerpPoint(p01, p12, t)
  const p123 = lerpPoint(p12, p23, t)
  const p0123 = lerpPoint(p012, p123, t)

  return { c1: p01, c2: p012, end: p0123 }
}

function lerpPoint(a: { x: number; y: number }, b: { x: number; y: number }, t: number) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function stepsPoint(progress: number) {
  if (progress <= STEP_TRACK_STRAIGHT_RATIO) {
    const t = progress / STEP_TRACK_STRAIGHT_RATIO
    return { x: STEP_TRACK_START.x + STEP_TRACK_STRAIGHT_LENGTH * t, y: STEP_TRACK_START.y }
  }

  return cubicPoint((progress - STEP_TRACK_STRAIGHT_RATIO) / (1 - STEP_TRACK_STRAIGHT_RATIO))
}

function stepsProgressPath(progress: number) {
  if (progress <= 0) return ''
  if (progress <= STEP_TRACK_STRAIGHT_RATIO) {
    const point = stepsPoint(progress)
    return `M ${STEP_TRACK_START.x} ${STEP_TRACK_START.y} L ${point.x} ${point.y}`
  }

  const t = (progress - STEP_TRACK_STRAIGHT_RATIO) / (1 - STEP_TRACK_STRAIGHT_RATIO)
  const split = splitCubic(t)

  return `M ${STEP_TRACK_START.x} ${STEP_TRACK_START.y} L ${STEP_TRACK_CURVE_START.x} ${STEP_TRACK_CURVE_START.y} C ${split.c1.x} ${split.c1.y} ${split.c2.x} ${split.c2.y} ${split.end.x} ${split.end.y}`
}

function valueFromStepsPointer(event: PointerEvent<SVGSVGElement>) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const curveStartX = STEP_TRACK_CURVE_START.x
  const straightProgress = Math.max(0, Math.min(1, (x - STEP_TRACK_START.x) / STEP_TRACK_STRAIGHT_LENGTH))

  if (x <= curveStartX) return Math.round(straightProgress * STEP_TRACK_STRAIGHT_RATIO * GRADIENT_STEPS_MAX)

  const curveProgressX = (x - curveStartX) / (STEP_TRACK_CURVE_END.x - curveStartX)
  const curveProgressY = (y - STEP_TRACK_CURVE_START.y) / (STEP_TRACK_CURVE_END.y - STEP_TRACK_CURVE_START.y)
  const curveProgress = Math.max(0, Math.min(1, Math.max(curveProgressX, curveProgressY)))
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
  const trackPath = `M ${STEP_TRACK_START.x} ${STEP_TRACK_START.y} L ${STEP_TRACK_CURVE_START.x} ${STEP_TRACK_CURVE_START.y} C ${STEP_TRACK_CONTROL_1.x} ${STEP_TRACK_CONTROL_1.y} ${STEP_TRACK_CONTROL_2.x} ${STEP_TRACK_CONTROL_2.y} ${STEP_TRACK_CURVE_END.x} ${STEP_TRACK_CURVE_END.y}`

  const update = (event: PointerEvent<SVGSVGElement>) => {
    event.preventDefault()
    setSteps(stepAmountFromSliderValue(valueFromStepsPointer(event)))
  }

  const release = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  return (
    <svg
      className="group/steps-slider h-9 w-[222px] shrink-0 touch-none overflow-visible text-[var(--pg-text)] drop-shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
      viewBox="0 0 222 40"
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
        d="M 12 0 H 181 C 205 0 222 16 222 40 H 12 A 12 12 0 0 1 0 28 V 12 A 12 12 0 0 1 12 0 Z"
        className="cursor-pointer fill-white/[0.10] transition-colors group-hover/steps-slider:fill-white/[0.06] group-active/steps-slider:fill-white/[0.08]"
      />
      <text x="12" y="22" className="pointer-events-none fill-current text-[11px] font-medium opacity-80">Steps</text>
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" strokeLinecap="round" pathLength={100} />
      {progressPath ? <path d={progressPath} fill="none" stroke="var(--pg-accent)" strokeWidth="6" strokeLinecap="round" /> : null}
      <circle cx={thumb.x} cy={thumb.y} r="7" className="cursor-grab active:cursor-grabbing" fill="var(--pg-text)" stroke="var(--pg-bg)" strokeWidth="1.5" />
    </svg>
  )
}
