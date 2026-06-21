'use client'

import { useEffect, useState } from 'react'
import type { GradientSnapshot } from '@/lib/gradient-model'

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
        if (!ignore && Array.isArray(data.library)) setLibrary(data.library)
      })
      .catch(() => {
        if (!ignore) setLibrary([])
      })

    return () => {
      ignore = true
    }
  }, [])

  const persistLibrary = (items: GradientSnapshot[]) => {
    fetch('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).catch(() => undefined)
  }

  const saveToLibrary = () => {
    const snapshot = captureGradient()
    if (!snapshot) return null
    setLibrary((items) => {
      const next = [snapshot, ...items].slice(0, 12)
      persistLibrary(next)
      return next
    })
    return snapshot
  }

  const download = () => {
    const snapshot = saveToLibrary()
    if (!snapshot) return
    const a = document.createElement('a')
    a.href = snapshot.preview
    a.download = 'mesh-gradient.png'
    a.click()
  }

  return { library, saveToLibrary, download, loadSnapshot: applySnapshot }
}
