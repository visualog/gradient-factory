import type { GradientStyle, WarpShape } from '@/lib/style-presets'
import { DEFAULT_VIGNETTE, clamp, hexToRgb, pseudoNoise, smoothstep, type PointPosition } from '@/lib/gradient-model'

type ColorPoint = {
  color: string
  x: number
  y: number
}

const INSET_STYLES = ['Inset Bloom', 'Flame Inset', 'Mint Dome', 'Violet Well', 'Lime Gate', 'Dusk Shelf'] as const
const BAND_STYLES = ['Neon Band', 'Cyan Ribbon', 'Solar Slash', 'Candy Wave', 'Pop Horizon'] as const
const CUSHION_STYLES = ['Radial Cushion', 'Lime Violet Drift', 'Blue Core'] as const
const TWIST_STYLES = ['Aurora Twist', 'Rose Orbit'] as const

function angleDelta(a: number, b: number) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
}

function isOneOf(style: GradientStyle, styles: readonly string[]) {
  return styles.includes(style)
}

function gradientWeight(style: GradientStyle, nx: number, ny: number, point: ColorPoint, spread: number, flow: number) {
  const dx = nx - point.x
  const dy = ny - point.y
  const d = Math.sqrt(dx * dx + dy * dy)
  const scaledDistance = d / spread

  if (style === 'Sharp Bézier') {
    return 1 / Math.pow(scaledDistance * 8 + 0.18, 2.2)
  }

  if (style === 'Soft Mesh') {
    return 1 / Math.pow(scaledDistance * 6 + 0.25, 1.5)
  }

  if (style === 'Linear Fold') {
    const lineDistance = Math.abs(dx * 0.72 + dy * 0.36) / spread
    return 1 / Math.pow(lineDistance * 7 + scaledDistance * 1.8 + 0.2, 1.75)
  }

  if (style === 'Conic Bloom') {
    const pixelAngle = Math.atan2(ny - 0.5, nx - 0.5)
    const pointAngle = Math.atan2(point.y - 0.5, point.x - 0.5)
    const pixelRadius = Math.hypot(nx - 0.5, ny - 0.5)
    const pointRadius = Math.hypot(point.x - 0.5, point.y - 0.5)
    return 1 / Math.pow((angleDelta(pixelAngle, pointAngle) * 1.15 + Math.abs(pixelRadius - pointRadius) * 3.2) / spread + 0.18, 1.7)
  }

  if (isOneOf(style, INSET_STYLES)) {
    const verticalFalloff = Math.abs(dy * (1.25 + flow * 0.35)) / spread
    const cap = smoothstep(0.95, 0.08, Math.abs(dy) / spread)
    return 1 / Math.pow(scaledDistance * 3.4 + verticalFalloff * 2.1 + 0.14, 1.68) + cap * 0.42
  }

  if (isOneOf(style, BAND_STYLES)) {
    const angle = -0.72 + flow * 0.42
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const wave = Math.sin((nx + ny + point.x) * Math.PI * (1.8 + flow)) * 0.045 * flow
    const band = Math.abs((nx - point.x) * c + (ny - point.y) * s + wave) / spread
    return 1 / Math.pow(band * 8.2 + scaledDistance * 1.15 + 0.13, 1.82)
  }

  if (isOneOf(style, CUSHION_STYLES)) {
    const pixelRadius = Math.hypot(nx - 0.5, ny - 0.5)
    const pointRadius = Math.hypot(point.x - 0.5, point.y - 0.5)
    const radiusDistance = Math.abs(pixelRadius - pointRadius) / spread
    return 1 / Math.pow(radiusDistance * (4.6 + flow) + scaledDistance * 2.15 + 0.15, 1.58)
  }

  if (isOneOf(style, TWIST_STYLES)) {
    const pixelAngle = Math.atan2(ny - 0.5, nx - 0.5)
    const pointAngle = Math.atan2(point.y - 0.5, point.x - 0.5)
    const ribbon = Math.abs(Math.sin(pixelAngle * (1.35 + flow * 0.5) - pointAngle + d * (3.4 + flow * 2.2))) / spread
    return 1 / Math.pow(ribbon * 3.2 + scaledDistance * 2.5 + 0.18, 1.68)
  }

  const cellEdge = smoothstep(0.18, 0.02, scaledDistance)
  return 1 / Math.pow(scaledDistance * 5.4 + 0.2, 1.45) + cellEdge * 0.65
}

function isUiGlowStyle(style: GradientStyle) {
  return isOneOf(style, INSET_STYLES) || isOneOf(style, BAND_STYLES) || isOneOf(style, CUSHION_STYLES) || isOneOf(style, TWIST_STYLES)
}

function uiFieldShade(style: GradientStyle, nx: number, ny: number, vignette: number) {
  if (!isUiGlowStyle(style)) return 1

  const edge = Math.min(nx, 1 - nx, ny, 1 - ny)
  const edgeDepth = 0.46 * clamp(vignette, 0, 1)
  const edgeShade = 1 - edgeDepth + smoothstep(0, 0.18, edge) * edgeDepth
  if (isOneOf(style, INSET_STYLES)) return edgeShade * (1 - smoothstep(0.04, 0.32, ny) * 0.22)
  if (isOneOf(style, BAND_STYLES)) return edgeShade * 1.05
  if (isOneOf(style, CUSHION_STYLES)) return edgeShade * (1 + smoothstep(0.8, 0.1, Math.hypot(nx - 0.5, ny - 0.5)) * 0.08)
  return edgeShade * 0.96
}

export function buildPoints(
  colors: string[],
  pointPositions: PointPosition[],
  warpShape: WarpShape,
  warp: number
) {
  return colors.map((color, i) => {
    const fallback = pointPositions[i % pointPositions.length] ?? { x: 0.5, y: 0.5 }
    let x = fallback.x
    let y = fallback.y

    if (warpShape === 'Wave') {
      x += Math.sin(y * Math.PI * 2) * 0.08 * warp
      y += Math.cos(x * Math.PI * 2) * 0.05 * warp
    } else if (warpShape === 'Radial') {
      const angle = Math.atan2(y - 0.5, x - 0.5)
      const radius = Math.hypot(x - 0.5, y - 0.5)
      const amount = 1 + Math.sin(radius * Math.PI * 3) * 0.16 * warp
      x = 0.5 + Math.cos(angle) * radius * amount
      y = 0.5 + Math.sin(angle) * radius * amount
    } else if (warpShape === 'Spiral') {
      const angle = Math.atan2(y - 0.5, x - 0.5)
      const radius = Math.hypot(x - 0.5, y - 0.5)
      const twist = warp * (1.2 - radius)
      x = 0.5 + Math.cos(angle + twist) * radius
      y = 0.5 + Math.sin(angle + twist) * radius
    } else if (warpShape === 'Pinch') {
      const dx = x - 0.5
      const dy = y - 0.5
      const radius = Math.hypot(dx, dy)
      const pinch = 1 - smoothstep(0.05, 0.7, radius) * 0.35 * warp
      x = 0.5 + dx * pinch
      y = 0.5 + dy * pinch
    } else if (warpShape === 'Ripple') {
      const dx = x - 0.5
      const dy = y - 0.5
      const radius = Math.hypot(dx, dy)
      const pulse = Math.sin(radius * Math.PI * 7 + i * 0.9) * 0.055 * warp
      x += dx * pulse
      y += dy * pulse
    } else if (warpShape === 'Drift') {
      x += Math.sin((i + 1) * 1.7 + warp * 2.4) * 0.065 * warp
      y += Math.cos((i + 1) * 1.3 - warp * 2.1) * 0.055 * warp
    } else {
      const pull = 0.11 * warp
      x += (0.5 - x) * pull
      y += (0.5 - y) * pull
    }

    return {
      color,
      x: clamp(x, 0, 1),
      y: clamp(y, 0, 1),
    }
  })
}

export function renderGradient(
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
    vignetteAmount = DEFAULT_VIGNETTE,
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
    vignetteAmount?: number
  }
) {
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const image = ctx.createImageData(width, height)
  const data = image.data
  const spread = clamp(warpSize, 0.35, 3)
  const uiGlow = isUiGlowStyle(style)
  const points = buildPoints(colors, pointPositions, warpShape, uiGlow ? 0 : warp).map((p) => ({
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
        const weight = gradientWeight(style, nx, ny, p, spread, warp)
        r += p.rgb.r * weight
        g += p.rgb.g * weight
        b += p.rgb.b * weight
        total += weight
      }

      const grain = (pseudoNoise(x * 0.9, y * 0.9) - 0.5) * 255 * noiseAmount
      const radius = Math.hypot(nx - 0.5, ny - 0.5)
      const baseVignette = smoothstep(uiGlow ? 0.82 : 0.95, uiGlow ? 0.18 : 0.2, radius)
      const vignette = uiGlow ? 1 - clamp(vignetteAmount, 0, 1) * (1 - baseVignette) : baseVignette
      const lift = uiGlow ? uiFieldShade(style, nx, ny, vignetteAmount) * 1.08 : 1
      const i = (y * width + x) * 4
      data[i] = clamp((r / total) * vignette * lift + grain, 0, 255)
      data[i + 1] = clamp((g / total) * vignette * lift + grain, 0, 255)
      data[i + 2] = clamp((b / total) * vignette * lift + grain, 0, 255)
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
}
