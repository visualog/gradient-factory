'use client'

import { useEffect, useState, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CANVAS_MAX_SIZE, clamp } from '@/lib/gradient-model'
import { Input } from '@/components/ui/input'

type SizeInputProps = {
  label: string
  min: number
  value: number
  onChange: Dispatch<SetStateAction<number>>
  className?: string
  inputClassName?: string
  inputTestId?: string
  showStepper?: boolean
}

export function SizeInput({ label, min, value, onChange, className = '', inputClassName = 'w-16', inputTestId, showStepper = false }: SizeInputProps) {
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

  const stepBy = (delta: number) => {
    const parsed = Number(draft)
    const base = Number.isFinite(parsed) ? parsed : value
    const next = Math.round(clamp(base + delta, min, CANVAS_MAX_SIZE))

    setDraft(String(next))
    onChange(next)
  }

  return (
    <label className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="relative">
        <Input
          type="number"
          min={min}
          max={CANVAS_MAX_SIZE}
          value={draft}
          onBlur={commit}
          onChange={(event) => updateDraft(event.target.value)}
          onInput={(event) => updateDraft(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          className={inputClassName}
          data-testid={inputTestId}
        />
        {showStepper ? (
          <span className="absolute right-1.5 top-1/2 flex -translate-y-1/2 flex-col overflow-hidden rounded-[4px] text-white/75">
            <button type="button" tabIndex={-1} className="flex h-3.5 w-4 items-center justify-center hover:text-white" aria-label={`Increase ${label}`} onClick={() => stepBy(1)}>
              <ChevronUp size={12} strokeWidth={2.4} />
            </button>
            <button type="button" tabIndex={-1} className="flex h-3.5 w-4 items-center justify-center hover:text-white" aria-label={`Decrease ${label}`} onClick={() => stepBy(-1)}>
              <ChevronDown size={12} strokeWidth={2.4} />
            </button>
          </span>
        ) : null}
      </span>
    </label>
  )
}
