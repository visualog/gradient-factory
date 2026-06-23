import type { GradientSnapshot, PointPosition } from '@/lib/gradient-model'
import type { GradientStyle, WarpShape } from '@/lib/style-presets'

export type UiGradientPreset = Omit<GradientSnapshot, 'id' | 'preview'> & {
  label: string
}

const p = (x: number, y: number): PointPosition => ({ x, y })

export const UI_IMAGE_STYLES = [
  'Flame Inset',
  'Lime Violet Drift',
  'Mint Dome',
  'Cyan Ribbon',
  'Violet Well',
  'Solar Slash',
  'Candy Wave',
  'Lime Gate',
  'Pop Horizon',
  'Dusk Shelf',
  'Blue Core',
  'Rose Orbit',
] as const satisfies readonly GradientStyle[]

export const UI_GRADIENT_PRESETS: UiGradientPreset[] = [
  { label: 'Flame Inset', width: 640, height: 640, colors: ['#FF2A17', '#FF7A30', '#190712', '#FFB276', '#68101E', '#050505'], pointPositions: [p(0.28, 0.42), p(0.55, 0.82), p(0.5, 0.11), p(0.75, 0.88), p(0.5, 0.22), p(0.5, 0.04)], style: 'Flame Inset', warpShape: 'Pinch', warp: 0.62, warpSize: 1.85, noise: 0.006 },
  { label: 'Lime Violet Drift', width: 640, height: 640, colors: ['#D8FF18', '#A7EA18', '#7B35FF', '#262D3D', '#C7FF45', '#4D2498'], pointPositions: [p(0.18, 0.18), p(0.82, 0.18), p(0.66, 0.66), p(0.45, 0.5), p(0.26, 0.72), p(0.72, 0.78)], style: 'Lime Violet Drift', warpShape: 'Wave', warp: 0.92, warpSize: 1.7, noise: 0.005 },
  { label: 'Mint Dome', width: 640, height: 640, colors: ['#58F079', '#A8FFBA', '#03200F', '#0A4422', '#35C95A', '#020604'], pointPositions: [p(0.5, 0.66), p(0.5, 0.48), p(0.5, 0.08), p(0.16, 0.22), p(0.85, 0.78), p(0.9, 0.18)], style: 'Mint Dome', warpShape: 'Radial', warp: 0.42, warpSize: 1.95, noise: 0.003 },
  { label: 'Cyan Ribbon', width: 640, height: 640, colors: ['#73E8FF', '#F15BD9', '#010A0B', '#B6F4FF', '#5D124E', '#081516'], pointPositions: [p(0.52, 0.5), p(0.33, 0.28), p(0.19, 0.66), p(0.78, 0.72), p(0.7, 0.25), p(0.85, 0.14)], style: 'Cyan Ribbon', warpShape: 'Spiral', warp: 1.05, warpSize: 1.9, noise: 0.004 },
  { label: 'Violet Well', width: 640, height: 640, colors: ['#FA76DA', '#C83DDB', '#1A0522', '#5A1772', '#FF9BE8', '#09030D'], pointPositions: [p(0.22, 0.24), p(0.78, 0.74), p(0.5, 0.6), p(0.54, 0.42), p(0.82, 0.2), p(0.5, 0.76)], style: 'Violet Well', warpShape: 'Pinch', warp: 0.68, warpSize: 2.05, noise: 0.004 },
  { label: 'Solar Slash', width: 640, height: 640, colors: ['#FF4214', '#67D7FF', '#071018', '#FFF3B0', '#B51E10', '#1C65D8'], pointPositions: [p(0.52, 0.52), p(0.18, 0.2), p(0.22, 0.78), p(0.58, 0.6), p(0.72, 0.34), p(0.86, 0.78)], style: 'Solar Slash', warpShape: 'Wave', warp: 1.18, warpSize: 1.55, noise: 0.005 },
  { label: 'Candy Wave', width: 640, height: 640, colors: ['#FB42D7', '#FF7A32', '#061B11', '#263126', '#FF92B8', '#7E2A0E'], pointPositions: [p(0.5, 0.18), p(0.22, 0.28), p(0.5, 0.5), p(0.5, 0.76), p(0.5, 0.86), p(0.78, 0.72)], style: 'Candy Wave', warpShape: 'Ripple', warp: 0.84, warpSize: 1.6, noise: 0.005 },
  { label: 'Lime Gate', width: 640, height: 640, colors: ['#3CFF13', '#051008', '#A7FFA1', '#07110A', '#25B30A', '#000000'], pointPositions: [p(0.5, 0.5), p(0.5, 0.16), p(0.5, 0.46), p(0.5, 0.84), p(0.18, 0.5), p(0.82, 0.5)], style: 'Lime Gate', warpShape: 'Pinch', warp: 0.74, warpSize: 1.7, noise: 0.004 },
  { label: 'Pop Horizon', width: 640, height: 640, colors: ['#FF0478', '#FFFFFF', '#5369FF', '#FF80C3', '#1B2EFF', '#07102C'], pointPositions: [p(0.5, 0.2), p(0.5, 0.58), p(0.5, 0.82), p(0.24, 0.4), p(0.8, 0.88), p(0.12, 0.88)], style: 'Pop Horizon', warpShape: 'Radial', warp: 0.38, warpSize: 1.95, noise: 0.003 },
  { label: 'Dusk Shelf', width: 640, height: 640, colors: ['#F95BEC', '#7B5CFF', '#051415', '#1B2B2C', '#F2A1F3', '#050606'], pointPositions: [p(0.5, 0.15), p(0.25, 0.28), p(0.5, 0.72), p(0.5, 0.48), p(0.82, 0.18), p(0.5, 0.9)], style: 'Dusk Shelf', warpShape: 'Gravity', warp: 0.5, warpSize: 1.75, noise: 0.004 },
  { label: 'Blue Core', width: 640, height: 640, colors: ['#7FEAFF', '#3138FF', '#0A0B2A', '#0F205A', '#B5F7FF', '#02040D'], pointPositions: [p(0.5, 0.52), p(0.5, 0.72), p(0.5, 0.18), p(0.18, 0.52), p(0.5, 0.5), p(0.86, 0.5)], style: 'Blue Core', warpShape: 'Radial', warp: 0.28, warpSize: 1.45, noise: 0.003 },
  { label: 'Rose Orbit', width: 640, height: 640, colors: ['#FF2E78', '#FF7FA6', '#050203', '#3A0618', '#A90B3A', '#020603'], pointPositions: [p(0.5, 0.5), p(0.5, 0.28), p(0.5, 0.5), p(0.18, 0.18), p(0.82, 0.82), p(0.18, 0.82)], style: 'Rose Orbit', warpShape: 'Ripple', warp: 0.78, warpSize: 1.35, noise: 0.004 },
]

export const UI_GRADIENT_STYLES = UI_GRADIENT_PRESETS.map((preset) => preset.style)
export const C_LAB_DEFAULT_SNAPSHOT: GradientSnapshot = { id: 0, preview: '', ...UI_GRADIENT_PRESETS[3] }

export function getUiGradientPreset(style: GradientStyle) {
  return UI_GRADIENT_PRESETS.find((preset) => preset.style === style)
}
