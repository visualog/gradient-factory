'use client'

import type { PointerEvent } from 'react'
import { useState } from 'react'
import { radiusHandleCursor, radiusHandleModeFromLocalX, type CanvasRadiusHandleMode } from '@/lib/canvas-radius-controls'
import {
  RESIZE_HANDLE_CORNER_BUTTON_SIZE,
  RESIZE_HANDLE_CORNER_STROKE_WIDTH,
  RESIZE_HANDLE_CORNER_SURFACE_WIDTH,
  RESIZE_HANDLE_CORNER_VIEWBOX,
  RESIZE_HANDLE_CORNER_VISUAL_INSET,
  RESIZE_HANDLES,
  resizeHandleBarClass,
  resizeHandleButtonClass,
  resizeHandleCornerClass,
  resizeHandleCornerPath,
  type ResizeHandle,
} from '@/lib/resize-handles'

type ResizeHandleButtonProps = {
  activeResizeHandle: string | null
  activeResizeMode: CanvasRadiusHandleMode | null
  radiusControlsEnabled: boolean
  beginCanvasResize: (handle: ResizeHandle, mode: CanvasRadiusHandleMode, event: PointerEvent<HTMLButtonElement>) => void
  resizeCanvas: (event: PointerEvent<HTMLButtonElement>) => void
  endCanvasResize: (event: PointerEvent<HTMLButtonElement>) => void
}

export function ResizeHandleButton({
  activeResizeHandle,
  activeResizeMode,
  radiusControlsEnabled,
  beginCanvasResize,
  resizeCanvas,
  endCanvasResize,
}: ResizeHandleButtonProps) {
  const [hoverMode, setHoverMode] = useState<CanvasRadiusHandleMode>('resize')
  const modeFromEvent = (event: PointerEvent<HTMLButtonElement>) => {
    if (!radiusControlsEnabled) return 'resize'
    const rect = event.currentTarget.getBoundingClientRect()
    return radiusHandleModeFromLocalX(event.clientX - rect.left, rect.width)
  }

  return (
    <>
      {RESIZE_HANDLES.filter((handle) => handle.id === 'se').map((handle) => (
        <button
          key={handle.id}
          type="button"
          className={`group/resize ${resizeHandleButtonClass(handle, activeResizeHandle)}`}
          style={{
            left: `${handle.x}%`,
            top: `${handle.y}%`,
            width: RESIZE_HANDLE_CORNER_BUTTON_SIZE,
            height: RESIZE_HANDLE_CORNER_BUTTON_SIZE,
            cursor: radiusHandleCursor(activeResizeMode ?? hoverMode, handle.cursor),
            transform: `translate(calc(-50% + ${handle.offsetX}px), calc(-50% + ${handle.offsetY}px))`,
          }}
          title={handle.label}
          aria-label={handle.label}
          onPointerDown={(event) => beginCanvasResize(handle, modeFromEvent(event), event)}
          onPointerMove={(event) => {
            const nextMode = modeFromEvent(event)
            setHoverMode((current) => current === nextMode ? current : nextMode)
            resizeCanvas(event)
          }}
          onPointerUp={endCanvasResize}
          onPointerCancel={endCanvasResize}
          onPointerLeave={() => setHoverMode('resize')}
        >
          {handle.shape === 'corner' ? (
            <>
              <svg
                aria-hidden
                viewBox={`0 0 ${RESIZE_HANDLE_CORNER_VIEWBOX} ${RESIZE_HANDLE_CORNER_VIEWBOX}`}
                fill="none"
                className={resizeHandleCornerClass(handle.id, activeResizeHandle)}
                style={{ inset: RESIZE_HANDLE_CORNER_VISUAL_INSET }}
              >
                <path
                  d={resizeHandleCornerPath(handle.id)}
                  fill="none"
                  stroke="rgba(9,11,16,0.45)"
                  strokeWidth={RESIZE_HANDLE_CORNER_SURFACE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={resizeHandleCornerPath(handle.id)}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={RESIZE_HANDLE_CORNER_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </>
          ) : (
            <span aria-hidden className={resizeHandleBarClass(handle, activeResizeHandle)} />
          )}
        </button>
      ))}
    </>
  )
}
