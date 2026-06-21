'use client'

import type { MotionValue } from 'motion/react'
import type { GradientSnapshot } from '@/lib/gradient-model'
import { DockItem } from '@/components/gradient/dock-item'

type LibraryDockProps = {
  library: GradientSnapshot[]
  dockMouseX: MotionValue<number>
  loadSnapshot: (snapshot: GradientSnapshot) => void
}

export function LibraryDock({ library, dockMouseX, loadSnapshot }: LibraryDockProps) {
  if (library.length === 0) return null

  return (
    <section className="z-20 col-start-1 row-start-2 h-36 overflow-hidden">
      <div
        className="flex h-full items-end gap-6 overflow-x-auto overflow-y-visible px-1 pb-2 pt-12"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          dockMouseX.set(event.clientX - rect.left + event.currentTarget.scrollLeft)
        }}
        onMouseLeave={() => dockMouseX.set(Number.POSITIVE_INFINITY)}
      >
        {library.map((snapshot, index) => (
          <DockItem key={snapshot.id} snapshot={snapshot} index={index} mouseX={dockMouseX} onSelect={loadSnapshot} />
        ))}
      </div>
    </section>
  )
}
