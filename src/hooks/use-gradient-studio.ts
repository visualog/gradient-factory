'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { useMotionValue } from 'motion/react'
import { DEFAULT_STYLE_PRESET, type GradientStyle, type WarpShape } from '@/lib/style-presets'
import { CANVAS_MAX_SIZE, CANVAS_MIN_HEIGHT, CANVAS_MIN_WIDTH, DEFAULT_POINT_POSITIONS, WARP_PREVIEW_HIDE_DELAY, clamp, type GradientSnapshot, type PointPosition } from '@/lib/gradient-model'
import { buildPoints, renderGradient } from '@/lib/gradient-renderer'
import { useCanvasInteractions } from '@/hooks/use-canvas-interactions'
import { useColorLayers } from '@/hooks/use-color-layers'
import { useGradientLibrary } from '@/hooks/use-gradient-library'

export function useGradientStudio() {
  const canvasFrameRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dockMouseX = useMotionValue(Number.POSITIVE_INFINITY)
  const warpPreviewTimeoutRef = useRef<number | null>(null)
  const didMountWarpPreviewRef = useRef(false)
  const renderFrameRef = useRef<number | null>(null)
  const [showWarpPreview, setShowWarpPreview] = useState(false)
  const [isCanvasHovering, setIsCanvasHovering] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(648)
  const activePreset = DEFAULT_STYLE_PRESET
  const { classes, gradientDefaults } = activePreset
  const presetStyleVars = { '--pg-bg': activePreset.tokens.background, '--pg-canvas': activePreset.tokens.canvasSurface, '--pg-panel': activePreset.tokens.panel, '--pg-border': activePreset.tokens.panelBorder, '--pg-text': activePreset.tokens.text, '--pg-accent': activePreset.tokens.accent } as CSSProperties

  const [style, setStyle] = useState<GradientStyle>(gradientDefaults.style)
  const [warpShape, setWarpShape] = useState<WarpShape>(gradientDefaults.warpShape)
  const [width, setWidth] = useState(648)
  const [height, setHeight] = useState(648)
  const [warp, setWarp] = useState(gradientDefaults.warp)
  const [warpSize, setWarpSize] = useState(gradientDefaults.warpSize)
  const [noise, setNoise] = useState(gradientDefaults.noise)
  const colorLayers = useColorLayers(gradientDefaults.colors)
  const { colors, setColors, pointPositions, setPointPositions, draggingColorIndex, setDraggingColorIndex, updateColor, reorderColorLayer, resetColors } = colorLayers

  const renderState = useMemo(
    () => ({ width, height, colors, pointPositions, style, warpShape, warp, warpSize, noiseAmount: noise }),
    [width, height, colors, pointPositions, style, warpShape, warp, warpSize, noise]
  )
  const warpedPointPositions = useMemo(
    () => buildPoints(colors, pointPositions, warpShape, warp, warpSize).map(({ x, y }) => ({ x, y })),
    [colors, pointPositions, warpShape, warp, warpSize]
  )
  const canvasInteractions = useCanvasInteractions({ canvasRef, width, height, setWidth, setHeight, setPointPositions })
  const showPointHandles = isCanvasHovering || canvasInteractions.activePointIndex !== null

  useEffect(() => {
    if (!canvasRef.current) return
    if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current)

    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null
      if (canvasRef.current) renderGradient(canvasRef.current, renderState)
    })

    return () => {
      if (renderFrameRef.current !== null) {
        cancelAnimationFrame(renderFrameRef.current)
        renderFrameRef.current = null
      }
    }
  }, [renderState])

  useEffect(() => {
    return () => {
      if (warpPreviewTimeoutRef.current !== null) window.clearTimeout(warpPreviewTimeoutRef.current)
      if (renderFrameRef.current !== null) cancelAnimationFrame(renderFrameRef.current)
    }
  }, [])

  useEffect(() => {
    const frame = canvasFrameRef.current
    if (!frame) return

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setPreviewWidth(entry.contentRect.width)
    })

    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const frame = canvasFrameRef.current
    if (!frame) return

    const rect = frame.getBoundingClientRect()
    if (rect.width > 0) setPreviewWidth(rect.width)
  }, [width, height])

  useEffect(() => {
    if (!didMountWarpPreviewRef.current) {
      didMountWarpPreviewRef.current = true
      return
    }
    if (canvasInteractions.activePointIndex !== null) return

    setShowWarpPreview(true)
    if (warpPreviewTimeoutRef.current !== null) window.clearTimeout(warpPreviewTimeoutRef.current)
    warpPreviewTimeoutRef.current = window.setTimeout(() => {
      setShowWarpPreview(false)
      warpPreviewTimeoutRef.current = null
    }, WARP_PREVIEW_HIDE_DELAY)
  }, [canvasInteractions.activePointIndex, warpShape, warp, warpSize])

  const captureGradient = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    renderGradient(canvas, renderState)
    return {
      id: Date.now(),
      preview: canvas.toDataURL('image/png'),
      width,
      height,
      colors: [...colors],
      pointPositions: pointPositions.map((point) => ({ ...point })),
      style,
      warpShape,
      warp,
      warpSize,
      noise,
    }
  }

  const applySnapshot = (snapshot: GradientSnapshot) => {
    setWidth(clamp(snapshot.width, CANVAS_MIN_WIDTH, CANVAS_MAX_SIZE))
    setHeight(clamp(snapshot.height, CANVAS_MIN_HEIGHT, CANVAS_MAX_SIZE))
    setColors([...snapshot.colors])
    setPointPositions(snapshot.pointPositions?.length ? snapshot.pointPositions.map((point) => ({ ...point })) : DEFAULT_POINT_POSITIONS)
    setStyle(snapshot.style)
    setWarpShape(snapshot.warpShape)
    setWarp(snapshot.warp)
    setWarpSize(snapshot.warpSize)
    setNoise(snapshot.noise)
  }

  const { library, saveToLibrary, download, loadSnapshot } = useGradientLibrary({ captureGradient, applySnapshot })

  const updateCanvasHover = (event: PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setIsCanvasHovering(
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    )
  }

  return {
    classes,
    presetStyleVars,
    canvas: {
      canvasFrameRef,
      canvasRef,
      width,
      height,
      colors,
      pointPositions,
      warpedPointPositions,
      activePointIndex: canvasInteractions.activePointIndex,
      activeResizeHandle: canvasInteractions.activeResizeHandle,
      showPointHandles,
      showWarpPreview,
      previewWidth,
      beginPointDrag: canvasInteractions.beginPointDrag,
      movePointDrag: canvasInteractions.movePointDrag,
      endPointDrag: canvasInteractions.endPointDrag,
      updateCanvasHover,
      endCanvasHover: () => setIsCanvasHovering(false),
      beginCanvasResize: canvasInteractions.beginCanvasResize,
      resizeCanvas: canvasInteractions.resizeCanvas,
      endCanvasResize: canvasInteractions.endCanvasResize,
    },
    controls: { style, setStyle, warpShape, setWarpShape, warp, setWarp, warpSize, setWarpSize, noise, setNoise },
    panel: {
      width,
      height,
      setWidth,
      setHeight,
      colors,
      draggingColorIndex,
      setDraggingColorIndex,
      updateColor,
      reorderColorLayer,
      resetColors,
      saveToLibrary,
      download,
    },
    dock: { library, dockMouseX, loadSnapshot },
  }
}
