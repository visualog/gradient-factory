'use client'

import { useEffect, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react'
import { Download, GripVertical, Plus, RefreshCw, Save } from 'lucide-react'
import { CANVAS_MAX_SIZE, CANVAS_MIN_HEIGHT, CANVAS_MIN_WIDTH, clamp } from '@/lib/gradient-model'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ControlPanelProps = {
  panelClass: string
  panelDividerClass: string
  footerButtonDividerClass: string
  width: number
  height: number
  setWidth: Dispatch<SetStateAction<number>>
  setHeight: Dispatch<SetStateAction<number>>
  colors: string[]
  draggingColorIndex: number | null
  setDraggingColorIndex: Dispatch<SetStateAction<number | null>>
  updateColor: (index: number, value: string) => void
  reorderColorLayer: (fromIndex: number, toIndex: number) => void
  resetColors: () => void
  saveToLibrary: () => void
  download: () => void
}

export function ControlPanel({
  panelClass,
  panelDividerClass,
  footerButtonDividerClass,
  width,
  height,
  setWidth,
  setHeight,
  colors,
  draggingColorIndex,
  setDraggingColorIndex,
  updateColor,
  reorderColorLayer,
  resetColors,
  saveToLibrary,
  download,
}: ControlPanelProps) {
  return (
    <aside className={`z-30 col-start-1 row-start-2 max-h-[min(720px,calc(100vh-3rem))] w-full overflow-y-auto lg:col-start-2 lg:row-start-1 lg:self-center ${panelClass}`}>
      <div className="grid grid-cols-2 gap-8 p-6">
        <SizeInput label="W" min={CANVAS_MIN_WIDTH} value={width} onChange={setWidth} />
        <SizeInput label="H" min={CANVAS_MIN_HEIGHT} value={height} onChange={setHeight} />
      </div>

      <div className={`border-t px-6 py-5 ${panelDividerClass}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold">Colors</div>
          <div className="flex items-center gap-1">
            <Button type="button" onClick={resetColors} variant="ghost" size="icon" className="text-lg leading-none" title="Reset colors">
              <RefreshCw size={16} strokeWidth={1.8} />
            </Button>
            <Button type="button" onClick={saveToLibrary} variant="ghost" size="icon" className="text-xl leading-none" title="Save to library">
              <Plus size={18} strokeWidth={1.8} />
            </Button>
          </div>
        </div>
        <ColorList
          colors={colors}
          draggingColorIndex={draggingColorIndex}
          setDraggingColorIndex={setDraggingColorIndex}
          updateColor={updateColor}
          reorderColorLayer={reorderColorLayer}
        />
      </div>

      <div className={`grid grid-cols-2 border-t ${footerButtonDividerClass}`}>
        <Button onClick={saveToLibrary} variant="ghost" size="dock" className={`rounded-none border-r ${footerButtonDividerClass}`}>
          <Save size={16} strokeWidth={1.8} />
          <span>Save</span>
        </Button>
        <Button onClick={download} variant="ghost" size="dock" className="rounded-none">
          <Download size={16} strokeWidth={1.8} />
          <span>Download</span>
        </Button>
      </div>
    </aside>
  )
}

function SizeInput({
  label,
  min,
  value,
  onChange,
}: {
  label: string
  min: number
  value: number
  onChange: Dispatch<SetStateAction<number>>
}) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = () => {
    const parsed = Number(draft)
    const next = Number.isFinite(parsed) ? Math.round(clamp(parsed, min, CANVAS_MAX_SIZE)) : value

    setDraft(String(next))
    onChange(next)
  }

  const updateDraft = (next: string) => {
    setDraft(next)
    const parsed = Number(next)

    if (Number.isFinite(parsed) && parsed >= min && parsed <= CANVAS_MAX_SIZE) onChange(Math.round(parsed))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur()
  }

  return (
    <label className="flex items-center gap-3">
      <span className="text-sm font-semibold">{label}</span>
      <Input
        type="number"
        min={min}
        max={CANVAS_MAX_SIZE}
        value={draft}
        onBlur={commit}
        onChange={(event) => updateDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        className="w-16"
      />
    </label>
  )
}

function ColorList({
  colors,
  draggingColorIndex,
  setDraggingColorIndex,
  updateColor,
  reorderColorLayer,
}: Pick<ControlPanelProps, 'colors' | 'draggingColorIndex' | 'setDraggingColorIndex' | 'updateColor' | 'reorderColorLayer'>) {
  return (
    <div className="space-y-3">
      {colors.map((color, index) => (
        <div
          key={color}
          className={`flex items-center gap-2 rounded-md transition-colors ${draggingColorIndex === index ? 'bg-white/[0.07]' : 'bg-transparent'}`}
          onDragOver={(event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
          }}
          onDrop={(event) => {
            event.preventDefault()
            const fromIndex = Number(event.dataTransfer.getData('text/plain'))
            if (Number.isInteger(fromIndex)) reorderColorLayer(fromIndex, index)
            setDraggingColorIndex(null)
          }}
        >
          <button
            type="button"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', String(index))
              setDraggingColorIndex(index)
            }}
            onDragEnd={() => setDraggingColorIndex(null)}
            className="grid h-8 w-6 shrink-0 cursor-grab place-items-center rounded text-[var(--pg-text)] opacity-55 transition-opacity hover:opacity-100 active:cursor-grabbing"
            title="Drag to reorder color layer"
          >
            <GripVertical size={15} strokeWidth={1.8} />
          </button>
          <input
            type="color"
            value={color}
            onChange={(e) => updateColor(index, e.target.value)}
            className="color-chip h-5 w-5 shrink-0 appearance-none rounded-full border-0 bg-transparent p-0"
            title={`Choose color ${index + 1}`}
          />
          <Input value={color.replace('#', '')} onChange={(e) => updateColor(index, e.target.value)} className="h-8 flex-1 uppercase" />
        </div>
      ))}
    </div>
  )
}
