# K 문화 그라디언트 생성 편집 리서치

작성일: 2026-06-24

## 목적

Photogradient C Lab을 K 문화와 어울리는 그라디언트 생성 편집 도구로 확장하기 위해, 그라디언트 종류와 생성 방식, 한국적 색채/형태 단서, 현재 앱에 반영할 기능 방향을 정리한다.

## 핵심 결론

K 문화형 그라디언트는 단순히 빨강, 파랑, 노랑을 섞는 방식보다 "역할이 있는 색상", "중심과 방향", "절제와 고채도의 대비", "전통 소재감과 K-pop식 광원"을 함께 제어해야 한다.

현재 C Lab은 point-driven weight field, 구조적 스타일, glass mask, steps, vignette를 이미 갖추고 있으므로 새 렌더러를 만들기보다 문화형 preset seed와 generation hint를 추가하는 방향이 맞다.

## 수집 출처 요약

| 출처 | 확인한 내용 | 제품 해석 |
|---|---|---|
| MDN CSS Gradients | CSS 기본 그라디언트는 linear, radial, conic, repeating 계열이며 color stop, hard line, band, stacking, blending으로 효과를 만든다. | UI에는 기본 타입보다 결과 중심 이름을 노출하되, 내부 생성 모델은 방향, 중심, stop, band, layer로 관리한다. |
| W3C CSS Color 4 | 색 보간은 color space에 따라 결과가 달라지고, perceptual spacing에는 Oklab 계열이 적합하다고 설명한다. | K 팔레트는 sRGB 단순 평균보다 Oklab 또는 OKLCH 보간 옵션을 검토한다. 특히 빨강-파랑, 청록-노랑 전환의 탁함을 줄인다. |
| Obangsaek | 오방색은 청, 적, 황, 백, 흑의 다섯 색과 방향/원소 의미를 연결한다. | 5색을 모두 같은 비율로 쓰기보다 중심색, 방향색, 여백색, grounding color 역할로 나눈다. |
| Taegeukgi/Taegeuk | 흰 배경, 적/청의 균형, 검은 괘는 조화와 움직임의 상징으로 읽힌다. | conic, swirl, dual core, red-blue polarity preset의 근거가 된다. |
| Dancheong | 단청은 청록/적/황/백/흑 기반의 장식 색채와 기하 패턴, 보호/상징 기능을 가진다. | saturated band, stepped gradient, ribbed/glass strip, edge ornament 계열에 적합하다. |
| Hanbok | 한복은 흰색 선호, 실크/모시 같은 소재감, 연한 색과 신분/행사별 색 대비가 중요하다. | Soft Mesh, silk haze, low-noise pastel, 넓은 여백형 preset에 적합하다. |
| Korean Wave/K-pop | 한류와 K-pop은 글로벌 플랫폼, 팬덤, 고도로 양식화된 시각 연출과 결합해 확산됐다. | 전통 팔레트만으로 고정하지 말고 neon, stage light, glossy pop 계열을 함께 둔다. |

## 그라디언트 종류 분류

### 1. 기본 기하 타입

- Linear: 방향성이 강하다. 배너, 카드, editorial backdrop에 적합하다.
- Radial: 중심 광원과 halo를 만든다. spotlight, glow, product backdrop에 적합하다.
- Conic: 중심을 기준으로 회전한다. Taegeuk, orbit, wheel, bloom에 적합하다.
- Repeating: 반복 band와 장식 패턴을 만든다. Dancheong stripe, ribbed texture, stage scanline에 적합하다.

### 2. 편집 도구형 타입

- Mesh/Point field: 여러 컬러 포인트의 influence를 합성한다. 현재 C Lab 핵심 계약이다.
- Ribbon/Fold: 선형 흐름과 곡선 띠를 만든다. 한강 야경, K-pop light trail, 비단 흐름에 적합하다.
- Bloom/Orbit: 중심 또는 링 주변 광량을 키운다. taegeuk pulse, idol stage, neon badge에 적합하다.
- Structural: sparkle, hex, star, cellular처럼 형태가 보이는 gradient다. 현재 Sparkle Field, Hex Glow, Star Burst가 여기에 있다.
- Mask/Glass: 아래 gradient 샘플 좌표와 highlight를 왜곡한다. 현재 Ribbed/Pebble/Ripple Glass가 여기에 있다.
- Stepped/Posterized: influence를 양자화해 band를 만든다. 단청, 포스터, 게임 UI asset에 적합하다.
- Grain/Vignette: 질감과 외곽 어두움을 더한다. 필름, 밤, 유리, stage shot에 적합하다.

## K 문화 시각 단서

### 오방색

제품에서는 오방색을 고정 5색 팔레트가 아니라 색상 역할 체계로 쓰는 편이 좋다.

- 청: 생장, 동쪽, 하늘/물의 확장감. cyan, blue-green, deep blue 변형으로 사용.
- 적: 에너지, 남쪽, 공연/축제감. crimson, rose, hot pink, vermilion 변형으로 사용.
- 황: 중심, 토양, 금빛. cream, amber, muted gold, chartreuse 변형으로 사용.
- 백: 여백, 순도, 빛. pure white보다 warm white, silk white, mist로 사용.
- 흑: 깊이, 북쪽, 구조. pure black보다 ink, navy black, charcoal로 사용.

추천 규칙:

- 5색을 모두 같은 채도로 쓰지 않는다.
- 황/백은 중심 또는 highlight로 두고, 흑은 vignette나 edge grounding에 둔다.
- 청/적은 균형 또는 대립 축으로 두면 Taegeuk 감각과 연결된다.

### 태극

태극은 red-blue 양극성, 원형 중심, 회전 흐름이 핵심이다.

- Conic Bloom, Rose Orbit, Blue Core를 문화형 변형하기 좋다.
- point positions는 좌상/우하 대립보다 S-curve 또는 dual-core로 배치한다.
- 너무 국기처럼 보이는 직접 재현보다 색의 균형과 회전감을 차용한다.

### 단청

단청은 밝고 선명한 색, 검은 윤곽, 반복 기하, 장식적 band가 강하다.

- Steps 6..10, Ribbed Glass, Glass Strips 계열과 잘 맞는다.
- red/cyan/yellow/green/black 조합은 고채도지만 black edge와 cream highlight로 정리한다.
- star, lotus, cloud, gate, beam 같은 structure hint를 추가하면 K 문화성이 강해진다.

### 한복과 백의 감각

한복 쪽은 고채도보다 여백, 실크, 반투명 레이어, 부드러운 색 전환이 중요하다.

- Soft Mesh, Fluid Veil, low noise, low steps가 적합하다.
- pale pink, jade, celadon, butter yellow, silk white, ink navy를 중심으로 둔다.
- grain은 낮게, vignette는 약하게, spread는 넓게 둔다.

### 현대 K-pop/Hallyu

K-pop식 결과는 전통색보다 광원과 표면이 더 중요하다.

- neon magenta, electric blue, lime, chrome white를 stage light처럼 쓴다.
- Sparkle Field, Star Burst, Conic Bloom, Ripple Glass와 잘 맞는다.
- "전통 30, pop 70" 같은 blend control이 있으면 사용자가 K 문화와 현대감을 조절할 수 있다.

## 현재 앱과의 차이

이미 있는 기반:

- 21종 UI gradient style preset
- point-driven common renderer 계약
- Sparkle Field, Hex Glow, Star Burst, Fluid Veil
- Ribbed/Pebble/Ripple Glass mask
- Steps 0..10 influence quantize
- Vignette, Grain, Flow, Spread
- share/export/snapshot 경로

부족한 부분:

- 문화형 preset family가 없다.
- 색상 역할 정보가 없다. 색 배열은 있지만 중심색, 여백색, grounding color가 구분되지 않는다.
- 생성 버튼이 문화적 의도, 소재감, 시대감을 선택하지 못한다.
- OKLab/OKLCH 계열 보간 검토가 아직 제품 문서에 없다.
- 단청형 band, 태극형 dual swirl, 한복형 silk mesh가 독립 seed로 정의되어 있지 않다.

## 기능 개선 제안

### 1. K Culture preset family 추가

`cultureFamily`를 style과 별도로 둔다.

- Obang Balance: 오방색 역할 기반, 중심 황/백, 외곽 흑, 청/적 균형.
- Taegeuk Pulse: red-blue dual core, conic/orbit motion, white highlight.
- Dancheong Neon: 단청 색 대비와 K-pop neon을 결합한 stepped band.
- Hanbok Silk: pastel, silk white, low noise, 넓은 soft mesh.
- Seoul Night: ink navy, cyan, magenta, amber, glass/ripple.
- Idol Stage: high chroma, spotlight radial, sparkle/star burst.
- Celadon Moon: 청자 jade, moon white, ink, 낮은 saturation의 luxury asset.

### 2. 생성 파라미터를 문화형으로 묶기

사용자에게는 다음 네 가지 축만 노출한다.

- Culture: Obang, Taegeuk, Dancheong, Hanbok, Seoul Night, Idol Stage
- Mood: Calm, Festival, Dream, Stage, Editorial
- Tradition/Pop: 0..100
- Texture: Silk, Glass, Grain, Band

내부에서는 다음 값을 함께 생성한다.

- colors, pointPositions, style, warpShape, warp, spread, noise, vignette, mask, steps
- colorRoles: center, polarityA, polarityB, highlight, ground, accent
- interpolationHint: srgb, oklab, oklch-shorter-hue

### 3. OKLab/OKLCH 보간 검토

렌더러가 현재 RGB 기반으로 색을 섞는다면 다음 실험을 둔다.

- 기본: 기존 RGB 유지
- Smooth: Oklab weighted mix
- Vivid: OKLCH hue-aware mix 후 gamut clamp
- Export: PNG는 내부 renderer 결과 유지, CSS snippet은 가능하면 `in oklab` syntax 제공하고 fallback을 같이 생성

### 4. 문화형 프리셋 초안

| Label | Family | Colors | Style | Mask | Steps | Texture |
|---|---|---|---|---|---|---|
| Obang Glow | Obang Balance | ink, blue-green, vermilion, warm white, gold | Conic Bloom | None | 2 | soft balance |
| Taegeuk Pulse | Taegeuk Pulse | white, taegeuk red, taegeuk blue, ink | Rose Orbit | RippleGlass | 0 | dual swirl |
| Dancheong Band | Dancheong Neon | dancheong green, red, yellow, blue, ink | Linear Fold | RibbedGlass | 8 | stepped ornament |
| Hanbok Silk | Hanbok Silk | silk white, pale pink, jade, celadon, ink navy | Soft Mesh | None | 0 | wide blur |
| Seoul Prism | Seoul Night | ink navy, cyan, magenta, amber, chrome white | Cyan Ribbon | RippleGlass | 0 | neon glass |
| Idol Halo | Idol Stage | black, hot pink, electric blue, lime, white | Star Burst | PebbleGlass | 4 | spotlight sparkle |
| Celadon Moon | Celadon Moon | celadon, jade gray, moon white, deep teal, soft gold | Fluid Veil | None | 0 | ceramic haze |

## 우선순위

1. `docs/gradient-service-improvement-plan.md` 다음 후보에 K Culture preset family를 연결한다.
2. `UI_GRADIENT_PRESETS`와 별도 데이터로 `K_CULTURE_GRADIENT_PRESETS`를 추가한다.
3. C Lab Generate가 일반 UI preset과 K Culture preset을 선택적으로 섞도록 seed pool을 분리한다.
4. color role과 `Tradition/Pop` 가중치를 도입해 같은 family 안에서도 전통형/현대형을 생성한다.
5. OKLab mix 실험은 렌더러 변경 범위가 커질 수 있으므로 별도 A/B flag로 검증한다.

## 참고 링크

- MDN, Using CSS gradients: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Images/Using_gradients
- W3C, CSS Color Module Level 4: https://www.w3.org/TR/css-color-4/
- Obangsaek: https://en.wikipedia.org/wiki/Obangsaek
- Taegeukgi: https://en.wikipedia.org/wiki/Flag_of_South_Korea
- Taegeuk: https://en.wikipedia.org/wiki/Taegeuk
- Dancheong: https://en.wikipedia.org/wiki/Dancheong
- Hanbok: https://en.wikipedia.org/wiki/Hanbok
- Korean Wave: https://en.wikipedia.org/wiki/Korean_Wave
