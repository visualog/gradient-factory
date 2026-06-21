'use client'

import type { Dispatch, SetStateAction } from 'react'
import { GRADIENT_STYLES, WARP_SHAPES, type GradientStyle, type WarpShape } from '@/lib/style-presets'
import { NOISE_MAX } from '@/lib/gradient-model'
import { perimeterControlStyle } from '@/lib/perimeter-controls'
import { CornerSlider } from '@/components/gradient/corner-slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

type PerimeterControlsProps = {
  previewWidth: number
  style: GradientStyle
  setStyle: Dispatch<SetStateAction<GradientStyle>>
  warpShape: WarpShape
  setWarpShape: Dispatch<SetStateAction<WarpShape>>
  warp: number
  setWarp: Dispatch<SetStateAction<number>>
  warpSize: number
  setWarpSize: Dispatch<SetStateAction<number>>
  noise: number
  setNoise: Dispatch<SetStateAction<number>>
}

export function PerimeterControls({
  previewWidth,
  style,
  setStyle,
  warpShape,
  setWarpShape,
  warp,
  setWarp,
  warpSize,
  setWarpSize,
  noise,
  setNoise,
}: PerimeterControlsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible text-[var(--pg-text)]">
      <div className="pointer-events-auto absolute" style={perimeterControlStyle('style', previewWidth)}>
        <Select value={style} onValueChange={(value) => setStyle(value as GradientStyle)}>
          <SelectTrigger className="h-9 w-full rounded-[12px] bg-white/[0.10] px-3 text-xs shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {GRADIENT_STYLES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pointer-events-auto absolute" style={perimeterControlStyle('warpShape', previewWidth)}>
        <Select value={warpShape} onValueChange={(value) => setWarpShape(value as WarpShape)}>
          <SelectTrigger className="h-9 w-full rounded-[12px] bg-white/[0.10] px-3 text-xs shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {WARP_SHAPES.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ControlSlider
        label="Warp"
        widthClass="w-8"
        style={perimeterControlStyle('warp', previewWidth)}
        value={warp}
        max={1.5}
        step={0.01}
        onChange={setWarp}
      />
      <CornerSlider
        controlId="warpSize"
        label="Warp Size"
        previewWidth={previewWidth}
        value={warpSize}
        max={3}
        step={0.01}
        onChange={setWarpSize}
      />
      <CornerSlider
        controlId="noise"
        label="Noise"
        previewWidth={previewWidth}
        value={noise}
        max={NOISE_MAX}
        step={0.001}
        onChange={setNoise}
      />
    </div>
  )
}

function ControlSlider({
  label,
  widthClass,
  style,
  value,
  max,
  step,
  onChange,
}: {
  label: string
  widthClass?: string
  style: React.CSSProperties
  value: number
  max: number
  step: number
  onChange: Dispatch<SetStateAction<number>>
}) {
  return (
    <div
      className="pointer-events-auto absolute flex h-9 items-center gap-2 rounded-[12px] bg-white/[0.10] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
      style={style}
    >
      <span className={`${widthClass ?? 'shrink-0'} whitespace-nowrap text-[11px] font-medium text-white/80`}>{label}</span>
      <Slider
        aria-label={label}
        className="min-w-[160px]"
        min={0}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}
