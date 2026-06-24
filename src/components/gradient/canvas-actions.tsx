'use client'

import { useState } from 'react'
import { Code2, Copy, Download, FileImage, Link2, Save } from 'lucide-react'
import { CONTROL_SURFACE_CLASS } from '@/lib/perimeter-controls'
import { Button } from '@/components/ui/button'

type ExportActions = {
  enabled: boolean
  shareGradient: () => void
  copyCss: () => void
  copyTailwind: () => void
  downloadScale: (scale: number) => void
}

export function CanvasActions({
  saveToLibrary,
  download,
  experiment,
}: {
  saveToLibrary: () => void
  download: () => void
  experiment?: ExportActions
}) {
  const [isExportOpen, setIsExportOpen] = useState(false)
  const actionButtonClass = 'h-8 w-8 rounded-[12px] bg-transparent text-[var(--pg-text)] outline-none hover:bg-black/[0.16] focus-visible:bg-black/[0.16] focus-visible:ring-1 focus-visible:ring-white/15 active:bg-black/[0.22]'
  const menuItemClass = 'flex h-8 w-full items-center gap-2 rounded-[9px] px-2 text-left text-xs text-[var(--pg-text)] outline-none hover:bg-black/[0.16] focus-visible:bg-black/[0.16]'
  const exportActions = experiment?.enabled ? experiment : null
  const useExportMenu = Boolean(exportActions)

  const runExportAction = (action: () => void) => {
    action()
    setIsExportOpen(false)
  }

  return (
    <div
      data-testid="canvas-actions"
      className={`pointer-events-auto relative flex items-center gap-1 px-1.5 text-[var(--pg-text)] ${CONTROL_SURFACE_CLASS}`}
    >
      <Button type="button" onClick={saveToLibrary} variant="ghost" size="icon" className={actionButtonClass} title="Save to library" aria-label="Save to library">
        <Save size={16} strokeWidth={1.8} />
      </Button>
      <Button
        type="button"
        onClick={useExportMenu ? () => setIsExportOpen((value) => !value) : download}
        variant="ghost"
        size="icon"
        className={actionButtonClass}
        title={useExportMenu ? 'Export' : 'Download'}
        aria-label={useExportMenu ? 'Export' : 'Download'}
        aria-expanded={useExportMenu ? isExportOpen : undefined}
      >
        <Download size={16} strokeWidth={1.8} />
      </Button>
      {exportActions && isExportOpen ? (
        <div className="absolute bottom-full right-0 z-[90] mb-2 w-52 rounded-[14px] border border-white/10 bg-[var(--pg-panel)] p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <button type="button" className={menuItemClass} onClick={() => runExportAction(() => exportActions.downloadScale(1))}>
            <FileImage size={14} strokeWidth={1.9} />
            <span>PNG 1x</span>
          </button>
          <button type="button" className={menuItemClass} onClick={() => runExportAction(() => exportActions.downloadScale(2))}>
            <FileImage size={14} strokeWidth={1.9} />
            <span>PNG 2x</span>
          </button>
          <button type="button" className={menuItemClass} onClick={() => runExportAction(() => exportActions.downloadScale(4))}>
            <FileImage size={14} strokeWidth={1.9} />
            <span>PNG 4x</span>
          </button>
          <div className="my-1 h-px bg-white/10" />
          <button type="button" className={menuItemClass} onClick={() => runExportAction(exportActions.copyCss)}>
            <Code2 size={14} strokeWidth={1.9} />
            <span>Copy CSS</span>
          </button>
          <button type="button" className={menuItemClass} onClick={() => runExportAction(exportActions.copyTailwind)}>
            <Copy size={14} strokeWidth={1.9} />
            <span>Copy Tailwind</span>
          </button>
          <button type="button" className={menuItemClass} onClick={() => runExportAction(exportActions.shareGradient)}>
            <Link2 size={14} strokeWidth={1.9} />
            <span>Copy share URL</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
