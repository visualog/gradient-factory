'use client'

import type { Dispatch, PointerEvent, ReactNode, RefObject, SetStateAction } from 'react'
import type { MotionValue } from 'motion/react'
import type { GradientStyle, WarpShape } from '@/lib/style-presets'
import { CANVAS_CORNER_RADIUS, CANVAS_MIN_HEIGHT, CANVAS_MIN_WIDTH, type GradientSnapshot, type PointPosition } from '@/lib/gradient-model'
import type { ResizeHandle } from '@/lib/resize-handles'
import type { CanvasSizePreset, ExperimentLock } from '@/hooks/use-gradient-experiment'
import { CanvasActions } from '@/components/gradient/canvas-actions'
import { CanvasColorChips } from '@/components/gradient/canvas-color-chips'
import { ExperimentToolbar } from '@/components/gradient/experiment-toolbar'
import { LibraryDock } from '@/components/gradient/library-dock'
import { PerimeterControls } from '@/components/gradient/perimeter-controls'
import { ResizeHandleButton } from '@/components/gradient/resize-handle-button'
import { SizeInput } from '@/components/gradient/size-input'

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
  updateColor: (index: number, value: string) => void
  addColor: () => void
  removeColor: (index: number) => void
  lockedColorIndexes: number[]
  toggleColorLock: (index: number) => void
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
  libraryDock: {
    library: GradientSnapshot[]
    dockMouseX: MotionValue<number>
    loadSnapshot: (snapshot: GradientSnapshot) => void
    toggleFavorite: (id: number) => void
    renameSnapshot: (id: number, name: string) => void
    deleteSnapshot: (id: number) => void
  }
  experiment?: {
    enabled: boolean
    generateVariation: () => void
    shufflePalette: () => void
    applyCanvasPreset: (presetIndex: number) => void
    experimentLocks: ExperimentLock[]
    toggleExperimentLock: (lock: ExperimentLock) => void
    shareGradient: () => void
    copyCss: () => void
    copyTailwind: () => void
    downloadScale: (scale: number) => void
    sizePresets: CanvasSizePreset[]
  }
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
  updateColor,
  addColor,
  removeColor,
  lockedColorIndexes,
  toggleColorLock,
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
  libraryDock,
  experiment,
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
        {experiment?.enabled ? (
          <ExperimentToolbar
            generateVariation={experiment.generateVariation}
            shufflePalette={experiment.shufflePalette}
            applyCanvasPreset={experiment.applyCanvasPreset}
            experimentLocks={experiment.experimentLocks}
            toggleExperimentLock={experiment.toggleExperimentLock}
            sizePresets={experiment.sizePresets}
          />
        ) : null}
        <PerimeterControls previewWidth={previewWidth} {...controls} />
        <CanvasBottomControls>
          <CanvasColorChips
            colors={colors}
            updateColor={updateColor}
            addColor={addColor}
            removeColor={removeColor}
            lockedColorIndexes={lockedColorIndexes}
            toggleColorLock={toggleColorLock}
            showLocks={Boolean(experiment?.enabled)}
          />
          <CanvasSizeInputs width={width} height={height} setWidth={setWidth} setHeight={setHeight} />
          <CanvasActions saveToLibrary={saveToLibrary} download={download} experiment={experiment} />
        </CanvasBottomControls>
        <LibraryDock {...libraryDock} />
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
      className="pointer-events-auto flex h-9 items-center gap-3 rounded-[12px] bg-white/[0.10] px-3 text-[var(--pg-text)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md transition-colors hover:bg-black/[0.16] focus-within:bg-black/[0.16] focus-within:ring-1 focus-within:ring-white/15 active:bg-black/[0.22]"
    >
      <SizeInput label="W" min={CANVAS_MIN_WIDTH} value={width} onChange={setWidth} className="gap-2" inputClassName="pg-number-input w-16 pl-1 pr-5 text-right tabular-nums" inputTestId="canvas-width-input" showStepper />
      <SizeInput label="H" min={CANVAS_MIN_HEIGHT} value={height} onChange={setHeight} className="gap-2" inputClassName="pg-number-input w-16 pl-1 pr-5 text-right tabular-nums" inputTestId="canvas-height-input" showStepper />
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
