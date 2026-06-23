import test from 'node:test'
import assert from 'node:assert/strict'
import { getUiGradientPreset, UI_IMAGE_STYLES } from './ui-gradient-presets.ts'

const BASE_GRADIENT_STYLES = ['Sharp Bézier', 'Soft Mesh', 'Linear Fold', 'Conic Bloom', 'Cellular Glow']

test('C Lab includes a fluid gradient preset with flow-oriented defaults', () => {
  assert.ok(UI_IMAGE_STYLES.includes('Fluid Veil'))
  assert.deepEqual(getUiGradientPreset('Fluid Veil'), {
    label: 'Fluid Veil',
    width: 640,
    height: 640,
    colors: ['#76F7FF', '#2F4DFF', '#FF5EC7', '#071221', '#DDFBFF', '#1AE6A6'],
    pointPositions: [
      { x: 0.18, y: 0.28 },
      { x: 0.58, y: 0.2 },
      { x: 0.82, y: 0.58 },
      { x: 0.32, y: 0.74 },
      { x: 0.68, y: 0.82 },
      { x: 0.48, y: 0.48 },
    ],
    style: 'Fluid Veil',
    warpShape: 'Drift',
    warp: 1.12,
    warpSize: 1.68,
    noise: 0.003,
    mask: 'RibbedGlass',
    steps: 0,
  })
})

test('C Lab includes A type base styles with Coolors popular gradient colors', () => {
  for (const style of BASE_GRADIENT_STYLES) {
    assert.ok(UI_IMAGE_STYLES.includes(style), `${style} should be available in C Lab`)
  }

  assert.deepEqual(getUiGradientPreset('Sharp Bézier')?.colors, ['#606C38', '#283618', '#FEFAE0', '#DDA15E', '#BC6C25'])
  assert.deepEqual(getUiGradientPreset('Soft Mesh')?.colors, ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'])
  assert.deepEqual(getUiGradientPreset('Linear Fold')?.colors, ['#8ECAE6', '#219EBC', '#023047', '#FFB703', '#FB8500'])
  assert.deepEqual(getUiGradientPreset('Conic Bloom')?.colors, ['#CDB4DB', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF'])
  assert.deepEqual(getUiGradientPreset('Cellular Glow')?.colors, ['#CCD5AE', '#E9EDC9', '#FEFAE0', '#FAEDCD', '#D4A373'])
})
