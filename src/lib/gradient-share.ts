import { GRADIENT_STYLES, WARP_SHAPES, type GradientStyle, type WarpShape } from '@/lib/style-presets'
import { GRADIENT_MASK_EFFECTS, type GradientMaskEffect } from '@/lib/gradient-mask-effects'
import type { GradientSnapshot, PointPosition } from '@/lib/gradient-model'

export type GradientStatePayload = Omit<GradientSnapshot, 'id' | 'preview'>

function isGradientStyle(value: unknown): value is GradientStyle {
  return typeof value === 'string' && (GRADIENT_STYLES as readonly string[]).includes(value)
}

function isWarpShape(value: unknown): value is WarpShape {
  return typeof value === 'string' && (WARP_SHAPES as readonly string[]).includes(value)
}

function isGradientMaskEffect(value: unknown): value is GradientMaskEffect {
  return typeof value === 'string' && (GRADIENT_MASK_EFFECTS as readonly string[]).includes(value)
}

function isPoint(value: unknown): value is PointPosition {
  const point = value as Partial<PointPosition>
  return typeof point?.x === 'number' && typeof point?.y === 'number'
}

function toBase64Url(value: string) {
  const encoded = window.btoa(unescape(encodeURIComponent(value)))
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const padded = `${value.replace(/-/g, '+').replace(/_/g, '/')}${'='.repeat((4 - (value.length % 4)) % 4)}`
  return decodeURIComponent(escape(window.atob(padded)))
}

export function snapshotToState(snapshot: GradientSnapshot): GradientStatePayload {
  return {
    width: snapshot.width,
    height: snapshot.height,
    cornerRadius: snapshot.cornerRadius,
    colors: snapshot.colors,
    pointPositions: snapshot.pointPositions,
    style: snapshot.style,
    warpShape: snapshot.warpShape,
    warp: snapshot.warp,
    warpSize: snapshot.warpSize,
    noise: snapshot.noise,
    vignette: snapshot.vignette,
    mask: snapshot.mask,
    steps: snapshot.steps,
  }
}

export function encodeGradientState(snapshot: GradientSnapshot) {
  return toBase64Url(JSON.stringify(snapshotToState(snapshot)))
}

export function decodeGradientState(value: string): GradientStatePayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(value)) as Partial<GradientStatePayload>

    if (
      typeof parsed.width !== 'number' ||
      typeof parsed.height !== 'number' ||
      !Array.isArray(parsed.colors) ||
      !parsed.colors.every((color) => typeof color === 'string') ||
      !isGradientStyle(parsed.style) ||
      !isWarpShape(parsed.warpShape) ||
      typeof parsed.warp !== 'number' ||
      typeof parsed.warpSize !== 'number' ||
      typeof parsed.noise !== 'number'
    ) {
      return null
    }

    return {
      width: parsed.width,
      height: parsed.height,
      cornerRadius: typeof parsed.cornerRadius === 'number' ? parsed.cornerRadius : undefined,
      colors: parsed.colors,
      pointPositions: Array.isArray(parsed.pointPositions) ? parsed.pointPositions.filter(isPoint) : undefined,
      style: parsed.style,
      warpShape: parsed.warpShape,
      warp: parsed.warp,
      warpSize: parsed.warpSize,
      noise: parsed.noise,
      vignette: typeof parsed.vignette === 'number' ? parsed.vignette : undefined,
      mask: isGradientMaskEffect(parsed.mask) ? parsed.mask : undefined,
      steps: typeof parsed.steps === 'number' ? parsed.steps : undefined,
    }
  } catch {
    return null
  }
}

export function cssGradientSnippet(snapshot: GradientSnapshot) {
  const points = snapshot.pointPositions?.length
    ? snapshot.pointPositions
    : snapshot.colors.map((_, index) => ({ x: index % 2 ? 0.78 : 0.22, y: index < 2 ? 0.22 : 0.78 }))
  const layers = snapshot.colors.map((color, index) => {
    const point = points[index] ?? { x: 0.5, y: 0.5 }
    return `radial-gradient(circle at ${Math.round(point.x * 100)}% ${Math.round(point.y * 100)}%, ${color} 0, transparent 42%)`
  })

  return `background:\n  ${layers.join(',\n  ')},\n  #0b0d12;\nborder-radius: ${snapshot.cornerRadius ?? 0}px;`
}

export function tailwindGradientSnippet(snapshot: GradientSnapshot) {
  const compact = cssGradientSnippet(snapshot).split('\nborder-radius')[0]
    .replace('background:\n  ', '')
    .replace(/,\n  /g, ',')
    .replace(/;$/, '')
    .replace(/\s+/g, '_')
    .replace(/,/g, '\\,')

  return `className="bg-[${compact}] rounded-[${snapshot.cornerRadius ?? 0}px]"`
}
