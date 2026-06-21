import type { GradientStyle, WarpShape } from '@/lib/style-presets'
import { clamp, hexToRgb, pseudoNoise, smoothstep, type PointPosition } from '@/lib/gradient-model'

type ColorPoint = {
  color: string
  x: number
  y: number
}

function angleDelta(a: number, b: number) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))
}

function gradientWeight(style: GradientStyle, nx: number, ny: number, point: ColorPoint) {
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

  const cellEdge = smoothstep(0.18, 0.02, d)
  return 1 / Math.pow(d * 5.4 + 0.2, 1.45) + cellEdge * 0.65
}

export function buildPoints(
  colors: string[],
  pointPositions: PointPosition[],
  warpShape: WarpShape,
  warp: number,
  warpSize: number
) {
  return colors.map((color, i) => {
    const fallback = pointPositions[i % pointPositions.length] ?? { x: 0.5, y: 0.5 }
    let x = fallback.x
    let y = fallback.y

    if (warpShape === 'Wave') {
      x += Math.sin(y * Math.PI * 2) * 0.08 * warp * warpSize
      y += Math.cos(x * Math.PI * 2) * 0.05 * warp * warpSize
    } else if (warpShape === 'Radial') {
      const angle = Math.atan2(y - 0.5, x - 0.5)
      const radius = Math.hypot(x - 0.5, y - 0.5)
      const amount = 1 + Math.sin(radius * Math.PI * 3) * 0.16 * warp * warpSize
      x = 0.5 + Math.cos(angle) * radius * amount
      y = 0.5 + Math.sin(angle) * radius * amount
    } else if (warpShape === 'Spiral') {
      const angle = Math.atan2(y - 0.5, x - 0.5)
      const radius = Math.hypot(x - 0.5, y - 0.5)
      const twist = warp * warpSize * (1.2 - radius)
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
      const pulse = Math.sin(radius * Math.PI * 7 + i * 0.9) * 0.055 * warp * warpSize
      x += dx * pulse
      y += dy * pulse
    } else if (warpShape === 'Drift') {
      x += Math.sin((i + 1) * 1.7 + warp * 2.4) * 0.065 * warpSize
      y += Math.cos((i + 1) * 1.3 - warp * 2.1) * 0.055 * warpSize
    } else {
      const pull = 0.11 * warp * warpSize
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

      const grain = (pseudoNoise(x * 0.9, y * 0.9) - 0.5) * 255 * noiseAmount
      const vignette = smoothstep(0.95, 0.2, Math.hypot(nx - 0.5, ny - 0.5))
      const i = (y * width + x) * 4
      data[i] = clamp((r / total) * vignette + grain, 0, 255)
      data[i + 1] = clamp((g / total) * vignette + grain, 0, 255)
      data[i + 2] = clamp((b / total) * vignette + grain, 0, 255)
      data[i + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)
}
