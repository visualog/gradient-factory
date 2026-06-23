import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('./resize-handles.ts', import.meta.url), 'utf8')

test('resize handle hover does not scale its visual geometry', () => {
  assert.equal(source.includes('group-hover/resize:scale-105'), false)
  assert.equal(source.includes('group-hover/resize:scale-110'), false)
})
