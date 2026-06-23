'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CanvasStage } from '@/components/gradient/canvas-stage'
import { useGradientStudio } from '@/hooks/use-gradient-studio'

type ABMode = 'control' | 'lab' | 'c-lab' | 'compare'
const C_LAB_DEFAULT_STATE = 'eyJ3aWR0aCI6NjQwLCJoZWlnaHQiOjY0MCwiY29sb3JzIjpbIiM3M0U4RkYiLCIjRjE1QkQ5IiwiIzAxMEEwQiIsIiNCNkY0RkYiLCIjNUQxMjRFIiwiIzA4MTUxNiJdLCJwb2ludFBvc2l0aW9ucyI6W3sieCI6MC41MiwieSI6MC41fSx7IngiOjAuMzMsInkiOjAuMjh9LHsieCI6MC4xOSwieSI6MC42Nn0seyJ4IjowLjc4LCJ5IjowLjcyfSx7IngiOjAuNywieSI6MC4yNX0seyJ4IjowLjg1LCJ5IjowLjE0fV0sInN0eWxlIjoiQ3lhbiBSaWJib24iLCJ3YXJwU2hhcGUiOiJTcGlyYWwiLCJ3YXJwIjoxLjA1LCJ3YXJwU2l6ZSI6MS45LCJub2lzZSI6MC4wMDR9'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GradientFactoryPage />
    </Suspense>
  )
}

function GradientFactoryPage() {
  const searchParams = useSearchParams()
  const requestedMode = searchParams.get('ab')
  const abMode: ABMode = requestedMode === 'lab' || requestedMode === 'c-lab' || requestedMode === 'compare' ? requestedMode : 'control'
  const sharedState = searchParams.get('state') ?? (abMode === 'c-lab' ? C_LAB_DEFAULT_STATE : null)
  const studio = useGradientStudio(sharedState, abMode === 'c-lab' ? 'ui-glow' : 'standard')
  const { classes, presetStyleVars, canvas, controls, panel, dock, experiment } = studio
  const isEmbedded = searchParams.get('embed') === '1'

  if (abMode === 'compare') {
    return (
      <main className={`min-h-screen overflow-hidden px-4 py-4 ${classes.app}`} style={presetStyleVars}>
        <ABSwitch activeMode="compare" />
        <div className="grid h-[calc(100vh-2rem)] grid-cols-1 gap-3 pt-14 lg:grid-cols-3">
          <CompareFrame title="A Current" src="/?ab=control&embed=1" />
          <CompareFrame title="B Lab" src="/?ab=lab&embed=1" />
          <CompareFrame title="C Lab" src="/?ab=c-lab&embed=1" />
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
          canvasRadius={canvas.canvasRadius}
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
          activeResizeMode={canvas.activeResizeMode}
          showPointHandles={canvas.showPointHandles}
          showWarpPreview={canvas.showWarpPreview}
          activeWarpFlow={canvas.activeWarpFlow}
          controlVariant={abMode === 'c-lab' ? 'ui-glow' : 'standard'}
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
          experiment={{ ...experiment, enabled: abMode === 'lab' || abMode === 'c-lab' }}
        />
      </div>
    </main>
  )
}

function ABSwitch({ activeMode }: { activeMode: ABMode }) {
  const itemClass = (mode: ABMode) =>
    `rounded-[12px] px-3 py-1.5 text-xs font-medium transition-colors ${
      activeMode === mode ? 'bg-[var(--pg-text)] text-[var(--pg-bg)]' : 'text-[var(--pg-text)] hover:bg-black/[0.16]'
    }`

  return (
    <nav className="fixed left-1/2 top-4 z-[90] flex -translate-x-1/2 items-center gap-1 rounded-[15px] bg-white/[0.10] p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.24)] backdrop-blur-md">
      <a className={itemClass('control')} href="/?ab=control">A Current</a>
      <a className={itemClass('lab')} href="/?ab=lab">B Lab</a>
      <a className={itemClass('c-lab')} href="/?ab=c-lab">C Lab</a>
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
