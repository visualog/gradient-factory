export const GRADIENT_MASK_EFFECTS = ['None', 'RibbedGlass', 'PebbleGlass', 'RippleGlass'] as const

export type GradientMaskEffect = (typeof GRADIENT_MASK_EFFECTS)[number]

export const DEFAULT_GRADIENT_MASK: GradientMaskEffect = 'None'

export const GRADIENT_MASK_LABELS: Record<GradientMaskEffect, string> = {
  None: '마스크 끔',
  RibbedGlass: '세로 유리',
  PebbleGlass: '조약돌 유리',
  RippleGlass: '물결 유리',
}

const clamp = (v: number, min = 0, max = 1) => Math.max(min, Math.min(max, v))
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function gradientMaskCoverage(mask: GradientMaskEffect = DEFAULT_GRADIENT_MASK, nx: number, ny: number) {
  void mask
  void nx
  void ny
  return 1
}

function ribbedWave(nx: number, ny: number) {
  return Math.sin((nx * 42 + Math.sin(ny * 8) * 0.28) * Math.PI)
}

function pebbleCell(nx: number, ny: number) {
  const qx = nx * 12 + Math.sin(ny * 9) * 0.35
  const qy = ny * 16 + Math.sin(nx * 8) * 0.25
  const fx = qx - Math.floor(qx) - 0.5
  const fy = qy - Math.floor(qy) - 0.5
  const d = Math.hypot(fx, fy)
  const ridge = smoothstep(0.48, 0.25, d)
  return { fx, fy, ridge }
}

function rippleWave(nx: number, ny: number) {
  const d = Math.hypot(nx - 0.52, ny - 0.48)
  return Math.sin((d * 26 + Math.sin(nx * 9) * 0.08) * Math.PI)
}

export function gradientGlassMaskDisplacement(mask: GradientMaskEffect = DEFAULT_GRADIENT_MASK, nx: number, ny: number) {
  if (mask === 'RibbedGlass') {
    const wave = ribbedWave(nx, ny)
    return { x: wave * 0.018, y: Math.sin(ny * Math.PI * 9) * 0.002 }
  }
  if (mask === 'PebbleGlass') {
    const cell = pebbleCell(nx, ny)
    return { x: cell.fx * cell.ridge * 0.026, y: cell.fy * cell.ridge * 0.026 }
  }
  if (mask === 'RippleGlass') {
    const wave = rippleWave(nx, ny)
    return {
      x: Math.cos((ny + wave * 0.02) * Math.PI * 11) * 0.012 + wave * 0.006,
      y: Math.sin((nx + wave * 0.02) * Math.PI * 9) * 0.012,
    }
  }
  return { x: 0, y: 0 }
}

function ribbedOverlay(nx: number, ny: number) {
  const wave = ribbedWave(nx, ny)
  const ridge = Math.abs(wave)
  const verticalShadow = 0.5 + Math.sin(nx * Math.PI * 84) * 0.5
  return {
    shade: clamp(0.84 + ridge * 0.22 - verticalShadow * 0.08),
    highlight: clamp(Math.pow(ridge, 5) * 0.18 + smoothstep(0.2, 0.8, ny) * 0.03),
    edge: clamp(ridge * 0.75),
  }
}

function pebbleOverlay(nx: number, ny: number) {
  const { ridge } = pebbleCell(nx, ny)
  return {
    shade: clamp(0.86 + ridge * 0.2),
    highlight: clamp(Math.pow(ridge, 2.4) * 0.16),
    edge: clamp(ridge * 0.7),
  }
}

function rippleOverlay(nx: number, ny: number) {
  const wave = rippleWave(nx, ny)
  const ridge = Math.abs(wave)
  return {
    shade: clamp(0.9 + wave * 0.08 + ridge * 0.08),
    highlight: clamp(Math.pow(ridge, 4) * 0.2),
    edge: clamp(ridge * 0.62),
  }
}

export function gradientGlassMaskOverlay(mask: GradientMaskEffect = DEFAULT_GRADIENT_MASK, nx: number, ny: number) {
  if (mask === 'RibbedGlass') return ribbedOverlay(nx, ny)
  if (mask === 'PebbleGlass') return pebbleOverlay(nx, ny)
  if (mask === 'RippleGlass') return rippleOverlay(nx, ny)
  return { shade: 1, highlight: 0, edge: 0 }
}

export function gradientMaskShade(mask: GradientMaskEffect = DEFAULT_GRADIENT_MASK, nx: number, ny: number) {
  return gradientGlassMaskOverlay(mask, nx, ny).shade
}
