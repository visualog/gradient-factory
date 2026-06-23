'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import { BASE_GRADIENT_STYLES, WARP_SHAPES, type GradientStyle, type WarpShape } from '@/lib/style-presets'
import {
  CANVAS_MAX_SIZE,
  CANVAS_MIN_HEIGHT,
  CANVAS_MIN_WIDTH,
  DEFAULT_POINT_POSITIONS,
  DEFAULT_VIGNETTE,
  clamp,
  type PointPosition,
} from '@/lib/gradient-model'
import { UI_GRADIENT_PRESETS } from '@/lib/ui-gradient-presets'

export type ExperimentLock = 'points' | 'style' | 'warp' | 'noise'
export type ExperimentProfile = 'standard' | 'ui-glow'
export type CanvasSizePreset = {
  platform: 'Web' | 'Mobile' | 'Social'
  label: string
  width: number
  height: number
}

const LAB_PALETTES = [
  ['#F43F5E', '#312E81', '#60A5FA', '#FDE68A', '#A78BFA', '#0F172A'],
  ['#34D399', '#0F766E', '#A7F3D0', '#60A5FA', '#F9A8D4', '#111827'],
  ['#FB7185', '#F97316', '#FACC15', '#7C3AED', '#1D4ED8', '#0B1120'],
  ['#F9A8D4', '#C084FC', '#818CF8', '#38BDF8', '#FEF3C7', '#831843'],
  ['#EF4444', '#1D4ED8', '#7DD3FC', '#FED7AA', '#581C87', '#F0FDFA'],
]

export const CANVAS_SIZE_PRESETS: CanvasSizePreset[] = [
  { platform: 'Web', label: 'Hero 16:9', width: 1920, height: 1080 },
  { platform: 'Web', label: 'Web Card 4:3', width: 1200, height: 900 },
  { platform: 'Web', label: 'Banner 2:1', width: 1600, height: 800 },
  { platform: 'Mobile', label: 'Phone 9:16', width: 1080, height: 1920 },
  { platform: 'Mobile', label: 'Wallpaper 9:19.5', width: 946, height: 2048 },
  { platform: 'Mobile', label: 'Tablet 4:3', width: 1536, height: 2048 },
  { platform: 'Social', label: 'Square 1:1', width: 1080, height: 1080 },
  { platform: 'Social', label: 'Portrait Post 4:5', width: 1080, height: 1350 },
  { platform: 'Social', label: 'Story/Reel 9:16', width: 1080, height: 1920 },
]

function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomPoint(index: number): PointPosition {
  const fallback = DEFAULT_POINT_POSITIONS[index] ?? { x: 0.5, y: 0.5 }
  return {
    x: clamp(fallback.x + (Math.random() - 0.5) * 0.28, 0.08, 0.92),
    y: clamp(fallback.y + (Math.random() - 0.5) * 0.28, 0.08, 0.92),
  }
}

export function useGradientExperiment({
  colors,
  setColors,
  setPointPositions,
  setStyle,
  setWarpShape,
  setWarp,
  setWarpSize,
  setNoise,
  setVignette,
  lockedColorIndexes,
  setWidth,
  setHeight,
  onGenerated,
  profile = 'standard',
}: {
  colors: string[]
  setColors: Dispatch<SetStateAction<string[]>>
  setPointPositions: Dispatch<SetStateAction<PointPosition[]>>
  setStyle: Dispatch<SetStateAction<GradientStyle>>
  setWarpShape: Dispatch<SetStateAction<WarpShape>>
  setWarp: Dispatch<SetStateAction<number>>
  setWarpSize: Dispatch<SetStateAction<number>>
  setNoise: Dispatch<SetStateAction<number>>
  setVignette: Dispatch<SetStateAction<number>>
  lockedColorIndexes: number[]
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
  onGenerated: () => void
  profile?: ExperimentProfile
}) {
  const [experimentLocks, setExperimentLocks] = useState<ExperimentLock[]>([])

  const generateVariation = () => {
    const isUiGlow = profile === 'ui-glow'
    const uiPreset = isUiGlow ? randomItem(UI_GRADIENT_PRESETS) : null
    const palette = uiPreset?.colors ?? randomItem(LAB_PALETTES)
    const nextColors = colors.map((color, index) =>
      lockedColorIndexes.includes(index) ? color : palette[index % palette.length]
    )

    setColors(nextColors)
    if (!experimentLocks.includes('points')) setPointPositions(uiPreset?.pointPositions?.map((point) => ({ ...point })) ?? nextColors.map((_, index) => randomPoint(index)))
    if (!experimentLocks.includes('style')) setStyle(uiPreset?.style ?? randomItem(BASE_GRADIENT_STYLES))
    if (!experimentLocks.includes('warp')) {
      setWarpShape(uiPreset?.warpShape ?? randomItem(WARP_SHAPES))
      setWarp(uiPreset?.warp ?? Number((0.18 + Math.random() * 0.92).toFixed(2)))
      setWarpSize(uiPreset?.warpSize ?? Number((0.65 + Math.random() * 1.65).toFixed(2)))
    }
    if (!experimentLocks.includes('noise')) {
      setNoise(uiPreset?.noise ?? Number((0.025 + Math.random() * 0.105).toFixed(3)))
      setVignette(uiPreset?.vignette ?? DEFAULT_VIGNETTE)
    }
    onGenerated()
  }

  const shufflePalette = () => {
    const unlockedIndexes = colors.map((_, index) => index).filter((index) => !lockedColorIndexes.includes(index))
    const shuffledColors = [...unlockedIndexes]
      .map((index) => colors[index])
      .sort(() => Math.random() - 0.5)

    setColors(colors.map((color, index) => {
      const unlockedPosition = unlockedIndexes.indexOf(index)
      return unlockedPosition === -1 ? color : shuffledColors[unlockedPosition]
    }))
  }

  const applyCanvasPreset = (presetIndex: number) => {
    const preset = CANVAS_SIZE_PRESETS[presetIndex]
    if (!preset) return

    setWidth(clamp(preset.width, CANVAS_MIN_WIDTH, CANVAS_MAX_SIZE))
    setHeight(clamp(preset.height, CANVAS_MIN_HEIGHT, CANVAS_MAX_SIZE))
  }

  const toggleExperimentLock = (lock: ExperimentLock) => {
    setExperimentLocks((current) =>
      current.includes(lock) ? current.filter((item) => item !== lock) : [...current, lock]
    )
  }

  return {
    generateVariation,
    shufflePalette,
    applyCanvasPreset,
    experimentLocks,
    toggleExperimentLock,
    sizePresets: CANVAS_SIZE_PRESETS,
  }
}
