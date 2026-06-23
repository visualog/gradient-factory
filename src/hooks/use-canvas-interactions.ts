'use client'

import { useEffect, useRef, useState, type Dispatch, type PointerEvent as ReactPointerEvent, type RefObject, type SetStateAction } from 'react'
import {
  CANVAS_MAX_SIZE,
  CANVAS_MIN_HEIGHT,
  CANVAS_MIN_WIDTH,
  clamp,
  type PointPosition,
} from '@/lib/gradient-model'
import { canvasRadiusFromDrag, type CanvasRadiusHandleMode } from '@/lib/canvas-radius-controls'
import type { CanvasResizeState, ResizeHandle } from '@/lib/resize-handles'

type UseCanvasInteractionsProps = {
  canvasRef: RefObject<HTMLCanvasElement>
  width: number
  height: number
  canvasRadius: number
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
  setCanvasRadius: Dispatch<SetStateAction<number>>
  setPointPositions: Dispatch<SetStateAction<PointPosition[]>>
}

export function useCanvasInteractions({
  canvasRef,
  width,
  height,
  canvasRadius,
  setWidth,
  setHeight,
  setCanvasRadius,
  setPointPositions,
}: UseCanvasInteractionsProps) {
  const activePointIndexRef = useRef<number | null>(null)
  const dragFrameRef = useRef<number | null>(null)
  const pendingPointRef = useRef<{ index: number; point: PointPosition } | null>(null)
  const canvasResizeRef = useRef<CanvasResizeState | null>(null)
  const resizeFrameRef = useRef<number | null>(null)
  const pendingCanvasSizeRef = useRef<{ width: number; height: number } | null>(null)
  const pendingCanvasRadiusRef = useRef<number | null>(null)
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const [activeResizeHandle, setActiveResizeHandle] = useState<string | null>(null)
  const [activeResizeMode, setActiveResizeMode] = useState<CanvasRadiusHandleMode | null>(null)

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

  const beginPointDrag = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    activePointIndexRef.current = index
    setActivePointIndex(index)
    movePoint(index, event.clientX, event.clientY)
  }

  const movePointDrag = (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (activePointIndexRef.current === index) movePoint(index, event.clientX, event.clientY)
  }

  const endPointDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    activePointIndexRef.current = null
    setActivePointIndex(null)
  }

  const beginCanvasResize = (handle: ResizeHandle, mode: CanvasRadiusHandleMode, event: ReactPointerEvent<HTMLButtonElement>) => {
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
      startRadius: canvasRadius,
      scaleX: width / rect.width,
      scaleY: height / rect.height,
      xAxis: handle.xAxis,
      yAxis: handle.yAxis,
      mode,
    }
    setActiveResizeHandle(handle.id)
    setActiveResizeMode(mode)
  }

  const resizeCanvas = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = canvasResizeRef.current
    if (!resizeState || resizeState.pointerId !== event.pointerId) return

    if (resizeState.mode === 'resize') {
      const deltaX = (event.clientX - resizeState.startX) * resizeState.scaleX
      const deltaY = (event.clientY - resizeState.startY) * resizeState.scaleY
      pendingCanvasSizeRef.current = {
        width: Math.round(clamp(resizeState.startWidth + deltaX * resizeState.xAxis, CANVAS_MIN_WIDTH, CANVAS_MAX_SIZE)),
        height: Math.round(clamp(resizeState.startHeight + deltaY * resizeState.yAxis, CANVAS_MIN_HEIGHT, CANVAS_MAX_SIZE)),
      }
    } else {
      pendingCanvasRadiusRef.current = canvasRadiusFromDrag({
        mode: resizeState.mode,
        startRadius: resizeState.startRadius,
        startX: resizeState.startX,
        startY: resizeState.startY,
        currentX: event.clientX,
        currentY: event.clientY,
        maxRadius: Math.floor(Math.min(resizeState.startWidth, resizeState.startHeight) / 2),
      })
    }

    if (resizeFrameRef.current !== null) return
    resizeFrameRef.current = requestAnimationFrame(() => {
      const nextSize = pendingCanvasSizeRef.current
      const nextRadius = pendingCanvasRadiusRef.current
      resizeFrameRef.current = null
      pendingCanvasSizeRef.current = null
      pendingCanvasRadiusRef.current = null
      if (nextSize) {
        setWidth(nextSize.width)
        setHeight(nextSize.height)
      }
      if (nextRadius !== null) setCanvasRadius(nextRadius)
    })
  }

  const endCanvasResize = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    canvasResizeRef.current = null
    setActiveResizeHandle(null)
    setActiveResizeMode(null)
  }

  useEffect(() => {
    if (activePointIndex === null) return

    const handleWindowMove = (event: PointerEvent) => {
      const index = activePointIndexRef.current
      if (index === null) return
      movePoint(index, event.clientX, event.clientY)
    }

    const handleWindowEnd = () => {
      activePointIndexRef.current = null
      setActivePointIndex(null)
    }

    window.addEventListener('pointermove', handleWindowMove)
    window.addEventListener('pointerup', handleWindowEnd)
    window.addEventListener('pointercancel', handleWindowEnd)

    return () => {
      window.removeEventListener('pointermove', handleWindowMove)
      window.removeEventListener('pointerup', handleWindowEnd)
      window.removeEventListener('pointercancel', handleWindowEnd)
    }
  }, [activePointIndex])

  return { activePointIndex, activeResizeHandle, activeResizeMode, beginPointDrag, movePointDrag, endPointDrag, beginCanvasResize, resizeCanvas, endCanvasResize }
}
