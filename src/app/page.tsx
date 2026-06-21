'use client'

import { CanvasStage } from '@/components/gradient/canvas-stage'
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
      <div className="grid min-h-[calc(100vh-2.5rem)] w-full grid-cols-1 grid-rows-[minmax(360px,1fr)_auto] gap-6 lg:min-h-[calc(100vh-3rem)]">
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
        <LibraryDock {...dock} />
      </div>
    </main>
  )
}
