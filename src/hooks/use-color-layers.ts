'use client'

import { useState } from 'react'
import { DEFAULT_POINT_POSITIONS, type PointPosition } from '@/lib/gradient-model'

export function useColorLayers(defaultColors: string[]) {
  const [colors, setColors] = useState(defaultColors)
  const [pointPositions, setPointPositions] = useState<PointPosition[]>(DEFAULT_POINT_POSITIONS)
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

  const resetColors = () => {
    setColors(defaultColors)
    setPointPositions(DEFAULT_POINT_POSITIONS)
  }

  return {
    colors,
    setColors,
    pointPositions,
    setPointPositions,
    draggingColorIndex,
    setDraggingColorIndex,
    updateColor,
    reorderColorLayer,
    resetColors,
  }
}
