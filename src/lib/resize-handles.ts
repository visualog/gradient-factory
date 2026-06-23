import { CANVAS_CORNER_RADIUS } from '@/lib/gradient-model'
import type { CanvasRadiusHandleMode } from '@/lib/canvas-radius-controls'

const RESIZE_HANDLE_EDGE_OFFSET = 18
const RESIZE_HANDLE_CORNER_GAP = 8
export const RESIZE_HANDLE_CORNER_BUTTON_SIZE = 56
export const RESIZE_HANDLE_CORNER_VISUAL_INSET = 0
export const RESIZE_HANDLE_CORNER_VIEWBOX = RESIZE_HANDLE_CORNER_BUTTON_SIZE
export const RESIZE_HANDLE_CORNER_STROKE_WIDTH = 5
export const RESIZE_HANDLE_CORNER_SURFACE_WIDTH = 8
const RESIZE_HANDLE_CORNER_STROKE_HALF = RESIZE_HANDLE_CORNER_STROKE_WIDTH / 2
const RESIZE_HANDLE_CORNER_OFFSET = 0
const RESIZE_HANDLE_CORNER_ARC_RADIUS =
  CANVAS_CORNER_RADIUS + RESIZE_HANDLE_CORNER_GAP + RESIZE_HANDLE_CORNER_STROKE_HALF
const RESIZE_HANDLE_CORNER_LOCAL = RESIZE_HANDLE_CORNER_BUTTON_SIZE / 2
const RESIZE_HANDLE_CORNER_ARC_START_DEG = 68
const RESIZE_HANDLE_CORNER_ARC_END_DEG = 22

export const RESIZE_HANDLES = [
  { id: 'nw', x: 0, y: 0, offsetX: -RESIZE_HANDLE_CORNER_OFFSET, offsetY: -RESIZE_HANDLE_CORNER_OFFSET, xAxis: -1, yAxis: -1, cursor: 'nwse-resize', label: 'Resize canvas from top left', shape: 'corner' },
  { id: 'n', x: 50, y: 0, offsetX: 0, offsetY: -RESIZE_HANDLE_EDGE_OFFSET, xAxis: 0, yAxis: -1, cursor: 'ns-resize', label: 'Resize canvas height from top', shape: 'horizontal' },
  { id: 'ne', x: 100, y: 0, offsetX: RESIZE_HANDLE_CORNER_OFFSET, offsetY: -RESIZE_HANDLE_CORNER_OFFSET, xAxis: 1, yAxis: -1, cursor: 'nesw-resize', label: 'Resize canvas from top right', shape: 'corner' },
  { id: 'e', x: 100, y: 50, offsetX: RESIZE_HANDLE_EDGE_OFFSET, offsetY: 0, xAxis: 1, yAxis: 0, cursor: 'ew-resize', label: 'Resize canvas width from right', shape: 'vertical' },
  { id: 'se', x: 100, y: 100, offsetX: RESIZE_HANDLE_CORNER_OFFSET, offsetY: RESIZE_HANDLE_CORNER_OFFSET, xAxis: 1, yAxis: 1, cursor: 'nwse-resize', label: 'Resize canvas from bottom right', shape: 'corner' },
  { id: 's', x: 50, y: 100, offsetX: 0, offsetY: RESIZE_HANDLE_EDGE_OFFSET, xAxis: 0, yAxis: 1, cursor: 'ns-resize', label: 'Resize canvas height from bottom', shape: 'horizontal' },
  { id: 'sw', x: 0, y: 100, offsetX: -RESIZE_HANDLE_CORNER_OFFSET, offsetY: RESIZE_HANDLE_CORNER_OFFSET, xAxis: -1, yAxis: 1, cursor: 'nesw-resize', label: 'Resize canvas from bottom left', shape: 'corner' },
  { id: 'w', x: 0, y: 50, offsetX: -RESIZE_HANDLE_EDGE_OFFSET, offsetY: 0, xAxis: -1, yAxis: 0, cursor: 'ew-resize', label: 'Resize canvas width from left', shape: 'vertical' },
] as const

export type ResizeHandle = (typeof RESIZE_HANDLES)[number]

export type CanvasResizeState = {
  pointerId: number
  mode: CanvasRadiusHandleMode
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startRadius: number
  scaleX: number
  scaleY: number
  xAxis: ResizeHandle['xAxis']
  yAxis: ResizeHandle['yAxis']
}

export function resizeHandleButtonClass(handle: ResizeHandle, activeResizeHandle: string | null) {
  const stateClass = activeResizeHandle
    ? activeResizeHandle === handle.id
      ? 'opacity-100'
      : 'opacity-70'
    : 'opacity-100'
  const sizeClass =
    handle.shape === 'horizontal' ? 'h-8 w-16' : handle.shape === 'vertical' ? 'h-16 w-8' : 'h-14 w-14'

  return `absolute z-50 flex touch-none items-center justify-center ${sizeClass} outline-none transition-opacity duration-150 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white/80 ${stateClass}`
}

export function resizeHandleBarClass(handle: ResizeHandle, activeResizeHandle: string | null) {
  const toneClass = activeResizeHandle === handle.id ? 'bg-white/85 border-white/40' : 'bg-white/50 border-white/20'
  const axisClass = handle.shape === 'horizontal' ? 'h-1.5 w-11' : 'h-11 w-1.5'

  return `block rounded-full border shadow-[0_3px_12px_rgba(0,0,0,0.45)] backdrop-blur transition-[background-color,border-color] duration-150 group-hover/resize:bg-white/75 ${axisClass} ${toneClass}`
}

export function resizeHandleCornerClass(handleId: ResizeHandle['id'], activeResizeHandle: string | null) {
  const toneClass = activeResizeHandle === handleId ? 'text-white' : 'text-white group-hover/resize:text-white'
  const shadowClass = 'drop-shadow-[0_4px_10px_rgba(0,0,0,0.65)]'

  return `absolute overflow-visible transition-[color,filter] duration-150 ${toneClass} ${shadowClass}`
}

export function resizeHandleCornerPath(handleId: ResizeHandle['id']) {
  const radius = RESIZE_HANDLE_CORNER_ARC_RADIUS
  const local = RESIZE_HANDLE_CORNER_LOCAL

  const pointOnArc = (cx: number, cy: number, angleDeg: number) => {
    const angle = (angleDeg * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  const arcPath = (cx: number, cy: number, startAngle: number, endAngle: number, sweep: 0 | 1) => {
    const start = pointOnArc(cx, cy, startAngle)
    const end = pointOnArc(cx, cy, endAngle)

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`
  }

  if (handleId === 'se') {
    const cx = local - CANVAS_CORNER_RADIUS
    const cy = local - CANVAS_CORNER_RADIUS
    return arcPath(cx, cy, RESIZE_HANDLE_CORNER_ARC_START_DEG, RESIZE_HANDLE_CORNER_ARC_END_DEG, 0)
  }

  if (handleId === 'sw') {
    const cx = local + CANVAS_CORNER_RADIUS
    const cy = local - CANVAS_CORNER_RADIUS
    return arcPath(cx, cy, 180 - RESIZE_HANDLE_CORNER_ARC_START_DEG, 180 - RESIZE_HANDLE_CORNER_ARC_END_DEG, 1)
  }

  if (handleId === 'ne') {
    const cx = local - CANVAS_CORNER_RADIUS
    const cy = local + CANVAS_CORNER_RADIUS
    return arcPath(cx, cy, 360 - RESIZE_HANDLE_CORNER_ARC_START_DEG, 360 - RESIZE_HANDLE_CORNER_ARC_END_DEG, 1)
  }

  const cx = local + CANVAS_CORNER_RADIUS
  const cy = local + CANVAS_CORNER_RADIUS
  return arcPath(cx, cy, 180 + RESIZE_HANDLE_CORNER_ARC_START_DEG, 180 + RESIZE_HANDLE_CORNER_ARC_END_DEG, 0)
}
