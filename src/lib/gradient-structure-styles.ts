export const STRUCTURE_GRADIENT_STYLES = ['Sparkle Field', 'Hex Glow', 'Star Burst', 'Fluid Veil'] as const

export type StructureGradientStyle = (typeof STRUCTURE_GRADIENT_STYLES)[number]
export type StructureGradientFamily = 'sparkle' | 'hex' | 'star' | 'fluid'

export function getStructureGradientFamily(style: string): StructureGradientFamily | null {
  if (style === 'Sparkle Field') return 'sparkle'
  if (style === 'Hex Glow') return 'hex'
  if (style === 'Star Burst') return 'star'
  if (style === 'Fluid Veil') return 'fluid'
  return null
}
