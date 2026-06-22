'use client'

import type { PointerEvent, ReactNode } from 'react'
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { Pencil, Star, Trash2 } from 'lucide-react'
import type { GradientSnapshot } from '@/lib/gradient-model'

const DOCK_BASE_SIZE = 64
const DOCK_MAX_SIZE = 112
const DOCK_INFLUENCE = 220
const DOCK_GAP = 16
const DOCK_PADDING = 32

function dockSize(pointerPosition: number, index: number) {
  if (!Number.isFinite(pointerPosition)) return DOCK_BASE_SIZE

  const center = DOCK_PADDING + index * (DOCK_BASE_SIZE + DOCK_GAP) + DOCK_BASE_SIZE / 2
  const distance = Math.abs(pointerPosition - center)
  const proximity = Math.max(0, Math.min(1, 1 - distance / DOCK_INFLUENCE))
  const eased = proximity * proximity * (3 - 2 * proximity)

  return DOCK_BASE_SIZE + eased * (DOCK_MAX_SIZE - DOCK_BASE_SIZE)
}

export function DockItem({
  snapshot,
  index,
  mouseX,
  onSelect,
  onToggleFavorite,
  onRename,
  onDelete,
}: {
  snapshot: GradientSnapshot
  index: number
  mouseX: MotionValue<number>
  onSelect: (snapshot: GradientSnapshot) => void
  onToggleFavorite: (id: number) => void
  onRename: (id: number, name: string) => void
  onDelete: (id: number) => void
}) {
  const targetSize = useTransform(mouseX, (latest) => dockSize(latest, index))
  const size = useSpring(targetSize, { stiffness: 420, damping: 34, mass: 0.55 })
  const lift = useTransform(size, (latest) => -(latest - DOCK_BASE_SIZE) * 0.28)

  const handleRename = () => {
    const nextName = window.prompt('Gradient name', snapshot.name ?? '')
    if (nextName) onRename(snapshot.id, nextName)
  }

  const stopSelect = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
  }

  return (
    <motion.div
      className="group/dock relative shrink-0 overflow-hidden rounded-2xl outline-none ring-1 ring-white/15 transition focus-within:ring-2 focus-within:ring-white/80"
      style={{ width: size, height: size, x: lift }}
      title={`${snapshot.name ?? `Saved gradient ${index + 1}`} · ${snapshot.width} x ${snapshot.height}`}
    >
      <button type="button" className="block h-full w-full" onClick={() => onSelect(snapshot)}>
        <img
          src={snapshot.preview}
          alt={snapshot.name ?? `Saved gradient ${index + 1}`}
          className="block h-full w-full rounded-xl object-cover shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
        />
      </button>
      <div className="pointer-events-none absolute inset-x-1 top-1 flex items-center justify-between opacity-0 transition-opacity group-hover/dock:opacity-100 group-focus-within/dock:opacity-100">
        <DockIconButton
          label={snapshot.favorite ? 'Remove favorite' : 'Favorite'}
          onClick={() => onToggleFavorite(snapshot.id)}
          onPointerDown={stopSelect}
          active={Boolean(snapshot.favorite)}
        >
          <Star size={10} strokeWidth={2.2} fill={snapshot.favorite ? 'currentColor' : 'none'} />
        </DockIconButton>
        <div className="flex gap-1">
          <DockIconButton label="Rename" onClick={handleRename} onPointerDown={stopSelect}>
            <Pencil size={10} strokeWidth={2.2} />
          </DockIconButton>
          <DockIconButton label="Delete" onClick={() => onDelete(snapshot.id)} onPointerDown={stopSelect}>
            <Trash2 size={10} strokeWidth={2.2} />
          </DockIconButton>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-1 bottom-1 truncate rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white/85 opacity-0 backdrop-blur transition-opacity group-hover/dock:opacity-100 group-focus-within/dock:opacity-100">
        {snapshot.name}
      </div>
    </motion.div>
  )
}

function DockIconButton({
  label,
  active,
  children,
  onClick,
  onPointerDown,
}: {
  label: string
  active?: boolean
  children: ReactNode
  onClick: () => void
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
}) {
  return (
    <button
      type="button"
      className={`pointer-events-auto grid h-5 w-5 place-items-center rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.35)] outline-none transition-colors hover:bg-white focus-visible:ring-1 focus-visible:ring-white ${active ? 'bg-white text-black' : 'bg-black/58 text-white'}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      {children}
    </button>
  )
}
