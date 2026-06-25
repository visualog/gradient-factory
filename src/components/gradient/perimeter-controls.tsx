'use client'

import type { Dispatch, SetStateAction } from 'react'
import { GRADIENT_STYLES, GRADIENT_STYLE_LABELS, WARP_SHAPES, WARP_SHAPE_LABELS, type GradientStyle, type WarpShape } from '@/lib/style-presets'
import { NOISE_MAX, VIGNETTE_MAX } from '@/lib/gradient-model'
import { KO_GRADIENT_STYLE_LABELS, KO_WARP_SHAPE_LABELS } from '@/lib/control-labels'
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
  variant = 'standard',
}: PerimeterControlsProps) {
  const isUiGlow = variant === 'ui-glow'
  const styleOptions = isUiGlow ? UI_GRADIENT_STYLES : GRADIENT_STYLES
  const styleLabels = isUiGlow ? KO_GRADIENT_STYLE_LABELS : GRADIENT_STYLE_LABELS
  const motionLabels = isUiGlow ? KO_WARP_SHAPE_LABELS : WARP_SHAPE_LABELS
  const warpLabel = isUiGlow ? '흐름' : '왜곡'
  const spreadLabel = isUiGlow ? '광량' : '확산'
  const noiseLabel = isUiGlow ? '입자' : '노이즈'

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-visible text-[var(--pg-text)]">
      <div className="pointer-events-auto absolute" style={perimeterControlStyle('style', previewWidth)}>
        <Select value={style} onValueChange={(value) => setStyle(value as GradientStyle)}>
          <SelectTrigger aria-label={isUiGlow ? '레퍼런스 스타일' : '그라디언트 스타일'} className={`${CONTROL_SURFACE_CLASS} w-full px-3 text-xs`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {styleOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {styleLabels[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pointer-events-auto absolute" style={perimeterControlStyle('warpShape', previewWidth)}>
        <Select value={warpShape} onValueChange={(value) => setWarpShape(value as WarpShape)}>
          <SelectTrigger aria-label={isUiGlow ? '레퍼런스 모션' : '왜곡 형태'} className={`${CONTROL_SURFACE_CLASS} w-full px-3 text-xs`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-36">
            {WARP_SHAPES.map((option) => (
              <SelectItem key={option} value={option}>
                {motionLabels[option]}
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
            label="외곽 음영"
            previewWidth={previewWidth}
            value={vignette}
            max={VIGNETTE_MAX}
            step={0.01}
            onChange={setVignette}
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
