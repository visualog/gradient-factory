'use client'

import type { Dispatch, PointerEvent, RefObject, SetStateAction } from 'react'
import type { GradientStyle, WarpShape } from '@/lib/style-presets'
import { CANVAS_CORNER_RADIUS, type PointPosition } from '@/lib/gradient-model'
import type { ResizeHandle } from '@/lib/resize-handles'
import { PerimeterControls } from '@/components/gradient/perimeter-controls'
import { ResizeHandleButton } from '@/components/gradient/resize-handle-button'

type CanvasStageProps = {
  canvasAreaClass: string
  canvasFrameRef: RefObject<HTMLDivElement>
  canvasRef: RefObject<HTMLCanvasElement>
  width: number
  height: number
  colors: string[]
  pointPositions: PointPosition[]
  warpedPointPositions: PointPosition[]
  activePointIndex: number | null
  activeResizeHandle: string | null
  showPointHandles: boolean
  showWarpPreview: boolean
  previewWidth: number
  controls: {
    style: GradientStyle
    setStyle: Dispatch<SetStateAction<GradientStyle>>
    warpShape: WarpShape
    setWarpShape: Dispatch<SetStateAction<WarpShape>>
    warp: number
    setWarp: Dispatch<SetStateAction<number>>
    warpSize: number
    setWarpSize: Dispatch<SetStateAction<number>>
    noise: number
    setNoise: Dispatch<SetStateAction<number>>
  }
  beginPointDrag: (index: number, event: PointerEvent<HTMLButtonElement>) => void
  movePointDrag: (index: number, event: PointerEvent<HTMLButtonElement>) => void
  endPointDrag: (event: PointerEvent<HTMLButtonElement>) => void
  updateCanvasHover: (event: PointerEvent<HTMLDivElement>) => void
  endCanvasHover: () => void
  beginCanvasResize: (handle: ResizeHandle, event: PointerEvent<HTMLButtonElement>) => void
  resizeCanvas: (event: PointerEvent<HTMLButtonElement>) => void
  endCanvasResize: (event: PointerEvent<HTMLButtonElement>) => void
}

export function CanvasStage({
  canvasAreaClass,
  canvasFrameRef,
  canvasRef,
  width,
  height,
  colors,
  pointPositions,
  warpedPointPositions,
  activePointIndex,
  activeResizeHandle,
  showPointHandles,
  showWarpPreview,
  previewWidth,
  controls,
  beginPointDrag,
  movePointDrag,
  endPointDrag,
  updateCanvasHover,
  endCanvasHover,
  beginCanvasResize,
  resizeCanvas,
  endCanvasResize,
}: CanvasStageProps) {
  return (
    <section className={`relative z-10 col-start-1 row-start-1 flex min-h-0 w-full items-center justify-center rounded-[28px] lg:col-start-1 lg:row-start-1 ${canvasAreaClass}`}>
      <div
        ref={canvasFrameRef}
        className={`group relative max-w-full ${activePointIndex !== null ? 'cursor-grabbing' : ''}`}
        style={{ width, aspectRatio: `${width} / ${height}` }}
        onPointerMove={updateCanvasHover}
        onPointerLeave={endCanvasHover}
      >
        <canvas
          ref={canvasRef}
          className="block h-auto max-w-full"
          style={{
            width: '100%',
            aspectRatio: `${width} / ${height}`,
            borderRadius: CANVAS_CORNER_RADIUS,
            boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
          }}
        />
        <PerimeterControls previewWidth={previewWidth} {...controls} />
        <PointHandles
          colors={colors}
          pointPositions={pointPositions}
          showPointHandles={showPointHandles}
          beginPointDrag={beginPointDrag}
          movePointDrag={movePointDrag}
          endPointDrag={endPointDrag}
        />
        <WarpPreview
          colors={colors}
          points={warpedPointPositions}
          isVisible={showWarpPreview && activePointIndex === null}
        />
        <ResizeHandleButton
          activeResizeHandle={activeResizeHandle}
          beginCanvasResize={beginCanvasResize}
          resizeCanvas={resizeCanvas}
          endCanvasResize={endCanvasResize}
        />
      </div>
    </section>
  )
}

function PointHandles({
  colors,
  pointPositions,
  showPointHandles,
  beginPointDrag,
  movePointDrag,
  endPointDrag,
}: {
  colors: string[]
  pointPositions: PointPosition[]
  showPointHandles: boolean
  beginPointDrag: (index: number, event: PointerEvent<HTMLButtonElement>) => void
  movePointDrag: (index: number, event: PointerEvent<HTMLButtonElement>) => void
  endPointDrag: (event: PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className={`absolute inset-0 rounded-[24px] transition-opacity ${showPointHandles ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
      {pointPositions.map((point, index) => (
        <button
          key={index}
          type="button"
          className="absolute h-6 w-6 touch-none -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.45)] outline-none ring-1 ring-black/30 transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-white active:cursor-grabbing"
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, backgroundColor: colors[index] }}
          title={`Color point ${index + 1}`}
          onPointerDown={(event) => beginPointDrag(index, event)}
          onPointerMove={(event) => movePointDrag(index, event)}
          onPointerUp={endPointDrag}
          onPointerCancel={endPointDrag}
        />
      ))}
    </div>
  )
}

function WarpPreview({ colors, points, isVisible }: { colors: string[]; points: PointPosition[]; isVisible: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 rounded-[24px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {points.map((point, index) => (
        <span
          key={index}
          className={`absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.45)] ring-1 ring-black/30 transition-[left,top,transform] duration-300 ease-out ${isVisible ? 'scale-100' : 'scale-75'}`}
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, backgroundColor: colors[index] }}
        />
      ))}
    </div>
  )
}
