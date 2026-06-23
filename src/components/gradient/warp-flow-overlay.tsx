'use client'

import type { PointPosition } from '@/lib/gradient-model'

export type WarpFlowMode = 'warp' | 'warpSize'

type WarpFlowOverlayProps = {
  colors: string[]
  points: PointPosition[]
  mode: WarpFlowMode | null
  isVisible: boolean
}

function pct(value: number) {
  return `${value * 100}%`
}

function ringRadius(index: number, mode: WarpFlowMode | null) {
  return mode === 'warpSize' ? 10 + index * 2.5 : 5 + index * 1.5
}

export function WarpFlowOverlay({ colors, points, mode, isVisible }: WarpFlowOverlayProps) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible rounded-[24px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <defs>
        <filter id="warp-flow-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {mode === 'warpSize'
        ? points.map((point, index) => {
            const color = colors[index] ?? 'var(--pg-text)'

            return (
              <circle
                key={index}
                cx={pct(point.x)}
                cy={pct(point.y)}
                r={ringRadius(index, mode)}
                fill="none"
                stroke={color}
                strokeDasharray="2 2.8"
                strokeOpacity="0.35"
                strokeWidth="0.35"
                vectorEffect="non-scaling-stroke"
              />
            )
          })
        : null}
    </svg>
  )
}
