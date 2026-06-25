import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

type SelectContextValue = {
  contentRef: React.RefObject<HTMLElement>
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useComposedRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return React.useCallback((node: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(node)
        return
      }
      ;(ref as React.MutableRefObject<T | null>).current = node
    })
  }, refs)
}

function Select({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(Boolean(defaultOpen))
  const open = controlledOpen ?? uncontrolledOpen
  const triggerRef = React.useRef<HTMLElement>(null)
  const contentRef = React.useRef<HTMLElement>(null)

  const setOpen = React.useCallback((nextOpen: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }, [controlledOpen, onOpenChange])

  React.useEffect(() => {
    if (!open) return

    const isInsideSelect = (event: Event) => {
      const target = event.target instanceof Node ? event.target : null
      return Boolean(target && (triggerRef.current?.contains(target) || contentRef.current?.contains(target)))
    }

    const closeIfOutside = (event: Event) => {
      if (!isInsideSelect(event)) setOpen(false)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeIfOutside, true)
    document.addEventListener('click', closeIfOutside, true)
    document.addEventListener('keydown', closeOnEscape, true)

    return () => {
      document.removeEventListener('pointerdown', closeIfOutside, true)
      document.removeEventListener('click', closeIfOutside, true)
      document.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [open, setOpen])

  const contextValue = React.useMemo(() => ({ contentRef, open, setOpen, triggerRef }), [open, setOpen])

  return (
    <SelectContext.Provider value={contextValue}>
      <SelectPrimitive.Root open={open} onOpenChange={setOpen} {...props} />
    </SelectContext.Provider>
  )
}

const SelectGroup = SelectPrimitive.Group
const SelectLabel = SelectPrimitive.Label
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const composedRef = useComposedRefs(ref, context?.triggerRef)

  return (
    <SelectPrimitive.Trigger
      ref={composedRef}
      className={cn(
        'flex h-8 w-full items-center justify-between gap-2 rounded-md bg-transparent px-1 text-sm text-[var(--pg-text)] outline-none transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06] focus:ring-1 focus:ring-white/15 active:bg-white/[0.08] data-[state=open]:bg-white/[0.06] data-[state=open]:ring-1 data-[state=open]:ring-white/15 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={16} strokeWidth={1.8} className="shrink-0 opacity-75" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const composedRef = useComposedRefs(ref, context?.contentRef)

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={composedRef}
        className={cn(
          'pg-select-content z-50 min-w-[8rem] overflow-hidden rounded-[12px] border border-white/10 bg-[#151820]/95 text-[var(--pg-text,#f5f7fb)] shadow-[0_16px_42px_rgba(0,0,0,0.38)] backdrop-blur-md',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            'pg-select-viewport max-h-[inherit] overflow-y-auto p-1',
            position === 'popper' && 'min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex h-8 cursor-default select-none items-center rounded-[8px] px-2 text-sm outline-none transition-colors focus:bg-white/10 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue }
