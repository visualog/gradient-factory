'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import type { CanvasSizePreset } from '@/hooks/use-gradient-experiment'
import { CANVAS_MIN_HEIGHT, CANVAS_MIN_WIDTH } from '@/lib/gradient-model'
import { SizeInput } from '@/components/gradient/size-input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'

type CanvasSizeControlsProps = {
  width: number
  height: number
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
  presets?: CanvasSizePreset[]
  onPresetSelect?: (presetIndex: number) => void
}

const SIZE_PLATFORMS: CanvasSizePreset['platform'][] = ['Web', 'Mobile', 'Social']

export function CanvasSizeControls({
  width,
  height,
  setWidth,
  setHeight,
  presets = [],
  onPresetSelect,
}: CanvasSizeControlsProps) {
  const showPresets = presets.length > 0 && Boolean(onPresetSelect)
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null)
  const presetValue = selectedPresetIndex === null ? 'custom' : String(selectedPresetIndex)
  const presetLabel = selectedPresetIndex === null ? 'Custom' : presets[selectedPresetIndex]?.label ?? 'Custom'
  const setCustomWidth: Dispatch<SetStateAction<number>> = (next) => {
    setSelectedPresetIndex(null)
    setWidth(next)
  }
  const setCustomHeight: Dispatch<SetStateAction<number>> = (next) => {
    setSelectedPresetIndex(null)
    setHeight(next)
  }

  return (
    <div
      data-testid="canvas-size-inputs"
      className="pointer-events-auto flex h-9 items-center gap-3 rounded-[12px] bg-white/[0.10] px-3 text-[var(--pg-text)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md transition-colors hover:bg-white/[0.06] focus-within:bg-white/[0.06] focus-within:ring-1 focus-within:ring-white/15 active:bg-white/[0.08]"
    >
      {showPresets ? (
        <SizePresetSelect
          label={presetLabel}
          presets={presets}
          value={presetValue}
          onChange={(index) => {
            if (index === null) {
              setSelectedPresetIndex(null)
              return
            }
            setSelectedPresetIndex(index)
            onPresetSelect?.(index)
          }}
        />
      ) : null}
      <SizeInput label="W" min={CANVAS_MIN_WIDTH} value={width} onChange={setCustomWidth} className="gap-2" inputClassName="pg-number-input w-16 pl-1 pr-5 text-right tabular-nums" inputTestId="canvas-width-input" showStepper />
      <SizeInput label="H" min={CANVAS_MIN_HEIGHT} value={height} onChange={setCustomHeight} className="gap-2" inputClassName="pg-number-input w-16 pl-1 pr-5 text-right tabular-nums" inputTestId="canvas-height-input" showStepper />
    </div>
  )
}

function SizePresetSelect({
  label,
  presets,
  value,
  onChange,
}: {
  label: string
  presets: CanvasSizePreset[]
  value: string
  onChange: (presetIndex: number | null) => void
}) {
  return (
    <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue === 'custom') {
            onChange(null)
            return
          }
          const index = Number(nextValue)
          if (Number.isNaN(index)) return
          onChange(index)
        }}
      >
      <SelectTrigger
        aria-label={`Canvas size preset: ${label}`}
        className="-ml-1 h-8 w-[108px] rounded-[10px] px-2 text-xs font-semibold hover:bg-transparent focus:bg-transparent focus:ring-0 data-[state=open]:bg-transparent data-[state=open]:ring-0"
        title="Choose canvas size"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64 w-[220px]">
        <SelectItem value="custom">Custom</SelectItem>
        {SIZE_PLATFORMS.map((platform) => (
          <SelectGroup key={platform}>
            <SelectLabel className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/45">
              {platform}
            </SelectLabel>
            {presets.map((preset, index) =>
              preset.platform === platform ? (
                <SelectItem key={`${preset.platform}-${preset.label}`} value={String(index)}>
                  {preset.label} - {preset.width} x {preset.height}
                </SelectItem>
              ) : null
            )}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
