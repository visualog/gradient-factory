'use client'

import type { CSSProperties, PointerEvent } from 'react'
import { clamp } from '@/lib/gradient-model'
import {
  CONTROL_HEIGHT,
  perimeterControlStart,
  perimeterControlWidth,
  perimeterPathGeometry,
  perimeterPointAt,
  roundedPerimeterSurfacePath,
  type PerimeterControlId,
} from '@/lib/perimeter-controls'

const SURFACE_WIDTH = CONTROL_HEIGHT
const TRACK_STROKE_WIDTH = 6
const THUMB_RADIUS = 7
const LABEL_OFFSET = 12
const TRACK_END_OFFSET = 16
const TRACK_LENGTH = 160
const LABEL_PATH_LENGTH = 72
const SIDE_LABEL_INSET = 8

type PathRange = {
  start: number
  end: number
  length: number
}

type CornerSliderProps = {
  controlId: PerimeterControlId
  label: string
  previewWidth: number
  value: number
  max: number
  step: number
  onChange: (value: number) => void
}

function controlRange(controlId: PerimeterControlId): PathRange {
  const start = perimeterControlStart(controlId)
  const end = start + perimeterControlWidth(controlId)

  return { end, length: end - start, start }
}

function trackRange(range: PathRange): PathRange {
  const start = Math.max(range.start + LABEL_OFFSET * 2, range.end - TRACK_END_OFFSET - TRACK_LENGTH)
  const end = range.end - TRACK_END_OFFSET

  return { end, length: end - start, start }
}

function labelRange(range: PathRange): PathRange {
  const start = range.start + LABEL_OFFSET
  const end = Math.min(range.end - LABEL_OFFSET, start + LABEL_PATH_LENGTH)

  return { end, length: end - start, start }
}

function segmentPath(start: number, end: number, previewWidth: number) {
  const g = perimeterPathGeometry(previewWidth)
  const points = [perimeterPointAt(start, previewWidth), perimeterPointAt(end, previewWidth)]
  let d = `M ${points[0].x} ${points[0].y}`

  if (start < g.topStraightLength && end > g.topStraightLength) {
    const p = perimeterPointAt(g.topStraightLength, previewWidth)
    d += ` L ${p.x} ${p.y}`
  }

  const arcStart = Math.max(start, g.topStraightLength)
  const arcEnd = Math.min(end, g.topStraightLength + g.arcLength)
  if (arcStart < arcEnd) {
    const p = perimeterPointAt(arcEnd, previewWidth)
    d += ` A ${g.pathRadius} ${g.pathRadius} 0 0 1 ${p.x} ${p.y}`
  }

  d += ` L ${points[1].x} ${points[1].y}`
  return d
}

function localSegmentPath(start: number, end: number, previewWidth: number, minX: number, minY: number) {
  if (end <= start) return ''

  return segmentPath(start, end, previewWidth)
    .replace(/([ML]) ([\d.-]+) ([\d.-]+)/g, (_, command, xValue, yValue) => `${command} ${Number(xValue) - minX} ${Number(yValue) - minY}`)
    .replace(/A ([\d.-]+) ([\d.-]+) 0 0 1 ([\d.-]+) ([\d.-]+)/g, (_, rx, ry, xValue, yValue) => `A ${rx} ${ry} 0 0 1 ${Number(xValue) - minX} ${Number(yValue) - minY}`)
}

function boundsForPath(start: number, end: number, previewWidth: number) {
  const g = perimeterPathGeometry(previewWidth)
  const distances = [start, end, g.topStraightLength, g.topStraightLength + g.arcLength].filter((d) => d >= start && d <= end)
  const points = distances.map((distance) => perimeterPointAt(distance, previewWidth))
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const pad = SURFACE_WIDTH / 2

  return {
    height: Math.max(CONTROL_HEIGHT, Math.max(...ys) - Math.min(...ys) + SURFACE_WIDTH),
    minX: Math.min(...xs) - pad,
    minY: Math.min(...ys) - pad,
    width: Math.max(CONTROL_HEIGHT, Math.max(...xs) - Math.min(...xs) + SURFACE_WIDTH),
  }
}

function rangeTouchesCorner(range: PathRange, previewWidth: number) {
  const g = perimeterPathGeometry(previewWidth)
  const arcStart = g.topStraightLength
  const arcEnd = g.topStraightLength + g.arcLength

  return range.start < arcEnd && range.end > arcStart
}

function valueFromPointer(
  range: PathRange,
  previewWidth: number,
  x: number,
  y: number,
  max: number,
  step: number,
) {
  const g = perimeterPathGeometry(previewWidth)
  const projections: { distance: number; error: number }[] = []
  const topStart = Math.max(range.start, 0)
  const topEnd = Math.min(range.end, g.topStraightLength)

  if (topStart < topEnd) {
    const distance = clamp(x, topStart, topEnd)
    projections.push({ distance, error: Math.abs(y - g.topY) + Math.abs(x - distance) * 0.15 })
  }

  const arcStart = Math.max(range.start, g.topStraightLength)
  const arcEnd = Math.min(range.end, g.topStraightLength + g.arcLength)
  if (arcStart < arcEnd) {
    const theta = clamp(Math.atan2(y - g.cornerCenterY, x - g.cornerCenterX), -Math.PI / 2, 0)
    const distance = clamp(g.topStraightLength + (theta + Math.PI / 2) * g.pathRadius, arcStart, arcEnd)
    const point = perimeterPointAt(distance, previewWidth)
    projections.push({ distance, error: Math.hypot(x - point.x, y - point.y) })
  }

  const sideStart = Math.max(range.start, g.topStraightLength + g.arcLength)
  const sideEnd = range.end
  if (sideStart < sideEnd) {
    const xOnSide = g.cornerCenterX + g.pathRadius
    const distance = clamp(g.topStraightLength + g.arcLength + y - g.cornerCenterY, sideStart, sideEnd)
    const point = perimeterPointAt(distance, previewWidth)
    projections.push({ distance, error: Math.abs(x - xOnSide) + Math.abs(y - point.y) * 0.15 })
  }

  const best = projections.sort((a, b) => a.error - b.error)[0] ?? { distance: range.start, error: 0 }
  const raw = ((best.distance - range.start) / range.length) * max

  return Math.round(raw / step) * step
}

export function CornerSlider({ controlId, label, previewWidth, value, max, step, onChange }: CornerSliderProps) {
  const range = controlRange(controlId)
  const track = trackRange(range)
  const progress = clamp(value / max, 0, 1)
  const progressDistance = track.start + track.length * progress
  const thumbDistance = clamp(progressDistance, track.start + THUMB_RADIUS, track.end - THUMB_RADIUS)
  const thumb = perimeterPointAt(thumbDistance, previewWidth)
  const labelSlot = labelRange(range)
  const baseLabelPoint = perimeterPointAt(range.start, previewWidth)
  const straightLabelDistance = baseLabelPoint.angle >= 80 ? range.start + SIDE_LABEL_INSET : range.start
  const labelPoint = perimeterPointAt(straightLabelDistance, previewWidth)
  const { height, minX, minY, width } = boundsForPath(range.start, range.end, previewWidth)
  const style = { left: minX, top: minY, width, height } as CSSProperties
  const surfacePath = roundedPerimeterSurfacePath(range.start, range.end, previewWidth, minX, minY)
  const trackPath = localSegmentPath(track.start, track.end, previewWidth, minX, minY)
  const progressPath = localSegmentPath(track.start, progressDistance, previewWidth, minX, minY)
  const shouldCurveLabel = controlId === 'noise' && rangeTouchesCorner(labelSlot, previewWidth)
  const labelPathId = `${controlId}-label-path`
  const curvedLabelPath = shouldCurveLabel ? localSegmentPath(labelSlot.start, labelSlot.end, previewWidth, minX, minY) : ''
  const isSideLabel = !curvedLabelPath && labelPoint.angle >= 80
  const straightLabelX = labelPoint.x - minX + (isSideLabel ? 0 : LABEL_OFFSET)
  const straightLabelY = labelPoint.y - minY + 4

  const update = (event: PointerEvent<SVGSVGElement>) => {
    const point = event.currentTarget.createSVGPoint()
    const matrix = event.currentTarget.getScreenCTM()
    if (!matrix) return
    point.x = event.clientX
    point.y = event.clientY
    const local = point.matrixTransform(matrix.inverse())
    const next = valueFromPointer(track, previewWidth, local.x + minX, local.y + minY, max, step)
    onChange(clamp(next, 0, max))
  }

  return (
    <svg
      className="pointer-events-auto absolute overflow-visible text-[var(--pg-text)] drop-shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
      style={style}
      viewBox={`0 0 ${width} ${height}`}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        update(event)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) update(event)
      }}
      aria-label={label}
    >
      {curvedLabelPath ? (
        <defs>
          <path id={labelPathId} d={curvedLabelPath} />
        </defs>
      ) : null}
      <path d={surfacePath} fill="rgba(255,255,255,0.10)" />
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={TRACK_STROKE_WIDTH} strokeLinecap="round" pathLength={100} />
      {progressPath ? (
        <path d={progressPath} fill="none" stroke="var(--pg-accent)" strokeWidth={TRACK_STROKE_WIDTH} strokeLinecap="round" />
      ) : null}
      {curvedLabelPath ? (
        <text className="fill-current text-[11px] font-medium opacity-80">
          <textPath href={`#${labelPathId}`} startOffset="0" dy="4">
            {label}
          </textPath>
        </text>
      ) : (
        <text
          x={straightLabelX}
          y={straightLabelY}
          transform={`rotate(${labelPoint.angle} ${straightLabelX} ${straightLabelY})`}
          dominantBaseline={isSideLabel ? 'middle' : undefined}
          className="fill-current text-[11px] font-medium opacity-80"
        >
          {label}
        </text>
      )}
      <circle cx={thumb.x - minX} cy={thumb.y - minY} r={THUMB_RADIUS} fill="var(--pg-text)" stroke="var(--pg-bg)" strokeWidth="1.5" />
    </svg>
  )
}
