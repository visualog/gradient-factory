'use client'

import { CanvasStage } from '@/components/gradient/canvas-stage'
import { ControlPanel } from '@/components/gradient/control-panel'
import { LibraryDock } from '@/components/gradient/library-dock'
import { useGradientStudio } from '@/hooks/use-gradient-studio'

export default function Page() {
  const studio = useGradientStudio()
  const { classes, presetStyleVars, canvas, controls, panel, dock } = studio

  return (
    <main
      className={`min-h-screen overflow-hidden px-4 py-5 sm:px-6 sm:py-6 ${classes.app}`}
      style={presetStyleVars}
    >
      <div className="grid min-h-[calc(100vh-2.5rem)] w-full grid-cols-1 grid-rows-[minmax(360px,1fr)_auto_auto] gap-6 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[minmax(0,1fr)_320px] lg:grid-rows-[minmax(0,1fr)_auto]">
        <CanvasStage
          canvasAreaClass={classes.canvasArea}
          canvasFrameRef={canvas.canvasFrameRef}
          canvasRef={canvas.canvasRef}
          width={canvas.width}
          height={canvas.height}
          colors={canvas.colors}
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
        />
        <ControlPanel
          panelClass={classes.panel}
          panelDividerClass={classes.panelDivider}
          footerButtonDividerClass={classes.footerButtonDivider}
          {...panel}
        />
        <LibraryDock {...dock} />
      </div>
    </main>
  )
}
