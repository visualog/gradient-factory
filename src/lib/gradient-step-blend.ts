export const DEFAULT_GRADIENT_STEPS = 0
export const GRADIENT_STEPS_MAX = 10

const clamp = (value: number, min = 0, max = GRADIENT_STEPS_MAX) => Math.max(min, Math.min(max, value))

export function quantizeGradientWeight(weight: number, amount = DEFAULT_GRADIENT_STEPS) {
  const steps = Math.round(clamp(amount))
  if (steps <= 0) return weight

  const levels = Math.max(2, steps)
  const step = 1 / (levels - 1)
  return Math.round(clamp(weight, 0, 1) / step) * step
}

export function applyGradientWeightSteps(weight: number, amount = DEFAULT_GRADIENT_STEPS) {
  return quantizeGradientWeight(weight, amount)
}

export function stepSliderValueFromAmount(amount = DEFAULT_GRADIENT_STEPS) {
  return GRADIENT_STEPS_MAX - Math.round(clamp(amount))
}

export function stepAmountFromSliderValue(value = GRADIENT_STEPS_MAX) {
  return GRADIENT_STEPS_MAX - Math.round(clamp(value))
}
