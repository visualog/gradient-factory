'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { Download, GripVertical, Plus, RefreshCw, Save } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react'
import {
  DEFAULT_STYLE_PRESET,
  GRADIENT_STYLES,
  WARP_SHAPES,
  type GradientStyle,
  type WarpShape,
} from '@/lib/style-presets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

type ColorPoint = {
  color: string
  x: number
  y: number
}

type PointPosition = {
  x: number
  y: number
}

type GradientSnapshot = {
  id: number
  preview: string
  width: number
  height: number
  colors: string[]
  pointPositions?: PointPosition[]
  style: GradientStyle
  warpShape: WarpShape
  warp: number
  warpSize: number
  noise: number
}

const DOCK_BASE_SIZE = 64
const DOCK_MAX_SIZE = 112
const DOCK_INFLUENCE = 220
const DOCK_GAP = 24
const DOCK_PADDING_X = 4
const WARP_PREVIEW_HIDE_DELAY = 900
const CANVAS_MIN_WIDTH = 640
const CANVAS_MIN_HEIGHT = 320
const CANVAS_MAX_SIZE = 2048
const CANVAS_PREVIEW_MAX_WIDTH = 900
const CANVAS_CORNER_RADIUS = 24
const NOISE_MAX = 0.15
const CONTROL_RAIL_GAP = 12
const CONTROL_ITEM_GAP = 8
const CONTROL_HEIGHT = 36
const RESIZE_HANDLE_EDGE_OFFSET = 18
const RESIZE_HANDLE_CORNER_GAP = 12
const RESIZE_HANDLE_CORNER_VIEWBOX = 48
const RESIZE_HANDLE_CORNER_PATH_PADDING = 3
const RESIZE_HANDLE_CORNER_STROKE_WIDTH = 6
const RESIZE_HANDLE_CORNER_STROKE_HALF = RESIZE_HANDLE_CORNER_STROKE_WIDTH / 2
const RESIZE_HANDLE_CORNER_FAR_EDGE = RESIZE_HANDLE_CORNER_VIEWBOX - RESIZE_HANDLE_CORNER_PATH_PADDING
const RESIZE_HANDLE_CORNER_VISUAL_ALIGNMENT =
  RESIZE_HANDLE_CORNER_FAR_EDGE - RESIZE_HANDLE_CORNER_VIEWBOX / 2 - RESIZE_HANDLE_CORNER_STROKE_HALF
const RESIZE_HANDLE_CORNER_OFFSET = RESIZE_HANDLE_CORNER_GAP - RESIZE_HANDLE_CORNER_VISUAL_ALIGNMENT
const RESIZE_HANDLE_CORNER_ARC_RADIUS =
  CANVAS_CORNER_RADIUS + RESIZE_HANDLE_CORNER_GAP + RESIZE_HANDLE_CORNER_STROKE_HALF
const DEFAULT_POINT_POSITIONS: PointPosition[] = [
  { x: 0.18, y: 0.18 },
  { x: 0.82, y: 0.14 },
  { x: 0.20, y: 0.82 },
  { x: 0.78, y: 0.78 },
  { x: 0.50, y: 0.32 },
  { x: 0.50, y: 0.66 },
]
const RESIZE_HANDLES = [
  { id: 'nw', x: 0, y: 0, offsetX: -RESIZE_HANDLE_CORNER_OFFSET, offsetY: -RESIZE_HANDLE_CORNER_OFFSET, xAxis: -1, yAxis: -1, cursor: 'nwse-resize', label: 'Resize canvas from top left', shape: 'corner' },
  { id: 'n', x: 50, y: 0, offsetX: 0, offsetY: -RESIZE_HANDLE_EDGE_OFFSET, xAxis: 0, yAxis: -1, cursor: 'ns-resize', label: 'Resize canvas height from top', shape: 'horizontal' },
  { id: 'ne', x: 100, y: 0, offsetX: RESIZE_HANDLE_CORNER_OFFSET, offsetY: -RESIZE_HANDLE_CORNER_OFFSET, xAxis: 1, yAxis: -1, cursor: 'nesw-resize', label: 'Resize canvas from top right', shape: 'corner' },
  { id: 'e', x: 100, y: 50, offsetX: RESIZE_HANDLE_EDGE_OFFSET, offsetY: 0, xAxis: 1, yAxis: 0, cursor: 'ew-resize', label: 'Resize canvas width from right', shape: 'vertical' },
  { id: 'se', x: 100, y: 100, offsetX: RESIZE_HANDLE_CORNER_OFFSET, offsetY: RESIZE_HANDLE_CORNER_OFFSET, xAxis: 1, yAxis: 1, cursor: 'nwse-resize', label: 'Resize canvas from bottom right', shape: 'corner' },
  { id: 's', x: 50, y: 100, offsetX: 0, offsetY: RESIZE_HANDLE_EDGE_OFFSET, xAxis: 0, yAxis: 1, cursor: 'ns-resize', label: 'Resize canvas height from bottom', shape: 'horizontal' },
  { id: 'sw', x: 0, y: 100, offsetX: -RESIZE_HANDLE_CORNER_OFFSET, offsetY: RESIZE_HANDLE_CORNER_OFFSET, xAxis: -1, yAxis: 1, cursor: 'nesw-resize', label: 'Resize canvas from bottom left', shape: 'corner' },
  { id: 'w', x: 0, y: 50, offsetX: -RESIZE_HANDLE_EDGE_OFFSET, offsetY: 0, xAxis: -1, yAxis: 0, cursor: 'ew-resize', label: 'Resize canvas width from left', shape: 'vertical' },
] as const

const PERIMETER_CONTROLS = [
  { id: 'style', width: 136 },
  { id: 'warpShape', width: 112 },
  { id: 'warp', width: 224 },
  { id: 'warpSize', width: 248 },
  { id: 'noise', width: 224 },
] as const

type PerimeterControlId = (typeof PERIMETER_CONTROLS)[number]['id']

type ResizeHandle = (typeof RESIZE_HANDLES)[number]

type CanvasResizeState = {
  pointerId: number
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  scaleX: number
  scaleY: number
  xAxis: ResizeHandle['xAxis']
  yAxis: ResizeHandle['yAxis']
}

function resizeHandleButtonClass(handle: ResizeHandle, activeResizeHandle: string | null) {
  const stateClass = activeResizeHandle
    ? activeResizeHandle === handle.id
      ? 'opacity-100'
      : 'opacity-40'
    : 'opacity-0 group-hover:opacity-100'

  const sizeClass =
    handle.shape === 'horizontal' ? 'h-8 w-16' : handle.shape === 'vertical' ? 'h-16 w-8' : 'h-12 w-12'

  return `absolute z-30 flex touch-none items-center justify-center ${sizeClass} outline-none transition-opacity duration-150 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/80 ${stateClass}`
}

function resizeHandleBarClass(handle: ResizeHandle, activeResizeHandle: string | null) {
  const toneClass = activeResizeHandle === handle.id ? 'bg-white/85 border-white/40' : 'bg-white/50 border-white/20'
  const axisClass = handle.shape === 'horizontal' ? 'h-1.5 w-11' : 'h-11 w-1.5'

  return `block rounded-full border shadow-[0_3px_12px_rgba(0,0,0,0.45)] backdrop-blur transition-[background-color,border-color,transform] duration-150 group-hover/resize:scale-110 group-hover/resize:bg-white/75 ${axisClass} ${toneClass}`
}

function resizeHandleCornerClass(handleId: ResizeHandle['id'], activeResizeHandle: string | null) {
  const toneClass = activeResizeHandle === handleId ? 'text-white/85' : 'text-white/55 group-hover/resize:text-white/75'
  const shadowClass = 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]'

  return `absolute inset-1 transition-[color,filter,transform] duration-150 group-hover/resize:scale-105 ${toneClass} ${shadowClass}`
}

function resizeHandleCornerPath(handleId: ResizeHandle['id']) {
  const radius = RESIZE_HANDLE_CORNER_ARC_RADIUS
  const padding = RESIZE_HANDLE_CORNER_PATH_PADDING
  const farEdge = RESIZE_HANDLE_CORNER_FAR_EDGE
  const arcStart = padding + radius
  const oppositeArcStart = farEdge - radius
  const control = radius * 0.5522847498

  return (
    handleId === 'nw'
      ? `M ${farEdge} ${padding} H ${arcStart} C ${arcStart - control} ${padding} ${padding} ${arcStart - control} ${padding} ${arcStart} V ${farEdge}`
      : handleId === 'ne'
        ? `M ${padding} ${padding} H ${oppositeArcStart} C ${oppositeArcStart + control} ${padding} ${farEdge} ${arcStart - control} ${farEdge} ${arcStart} V ${farEdge}`
        : handleId === 'se'
          ? `M ${padding} ${farEdge} H ${oppositeArcStart} C ${oppositeArcStart + control} ${farEdge} ${farEdge} ${oppositeArcStart + control} ${farEdge} ${oppositeArcStart} V ${padding}`
          : `M ${farEdge} ${farEdge} H ${arcStart} C ${arcStart - control} ${farEdge} ${padding} ${oppositeArcStart + control} ${padding} ${oppositeArcStart} V ${padding}`
  )
}

function perimeterControlDistance(controlId: PerimeterControlId) {
  let distance = 0

  for (const control of PERIMETER_CONTROLS) {
    if (control.id === controlId) return distance + control.width / 2
    distance += control.width + CONTROL_ITEM_GAP
  }

  return distance
}

function perimeterControlWidth(controlId: PerimeterControlId) {
  return PERIMETER_CONTROLS.find((control) => control.id === controlId)?.width ?? 160
}

function perimeterControlStyle(
  controlId: PerimeterControlId,
  previewWidth: number
): CSSProperties {
  const width = perimeterControlWidth(controlId)
  const distance = perimeterControlDistance(controlId)
  const pathRadius = CANVAS_CORNER_RADIUS + CONTROL_RAIL_GAP + CONTROL_HEIGHT / 2
  const topStraightLength = Math.max(0, previewWidth - CANVAS_CORNER_RADIUS)
  const cornerCenterX = previewWidth - CANVAS_CORNER_RADIUS
  const cornerCenterY = CANVAS_CORNER_RADIUS
  const arcLength = (Math.PI * pathRadius) / 2
  let x = distance
  let y = -(CONTROL_RAIL_GAP + CONTROL_HEIGHT / 2)
  let angle = 0

  if (distance > topStraightLength) {
    const cornerDistance = distance - topStraightLength

    if (cornerDistance <= arcLength) {
      const progress = cornerDistance / arcLength
      const theta = -Math.PI / 2 + progress * (Math.PI / 2)
      x = cornerCenterX + pathRadius * Math.cos(theta)
      y = cornerCenterY + pathRadius * Math.sin(theta)
      angle = (theta * 180) / Math.PI + 90
    } else {
      x = previewWidth + CONTROL_RAIL_GAP + CONTROL_HEIGHT / 2
      y = cornerCenterY + (cornerDistance - arcLength)
      angle = 90
    }
  }

  return {
    height: CONTROL_HEIGHT,
    left: x,
    top: y,
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
    transformOrigin: 'center',
    width,
  }
}

function dockSize(mouseX: number, index: number) {
  if (!Number.isFinite(mouseX)) return DOCK_BASE_SIZE

  const center = DOCK_PADDING_X + index * (DOCK_BASE_SIZE + DOCK_GAP) + DOCK_BASE_SIZE / 2
  const distance = Math.abs(mouseX - center)
  const proximity = clamp(1 - distance / DOCK_INFLUENCE, 0, 1)
  const eased = proximity * proximity * (3 - 2 * proximity)

  return DOCK_BASE_SIZE + eased * (DOCK_MAX_SIZE - DOCK_BASE_SIZE)
}

function DockItem({
  snapshot,
  index,
  mouseX,
  onSelect,
}: {
  snapshot: GradientSnapshot
  index: number
  mouseX: MotionValue<number>
  onSelect: (snapshot: GradientSnapshot) => void
}) {
  const targetSize = useTransform(mouseX, (latest) => dockSize(latest, index))
  const size = useSpring(targetSize, { stiffness: 420, damping: 34, mass: 0.55 })
  const lift = useTransform(size, (latest) => -(latest - DOCK_BASE_SIZE) * 0.28)

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(snapshot)}
      className="shrink-0 appearance-none overflow-hidden rounded-xl border-0 bg-transparent p-0 will-change-[width,height,transform]"
      style={{
        width: size,
        height: size,
        y: lift,
      }}
      title={`${snapshot.width} x ${snapshot.height}`}
    >
      <img
        src={snapshot.preview}
        alt={`Saved gradient ${index + 1}`}
        className="block h-full w-full rounded-xl object-cover shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
      />
    </motion.button>
  )
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized
  const num = parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

function pseudoNoise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return n - Math.floor(n)
}

function angleDelta(a: number, b: number) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
}

function gradientWeight(
  style: GradientStyle,
  nx: number,
  ny: number,
  point: ColorPoint
) {
  const dx = nx - point.x
  const dy = ny - point.y
  const d = Math.sqrt(dx * dx + dy * dy)

  if (style === 'Sharp Bézier') {
    return 1 / Math.pow(d * 8 + 0.18, 2.2)
  }

  if (style === 'Soft Mesh') {
    return 1 / Math.pow(d * 6 + 0.25, 1.5)
  }

  if (style === 'Linear Fold') {
    const lineDistance = Math.abs(dx * 0.72 + dy * 0.36)
    return 1 / Math.pow(lineDistance * 7 + d * 1.8 + 0.2, 1.75)
  }

  if (style === 'Conic Bloom') {
    const pixelAngle = Math.atan2(ny - 0.5, nx - 0.5)
    const pointAngle = Math.atan2(point.y - 0.5, point.x - 0.5)
    const pixelRadius = Math.hypot(nx - 0.5, ny - 0.5)
    const pointRadius = Math.hypot(point.x - 0.5, point.y - 0.5)
    return 1 / Math.pow(angleDelta(pixelAngle, pointAngle) * 1.15 + Math.abs(pixelRadius - pointRadius) * 3.2 + 0.18, 1.7)
  }

  const cellEdge = 1 - smoothstep(0.02, 0.22, d)
  return 1 / Math.pow(d * 5.4 + 0.2, 1.45) + cellEdge * 0.65
}

function buildPoints(
  colors: string[],
  pointPositions: PointPosition[],
  warpShape: WarpShape,
  warp: number,
  warpSize: number
): ColorPoint[] {
  return colors.map((color, i) => {
    let { x, y } = pointPositions[i] ?? DEFAULT_POINT_POSITIONS[i % DEFAULT_POINT_POSITIONS.length]

    if (warpShape === 'Gravity') {
      const dx = x - 0.5
      const dy = y - 0.5
      x -= dx * warp * 0.2 * warpSize
      y -= dy * warp * 0.2 * warpSize
    }

    if (warpShape === 'Wave') {
      x += Math.sin(y * Math.PI * 2) * 0.08 * warp * warpSize
      y += Math.cos(x * Math.PI * 2) * 0.05 * warp * warpSize
    }

    if (warpShape === 'Radial') {
      const angle = Math.atan2(y - 0.5, x - 0.5)
      const radius = Math.hypot(x - 0.5, y - 0.5)
      x = 0.5 + Math.cos(angle + warp * 1.2) * radius
      y = 0.5 + Math.sin(angle + warp * 1.2) * radius
    }

    if (warpShape === 'Spiral') {
      const angle = Math.atan2(y - 0.5, x - 0.5)
      const radius = Math.hypot(x - 0.5, y - 0.5)
      const twist = warp * warpSize * (1.35 - radius)
      x = 0.5 + Math.cos(angle + twist) * radius
      y = 0.5 + Math.sin(angle + twist) * radius
    }

    if (warpShape === 'Pinch') {
      const dx = x - 0.5
      const dy = y - 0.5
      const radius = Math.hypot(dx, dy)
      const scale = 1 - smoothstep(0, 0.7, radius) * warp * 0.34 * warpSize
      x = 0.5 + dx * scale
      y = 0.5 + dy * scale
    }

    if (warpShape === 'Ripple') {
      const dx = x - 0.5
      const dy = y - 0.5
      const radius = Math.hypot(dx, dy)
      const pulse = Math.sin(radius * Math.PI * 7 + i * 0.9) * 0.055 * warp * warpSize
      x += dx * pulse
      y += dy * pulse
    }

    if (warpShape === 'Drift') {
      x += Math.sin((i + 1) * 1.7 + warp * 2.4) * 0.065 * warpSize
      y += Math.cos((i + 1) * 1.3 - warp * 2.1) * 0.055 * warpSize
    }

    return { color, x: clamp(x, 0, 1), y: clamp(y, 0, 1) }
  })
}

function renderGradient(
  canvas: HTMLCanvasElement,
  {
    width,
    height,
    colors,
    pointPositions,
    style,
    warpShape,
    warp,
    warpSize,
    noiseAmount,
  }: {
    width: number
    height: number
    colors: string[]
    pointPositions: PointPosition[]
    style: GradientStyle
    warpShape: WarpShape
    warp: number
    warpSize: number
    noiseAmount: number
  }
) {
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const image = ctx.createImageData(width, height)
  const data = image.data
  const points = buildPoints(colors, pointPositions, warpShape, warp, warpSize).map((p) => ({
    ...p,
    rgb: hexToRgb(p.color),
  }))

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x / width
      const ny = y / height

      let r = 0
      let g = 0
      let b = 0
      let total = 0

      for (const p of points) {
        const weight = gradientWeight(style, nx, ny, p)

        r += p.rgb.r * weight
        g += p.rgb.g * weight
        b += p.rgb.b * weight
        total += weight
      }

      r /= total
      g /= total
      b /= total

      const grain = (pseudoNoise(x * 0.9, y * 0.9) - 0.5) * 255 * noiseAmount
      const vignette = smoothstep(0.95, 0.2, Math.hypot(nx - 0.5, ny - 0.5))

      const i = (y * width + x) * 4
      data[i] = clamp(r * vignette + grain, 0, 255)
      data[i + 1] = clamp(g * vignette + grain, 0, 255)
      data[i + 2] = clamp(b * vignette + grain, 0, 255)
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
}

export default function Page() {
  const canvasFrameRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dockMouseX = useMotionValue(Number.POSITIVE_INFINITY)
  const activePointIndexRef = useRef<number | null>(null)
  const dragFrameRef = useRef<number | null>(null)
  const pendingPointRef = useRef<{ index: number; point: PointPosition } | null>(null)
  const warpPreviewTimeoutRef = useRef<number | null>(null)
  const didMountWarpPreviewRef = useRef(false)
  const canvasResizeRef = useRef<CanvasResizeState | null>(null)
  const renderFrameRef = useRef<number | null>(null)
  const resizeFrameRef = useRef<number | null>(null)
  const pendingCanvasSizeRef = useRef<{ width: number; height: number } | null>(null)
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const [showWarpPreview, setShowWarpPreview] = useState(false)
  const [isCanvasHovering, setIsCanvasHovering] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(648)
  const [draggingColorIndex, setDraggingColorIndex] = useState<number | null>(null)
  const [activeResizeHandle, setActiveResizeHandle] = useState<string | null>(null)
  const activePreset = DEFAULT_STYLE_PRESET
  const { classes, gradientDefaults } = activePreset
  const presetStyleVars = {
    '--pg-bg': activePreset.tokens.background,
    '--pg-canvas': activePreset.tokens.canvasSurface,
    '--pg-panel': activePreset.tokens.panel,
    '--pg-border': activePreset.tokens.panelBorder,
    '--pg-text': activePreset.tokens.text,
    '--pg-accent': activePreset.tokens.accent,
  } as CSSProperties

  const [style, setStyle] = useState<GradientStyle>(gradientDefaults.style)
  const [warpShape, setWarpShape] = useState<WarpShape>(gradientDefaults.warpShape)
  const [width, setWidth] = useState(648)
  const [height, setHeight] = useState(648)
  const [warp, setWarp] = useState(gradientDefaults.warp)
  const [warpSize, setWarpSize] = useState(gradientDefaults.warpSize)
  const [noise, setNoise] = useState(gradientDefaults.noise)
  const [colors, setColors] = useState(gradientDefaults.colors)
  const [pointPositions, setPointPositions] = useState<PointPosition[]>(DEFAULT_POINT_POSITIONS)
  const [library, setLibrary] = useState<GradientSnapshot[]>([])

  const state = useMemo(
    () => ({
      width,
      height,
      colors,
      pointPositions,
      style,
      warpShape,
      warp,
      warpSize,
      noiseAmount: noise,
    }),
    [width, height, colors, pointPositions, style, warpShape, warp, warpSize, noise]
  )
  const warpedPointPositions = useMemo(
    () => buildPoints(colors, pointPositions, warpShape, warp, warpSize).map(({ x, y }) => ({ x, y })),
    [colors, pointPositions, warpShape, warp, warpSize]
  )
  const showPointHandles = isCanvasHovering || activePointIndex !== null

  useEffect(() => {
    if (!canvasRef.current) return

    if (renderFrameRef.current !== null) {
      cancelAnimationFrame(renderFrameRef.current)
    }

    renderFrameRef.current = requestAnimationFrame(() => {
      renderFrameRef.current = null
      if (!canvasRef.current) return
      renderGradient(canvasRef.current, state)
    })

    return () => {
      if (renderFrameRef.current !== null) {
        cancelAnimationFrame(renderFrameRef.current)
        renderFrameRef.current = null
      }
    }
  }, [state])

  useEffect(() => {
    return () => {
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current)
      }
      if (warpPreviewTimeoutRef.current !== null) {
        window.clearTimeout(warpPreviewTimeoutRef.current)
      }
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current)
      }
      if (renderFrameRef.current !== null) {
        cancelAnimationFrame(renderFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const frame = canvasFrameRef.current
    if (!frame) return

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      setPreviewWidth(entry.contentRect.width)
    })

    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!didMountWarpPreviewRef.current) {
      didMountWarpPreviewRef.current = true
      return
    }

    if (activePointIndexRef.current !== null) return

    setShowWarpPreview(true)
    if (warpPreviewTimeoutRef.current !== null) {
      window.clearTimeout(warpPreviewTimeoutRef.current)
    }

    warpPreviewTimeoutRef.current = window.setTimeout(() => {
      setShowWarpPreview(false)
      warpPreviewTimeoutRef.current = null
    }, WARP_PREVIEW_HIDE_DELAY)
  }, [warpShape, warp, warpSize])

  useEffect(() => {
    let ignore = false

    fetch('/api/library')
      .then((response) => response.json())
      .then((data: { library?: GradientSnapshot[] }) => {
        if (!ignore && Array.isArray(data.library)) {
          setLibrary(data.library)
        }
      })
      .catch(() => {
        if (!ignore) setLibrary([])
      })

    return () => {
      ignore = true
    }
  }, [])

  const updateColor = (index: number, value: string) => {
    const normalized = value.startsWith('#') ? value : `#${value}`
    const next = [...colors]
    next[index] = normalized
    setColors(next)
  }

  const reorderColorLayer = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setColors((items) => {
      const next = [...items]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })

    setPointPositions((items) => {
      const next = [...items]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const captureGradient = () => {
    const canvas = canvasRef.current
    if (!canvas) return null
    renderGradient(canvas, state)
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

  const persistLibrary = (items: GradientSnapshot[]) => {
    fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).catch(() => undefined)
  }

  const saveToLibrary = () => {
    const snapshot = captureGradient()
    if (!snapshot) return null
    setLibrary((items) => {
      const next = [snapshot, ...items].slice(0, 12)
      persistLibrary(next)
      return next
    })
    return snapshot
  }

  const loadSnapshot = (snapshot: GradientSnapshot) => {
    setWidth(clamp(snapshot.width, CANVAS_MIN_WIDTH, CANVAS_MAX_SIZE))
    setHeight(clamp(snapshot.height, CANVAS_MIN_HEIGHT, CANVAS_MAX_SIZE))
    setColors([...snapshot.colors])
    setPointPositions(
      snapshot.pointPositions && snapshot.pointPositions.length > 0
        ? snapshot.pointPositions.map((point) => ({ ...point }))
        : DEFAULT_POINT_POSITIONS
    )
    setStyle(snapshot.style)
    setWarpShape(snapshot.warpShape)
    setWarp(snapshot.warp)
    setWarpSize(snapshot.warpSize)
    setNoise(snapshot.noise)
  }

  const download = () => {
    const snapshot = saveToLibrary()
    if (!snapshot) return
    const a = document.createElement('a')
    a.href = snapshot.preview
    a.download = 'mesh-gradient.png'
    a.click()
  }

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

  const endPointDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    activePointIndexRef.current = null
    setActivePointIndex(null)
  }

  const updateCanvasHover = (event: PointerEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const isInside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom

    setIsCanvasHovering(isInside)
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
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    canvasResizeRef.current = null
    setActiveResizeHandle(null)
  }

  return (
    <main
      className={`min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-6 ${classes.app}`}
      style={presetStyleVars}
    >
      <div className="grid min-h-[calc(100vh-2.5rem)] w-full grid-cols-1 grid-rows-[minmax(360px,1fr)_auto_auto] gap-6 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)_auto]">
        <section className={`relative z-10 col-start-1 row-start-1 flex min-h-0 w-full items-center justify-center rounded-[28px] lg:col-start-1 lg:row-start-1 ${classes.canvasArea}`}>
          <div
            ref={canvasFrameRef}
            className={`group relative max-w-full ${activePointIndex !== null ? 'cursor-grabbing' : ''}`}
            style={{ width: Math.min(width, CANVAS_PREVIEW_MAX_WIDTH), aspectRatio: `${width} / ${height}` }}
            onPointerMove={updateCanvasHover}
            onPointerLeave={() => setIsCanvasHovering(false)}
          >
            <canvas
              ref={canvasRef}
              className="block h-auto max-w-full"
              style={{
                width: '100%',
                aspectRatio: `${width} / ${height}`,
                borderRadius: CANVAS_CORNER_RADIUS,
                boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
              }}
            />
            <div className="pointer-events-none absolute inset-0 z-40 overflow-visible text-[var(--pg-text)]">
              <div
                className="pointer-events-auto absolute"
                style={perimeterControlStyle('style', previewWidth)}
              >
              <Select
                value={style}
                onValueChange={(value) => setStyle(value as GradientStyle)}
              >
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

              <div
                className="pointer-events-auto absolute"
                style={perimeterControlStyle('warpShape', previewWidth)}
              >
              <Select
                value={warpShape}
                onValueChange={(value) => setWarpShape(value as WarpShape)}
              >
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

              <div
                className="pointer-events-auto absolute flex h-9 items-center gap-2 rounded-[12px] bg-white/[0.10] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
                style={perimeterControlStyle('warp', previewWidth)}
              >
                <span className="w-8 whitespace-nowrap text-[11px] font-medium text-white/80">Warp</span>
                <Slider
                  aria-label="Warp"
                  className="min-w-[160px]"
                  min={0}
                  max={1.5}
                  step={0.01}
                  value={[warp]}
                  onValueChange={([value]) => setWarp(value)}
                />
              </div>

              <div
                className="pointer-events-auto absolute flex h-9 items-center gap-2 rounded-[12px] bg-white/[0.10] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
                style={perimeterControlStyle('warpSize', previewWidth)}
              >
                <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-white/80">Warp Size</span>
                <Slider
                  aria-label="Warp Size"
                  className="min-w-[160px]"
                  min={0}
                  max={3}
                  step={0.01}
                  value={[warpSize]}
                  onValueChange={([value]) => setWarpSize(value)}
                />
              </div>

              <div
                className="pointer-events-auto absolute flex h-9 items-center gap-2 rounded-[12px] bg-white/[0.10] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
                style={perimeterControlStyle('noise', previewWidth)}
              >
                <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-white/80">Noise</span>
                <Slider
                  aria-label="Noise"
                  className="min-w-[160px]"
                  min={0}
                  max={NOISE_MAX}
                  step={0.001}
                  value={[noise]}
                  onValueChange={([value]) => setNoise(value)}
                />
              </div>
            </div>
            <div
              className={`absolute inset-0 rounded-[24px] transition-opacity ${
                showPointHandles ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {pointPositions.map((point, index) => (
                <button
                  key={index}
                  type="button"
                  className="absolute h-6 w-6 touch-none -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.45)] outline-none ring-1 ring-black/30 transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-white active:cursor-grabbing"
                  style={{
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                    backgroundColor: colors[index],
                  }}
                  title={`Color point ${index + 1}`}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.currentTarget.setPointerCapture(event.pointerId)
                    activePointIndexRef.current = index
                    setActivePointIndex(index)
                    movePoint(index, event.clientX, event.clientY)
                  }}
                  onPointerMove={(event) => {
                    if (activePointIndexRef.current !== index) return
                    movePoint(index, event.clientX, event.clientY)
                  }}
                  onPointerUp={endPointDrag}
                  onPointerCancel={endPointDrag}
                />
              ))}
            </div>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 rounded-[24px] transition-opacity duration-300 ${
                showWarpPreview && activePointIndex === null ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {warpedPointPositions.map((point, index) => (
                <span
                  key={index}
                  className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-1 ring-black/30 transition-[left,top,transform] duration-300 ease-out ${
                    showWarpPreview && activePointIndex === null ? 'scale-100' : 'scale-75'
                  }`}
                  style={{
                    left: `${point.x * 100}%`,
                    top: `${point.y * 100}%`,
                    backgroundColor: colors[index],
                  }}
                />
              ))}
            </div>
            {RESIZE_HANDLES.filter((handle) => handle.id === 'se').map((handle) => (
              <button
                key={handle.id}
                type="button"
                className={`group/resize ${resizeHandleButtonClass(handle, activeResizeHandle)}`}
                style={{
                  left: `${handle.x}%`,
                  top: `${handle.y}%`,
                  cursor: handle.cursor,
                  transform: `translate(calc(-50% + ${handle.offsetX}px), calc(-50% + ${handle.offsetY}px))`,
                }}
                title={handle.label}
                aria-label={handle.label}
                onPointerDown={(event) => beginCanvasResize(handle, event)}
                onPointerMove={resizeCanvas}
                onPointerUp={endCanvasResize}
                onPointerCancel={endCanvasResize}
              >
                {handle.shape === 'corner' ? (
                  <svg
                    aria-hidden
                    viewBox="0 0 48 48"
                    fill="none"
                    className={resizeHandleCornerClass(handle.id, activeResizeHandle)}
                  >
                    <path
                      d={resizeHandleCornerPath(handle.id)}
                      stroke="currentColor"
                      strokeWidth={RESIZE_HANDLE_CORNER_STROKE_WIDTH}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span aria-hidden className={resizeHandleBarClass(handle, activeResizeHandle)} />
                )}
              </button>
            ))}
          </div>
        </section>

        <aside className={`z-30 col-start-1 row-start-2 max-h-[min(720px,calc(100vh-3rem))] w-full overflow-y-auto lg:col-start-2 lg:row-start-1 lg:self-center ${classes.panel}`}>
          <div className="grid grid-cols-2 gap-8 p-6">
            <label className="flex items-center gap-3">
              <span className="text-sm font-semibold">W</span>
              <Input
                type="number"
                min={CANVAS_MIN_WIDTH}
                value={width}
                onChange={(e) => setWidth(clamp(Number(e.target.value), CANVAS_MIN_WIDTH, CANVAS_MAX_SIZE))}
                className="w-16"
              />
            </label>
            <label className="flex items-center gap-3">
              <span className="text-sm font-semibold">H</span>
              <Input
                type="number"
                min={CANVAS_MIN_HEIGHT}
                value={height}
                onChange={(e) => setHeight(clamp(Number(e.target.value), CANVAS_MIN_HEIGHT, CANVAS_MAX_SIZE))}
                className="w-16"
              />
            </label>
          </div>

          <div className={`border-t px-6 py-5 ${classes.panelDivider}`}>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-semibold">Colors</div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  onClick={() => {
                    setColors(gradientDefaults.colors)
                    setPointPositions(DEFAULT_POINT_POSITIONS)
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-lg leading-none"
                  title="Reset colors"
                >
                  <RefreshCw size={16} strokeWidth={1.8} />
                </Button>
                <Button
                  type="button"
                  onClick={saveToLibrary}
                  variant="ghost"
                  size="icon"
                  className="text-xl leading-none"
                  title="Save to library"
                >
                  <Plus size={18} strokeWidth={1.8} />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {colors.map((color, index) => (
                <div
                  key={color}
                  className={`flex items-center gap-2 rounded-md transition-colors ${
                    draggingColorIndex === index ? 'bg-white/[0.07]' : 'bg-transparent'
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    const fromIndex = Number(event.dataTransfer.getData('text/plain'))
                    if (Number.isInteger(fromIndex)) {
                      reorderColorLayer(fromIndex, index)
                    }
                    setDraggingColorIndex(null)
                  }}
                >
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', String(index))
                      setDraggingColorIndex(index)
                    }}
                    onDragEnd={() => setDraggingColorIndex(null)}
                    className="grid h-8 w-6 shrink-0 cursor-grab place-items-center rounded text-[var(--pg-text)] opacity-55 transition-opacity hover:opacity-100 active:cursor-grabbing"
                    title="Drag to reorder color layer"
                  >
                    <GripVertical size={15} strokeWidth={1.8} />
                  </button>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="color-chip h-5 w-5 shrink-0 appearance-none rounded-full border-0 bg-transparent p-0"
                    title={`Choose color ${index + 1}`}
                  />
                  <Input
                    value={color.replace('#', '')}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="h-8 flex-1 uppercase"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={`grid grid-cols-2 border-t ${classes.footerButtonDivider}`}>
            <Button
              onClick={saveToLibrary}
              variant="ghost"
              size="dock"
              className={`rounded-none border-r ${classes.footerButtonDivider}`}
            >
              <Save size={16} strokeWidth={1.8} />
              <span>Save</span>
            </Button>
            <Button
              onClick={download}
              variant="ghost"
              size="dock"
              className="rounded-none"
            >
              <Download size={16} strokeWidth={1.8} />
              <span>Download</span>
            </Button>
          </div>
        </aside>

        {library.length > 0 && (
          <section className="z-20 col-start-1 row-start-3 h-36 overflow-hidden lg:col-span-2 lg:row-start-2">
            <div
              className="flex h-full items-end gap-6 overflow-x-auto overflow-y-visible px-1 pb-2 pt-12"
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                dockMouseX.set(event.clientX - rect.left + event.currentTarget.scrollLeft)
              }}
              onMouseLeave={() => dockMouseX.set(Number.POSITIVE_INFINITY)}
            >
              {library.map((snapshot, index) => (
                <DockItem
                  key={snapshot.id}
                  snapshot={snapshot}
                  index={index}
                  mouseX={dockMouseX}
                  onSelect={loadSnapshot}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
