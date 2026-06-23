import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_GRADIENT_STEPS,
  GRADIENT_STEPS_MAX,
  applyGradientWeightSteps,
  quantizeGradientWeight,
  stepAmountFromSliderValue,
  stepSliderValueFromAmount,
} from './gradient-step-blend.ts'

test('default step blend keeps each gradient influence smooth', () => {
  assert.equal(DEFAULT_GRADIENT_STEPS, 0)
  assert.equal(applyGradientWeightSteps(0.37, 0), 0.37)
})

test('max steps represent ten discrete influence levels per gradient', () => {
  assert.equal(GRADIENT_STEPS_MAX, 10)
  const values = Array.from({ length: 101 }, (_, value) => quantizeGradientWeight(value / 100, GRADIENT_STEPS_MAX))
  assert.equal(new Set(values).size, 10)
})

test('step amount is applied before color mixing to individual gradient weights', () => {
  assert.equal(applyGradientWeightSteps(0.37, 10), 1 / 3)
  assert.equal(applyGradientWeightSteps(0.37, 5), 0.25)
})

test('step slider is inverted so the default smooth state sits at the right edge', () => {
  assert.equal(stepSliderValueFromAmount(DEFAULT_GRADIENT_STEPS), GRADIENT_STEPS_MAX)
  assert.equal(stepAmountFromSliderValue(GRADIENT_STEPS_MAX), DEFAULT_GRADIENT_STEPS)
  assert.equal(stepAmountFromSliderValue(0), GRADIENT_STEPS_MAX)
  assert.equal(stepSliderValueFromAmount(7), 3)
})
