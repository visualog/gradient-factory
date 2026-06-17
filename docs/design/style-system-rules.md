# Photogradient Style System Rules

이 문서는 UI, 레이아웃, 스타일 프리셋 작업 전에 확인한다. 목적은 shadcn/ui의 기본 컴포넌트 품질을 유지하면서 Photogradient에 맞는 유연한 시각 시스템을 만드는 것이다.

## Core Model

- shadcn/ui는 기본 컴포넌트 레이어로 사용한다.
- shadcn/ui의 기본 SaaS 밀도와 외형을 그대로 노출하지 않는다.
- 앱 전용 wrapper를 우선 만든다. 예: `GradientSlider`, `ControlPanel`, `PresetSelect`.
- `Vega`, `Nova`, `Luma`, `Rhea`, `Mira`, `Maia`, `Lyra`, `Sera`는 Bklit UI 스타일이 아니라 Photogradient visual style preset이다.
- 기존 preset, style, component는 사용자 승인 없이 의미나 기본 동작을 바꾸지 않는다.
- 새 패키지 설치, shadcn init, registry add는 예상 변경 파일과 명령을 보고한 뒤 사용자 승인 후 진행한다.

## Grid Rhythm

- 수평 리듬은 grid 기반으로 구성한다.
- `fixed`/`absolute` 배치를 기본 레이아웃 수단으로 쓰지 않는다. 오버레이, modal, floating dock처럼 필요한 경우에만 사용한다.
- 주요 화면은 named grid area 또는 명시적 grid track으로 구성한다.
- 컨트롤 패널, 캔버스, 프리셋 dock은 임의 위치가 아니라 grid 영역 위에 배치한다.
- 프리셋별로 column width, gap, density는 달라질 수 있지만 grid 기준은 유지한다.

## Vertical Rhythm

- 수직 리듬은 baseline grid, spacing scale, section rhythm으로 관리한다.
- 기본 단위는 4px이다.
- 텍스트 line-height는 4px grid에 맞춘다.
- 권장 baseline:
  - label: `12px / 16px`
  - body/control text: `14px / 20px`
  - compact heading: `18px / 24px`
- 권장 spacing:
  - label to control: `8px`
  - control row gap: `12px`
  - section padding Y: `16px`
  - section gap: `24px`
  - large canvas/dock gap: `24px` or `32px`
- 프리셋 density는 compact, balanced, spacious 중 하나로 정의한다.

## Preset Contract

스타일 프리셋은 색상만 바꾸지 않는다. 최소한 아래 범위를 함께 정의한다.

```ts
type VisualStyle =
  | "vega"
  | "nova"
  | "luma"
  | "rhea"
  | "mira"
  | "maia"
  | "lyra"
  | "sera"

type StylePreset = {
  id: VisualStyle
  name: string
  tokens: {
    background: string
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
    density: "compact" | "balanced" | "spacious"
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
    style: "Sharp Bézier" | "Soft Mesh" | "Linear Fold" | "Conic Bloom" | "Cellular Glow"
    warpShape: "Gravity" | "Wave" | "Radial" | "Spiral" | "Pinch" | "Ripple" | "Drift"
  }
}
```

## Preset Intent

- `Vega`: high contrast, crisp controls, strong edge, dark panel.
- `Nova`: bright neon, experimental, saturated, energetic.
- `Luma`: soft, bright, low contrast, gentle mesh.
- `Rhea`: editorial, muted, calm, restrained.
- `Mira`: glass, blur, translucent surfaces.
- `Maia`: warm, organic, rounded, soft mesh.
- `Lyra`: cool, precise, technical, structured.
- `Sera`: minimal, quiet, low noise, reduced UI.

## Implementation Rules

- First convert layout to grid before adding broad preset variation.
- Put preset data in `src/lib/style-presets.ts` or an equivalent dedicated module.
- Keep shadcn generated components under `src/components/ui/`.
- Keep app-specific components outside `src/components/ui/`.
- Prefer CSS variables or preset-derived class maps over scattered hardcoded colors.
- Every UI task must preserve readable text, stable control dimensions, and responsive layout.
- After a UI change, run available validation and update `docs/state.md` and `docs/task-board.md`.
