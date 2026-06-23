import type { CSSProperties } from 'react'
import { CANVAS_CORNER_RADIUS } from '@/lib/gradient-model'

export const CONTROL_RAIL_GAP = 12
export const CONTROL_ITEM_GAP = 8
export const CONTROL_HEIGHT = 36
export const SLIDER_LABEL_GAP = 12
export const SLIDER_TRACK_LENGTH = 160
const CONTROL_SURFACE_RADIUS = 12

const PERIMETER_CONTROLS = [
  { id: 'style', width: 136 },
  { id: 'warpShape', width: 112 },
  { id: 'warp', width: 228 },
  { id: 'warpSize', width: 256 },
  { id: 'noise', width: 232 },
  { id: 'vignette', width: 248 },
] as const

export type PerimeterControlId = (typeof PERIMETER_CONTROLS)[number]['id']

export function perimeterControlStart(controlId: PerimeterControlId) {
  let distance = 0

  for (const control of PERIMETER_CONTROLS) {
    if (control.id === controlId) return distance
    distance += control.width + CONTROL_ITEM_GAP
  }

  return distance
}

export function perimeterControlWidth(controlId: PerimeterControlId) {
  return PERIMETER_CONTROLS.find((control) => control.id === controlId)?.width ?? 160
}

export function perimeterPathGeometry(previewWidth: number) {
  const pathRadius = CANVAS_CORNER_RADIUS + CONTROL_RAIL_GAP + CONTROL_HEIGHT / 2
  const topStraightLength = Math.max(0, previewWidth - CANVAS_CORNER_RADIUS)
  const cornerCenterX = previewWidth - CANVAS_CORNER_RADIUS
  const cornerCenterY = CANVAS_CORNER_RADIUS
  const arcLength = (Math.PI * pathRadius) / 2
  const topY = -(CONTROL_RAIL_GAP + CONTROL_HEIGHT / 2)

  return { arcLength, cornerCenterX, cornerCenterY, pathRadius, topStraightLength, topY }
}

export function perimeterPointAt(distance: number, previewWidth: number) {
  const g = perimeterPathGeometry(previewWidth)

  if (distance <= g.topStraightLength) return { x: distance, y: g.topY, angle: 0 }
  if (distance <= g.topStraightLength + g.arcLength) {
    const theta = -Math.PI / 2 + (distance - g.topStraightLength) / g.pathRadius
    return {
      x: g.cornerCenterX + g.pathRadius * Math.cos(theta),
      y: g.cornerCenterY + g.pathRadius * Math.sin(theta),
      angle: (theta * 180) / Math.PI + 90,
    }
  }

  return {
    x: g.cornerCenterX + g.pathRadius,
    y: g.cornerCenterY + distance - g.topStraightLength - g.arcLength,
    angle: 90,
  }
}

function surfacePoint(distance: number, previewWidth: number, side = 0) {
  const g = perimeterPathGeometry(previewWidth)
  const radius = g.pathRadius - side

  if (distance <= g.topStraightLength) return { x: distance, y: g.topY + side }
  if (distance <= g.topStraightLength + g.arcLength) {
    const theta = -Math.PI / 2 + (distance - g.topStraightLength) / g.pathRadius
    return { x: g.cornerCenterX + radius * Math.cos(theta), y: g.cornerCenterY + radius * Math.sin(theta) }
  }

  return {
    x: g.cornerCenterX + g.pathRadius - side,
    y: g.cornerCenterY + distance - g.topStraightLength - g.arcLength,
  }
}

function offsetSegmentPath(start: number, end: number, previewWidth: number, side: number, minX: number, minY: number) {
  const g = perimeterPathGeometry(previewWidth)
  const radius = g.pathRadius - side
  const local = (point: { x: number; y: number }) => `${point.x - minX} ${point.y - minY}`
  const startPoint = surfacePoint(start, previewWidth, side)
  const endPoint = surfacePoint(end, previewWidth, side)
  const forward = end >= start
  let d = `M ${local(startPoint)}`

  if (forward && start < g.topStraightLength && end > g.topStraightLength) {
    d += ` L ${local(surfacePoint(g.topStraightLength, previewWidth, side))}`
  }

  if (!forward && start > g.topStraightLength + g.arcLength && end < g.topStraightLength + g.arcLength) {
    d += ` L ${local(surfacePoint(g.topStraightLength + g.arcLength, previewWidth, side))}`
  }

  const arcLow = Math.max(Math.min(start, end), g.topStraightLength)
  const arcHigh = Math.min(Math.max(start, end), g.topStraightLength + g.arcLength)
  if (arcLow < arcHigh) {
    d += ` A ${radius} ${radius} 0 0 ${forward ? 1 : 0} ${local(surfacePoint(forward ? arcHigh : arcLow, previewWidth, side))}`
  }

  if (!forward && start > g.topStraightLength && end < g.topStraightLength) {
    d += ` L ${local(surfacePoint(g.topStraightLength, previewWidth, side))}`
  }

  d += ` L ${local(endPoint)}`

  return d
}

export function roundedPerimeterSurfacePath(start: number, end: number, previewWidth: number, minX: number, minY: number) {
  const half = CONTROL_HEIGHT / 2
  const bodyStart = start + CONTROL_SURFACE_RADIUS
  const bodyEnd = end - CONTROL_SURFACE_RADIUS
  const local = (x: number, y: number) => `${x - minX} ${y - minY}`
  const startTop = surfacePoint(start, previewWidth, half - CONTROL_SURFACE_RADIUS)
  const startBottom = surfacePoint(start, previewWidth, CONTROL_SURFACE_RADIUS - half)
  const endTop = surfacePoint(end, previewWidth, half - CONTROL_SURFACE_RADIUS)
  const endBottom = surfacePoint(end, previewWidth, CONTROL_SURFACE_RADIUS - half)
  let d = offsetSegmentPath(bodyStart, bodyEnd, previewWidth, half, minX, minY)

  d += ` A ${CONTROL_SURFACE_RADIUS} ${CONTROL_SURFACE_RADIUS} 0 0 0 ${local(endTop.x, endTop.y)}`
  d += ` L ${local(endBottom.x, endBottom.y)}`
  d += ` A ${CONTROL_SURFACE_RADIUS} ${CONTROL_SURFACE_RADIUS} 0 0 0 ${local(surfacePoint(bodyEnd, previewWidth, -half).x, surfacePoint(bodyEnd, previewWidth, -half).y)}`
  d += offsetSegmentPath(bodyEnd, bodyStart, previewWidth, -half, minX, minY).replace(/^M [\d.-]+ [\d.-]+/, '')
  d += ` A ${CONTROL_SURFACE_RADIUS} ${CONTROL_SURFACE_RADIUS} 0 0 0 ${local(startBottom.x, startBottom.y)}`
  d += ` L ${local(startTop.x, startTop.y)}`
  d += ` A ${CONTROL_SURFACE_RADIUS} ${CONTROL_SURFACE_RADIUS} 0 0 0 ${local(surfacePoint(bodyStart, previewWidth, half).x, surfacePoint(bodyStart, previewWidth, half).y)} Z`

  return d
}

export function perimeterControlStyle(controlId: PerimeterControlId, previewWidth: number): CSSProperties {
  const width = perimeterControlWidth(controlId)
  const centerDistance = perimeterControlStart(controlId) + width / 2
  const { x, y, angle } = perimeterPointAt(centerDistance, previewWidth)

  return {
    height: CONTROL_HEIGHT,
    left: x,
    top: y,
    transform: `translate(-50%, -50%) rotate(${angle}deg)`,
    transformOrigin: 'center',
    width,
  }
}
