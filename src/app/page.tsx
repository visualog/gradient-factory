'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CanvasStage } from '@/components/gradient/canvas-stage'
import { useGradientStudio } from '@/hooks/use-gradient-studio'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GradientFactoryPage />
    </Suspense>
  )
}

function GradientFactoryPage() {
  const searchParams = useSearchParams()
  const studio = useGradientStudio(searchParams.get('state'))
  const { classes, presetStyleVars, canvas, controls, panel, dock, experiment } = studio
  const requestedMode = searchParams.get('ab')
  const abMode: 'control' | 'lab' | 'compare' = requestedMode === 'lab' || requestedMode === 'compare' ? requestedMode : 'control'
  const isEmbedded = searchParams.get('embed') === '1'

  if (abMode === 'compare') {
    return (
      <main className={`min-h-screen overflow-hidden px-4 py-4 ${classes.app}`} style={presetStyleVars}>
        <ABSwitch activeMode="compare" />
        <div className="grid h-[calc(100vh-2rem)] grid-cols-1 gap-3 pt-14 lg:grid-cols-2">
          <CompareFrame title="A Current" src="/?ab=control&embed=1" />
          <CompareFrame title="B Lab" src="/?ab=lab&embed=1" />
        </div>
      </main>
    )
  }

  return (
    <main
      className={`min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-6 ${!isEmbedded ? 'pt-20 sm:pt-20' : ''} ${classes.app}`}
      style={presetStyleVars}
    >
      {!isEmbedded ? <ABSwitch activeMode={abMode} /> : null}
      <div className="grid min-h-[calc(100vh-2.5rem)] w-full grid-cols-1 lg:min-h-[calc(100vh-3rem)]">
        <CanvasStage
          canvasAreaClass={classes.canvasArea}
          canvasFrameRef={canvas.canvasFrameRef}
          canvasRef={canvas.canvasRef}
          width={canvas.width}
          height={canvas.height}
          setWidth={canvas.setWidth}
          setHeight={canvas.setHeight}
          saveToLibrary={panel.saveToLibrary}
          download={panel.download}
          colors={canvas.colors}
          updateColor={canvas.updateColor}
          addColor={canvas.addColor}
          removeColor={canvas.removeColor}
          lockedColorIndexes={canvas.lockedColorIndexes}
          toggleColorLock={canvas.toggleColorLock}
          pointPositions={canvas.pointPositions}
          warpedPointPositions={canvas.warpedPointPositions}
          activePointIndex={canvas.activePointIndex}
          activeResizeHandle={canvas.activeResizeHandle}
          showPointHandles={canvas.showPointHandles}
          showWarpPreview={canvas.showWarpPreview}
          previewWidth={canvas.previewWidth}
          controls={controls}
          beginPointDrag={canvas.beginPointDrag}
          movePointDrag={canvas.movePointDrag}
          endPointDrag={canvas.endPointDrag}
          updateCanvasHover={canvas.updateCanvasHover}
          endCanvasHover={canvas.endCanvasHover}
          beginCanvasResize={canvas.beginCanvasResize}
          resizeCanvas={canvas.resizeCanvas}
          endCanvasResize={canvas.endCanvasResize}
          libraryDock={dock}
          experiment={{ ...experiment, enabled: abMode === 'lab' }}
        />
      </div>
    </main>
  )
}

function ABSwitch({ activeMode }: { activeMode: 'control' | 'lab' | 'compare' }) {
  const itemClass = (mode: 'control' | 'lab' | 'compare') =>
    `rounded-[12px] px-3 py-1.5 text-xs font-medium transition-colors ${
      activeMode === mode ? 'bg-[var(--pg-text)] text-[var(--pg-bg)]' : 'text-[var(--pg-text)] hover:bg-black/[0.16]'
    }`

  return (
    <nav className="fixed left-1/2 top-4 z-[90] flex -translate-x-1/2 items-center gap-1 rounded-[15px] bg-white/[0.10] p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <a className={itemClass('control')} href="/?ab=control">A Current</a>
      <a className={itemClass('lab')} href="/?ab=lab">B Lab</a>
      <a className={itemClass('compare')} href="/?ab=compare">Compare</a>
    </nav>
  )
}

function CompareFrame({ title, src }: { title: string; src: string }) {
  return (
    <section className="relative min-h-0 overflow-hidden rounded-[20px] border border-white/10 bg-black/25">
      <div className="absolute right-3 top-3 z-10 rounded-[10px] bg-black/55 px-2.5 py-1 text-xs font-medium text-white/85 backdrop-blur-md">
        {title}
      </div>
      <iframe title={title} src={src} className="h-full w-full border-0" />
    </section>
  )
}
