'use client'

import type { PointerEvent } from 'react'
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
  beginCanvasResize: (handle: ResizeHandle, event: PointerEvent<HTMLButtonElement>) => void
  resizeCanvas: (event: PointerEvent<HTMLButtonElement>) => void
  endCanvasResize: (event: PointerEvent<HTMLButtonElement>) => void
}

export function ResizeHandleButton({
  activeResizeHandle,
  beginCanvasResize,
  resizeCanvas,
  endCanvasResize,
}: ResizeHandleButtonProps) {
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
            cursor: handle.cursor,
            transform: `translate(calc(-50% + ${handle.offsetX}px), calc(-50% + ${handle.offsetY}px))`,
          }}
          title={handle.label}
          aria-label={handle.label}
          onPointerDown={(event) => beginCanvasResize(handle, event)}
          onPointerMove={resizeCanvas}
          onPointerUp={endCanvasResize}
          onPointerCancel={endCanvasResize}
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
