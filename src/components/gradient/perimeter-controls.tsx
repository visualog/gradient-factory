'use client'

import type { Dispatch, SetStateAction } from 'react'
import { GRADIENT_STYLES, GRADIENT_STYLE_LABELS, WARP_SHAPES, WARP_SHAPE_LABELS, type GradientStyle, type WarpShape } from '@/lib/style-presets'
import { GRADIENT_MASK_EFFECTS, GRADIENT_MASK_LABELS, type GradientMaskEffect } from '@/lib/gradient-mask-effects'
import { GRADIENT_STEPS_MAX, stepAmountFromSliderValue, stepSliderValueFromAmount } from '@/lib/gradient-step-blend'
import { NOISE_MAX, VIGNETTE_MAX } from '@/lib/gradient-model'
import { CONTROL_INTERACTIVE_SURFACE_CLASS, CONTROL_SURFACE_CLASS, SLIDER_LABEL_GAP, SLIDER_TRACK_LENGTH, perimeterControlStyle } from '@/lib/perimeter-controls'
import { UI_GRADIENT_STYLES } from '@/lib/ui-gradient-presets'
import { CornerSlider } from '@/components/gradient/corner-slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

type PerimeterControlsProps = {
  previewWidth: number
  style: GradientStyle
  setStyle: (value: GradientStyle) => void
  warpShape: WarpShape
  setWarpShape: Dispatch<SetStateAction<WarpShape>>
  warp: number
  setWarp: Dispatch<SetStateAction<number>>
  warpSize: number
  setWarpSize: Dispatch<SetStateAction<number>>
  noise: number
  setNoise: Dispatch<SetStateAction<number>>
  vignette: number
  setVignette: Dispatch<SetStateAction<number>>
  mask: GradientMaskEffect
  setMask: Dispatch<SetStateAction<GradientMaskEffect>>
  steps: number
  setSteps: Dispatch<SetStateAction<number>>
  variant?: 'standard' | 'ui-glow'
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
  vignette,
  setVignette,
  mask,
  setMask,
  steps,
  setSteps,
  variant = 'standard',
}: PerimeterControlsProps) {
  const isUiGlow = variant === 'ui-glow'
  const styleOptions = isUiGlow ? UI_GRADIENT_STYLES : GRADIENT_STYLES
  const warpLabel = isUiGlow ? 'Flow' : 'Warp'
  const spreadLabel = isUiGlow ? 'Bloom' : 'Spread'
  const noiseLabel = isUiGlow ? 'Grain' : 'Noise'

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible text-[var(--pg-text)]">
      <div className="pointer-events-auto absolute" style={perimeterControlStyle('style', previewWidth)}>
        <Select value={style} onValueChange={(value) => setStyle(value as GradientStyle)}>
          <SelectTrigger aria-label={isUiGlow ? 'Reference style' : 'Gradient style'} className={`${CONTROL_SURFACE_CLASS} w-full px-3 text-xs`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {styleOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {GRADIENT_STYLE_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pointer-events-auto absolute" style={perimeterControlStyle('warpShape', previewWidth)}>
        <Select value={warpShape} onValueChange={(value) => setWarpShape(value as WarpShape)}>
          <SelectTrigger aria-label={isUiGlow ? 'Reference motion' : 'Warp shape'} className={`${CONTROL_SURFACE_CLASS} w-full px-3 text-xs`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {WARP_SHAPES.map((option) => (
              <SelectItem key={option} value={option}>
                {WARP_SHAPE_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ControlSlider
        label={warpLabel}
        style={perimeterControlStyle('warp', previewWidth)}
        value={warp}
        max={1.5}
        step={0.01}
        onChange={setWarp}
      />
      <CornerSlider
        controlId="warpSize"
        label={spreadLabel}
        previewWidth={previewWidth}
        value={warpSize}
        max={3}
        step={0.01}
        onChange={setWarpSize}
      />
      <CornerSlider
        controlId="noise"
        label={noiseLabel}
        previewWidth={previewWidth}
        value={noise}
        max={NOISE_MAX}
        step={0.001}
        onChange={setNoise}
      />
      {isUiGlow ? (
        <>
          <CornerSlider
            controlId="vignette"
            label="Vignette"
            previewWidth={previewWidth}
            value={vignette}
            max={VIGNETTE_MAX}
            step={0.01}
            onChange={setVignette}
          />
          <div className="pointer-events-auto absolute" style={perimeterControlStyle('mask', previewWidth)}>
            <Select value={mask} onValueChange={(value) => setMask(value as GradientMaskEffect)}>
              <SelectTrigger aria-label="Mask effect" className={`${CONTROL_SURFACE_CLASS} w-full px-3 text-xs`}>
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
          <CornerSlider
            controlId="steps"
            label="Steps"
            previewWidth={previewWidth}
            value={stepSliderValueFromAmount(steps)}
            max={GRADIENT_STEPS_MAX}
            step={1}
            onChange={(value) => setSteps(stepAmountFromSliderValue(value))}
          />
        </>
      ) : null}
    </div>
  )
}

function ControlSlider({
  label,
  style,
  value,
  max,
  step,
  onChange,
}: {
  label: string
  style: React.CSSProperties
  value: number
  max: number
  step: number
  onChange: Dispatch<SetStateAction<number>>
}) {
  return (
    <div
      className={`pointer-events-auto absolute flex items-center px-3 ${CONTROL_INTERACTIVE_SURFACE_CLASS}`}
      style={{ ...style, gap: SLIDER_LABEL_GAP }}
    >
      <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-white/80">{label}</span>
      <Slider
        aria-label={label}
        className="shrink-0"
        style={{ width: SLIDER_TRACK_LENGTH }}
        min={0}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}
