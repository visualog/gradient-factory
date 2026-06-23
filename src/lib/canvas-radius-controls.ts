export type CanvasRadiusHandleMode = 'resize' | 'radius-horizontal' | 'radius-vertical'

const RADIUS_HANDLE_EDGE_ZONE = 16
const RADIUS_DRAG_SENSITIVITY = 0.55

export function radiusHandleModeFromLocalX(localX: number, buttonSize: number, edgeZone = RADIUS_HANDLE_EDGE_ZONE): CanvasRadiusHandleMode {
  if (localX <= edgeZone) return 'radius-horizontal'
  if (localX >= buttonSize - edgeZone) return 'radius-vertical'
  return 'resize'
}

export function canvasRadiusFromDrag({
  mode,
  startRadius,
  startX,
  startY,
  currentX,
  currentY,
  maxRadius,
}: {
  mode: CanvasRadiusHandleMode
  startRadius: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  maxRadius: number
}) {
  const rawDelta = mode === 'radius-horizontal' ? currentX - startX : mode === 'radius-vertical' ? startY - currentY : 0
  const delta = rawDelta * RADIUS_DRAG_SENSITIVITY
  return Math.round(Math.max(0, Math.min(maxRadius, startRadius + delta)))
}

export function radiusHandleCursor(mode: CanvasRadiusHandleMode, resizeCursor: string) {
  if (mode === 'radius-horizontal') return 'ew-resize'
  if (mode === 'radius-vertical') return 'ns-resize'
  return resizeCursor
}
