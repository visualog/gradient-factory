import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./perimeter-controls.ts', import.meta.url), 'utf8')
const colorChipsSource = readFileSync(new URL('../components/gradient/canvas-color-chips.tsx', import.meta.url), 'utf8')
const sizeControlsSource = readFileSync(new URL('../components/gradient/canvas-size-controls.tsx', import.meta.url), 'utf8')
const actionsSource = readFileSync(new URL('../components/gradient/canvas-actions.tsx', import.meta.url), 'utf8')
const experimentToolbarSource = readFileSync(new URL('../components/gradient/experiment-toolbar.tsx', import.meta.url), 'utf8')
const perimeterControlsSource = readFileSync(new URL('../components/gradient/perimeter-controls.tsx', import.meta.url), 'utf8')
const canvasStageSource = readFileSync(new URL('../components/gradient/canvas-stage.tsx', import.meta.url), 'utf8')

test('canvas perimeter bars share a fixed 36px height', () => {
  assert.match(source, /export const CONTROL_HEIGHT = 36/)
  assert.match(source, /CONTROL_HEIGHT_CLASS = 'h-9 min-h-9'/)
  assert.match(source, /CONTROL_SURFACE_CLASS = `\$\{CONTROL_HEIGHT_CLASS\}/)
  assert.match(colorChipsSource, /CONTROL_SURFACE_CLASS/)
  assert.match(sizeControlsSource, /CONTROL_INTERACTIVE_SURFACE_CLASS/)
  assert.match(actionsSource, /CONTROL_SURFACE_CLASS/)
  assert.match(experimentToolbarSource, /CONTROL_SURFACE_CLASS/)
  assert.doesNotMatch(experimentToolbarSource, /p-1\.5 text-\[var\(--pg-text\)\]/)
})

test('mask and steps share the generate toolbar row with the standard gap', () => {
  assert.match(experimentToolbarSource, /aria-label="Mask effect"/)
  assert.match(experimentToolbarSource, /aria-label="Steps"/)
  assert.match(experimentToolbarSource, /w-\[222px\]/)
  assert.match(experimentToolbarSource, /function StepsCornerSlider/)
  assert.match(experimentToolbarSource, /STEP_TRACK_CURVE_END/)
  assert.match(experimentToolbarSource, /role="slider"/)
  assert.match(experimentToolbarSource, /C \$\{STEP_TRACK_CONTROL_1\.x\}/)
  assert.match(experimentToolbarSource, /M 12 0 H 181 C 205 0 222 16 222 40/)
  assert.doesNotMatch(experimentToolbarSource, /<Slider/)
  assert.doesNotMatch(experimentToolbarSource, /style=\{\{ width: 168 \}\}/)
  assert.doesNotMatch(perimeterControlsSource, /label="Steps"/)
  assert.doesNotMatch(perimeterControlsSource, /aria-label="Mask effect"/)
})

test('color panel swatches update before the outside pointerdown closer can unmount them', () => {
  assert.match(colorChipsSource, /onPointerDownCapture=\{selectQuickColorFromEvent\}/)
  assert.match(colorChipsSource, /onMouseDownCapture=\{selectQuickColorFromEvent\}/)
  assert.match(colorChipsSource, /event\.stopPropagation\(\)/)
  assert.match(colorChipsSource, /data-swatch=\{swatch\}/)
  assert.match(colorChipsSource, /updateColor\(activeColorIndex, swatch\)/)
  assert.match(colorChipsSource, /window\.setTimeout\(close, 0\)/)
  assert.match(colorChipsSource, /key=\{`palette-color-\$\{index\}`\}/)
  assert.doesNotMatch(colorChipsSource, /key=\{`\$\{color\}-\$\{index\}`\}/)
})

test('floating color and export panels render above canvas point handles', () => {
  assert.match(canvasStageSource, /function PointHandles/)
  assert.match(canvasStageSource, /className="absolute h-6 w-6/)
  assert.match(canvasStageSource, /absolute left-0 top-full z-\[80\]/)
  assert.match(canvasStageSource, /absolute inset-0 z-\[30\]/)
  assert.match(colorChipsSource, /z-\[90\]/)
  assert.match(actionsSource, /z-\[90\]/)
})
