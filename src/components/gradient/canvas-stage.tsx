'use client'

import type { Dispatch, PointerEvent, ReactNode, RefObject, SetStateAction } from 'react'
import type { MotionValue } from 'motion/react'
import type { GradientStyle, WarpShape } from '@/lib/style-presets'
import type { GradientMaskEffect } from '@/lib/gradient-mask-effects'
import type { GradientSnapshot, PointPosition } from '@/lib/gradient-model'
import type { ResizeHandle } from '@/lib/resize-handles'
import type { CanvasSizePreset, ExperimentLock } from '@/hooks/use-gradient-experiment'
import { CanvasActions } from '@/components/gradient/canvas-actions'
import { CanvasColorChips } from '@/components/gradient/canvas-color-chips'
import { CanvasSizeControls } from '@/components/gradient/canvas-size-controls'
import { ExperimentToolbar } from '@/components/gradient/experiment-toolbar'
import { LibraryDock } from '@/components/gradient/library-dock'
import { PerimeterControls } from '@/components/gradient/perimeter-controls'
import { ResizeHandleButton } from '@/components/gradient/resize-handle-button'
import { WarpFlowOverlay, type WarpFlowMode } from '@/components/gradient/warp-flow-overlay'

type CanvasStageProps = {
  canvasAreaClass: string
  canvasFrameRef: RefObject<HTMLDivElement>
  canvasRef: RefObject<HTMLCanvasElement>
  width: number
  height: number
  canvasRadius: number
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
  activeResizeMode: 'resize' | 'radius-horizontal' | 'radius-vertical' | null
  showPointHandles: boolean
  showWarpPreview: boolean
  activeWarpFlow: WarpFlowMode | null
  controlVariant?: 'standard' | 'ui-glow'
  previewWidth: number
  controls: {
    style: GradientStyle
    setStyle: (value: GradientStyle) => void
    warpShape: WarpShape
    setWarpShape: Dispatch<SetStateAction<WarpShape>>
    warp: number
    setWarp: Dispatch<SetStateAction<number>>
    warpSize: number
    setWarpSize: Dispatch<SetStateAction<number>>
    noise: number
    setNoise: Dispatch<SetStateAction<number>>
    vignette: number
    setVignette: Dispatch<SetStateAction<number>>
    mask: GradientMaskEffect
    setMask: Dispatch<SetStateAction<GradientMaskEffect>>
    steps: number
    setSteps: Dispatch<SetStateAction<number>>
  }
  beginPointDrag: (index: number, event: PointerEvent<HTMLButtonElement>) => void
  movePointDrag: (index: number, event: PointerEvent<HTMLButtonElement>) => void
  endPointDrag: (event: PointerEvent<HTMLButtonElement>) => void
  updateCanvasHover: (event: PointerEvent<HTMLDivElement>) => void
  endCanvasHover: () => void
  beginCanvasResize: (handle: ResizeHandle, mode: 'resize' | 'radius-horizontal' | 'radius-vertical', event: PointerEvent<HTMLButtonElement>) => void
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
  canvasRadius,
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
  activeResizeMode,
  showPointHandles,
  showWarpPreview,
  activeWarpFlow,
  controlVariant = 'standard',
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
  const isRadiusAdjusting = activeResizeMode === 'radius-horizontal' || activeResizeMode === 'radius-vertical'
  const outerControlClass = isRadiusAdjusting ? 'opacity-20' : 'opacity-100'

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
            borderRadius: canvasRadius,
            boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
          }}
        />
        <div className={`transition-opacity duration-150 ${outerControlClass}`}>
          {experiment?.enabled ? (
            <ExperimentToolbar
              generateVariation={experiment.generateVariation}
              shufflePalette={experiment.shufflePalette}
              experimentLocks={experiment.experimentLocks}
              toggleExperimentLock={experiment.toggleExperimentLock}
            />
          ) : null}
          <PerimeterControls previewWidth={previewWidth} variant={controlVariant} {...controls} />
        </div>
        <WarpFlowOverlay
          colors={colors}
          points={pointPositions}
          mode={activeWarpFlow}
          isVisible={activeWarpFlow === 'warpSize'}
        />
        <CanvasBottomControls className={outerControlClass}>
          <CanvasColorChips
            colors={colors}
            updateColor={updateColor}
            addColor={addColor}
            removeColor={removeColor}
            lockedColorIndexes={lockedColorIndexes}
            toggleColorLock={toggleColorLock}
            showLocks={Boolean(experiment?.enabled)}
          />
          <CanvasSizeControls
            width={width}
            height={height}
            setWidth={setWidth}
            setHeight={setHeight}
            presets={experiment?.enabled ? experiment.sizePresets : undefined}
            onPresetSelect={experiment?.applyCanvasPreset}
          />
          <CanvasActions saveToLibrary={saveToLibrary} download={download} experiment={experiment} />
        </CanvasBottomControls>
        <div className={`transition-opacity duration-150 ${outerControlClass}`}>
          <LibraryDock {...libraryDock} />
        </div>
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
          isVisible={showWarpPreview && !showPointHandles}
        />
        <ResizeHandleButton
          activeResizeHandle={activeResizeHandle}
          activeResizeMode={activeResizeMode}
          radiusControlsEnabled={controlVariant === 'ui-glow'}
          beginCanvasResize={beginCanvasResize}
          resizeCanvas={resizeCanvas}
          endCanvasResize={endCanvasResize}
        />
      </div>
    </section>
  )
}

function CanvasBottomControls({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`pointer-events-none absolute left-0 top-full mt-3 flex max-w-full flex-wrap items-center gap-3 transition-opacity duration-150 ${className ?? ''}`}>{children}</div>
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
