'use client'

import { useEffect, useRef, useState, type Dispatch, type PointerEvent, type RefObject, type SetStateAction } from 'react'
import {
  CANVAS_MAX_SIZE,
  CANVAS_MIN_HEIGHT,
  CANVAS_MIN_WIDTH,
  clamp,
  type PointPosition,
} from '@/lib/gradient-model'
import type { CanvasResizeState, ResizeHandle } from '@/lib/resize-handles'

type UseCanvasInteractionsProps = {
  canvasRef: RefObject<HTMLCanvasElement>
  width: number
  height: number
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
  setPointPositions: Dispatch<SetStateAction<PointPosition[]>>
}

export function useCanvasInteractions({
  canvasRef,
  width,
  height,
  setWidth,
  setHeight,
  setPointPositions,
}: UseCanvasInteractionsProps) {
  const activePointIndexRef = useRef<number | null>(null)
  const dragFrameRef = useRef<number | null>(null)
  const pendingPointRef = useRef<{ index: number; point: PointPosition } | null>(null)
  const canvasResizeRef = useRef<CanvasResizeState | null>(null)
  const resizeFrameRef = useRef<number | null>(null)
  const pendingCanvasSizeRef = useRef<{ width: number; height: number } | null>(null)
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const [activeResizeHandle, setActiveResizeHandle] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current)
      if (resizeFrameRef.current !== null) cancelAnimationFrame(resizeFrameRef.current)
    }
  }, [])

  const movePoint = (index: number, clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = clamp((clientX - rect.left) / rect.width, 0, 1)
    const y = clamp((clientY - rect.top) / rect.height, 0, 1)
    pendingPointRef.current = { index, point: { x, y } }
    if (dragFrameRef.current !== null) return

    dragFrameRef.current = requestAnimationFrame(() => {
      const pending = pendingPointRef.current
      dragFrameRef.current = null
      pendingPointRef.current = null
      if (!pending) return

      setPointPositions((points) => {
        const next = [...points]
        next[pending.index] = pending.point
        return next
      })
    })
  }

  const beginPointDrag = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    activePointIndexRef.current = index
    setActivePointIndex(index)
    movePoint(index, event.clientX, event.clientY)
  }

  const movePointDrag = (index: number, event: PointerEvent<HTMLButtonElement>) => {
    if (activePointIndexRef.current === index) movePoint(index, event.clientX, event.clientY)
  }

  const endPointDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    activePointIndexRef.current = null
    setActivePointIndex(null)
  }

  const beginCanvasResize = (handle: ResizeHandle, event: PointerEvent<HTMLButtonElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)

    const rect = canvas.getBoundingClientRect()
    canvasResizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: width,
      startHeight: height,
      scaleX: width / rect.width,
      scaleY: height / rect.height,
      xAxis: handle.xAxis,
      yAxis: handle.yAxis,
    }
    setActiveResizeHandle(handle.id)
  }

  const resizeCanvas = (event: PointerEvent<HTMLButtonElement>) => {
    const resizeState = canvasResizeRef.current
    if (!resizeState || resizeState.pointerId !== event.pointerId) return

    const deltaX = (event.clientX - resizeState.startX) * resizeState.scaleX
    const deltaY = (event.clientY - resizeState.startY) * resizeState.scaleY
    pendingCanvasSizeRef.current = {
      width: Math.round(clamp(resizeState.startWidth + deltaX * resizeState.xAxis, CANVAS_MIN_WIDTH, CANVAS_MAX_SIZE)),
      height: Math.round(clamp(resizeState.startHeight + deltaY * resizeState.yAxis, CANVAS_MIN_HEIGHT, CANVAS_MAX_SIZE)),
    }

    if (resizeFrameRef.current !== null) return
    resizeFrameRef.current = requestAnimationFrame(() => {
      const nextSize = pendingCanvasSizeRef.current
      resizeFrameRef.current = null
      pendingCanvasSizeRef.current = null
      if (!nextSize) return
      setWidth(nextSize.width)
      setHeight(nextSize.height)
    })
  }

  const endCanvasResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    canvasResizeRef.current = null
    setActiveResizeHandle(null)
  }

  return { activePointIndex, activeResizeHandle, beginPointDrag, movePointDrag, endPointDrag, beginCanvasResize, resizeCanvas, endCanvasResize }
}
