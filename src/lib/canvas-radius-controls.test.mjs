import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canvasRadiusFromDrag,
  radiusHandleModeFromLocalX,
} from './canvas-radius-controls.ts'

test('radius handle keeps the center zone for canvas resize', () => {
  assert.equal(radiusHandleModeFromLocalX(28, 56), 'resize')
})

test('radius handle uses the left edge for horizontal radius drag', () => {
  assert.equal(radiusHandleModeFromLocalX(8, 56), 'radius-horizontal')
})

test('radius handle uses the right edge for vertical radius drag', () => {
  assert.equal(radiusHandleModeFromLocalX(48, 56), 'radius-vertical')
})

test('horizontal radius drag is damped so small movements feel controlled', () => {
  assert.equal(canvasRadiusFromDrag({ mode: 'radius-horizontal', startRadius: 24, startX: 100, startY: 100, currentX: 136, currentY: 100, maxRadius: 80 }), 44)
})

test('horizontal radius drag clamps at zero', () => {
  assert.equal(canvasRadiusFromDrag({ mode: 'radius-horizontal', startRadius: 24, startX: 100, startY: 100, currentX: 20, currentY: 100, maxRadius: 80 }), 0)
})

test('vertical radius drag grows upward and clamps at max radius', () => {
  assert.equal(canvasRadiusFromDrag({ mode: 'radius-vertical', startRadius: 24, startX: 100, startY: 100, currentX: 100, currentY: 40, maxRadius: 48 }), 48)
})
