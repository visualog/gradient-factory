import test from 'node:test'
import assert from 'node:assert/strict'
import {
  GRADIENT_MASK_EFFECTS,
  gradientGlassMaskDisplacement,
  gradientGlassMaskOverlay,
  gradientMaskCoverage,
  gradientMaskShade,
} from './gradient-mask-effects.ts'

test('mask effects expose full-canvas textured glass options', () => {
  assert.deepEqual(GRADIENT_MASK_EFFECTS, ['None', 'RibbedGlass', 'PebbleGlass', 'RippleGlass'])
})

test('none mask leaves the field unchanged', () => {
  assert.equal(gradientMaskCoverage('None', 0.02, 0.98), 1)
  assert.equal(gradientMaskShade('None', 0.02, 0.98), 1)
  assert.deepEqual(gradientGlassMaskOverlay('None', 0.02, 0.98), { shade: 1, highlight: 0, edge: 0 })
  assert.deepEqual(gradientGlassMaskDisplacement('None', 0.02, 0.98), { x: 0, y: 0 })
})

test('ribbed glass covers the full canvas and bends samples horizontally', () => {
  assert.equal(gradientMaskCoverage('RibbedGlass', 0.01, 0.92), 1)
  assert.notEqual(gradientGlassMaskDisplacement('RibbedGlass', 0.12, 0.4).x, gradientGlassMaskDisplacement('RibbedGlass', 0.18, 0.4).x)
})

test('pebble glass creates two-axis local refraction', () => {
  const displacement = gradientGlassMaskDisplacement('PebbleGlass', 0.37, 0.58)
  assert.notEqual(displacement.x, 0)
  assert.notEqual(displacement.y, 0)
})

test('ripple glass adds overlay highlights across the full canvas', () => {
  assert.ok(gradientGlassMaskOverlay('RippleGlass', 0.6, 0.42).highlight > 0)
})
