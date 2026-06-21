'use client'

import { motion, useSpring, useTransform, type MotionValue } from 'motion/react'
import type { GradientSnapshot } from '@/lib/gradient-model'

const DOCK_BASE_SIZE = 64
const DOCK_MAX_SIZE = 112
const DOCK_INFLUENCE = 220
const DOCK_GAP = 24
const DOCK_PADDING_X = 4

function dockSize(mouseX: number, index: number) {
  if (!Number.isFinite(mouseX)) return DOCK_BASE_SIZE

  const center = DOCK_PADDING_X + index * (DOCK_BASE_SIZE + DOCK_GAP) + DOCK_BASE_SIZE / 2
  const distance = Math.abs(mouseX - center)
  const proximity = Math.max(0, Math.min(1, 1 - distance / DOCK_INFLUENCE))
  const eased = proximity * proximity * (3 - 2 * proximity)

  return DOCK_BASE_SIZE + eased * (DOCK_MAX_SIZE - DOCK_BASE_SIZE)
}

export function DockItem({
  snapshot,
  index,
  mouseX,
  onSelect,
}: {
  snapshot: GradientSnapshot
  index: number
  mouseX: MotionValue<number>
  onSelect: (snapshot: GradientSnapshot) => void
}) {
  const targetSize = useTransform(mouseX, (latest) => dockSize(latest, index))
  const size = useSpring(targetSize, { stiffness: 420, damping: 34, mass: 0.55 })
  const lift = useTransform(size, (latest) => -(latest - DOCK_BASE_SIZE) * 0.28)

  return (
    <motion.button
      type="button"
      className="shrink-0 overflow-hidden rounded-2xl outline-none ring-1 ring-white/15 transition focus-visible:ring-2 focus-visible:ring-white/80"
      style={{ width: size, height: size, y: lift }}
      onClick={() => onSelect(snapshot)}
      title={`${snapshot.width} x ${snapshot.height}`}
    >
      <img
        src={snapshot.preview}
        alt={`Saved gradient ${index + 1}`}
        className="block h-full w-full rounded-xl object-cover shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
      />
    </motion.button>
  )
}
