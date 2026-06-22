'use client'

import { useState } from 'react'
import {
  DEFAULT_POINT_POSITIONS,
  PALETTE_BASE_COLOR_COUNT,
  PALETTE_EXTRA_COLORS,
  PALETTE_MAX_COLOR_COUNT,
  type PointPosition,
} from '@/lib/gradient-model'

function pointsForColorCount(count: number) {
  return DEFAULT_POINT_POSITIONS.slice(0, count).map((point) => ({ ...point }))
}

export function useColorLayers(defaultColors: string[]) {
  const [colors, setColors] = useState(defaultColors.slice(0, PALETTE_MAX_COLOR_COUNT))
  const [pointPositions, setPointPositions] = useState<PointPosition[]>(() => pointsForColorCount(defaultColors.length))
  const [draggingColorIndex, setDraggingColorIndex] = useState<number | null>(null)

  const updateColor = (index: number, value: string) => {
    const next = [...colors]
    next[index] = value.startsWith('#') ? value : `#${value}`
    setColors(next)
  }

  const reorderColorLayer = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const move = <T,>(items: T[]) => {
      const next = [...items]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    }
    setColors(move)
    setPointPositions(move)
  }

  const addColor = () => {
    if (colors.length >= PALETTE_MAX_COLOR_COUNT) return

    const nextIndex = colors.length
    const nextColor = PALETTE_EXTRA_COLORS[nextIndex - PALETTE_BASE_COLOR_COUNT] ?? colors[colors.length - 1] ?? '#FFFFFF'

    setColors([...colors, nextColor])
    setPointPositions([
      ...pointPositions,
      { ...(DEFAULT_POINT_POSITIONS[nextIndex] ?? { x: 0.5, y: 0.5 }) },
    ])
  }

  const removeColor = (index: number) => {
    if (index < PALETTE_BASE_COLOR_COUNT) return
    if (colors.length <= PALETTE_BASE_COLOR_COUNT || index >= colors.length) return

    setColors(colors.filter((_, colorIndex) => colorIndex !== index))
    setPointPositions(pointPositions.filter((_, pointIndex) => pointIndex !== index))
  }

  const resetColors = () => {
    setColors(defaultColors.slice(0, PALETTE_MAX_COLOR_COUNT))
    setPointPositions(pointsForColorCount(defaultColors.length))
  }

  return {
    colors,
    setColors,
    pointPositions,
    setPointPositions,
    draggingColorIndex,
    setDraggingColorIndex,
    updateColor,
    addColor,
    removeColor,
    reorderColorLayer,
    resetColors,
  }
}
