import type { GradientMaskEffect } from '@/lib/gradient-mask-effects'
import type { GradientStyle, WarpShape } from '@/lib/style-presets'
import type { CultureMode, ExperimentLock } from '@/hooks/use-gradient-experiment'

export const KO_GRADIENT_STYLE_LABELS: Record<GradientStyle, string> = {
  'Sharp Bézier': '선명한 베지어',
  'Soft Mesh': '부드러운 메시',
  'Linear Fold': '선형 접힘',
  'Conic Bloom': '원형 광채',
  'Cellular Glow': '셀룰러 글로우',
  'Inset Bloom': '안쪽 빛 번짐',
  'Neon Band': '네온 밴드',
  'Radial Cushion': '중심 쿠션',
  'Aurora Twist': '오로라 회전',
  'Flame Inset': '불꽃 인셋',
  'Lime Violet Drift': '라임 보라 흐름',
  'Mint Dome': '민트 돔',
  'Cyan Ribbon': '시안 리본',
  'Violet Well': '보라 웰',
  'Solar Slash': '태양 사선',
  'Candy Wave': '캔디 웨이브',
  'Lime Gate': '라임 게이트',
  'Pop Horizon': '팝 수평선',
  'Dusk Shelf': '황혼 선반',
  'Blue Core': '블루 코어',
  'Rose Orbit': '로즈 궤도',
  'Sparkle Field': '스파클 필드',
  'Hex Glow': '육각 글로우',
  'Star Burst': '별빛 폭발',
  'Fluid Veil': '유체 베일',
}

export const KO_WARP_SHAPE_LABELS: Record<WarpShape, string> = {
  Gravity: '부드러운 끌림',
  Wave: '액체 물결',
  Radial: '중심 확산',
  Spiral: '비틀린 흐름',
  Pinch: '타이트 포커스',
  Ripple: '잔물결 필드',
  Drift: '느린 드리프트',
}

export const KO_MASK_LABELS: Record<GradientMaskEffect, string> = {
  None: '마스크 끔',
  RibbedGlass: '세로 유리',
  PebbleGlass: '조약돌 유리',
  RippleGlass: '물결 유리',
}

export const KO_CULTURE_MODE_LABELS: Record<CultureMode, string> = {
  general: '일반',
  'k-culture': 'K 문화',
}

export const KO_LOCK_LABELS: Record<ExperimentLock, string> = {
  points: '점',
  style: '형',
  warp: '흐',
  noise: '결',
}

export const KO_LOCK_TITLES: Record<ExperimentLock, string> = {
  points: '포인트',
  style: '스타일',
  warp: '흐름',
  noise: '질감',
}
