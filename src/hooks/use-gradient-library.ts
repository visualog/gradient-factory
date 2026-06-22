'use client'

import { useEffect, useState } from 'react'
import type { GradientSnapshot } from '@/lib/gradient-model'

const LIBRARY_LIMIT = 18

function defaultSnapshotName(snapshot: GradientSnapshot, index: number) {
  if (snapshot.name) return snapshot.name
  return snapshot.kind === 'history' ? `Generated ${index + 1}` : `Saved ${index + 1}`
}

export function useGradientLibrary({
  captureGradient,
  applySnapshot,
}: {
  captureGradient: () => GradientSnapshot | null
  applySnapshot: (snapshot: GradientSnapshot) => void
}) {
  const [library, setLibrary] = useState<GradientSnapshot[]>([])

  useEffect(() => {
    let ignore = false
    fetch('/api/library')
      .then((response) => response.json())
      .then((data: { library?: GradientSnapshot[] }) => {
        if (!ignore && Array.isArray(data.library)) {
          setLibrary(data.library.filter((item) => item.kind !== 'history'))
        }
      })
      .catch(() => {
        if (!ignore) setLibrary([])
      })

    return () => {
      ignore = true
    }
  }, [])

  const persistLibrary = (items: GradientSnapshot[]) => {
    const savedItems = items.filter((item) => item.kind !== 'history')

    fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedItems),
    }).catch(() => undefined)
  }

  const commitLibrary = (updater: (items: GradientSnapshot[]) => GradientSnapshot[], persist = true) => {
    setLibrary((items) => {
      const next = updater(items).slice(0, LIBRARY_LIMIT)
      if (persist) persistLibrary(next)
      return next
    })
  }

  const saveToLibrary = () => {
    const snapshot = captureGradient()
    if (!snapshot) return null
    const savedSnapshot = { ...snapshot, kind: 'saved' as const, favorite: true, name: snapshot.name ?? 'Saved gradient' }

    commitLibrary((items) => [savedSnapshot, ...items])
    return savedSnapshot
  }

  const recordHistory = (snapshot: GradientSnapshot | null) => {
    if (!snapshot) return
    commitLibrary((items) => [
      { ...snapshot, kind: 'history' as const, favorite: false, name: snapshot.name ?? 'Generated' },
      ...items,
    ], false)
  }

  const toggleFavorite = (id: number) => {
    commitLibrary((items) =>
      items.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite, kind: !item.favorite ? 'saved' : item.kind } : item
      )
    )
  }

  const renameSnapshot = (id: number, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    commitLibrary((items) => items.map((item) => (item.id === id ? { ...item, name: trimmed } : item)))
  }

  const deleteSnapshot = (id: number) => {
    commitLibrary((items) => items.filter((item) => item.id !== id))
  }

  const download = () => {
    const snapshot = captureGradient()
    if (!snapshot) return
    const a = document.createElement('a')
    a.href = snapshot.preview
    a.download = 'mesh-gradient.png'
    a.click()
  }

  return {
    library: library.map((snapshot, index) => ({ ...snapshot, name: defaultSnapshotName(snapshot, index) })),
    saveToLibrary,
    download,
    loadSnapshot: applySnapshot,
    recordHistory,
    toggleFavorite,
    renameSnapshot,
    deleteSnapshot,
  }
}
