# 그라디언트 서비스 개선 계획

이 문서는 그라디언트 생성 서비스의 제품 개선 방향과 현재 A/B 테스트에 반영된 항목을 기록한다.

## 제품 방향

이 서비스는 복잡한 그래픽 편집기보다 좋은 그라디언트를 빠르게 찾는 생성 도구에 가깝게 개선한다. 캔버스가 경험의 중심에 있어야 하며, 컨트롤은 사용자가 결과를 빠르게 탐색하고, 마음에 드는 요소를 잠그고, 저장하고, 내보내는 흐름을 돕는 역할이어야 한다.

## 개선 방향

1. 결과 중심 프리셋

   `Sharp Bezier`, `Gravity`, `Warp`처럼 제작 파라미터 중심의 이름만 노출하기보다 결과의 느낌과 용도를 기준으로 선택지를 제공한다. 예시는 `Soft Glow`, `Poster Grain`, `Chrome Blur`, `Aurora`, `Product Backdrop`, `Editorial Mesh` 같은 방향이다.

2. Generate와 잠금 흐름

   `Generate`를 핵심 동작으로 둔다. 색상, 포인트 위치, 워프, 노이즈를 새로 조합하되 사용자가 마음에 든 색상이나 이후 특정 포인트/설정은 잠글 수 있어야 한다. 반복 생성 중에도 좋은 요소를 보존하는 것이 목적이다.

3. 팔레트 도구 강화

   기본 팔레트는 단순하게 유지한다. 기본 색상 4개를 항상 보여주고, 필요할 때 최대 2개를 추가하는 구조를 사용한다.

   - 개별 색상 변경
   - 최대 2개 색상 추가
   - 추가 색상만 제거
   - 생성 중 색상 잠금
   - 잠기지 않은 색상만 셔플
   - 이후 유사색/보색 제안 또는 이미지에서 팔레트 추출 검토

4. 라이브러리를 히스토리로 확장

   저장 라이브러리를 단순 저장 목록이 아니라 창작 히스토리로 확장한다.

   - 자동 최근 히스토리
   - 즐겨찾기 또는 별표
   - 삭제와 이름 변경
   - 라이브러리 항목과 현재 캔버스 비교
   - 캔버스 좌측 외곽에 붙어 있는 공간적 연결 유지

5. 내보내기 옵션 확장

   단일 다운로드를 넘어 여러 사용처에 맞는 내보내기를 제공한다.

   - PNG 1x, 2x, 4x
   - CSS snippet
   - Tailwind background snippet
   - 가능한 경우 SVG 또는 data URL fallback
   - Figma에서 쓰기 쉬운 이미지 export

6. 용도별 캔버스 사이즈 프리셋

   사용자가 자주 쓰는 크기를 직접 입력하지 않아도 되도록 목적 기반 프리셋을 제공한다.

   - Web: Hero 16:9 1920 x 1080, Web Card 4:3 1200 x 900, Banner 2:1 1600 x 800
   - Mobile: Phone 9:16 1080 x 1920, Wallpaper 9:19.5 946 x 2048, Tablet 4:3 1536 x 2048
   - Social: Square 1:1 1080 x 1080, Portrait Post 4:5 1080 x 1350, Story/Reel 9:16 1080 x 1920
   - 이후 X header, YouTube thumbnail, desktop wallpaper, custom preset 검토

7. 컨트롤은 더 조용하게 유지

   제품을 대시보드처럼 만들지 않는다. 직접 조작과 점진적 노출을 우선한다.

   - hover 시 포인트 핸들 표시
   - 고급 컨트롤은 compact하게 유지
   - 캔버스를 시각적 중심으로 유지
   - 무거운 패널보다 작은 floating control 사용

8. 공유 가능한 상태 URL

   생성 결과를 공유하고 복원할 수 있도록 그라디언트 상태를 URL에 인코딩한다.

   - 색상
   - 포인트 위치
   - 스타일
   - 워프 형태와 값
   - 노이즈
   - 캔버스 크기

   이후 방향 예시: `/g?colors=...&warp=...&noise=...`

## 현재 A/B 테스트

현재 앱은 query parameter로 브라우저 기반 비교를 지원한다.

- `/?ab=control`: 기존 버전
- `/?ab=lab`: 실험 버전
- `/?ab=c-lab`: UI용 블러/글로우 그라디언트 실험 버전
- `/?ab=compare`: 세 개의 독립 iframe으로 기존안, B Lab, C Lab을 나란히 비교

B Lab에 반영된 항목:

- `Generate`: 잠기지 않은 색상, 포인트, 스타일, 워프, 노이즈를 새로 생성
- `Shuffle`: 잠기지 않은 색상 위치만 섞기
- 팔레트 칩의 색상 잠금 컨트롤
- 포인트, 스타일, 워프, 노이즈 설정 잠금 컨트롤
- 제작 파라미터 중심 이름을 결과 중심 라벨로 표시: `Soft Glow`, `Poster Grain`, `Product Backdrop`, `Chrome Bloom`, `Editorial Mesh`
- 목적 기반 캔버스 사이즈 프리셋: `Web`, `Mobile`, `Social` 그룹 드롭다운과 그룹별 해상도 표시
- 팔레트 구조: 기본 색상 4개와 선택 추가 색상 최대 2개
- export 메뉴: `PNG 1x`, `PNG 2x`, `PNG 4x`, `Copy CSS`, `Copy Tailwind`
- 공유 URL: `state` query parameter로 색상, 포인트 위치, 스타일, 워프, 노이즈, 캔버스 크기를 복원
- 라이브러리 관리: 저장된 dock 항목 즐겨찾기, 이름 변경, 삭제
- 저장 분리: `Generate`는 캔버스만 변경하고, 영구 저장은 저장 아이콘을 눌렀을 때만 실행

C Lab에 반영된 항목:

- C Lab 기본 URL: `/?ab=c-lab`
- C Lab Compare 포함: `/?ab=compare`에서 `A Current`, `B Lab`, `C Lab` 3분할 비교
- 목적: 첨부 레퍼런스처럼 편집 가능한 UI gradient resource 타일 스타일을 검증
- 등록된 레퍼런스 스타일 21종: A 타입 기본 스타일 `Sharp Bézier`, `Soft Mesh`, `Linear Fold`, `Conic Bloom`, `Cellular Glow`와 C Lab 전용 16종
- 첫 번째 Gradient Style 드롭다운에서 21종을 선택하면 색상, 컬러 포인트, 워프 형태, Warp, Spread, Noise가 함께 적용됨
- `Generate`: C Lab에서는 21종 레퍼런스 스타일 중 하나를 통째로 적용
- C Lab 최초 상태: 640 x 640, cyan/magenta/dark 기반 `Cyan Ribbon` 프리셋으로 시작
- 렌더링 계약: 21종 스타일은 배경 이미지나 별도 픽셀 레이어가 아니라 공통 그라디언트 렌더러의 weight field로 생성되어야 하며, 컬러 포인트 핸들이 실제 색 덩어리와 밴드의 기준점이 되어야 함
- `Vignette`: `Grain` 다음 외곽 컨트롤에서 코너/외곽 어두움 강도를 별도로 조절
- A 타입 기본 스타일: `Sharp Bézier`, `Soft Mesh`, `Linear Fold`, `Conic Bloom`, `Cellular Glow`는 Coolors popular gradient 페이지에서 확인한 상위 팔레트 색상으로 구성한다.
- 구조적 형태: `Sparkle Field`, `Hex Glow`, `Star Burst`는 sparkle ray, hex field, star burst weight field를 사용해 일반 blob보다 뚜렷한 형태감을 만든다.
- Fluid 형태: `Fluid Veil`은 포인트 기반 flow/ribbon weight field와 `Drift` warp를 사용해 정적인 blob보다 흐르는 액체감을 만든다.

## 다음 실험 후보

1. 라이브러리 항목과 현재 캔버스 비교 UI 추가
2. 자동 생성 히스토리를 다시 도입할 경우 저장 라이브러리와 완전히 분리된 session-only UI로 제공
3. 유사색/보색 제안 또는 이미지에서 팔레트 추출 검토
4. Figma 사용을 위한 export preset 추가

## 추가 실험 후보: 캔버스와 렌더링 확장

1. 캔버스 외관 모서리 조절

   캔버스 자체의 corner radius를 직접 조절한다. 우하단 사이즈 조절 핸들을 확장해 가운데 영역은 현재처럼 캔버스 width/height를 조절하고, 핸들의 좌측 또는 우측 끝 영역은 radius 조절 모드로 전환한다.

   - 핸들 가운데 hover: 현재와 같은 resize cursor와 resize 동작 유지
   - 핸들 우측 끝 hover: radius 조절 cursor로 전환, 클릭 후 상하 드래그로 radius 증감
   - 핸들 좌측 끝 hover: radius 조절 cursor로 전환, 클릭 후 좌우 드래그로 radius 증감
   - radius 조절 중에는 캔버스 외곽의 다른 컨트롤 opacity를 낮추거나 숨겨서 조작 대상이 명확하게 보이도록 처리
   - radius 값은 공유 URL, 저장 라이브러리, export 결과에 포함하는 방향 검토

2. 그라디언트 형태 다양화

   현재의 soft blob/field 중심 표현에 더해 UI asset으로 쓰기 좋은 구조적 모양을 추가한다.

   - Sparkle 또는 glint highlight
   - Hexagon 기반 glow field
   - Star 또는 burst 형태
   - diagonal ribbon, orbit, dome 같은 기존 C Lab 표현과 함께 style preset으로 노출

3. 마스크 기반 특수 효과

   그라디언트 위에 별도 마스크 레이어를 추가해 결과를 더 강하게 변형한다. 마스크는 색상 자체보다 알파, 밝기, blur, vignette, pattern을 제어하는 보조 레이어로 다룬다.

   - C Lab 1차 보정: `Mask` 외곽 컨트롤로 `Mask Off`, `Ribbed Glass`, `Pebble Glass`, `Ripple Glass`를 선택
   - ribbed glass mask: 세로 ribbed 패턴이 캔버스 전체를 덮고 아래 그라디언트를 좌우로 굴절
   - pebble glass mask: 불규칙한 셀 패턴이 아래 그라디언트를 국소적으로 왜곡
   - ripple glass mask: 물결형 유리 표면처럼 샘플 좌표와 하이라이트를 함께 변형
   - shape mask는 canvas alpha를 자르기보다 전체 화면 lens layer로 우선 구현
   - PNG export에는 렌더러 결과를 반영하고, CSS/Tailwind fallback은 현재 gradient background 중심으로 유지

4. 부드러움과 단계감 조절

   같은 그라디언트라도 아주 부드러운 blur field와 계단식 posterized field 사이를 조절할 수 있게 한다.

   - Smooth: 색 전환을 더 부드럽게 보간
   - Steps: 각 컬러 포인트의 gradient band가 단계적으로 보이는 quantize 표현
   - Blend: 필요 시 smooth와 stepped 결과 사이를 별도 강도로 조절
   - C Lab 구현: `Steps` 외곽 슬라이더를 0..10 정수 단계 수로 사용
   - `0`은 smooth 원본, `10`은 각 gradient influence를 10개 discrete band로 quantize
   - 단계 수 값은 snapshot, 공유 URL, PNG export, C Lab generate preset 경로에 포함

5. Fluid gradient 계열

   정적인 field를 넘어 흐르는 액체감의 gradient preset을 추가한다. 초기 구현은 실제 시뮬레이션보다 포인트 기반 flow field와 ribbon distortion으로 시작하고, 필요할 때 canvas animation 또는 export 가능한 frame/snapshot 전략을 검토한다.

   - C Lab 1차 구현: `Fluid Veil` 프리셋을 추가하고 flow/ribbon weight field로 렌더
   - 현재 범위: 정적 canvas snapshot 중심, 기존 `Flow`, `Spread`, `Mask`, `Steps` 컨트롤 재사용
   - 이후 후보: animation preview, frame export, fluid preset 추가 확장
