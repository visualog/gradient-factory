import test from 'node:test'
import assert from 'node:assert/strict'
import { K_CULTURE_GRADIENT_PRESETS } from './k-culture-gradient-presets.ts'

test('K Culture presets cover distinct cultural gradient directions', () => {
  const labels = K_CULTURE_GRADIENT_PRESETS.map((preset) => preset.label)

  assert.deepEqual(labels, [
    'Obang Glow',
    'Taegeuk Pulse',
    'Dancheong Band',
    'Hanbok Silk',
    'Seoul Prism',
    'Idol Halo',
    'Celadon Moon',
  ])
})

test('K Culture presets use the existing C Lab renderer contract', () => {
  for (const preset of K_CULTURE_GRADIENT_PRESETS) {
    assert.equal(preset.width, 640)
    assert.equal(preset.height, 640)
    assert.ok(preset.colors.length >= 5)
    assert.equal(preset.pointPositions?.length, preset.colors.length)
    assert.ok(preset.warp >= 0)
    assert.ok(preset.warpSize >= 1)
    assert.ok((preset.steps ?? 0) >= 0)
  }
})

test('Dancheong and Hanbok presets map research cues to renderer controls', () => {
  const dancheong = K_CULTURE_GRADIENT_PRESETS.find((preset) => preset.label === 'Dancheong Band')
  const hanbok = K_CULTURE_GRADIENT_PRESETS.find((preset) => preset.label === 'Hanbok Silk')

  assert.equal(dancheong?.style, 'Linear Fold')
  assert.equal(dancheong?.mask, 'RibbedGlass')
  assert.equal(dancheong?.steps, 8)
  assert.equal(hanbok?.style, 'Soft Mesh')
  assert.equal(hanbok?.mask, 'None')
  assert.equal(hanbok?.steps, 0)
})
