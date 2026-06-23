export const BASE_GRADIENT_STYLES = [
  'Sharp Bézier', 'Soft Mesh', 'Linear Fold', 'Conic Bloom', 'Cellular Glow',
] as const

export const GRADIENT_STYLES = [
  ...BASE_GRADIENT_STYLES,
  'Inset Bloom', 'Neon Band', 'Radial Cushion', 'Aurora Twist',
  'Flame Inset', 'Lime Violet Drift', 'Mint Dome', 'Cyan Ribbon',
  'Violet Well', 'Solar Slash', 'Candy Wave', 'Lime Gate',
  'Pop Horizon', 'Dusk Shelf', 'Blue Core', 'Rose Orbit',
] as const

export const WARP_SHAPES = ['Gravity', 'Wave', 'Radial', 'Spiral', 'Pinch', 'Ripple', 'Drift'] as const

export type GradientStyle = (typeof GRADIENT_STYLES)[number]
export type WarpShape = (typeof WARP_SHAPES)[number]

export const GRADIENT_STYLE_LABELS: Record<GradientStyle, string> = {
  'Sharp Bézier': 'Poster Grain',
  'Soft Mesh': 'Soft Glow',
  'Linear Fold': 'Product Backdrop',
  'Conic Bloom': 'Chrome Bloom',
  'Cellular Glow': 'Editorial Mesh',
  'Inset Bloom': 'Inset Bloom',
  'Neon Band': 'Neon Band',
  'Radial Cushion': 'Radial Cushion',
  'Aurora Twist': 'Aurora Twist',
  'Flame Inset': 'Flame Inset',
  'Lime Violet Drift': 'Lime Violet Drift',
  'Mint Dome': 'Mint Dome',
  'Cyan Ribbon': 'Cyan Ribbon',
  'Violet Well': 'Violet Well',
  'Solar Slash': 'Solar Slash',
  'Candy Wave': 'Candy Wave',
  'Lime Gate': 'Lime Gate',
  'Pop Horizon': 'Pop Horizon',
  'Dusk Shelf': 'Dusk Shelf',
  'Blue Core': 'Blue Core',
  'Rose Orbit': 'Rose Orbit',
}

export const WARP_SHAPE_LABELS: Record<WarpShape, string> = {
  Gravity: 'Soft Pull',
  Wave: 'Liquid Wave',
  Radial: 'Center Bloom',
  Spiral: 'Twist Flow',
  Pinch: 'Tight Focus',
  Ripple: 'Ripple Field',
  Drift: 'Slow Drift',
}
export type VisualStyle = 'vega' | 'nova' | 'luma' | 'rhea' | 'mira' | 'maia' | 'lyra' | 'sera'

export type StylePreset = {
  id: VisualStyle
  name: string
  tokens: {
    background: string
    canvasSurface: string
    panel: string
    panelBorder: string
    text: string
    mutedText: string
    accent: string
    radius: string
    shadow: string
  }
  grid: {
    columns: string
    rows: string
    gap: string
    panelWidth: string
    density: 'compact' | 'balanced' | 'spacious'
  }
  verticalRhythm: {
    base: 4
    baseline: number
    controlHeight: number
    rowGap: number
    sectionGap: number
    sectionPaddingY: number
    labelGap: number
  }
  gradientDefaults: {
    colors: string[]
    warp: number
    warpSize: number
    noise: number
    style: GradientStyle
    warpShape: WarpShape
  }
  classes: {
    app: string
    canvasArea: string
    panel: string
    panelDivider: string
    iconButton: string
    textInput: string
    rangeInput: string
    footerButton: string
    footerButtonDivider: string
  }
}

const vegaPreset: StylePreset = {
  id: 'vega',
  name: 'Vega',
  tokens: {
    background: '#0b0d12',
    canvasSurface: '#090b10',
    panel: '#11141c',
    panelBorder: 'rgba(255,255,255,0.10)',
    text: '#f5f7fb',
    mutedText: 'rgba(245,247,251,0.70)',
    accent: '#f5f7fb',
    radius: '22px',
    shadow: '0 20px 64px rgba(0,0,0,0.45)',
  },
  grid: {
    columns: 'minmax(0,1fr) 320px',
    rows: 'minmax(0,1fr) auto',
    gap: '24px',
    panelWidth: '320px',
    density: 'balanced',
  },
  verticalRhythm: {
    base: 4,
    baseline: 20,
    controlHeight: 32,
    rowGap: 12,
    sectionGap: 24,
    sectionPaddingY: 16,
    labelGap: 8,
  },
  gradientDefaults: {
    colors: ['#EB4679', '#051681', '#EE7F7D', '#265BC9'],
    warp: 0.4,
    warpSize: 1,
    noise: 0.08,
    style: 'Sharp Bézier',
    warpShape: 'Gravity',
  },
  classes: {
    app: 'bg-[var(--pg-bg)] text-[var(--pg-text)]',
    canvasArea: 'bg-[var(--pg-canvas)]',
    panel:
      'rounded-[22px] border border-[var(--pg-border)] bg-[var(--pg-panel)] text-[var(--pg-text)] shadow-[0_20px_64px_rgba(0,0,0,0.45)] backdrop-blur',
    panelDivider: 'border-[var(--pg-border)]',
    iconButton:
      'grid h-8 w-8 place-items-center rounded-md text-[var(--pg-text)] hover:bg-white/10',
    textInput:
      'bg-transparent text-[var(--pg-text)] outline-none focus:bg-white/[0.06] focus:ring-1 focus:ring-white/15',
    rangeInput: 'w-full accent-[var(--pg-accent)]',
    footerButton: 'flex items-center gap-3 px-6 py-5 text-left text-sm hover:bg-white/[0.06]',
    footerButtonDivider: 'border-[var(--pg-border)]',
  },
}

function createPreset(
  id: VisualStyle,
  name: string,
  colors: string[],
  theme: {
    background: string
    canvasSurface: string
    panel: string
    text: string
    border: string
    accent: string
  }
): StylePreset {
  return {
    ...vegaPreset,
    id,
    name,
    tokens: {
      ...vegaPreset.tokens,
      background: theme.background,
      canvasSurface: theme.canvasSurface,
      panel: theme.panel,
      panelBorder: theme.border,
      text: theme.text,
      mutedText: 'rgba(245,247,251,0.70)',
      accent: theme.accent,
    },
    gradientDefaults: {
      ...vegaPreset.gradientDefaults,
      colors,
    },
    classes: {
      ...vegaPreset.classes,
    },
  }
}

export const STYLE_PRESETS: Record<VisualStyle, StylePreset> = {
  vega: vegaPreset,
  nova: createPreset(
    'nova',
    'Nova',
    ['#7DD3FC', '#2563EB', '#C084FC', '#F0ABFC', '#111827', '#38BDF8'],
    {
      background: '#080b14',
      canvasSurface: '#070a12',
      panel: '#101523',
      text: '#f8fbff',
      border: 'rgba(255,255,255,0.12)',
      accent: '#7dd3fc',
    }
  ),
  luma: createPreset(
    'luma',
    'Luma',
    ['#FDE68A', '#FB7185', '#FDBA74', '#F9A8D4', '#FEF3C7', '#A7F3D0'],
    {
      background: '#14100a',
      canvasSurface: '#0f0c08',
      panel: '#1d1710',
      text: '#fff9ed',
      border: 'rgba(255,249,237,0.14)',
      accent: '#fde68a',
    }
  ),
  rhea: createPreset(
    'rhea',
    'Rhea',
    ['#34D399', '#0F766E', '#99F6E4', '#86EFAC', '#164E63', '#E0F2FE'],
    {
      background: '#07110f',
      canvasSurface: '#06100e',
      panel: '#0d1a18',
      text: '#effffb',
      border: 'rgba(239,255,251,0.12)',
      accent: '#34d399',
    }
  ),
  mira: createPreset(
    'mira',
    'Mira',
    ['#F43F5E', '#BE123C', '#F97316', '#FACC15', '#7F1D1D', '#FED7AA'],
    {
      background: '#12090b',
      canvasSurface: '#0e0708',
      panel: '#1c1012',
      text: '#fff5f6',
      border: 'rgba(255,245,246,0.12)',
      accent: '#fb7185',
    }
  ),
  maia: createPreset(
    'maia',
    'Maia',
    ['#A78BFA', '#4C1D95', '#22D3EE', '#DDD6FE', '#312E81', '#F0FDFA'],
    {
      background: '#0b0815',
      canvasSurface: '#090711',
      panel: '#151020',
      text: '#faf7ff',
      border: 'rgba(250,247,255,0.12)',
      accent: '#a78bfa',
    }
  ),
  lyra: createPreset(
    'lyra',
    'Lyra',
    ['#60A5FA', '#1D4ED8', '#F472B6', '#818CF8', '#172554', '#BAE6FD'],
    {
      background: '#070c17',
      canvasSurface: '#060a12',
      panel: '#0f1624',
      text: '#f3f8ff',
      border: 'rgba(243,248,255,0.12)',
      accent: '#60a5fa',
    }
  ),
  sera: createPreset(
    'sera',
    'Sera',
    ['#F9A8D4', '#E879F9', '#C4B5FD', '#FDE68A', '#831843', '#FAE8FF'],
    {
      background: '#130913',
      canvasSurface: '#0f070f',
      panel: '#1e1020',
      text: '#fff4ff',
      border: 'rgba(255,244,255,0.13)',
      accent: '#f9a8d4',
    }
  ),
}

export const DEFAULT_STYLE_PRESET = STYLE_PRESETS.vega
