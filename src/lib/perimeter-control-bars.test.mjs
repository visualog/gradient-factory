import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./perimeter-controls.ts', import.meta.url), 'utf8')
const colorChipsSource = readFileSync(new URL('../components/gradient/canvas-color-chips.tsx', import.meta.url), 'utf8')
const sizeControlsSource = readFileSync(new URL('../components/gradient/canvas-size-controls.tsx', import.meta.url), 'utf8')
const actionsSource = readFileSync(new URL('../components/gradient/canvas-actions.tsx', import.meta.url), 'utf8')

test('canvas perimeter bars share a fixed 36px height', () => {
  assert.match(source, /export const CONTROL_HEIGHT = 36/)
  assert.match(source, /CONTROL_HEIGHT_CLASS = 'h-9 min-h-9'/)
  assert.match(source, /CONTROL_SURFACE_CLASS = `\$\{CONTROL_HEIGHT_CLASS\}/)
  assert.match(colorChipsSource, /CONTROL_SURFACE_CLASS/)
  assert.match(sizeControlsSource, /CONTROL_INTERACTIVE_SURFACE_CLASS/)
  assert.match(actionsSource, /CONTROL_SURFACE_CLASS/)
})
