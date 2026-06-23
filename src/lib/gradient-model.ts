import type { GradientStyle, WarpShape } from '@/lib/style-presets'

export type PointPosition = {
  x: number
  y: number
}

export type GradientSnapshot = {
  id: number
  preview: string
  name?: string
  favorite?: boolean
  kind?: 'saved' | 'history'
  width: number
  height: number
  cornerRadius?: number
  colors: string[]
  pointPositions?: PointPosition[]
  style: GradientStyle
  warpShape: WarpShape
  warp: number
  warpSize: number
  noise: number
  vignette?: number
}

export const WARP_PREVIEW_HIDE_DELAY = 900
export const CANVAS_MIN_WIDTH = 640
export const CANVAS_MIN_HEIGHT = 640
export const CANVAS_MAX_SIZE = 2048
export const CANVAS_PREVIEW_MAX_WIDTH = 900
export const CANVAS_CORNER_RADIUS = 24
export const NOISE_MAX = 0.15
export const VIGNETTE_MAX = 1
export const DEFAULT_VIGNETTE = 0.62
export const PALETTE_BASE_COLOR_COUNT = 4
export const PALETTE_MAX_COLOR_COUNT = 6
export const PALETTE_EXTRA_COLORS = ['#C25EA5', '#7961D3']

export const DEFAULT_POINT_POSITIONS: PointPosition[] = [
  { x: 0.18, y: 0.18 },
  { x: 0.82, y: 0.14 },
  { x: 0.20, y: 0.82 },
  { x: 0.78, y: 0.78 },
  { x: 0.50, y: 0.32 },
  { x: 0.50, y: 0.66 },
]

export function hexToRgb(hex: string) {
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

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function pseudoNoise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return n - Math.floor(n)
}
