'use client'

import type { MotionValue } from 'motion/react'
import type { GradientSnapshot } from '@/lib/gradient-model'
import { DockItem } from '@/components/gradient/dock-item'

type LibraryDockProps = {
  library: GradientSnapshot[]
  dockMouseX: MotionValue<number>
  loadSnapshot: (snapshot: GradientSnapshot) => void
  toggleFavorite: (id: number) => void
  renameSnapshot: (id: number, name: string) => void
  deleteSnapshot: (id: number) => void
}

export function LibraryDock({
  library,
  dockMouseX,
  loadSnapshot,
  toggleFavorite,
  renameSnapshot,
  deleteSnapshot,
}: LibraryDockProps) {
  if (library.length === 0) return null

  return (
    <section className="pointer-events-auto absolute inset-y-0 right-full z-30 mr-4 hidden overflow-visible md:block">
      <div
        className="library-dock-scroll flex h-full flex-col items-end gap-4 overflow-x-visible overflow-y-auto py-8 pl-4 pr-1"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          dockMouseX.set(event.clientY - rect.top + event.currentTarget.scrollTop)
        }}
        onMouseLeave={() => dockMouseX.set(Number.POSITIVE_INFINITY)}
      >
        {library.map((snapshot, index) => (
          <DockItem
            key={snapshot.id}
            snapshot={snapshot}
            index={index}
            mouseX={dockMouseX}
            onSelect={loadSnapshot}
            onToggleFavorite={toggleFavorite}
            onRename={renameSnapshot}
            onDelete={deleteSnapshot}
          />
        ))}
      </div>
    </section>
  )
}
