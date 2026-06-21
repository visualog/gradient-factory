'use client'

import type { Dispatch, PointerEvent, ReactNode, RefObject, SetStateAction } from 'react'
import { Download, Save } from 'lucide-react'
import type { GradientStyle, WarpShape } from '@/lib/style-presets'
import { CANVAS_CORNER_RADIUS, CANVAS_MIN_HEIGHT, CANVAS_MIN_WIDTH, type PointPosition } from '@/lib/gradient-model'
import type { ResizeHandle } from '@/lib/resize-handles'
import { PerimeterControls } from '@/components/gradient/perimeter-controls'
import { ResizeHandleButton } from '@/components/gradient/resize-handle-button'
import { SizeInput } from '@/components/gradient/size-input'
import { Button } from '@/components/ui/button'

type CanvasStageProps = {
  canvasAreaClass: string
  canvasFrameRef: RefObject<HTMLDivElement>
  canvasRef: RefObject<HTMLCanvasElement>
  width: number
  height: number
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
  saveToLibrary: () => void
  download: () => void
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
  setWidth,
  setHeight,
  saveToLibrary,
  download,
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
        <CanvasBottomControls>
          <CanvasColorChips colors={colors} />
          <CanvasSizeInputs width={width} height={height} setWidth={setWidth} setHeight={setHeight} />
          <CanvasActions saveToLibrary={saveToLibrary} download={download} />
        </CanvasBottomControls>
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

function CanvasBottomControls({ children }: { children: ReactNode }) {
  return <div className="pointer-events-none absolute left-0 top-full mt-3 flex max-w-full flex-wrap items-center gap-3">{children}</div>
}

function CanvasActions({ saveToLibrary, download }: { saveToLibrary: () => void; download: () => void }) {
  return (
    <div
      data-testid="canvas-actions"
      className="pointer-events-auto flex h-9 items-center gap-1 rounded-[12px] bg-white/[0.10] px-1.5 text-[var(--pg-text)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
    >
      <Button type="button" onClick={saveToLibrary} variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" title="Save to library" aria-label="Save to library">
        <Save size={16} strokeWidth={1.8} />
      </Button>
      <Button type="button" onClick={download} variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" title="Download" aria-label="Download">
        <Download size={16} strokeWidth={1.8} />
      </Button>
    </div>
  )
}

function CanvasSizeInputs({
  width,
  height,
  setWidth,
  setHeight,
}: {
  width: number
  height: number
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
}) {
  return (
    <div
      data-testid="canvas-size-inputs"
      className="pointer-events-auto flex h-9 items-center gap-3 rounded-[12px] bg-white/[0.10] px-3 text-[var(--pg-text)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
    >
      <SizeInput label="W" min={CANVAS_MIN_WIDTH} value={width} onChange={setWidth} className="gap-2" inputClassName="pg-number-input w-20 pl-1 pr-7 text-right tabular-nums" inputTestId="canvas-width-input" showStepper />
      <SizeInput label="H" min={CANVAS_MIN_HEIGHT} value={height} onChange={setHeight} className="gap-2" inputClassName="pg-number-input w-20 pl-1 pr-7 text-right tabular-nums" inputTestId="canvas-height-input" showStepper />
    </div>
  )
}

function CanvasColorChips({ colors }: { colors: string[] }) {
  return (
    <div
      aria-hidden
      data-testid="canvas-color-chips"
      className="pointer-events-none flex h-9 items-center gap-2 rounded-[12px] bg-white/[0.10] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md"
    >
      {colors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="block h-5 w-5 rounded-full border border-white/45 shadow-[0_4px_14px_rgba(0,0,0,0.35)] ring-1 ring-black/25"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
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
