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
const DEFAULT_POINT_POSITIONS: PointPosition[] = [
  { x: 0.18, y: 0.18 },
  { x: 0.82, y: 0.14 },
  { x: 0.20, y: 0.82 },
  { x: 0.78, y: 0.78 },
  { x: 0.50, y: 0.32 },
  { x: 0.50, y: 0.66 },
]

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dockMouseX = useMotionValue(Number.POSITIVE_INFINITY)
  const activePointIndexRef = useRef<number | null>(null)
  const dragFrameRef = useRef<number | null>(null)
  const pendingPointRef = useRef<{ index: number; point: PointPosition } | null>(null)
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null)
  const [draggingColorIndex, setDraggingColorIndex] = useState<number | null>(null)
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

  useEffect(() => {
    if (!canvasRef.current) return
    renderGradient(canvasRef.current, state)
  }, [state])

  useEffect(() => {
    return () => {
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current)
      }
    }
  }, [])

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
    setWidth(snapshot.width)
    setHeight(snapshot.height)
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

  return (
    <main
      className={`min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-6 ${classes.app}`}
      style={presetStyleVars}
    >
      <div className="grid min-h-[calc(100vh-2.5rem)] w-full grid-cols-1 grid-rows-[minmax(360px,1fr)_auto_auto] gap-6 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)_auto]">
        <section className={`relative z-10 col-start-1 row-start-1 flex min-h-0 w-full items-center justify-center rounded-[28px] p-4 sm:p-6 lg:col-start-1 lg:row-start-1 ${classes.canvasArea}`}>
          <div
            className={`group relative max-w-full ${activePointIndex !== null ? 'cursor-grabbing' : ''}`}
            style={{ width: Math.min(width, 900), aspectRatio: `${width} / ${height}` }}
          >
            <canvas
              ref={canvasRef}
              className="block h-auto max-w-full"
              style={{
                width: '100%',
                aspectRatio: `${width} / ${height}`,
                borderRadius: 24,
                boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
              }}
            />
            <div
              className={`absolute inset-0 rounded-[24px] transition-opacity ${
                activePointIndex !== null ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              {pointPositions.map((point, index) => (
                <button
                  key={index}
                  type="button"
                  className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.45)] outline-none ring-1 ring-black/30 transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-white active:cursor-grabbing"
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
          </div>
        </section>

        <aside className={`z-30 col-start-1 row-start-2 max-h-[min(720px,calc(100vh-3rem))] w-full overflow-y-auto lg:col-start-2 lg:row-start-1 lg:self-center ${classes.panel}`}>
          <div className="space-y-5 p-6">
            <label className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
              <span className="text-base font-semibold">Gradient</span>
              <Select
                value={style}
                onValueChange={(value) => setStyle(value as GradientStyle)}
              >
                <SelectTrigger className="w-full min-w-0">
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
            </label>

            <label className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
              <span className="text-sm font-semibold">Warp Shape</span>
              <Select
                value={warpShape}
                onValueChange={(value) => setWarpShape(value as WarpShape)}
              >
                <SelectTrigger className="w-full min-w-0">
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
            </label>

            <div className="grid grid-cols-2 gap-8">
              <label className="flex items-center gap-3">
                <span className="text-sm font-semibold">W</span>
                <Input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-16"
                />
              </label>
              <label className="flex items-center gap-3">
                <span className="text-sm font-semibold">H</span>
                <Input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-16"
                />
              </label>
            </div>
          </div>

          <div className={`space-y-5 border-t px-6 py-5 ${classes.panelDivider}`}>
            <label className="grid grid-cols-[76px_1fr] items-center gap-3">
              <span className="text-sm">Warp</span>
              <Slider
                min={0}
                max={1.5}
                step={0.01}
                value={[warp]}
                onValueChange={([value]) => setWarp(value)}
              />
            </label>

            <label className="grid grid-cols-[76px_1fr] items-center gap-3">
              <span className="text-sm">Warp Size</span>
              <Slider
                min={0}
                max={3}
                step={0.01}
                value={[warpSize]}
                onValueChange={([value]) => setWarpSize(value)}
              />
            </label>

            <label className="grid grid-cols-[76px_1fr] items-center gap-3">
              <span className="text-sm">Noise</span>
              <Slider
                min={0}
                max={0.15}
                step={0.001}
                value={[noise]}
                onValueChange={([value]) => setNoise(value)}
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
                    className="h-5 w-5 shrink-0 appearance-none rounded border-0 bg-transparent p-0"
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
