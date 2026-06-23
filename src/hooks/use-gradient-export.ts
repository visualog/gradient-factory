'use client'

import { DEFAULT_POINT_POSITIONS, type GradientSnapshot } from '@/lib/gradient-model'
import { renderGradient } from '@/lib/gradient-renderer'
import { cssGradientSnippet, encodeGradientState, tailwindGradientSnippet } from '@/lib/gradient-share'

function maskCanvasCorners(canvas: HTMLCanvasElement, radius: number) {
  if (radius <= 0) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.globalCompositeOperation = 'destination-in'
  ctx.beginPath()
  ctx.roundRect(0, 0, canvas.width, canvas.height, Math.min(radius, canvas.width / 2, canvas.height / 2))
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

export function useGradientExport(captureGradient: () => GradientSnapshot | null) {
  const copyText = async (value: string) => {
    if (!navigator.clipboard) return
    await navigator.clipboard.writeText(value)
  }

  const shareGradient = async () => {
    const snapshot = captureGradient()
    if (!snapshot) return

    const url = new URL(window.location.href)
    url.searchParams.set('ab', 'lab')
    url.searchParams.set('state', encodeGradientState(snapshot))
    window.history.replaceState(null, '', url)
    await copyText(url.toString())
  }

  const copyCss = async () => {
    const snapshot = captureGradient()
    if (!snapshot) return
    await copyText(cssGradientSnippet(snapshot))
  }

  const copyTailwind = async () => {
    const snapshot = captureGradient()
    if (!snapshot) return
    await copyText(tailwindGradientSnippet(snapshot))
  }

  const downloadScale = (scale: number) => {
    const snapshot = captureGradient()
    if (!snapshot) return

    const canvas = document.createElement('canvas')
    renderGradient(canvas, {
      width: snapshot.width * scale,
      height: snapshot.height * scale,
      colors: snapshot.colors,
      pointPositions: snapshot.pointPositions ?? DEFAULT_POINT_POSITIONS,
      style: snapshot.style,
      warpShape: snapshot.warpShape,
      warp: snapshot.warp,
      warpSize: snapshot.warpSize,
      noiseAmount: snapshot.noise,
      vignetteAmount: snapshot.vignette,
    })
    maskCanvasCorners(canvas, (snapshot.cornerRadius ?? 0) * scale)

    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mesh-gradient-${scale}x.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return { shareGradient, copyCss, copyTailwind, downloadScale }
}
