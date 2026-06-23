import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getStructureGradientFamily,
  STRUCTURE_GRADIENT_STYLES,
} from './gradient-structure-styles.ts'

test('structure gradient styles include sparkle, hexagon, star, and fluid families', () => {
  assert.deepEqual(STRUCTURE_GRADIENT_STYLES, ['Sparkle Field', 'Hex Glow', 'Star Burst', 'Fluid Veil'])
  assert.equal(getStructureGradientFamily('Sparkle Field'), 'sparkle')
  assert.equal(getStructureGradientFamily('Hex Glow'), 'hex')
  assert.equal(getStructureGradientFamily('Star Burst'), 'star')
  assert.equal(getStructureGradientFamily('Fluid Veil'), 'fluid')
})

test('non-structure styles do not report a structure family', () => {
  assert.equal(getStructureGradientFamily('Cyan Ribbon'), null)
})
