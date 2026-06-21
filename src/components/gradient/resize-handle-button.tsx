'use client'

import type { PointerEvent } from 'react'
import {
  RESIZE_HANDLE_CORNER_STROKE_WIDTH,
  RESIZE_HANDLE_CORNER_SURFACE_WIDTH,
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
              <span aria-hidden className="absolute inset-2 rounded-[16px] bg-[var(--pg-bg)]/70 ring-1 ring-white/25 backdrop-blur-md" />
              <svg aria-hidden viewBox="0 0 48 48" fill="none" className={resizeHandleCornerClass(handle.id, activeResizeHandle)}>
                <path
                  d={resizeHandleCornerPath(handle.id)}
                  stroke="rgba(9,11,16,0.72)"
                  strokeWidth={RESIZE_HANDLE_CORNER_SURFACE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={resizeHandleCornerPath(handle.id)}
                  stroke="currentColor"
                  strokeWidth={RESIZE_HANDLE_CORNER_STROKE_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span aria-hidden className="absolute bottom-3.5 right-3.5 flex flex-col gap-1">
                <span className="block h-0.5 w-4 -rotate-45 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.8)]" />
                <span className="ml-1 block h-0.5 w-3 -rotate-45 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.8)]" />
              </span>
            </>
          ) : (
            <span aria-hidden className={resizeHandleBarClass(handle, activeResizeHandle)} />
          )}
        </button>
      ))}
    </>
  )
}
