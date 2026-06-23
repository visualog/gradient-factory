# Task Board

| Task ID | 상태 | 태스크 | 완료 조건 |
|---|---|---|---|
| T001 | 완료 | AgentOS 운영 파일 비파괴 병합 | `AGENTS.md`와 `docs/` 운영 문서가 `photogradient/` 루트에 추가됨 |
| T002 | 완료 | 사이드 컨트롤바 다크 톤 정리 | 컨트롤바가 앱 다크 배경과 일관되고 `npm run build`가 통과함 |
| T003 | 완료 | 디자인 운영 규칙 고정 | shadcn/ui, visual preset, grid rhythm, vertical rhythm 규칙이 AgentOS 문서에 연결됨 |
| T004 | 완료 | grid 기반 layout 및 style preset 1차 구현 | `src/app/page.tsx`가 grid layout으로 전환되고 `src/lib/style-presets.ts`에 visual preset 기반이 추가됨 |
| T005 | 완료 | shadcn/ui wrapper 도입 | `src/components/ui/` 기본 컴포넌트가 추가되고 화면 컨트롤에 적용되며 `npm run build`가 통과함 |
| T006 | 완료 | shadcn/Radix dev cache 오류 복구 | stale `.next`를 비파괴 이동 후 새 cache로 dev server가 `/` 200 응답함 |
| T007 | 완료 | 사이드바 footer 라인 컬러 통일 | footer 버튼 구분선이 panel divider와 같은 `--pg-border` token을 사용함 |
| T008 | 완료 | dev/build `.next` 충돌 화면 깨짐 복구 | dev server 재시작 후 CSS 200 및 스크린샷 정상 렌더가 확인됨 |
| T009 | 완료 | Gradient/Warp Shape 옵션 확장 | Gradient 5종, Warp Shape 7종이 UI와 렌더러에 연결되고 `tsc --noEmit`이 통과함 |
| T010 | 완료 | 드롭다운 UX 안정화 | chevron affordance, Portal-safe background fallback, capped option list가 적용되고 `npm run build`가 통과함 |
| T011 | 완료 | 캔버스 컬러 포인트 핸들 | hover 시 포인트 핸들이 표시되고 드래그로 위치를 바꾸며 `npm run build`가 통과함 |
| T012 | 완료 | 컬러 레이어 순서 드래그 변경 | Colors 리스트에서 드래그 핸들로 순서를 바꾸고 point position도 함께 이동함 |
| T013 | 완료 | GitHub 초기 푸시 | `photogradient/` 저장소가 `visualog/gradient-factory` `main`에 푸시됨 |
| T014 | 대기 | reorder/point handle UX polish | drop indicator, active handle state, drag performance polish가 검증됨 |
| T015 | 완료 | Photogradient Ultra Lite 운영 구조 정리 | `AGENTS.md`가 실제 루트, 간소화 문서 구조, 잔여 빌드 파일 제외 기준, 문서 갱신 타이밍을 명시함 |
| T016 | 완료 | 캔버스 외곽 경로 기반 컨트롤 배치 | Gradient/Warp Shape/Warp/Warp Size/Noise가 하나의 시퀀스로 상단, 코너 아크, 우측 edge를 따라 계산 배치됨 |
| T017 | 완료 | 우상단 라운드 경로 컨트롤 보정 | `Warp Size`는 코너를 완만히 타고 `Noise`는 오른쪽 세로 레일로 내려가며 `tsc --noEmit`이 통과함 |
| T018 | 완료 | Lite 파일 예산 준수 리팩터링 | `page.tsx`와 분리된 작업 파일들이 모두 250줄 이하이며 `tsc --noEmit`이 통과함 |
| T019 | 완료 | 크기별 외곽 컨트롤 흐름 검증 | 브라우저에서 900px/640px 캔버스 크기별 컨트롤 배치를 확인하고 `Noise` 세로 레일 점프를 완충함 |
| T020 | 완료 | 코너 곡선형 외곽 컨트롤 적용 | `Warp Size`가 좁은 캔버스에서 우상단 라운드 경로를 따라 흐르는 SVG path 컨트롤로 렌더됨 |
| T021 | 완료 | 우하단 사이즈 조절 핸들 표시 복구 | 사이즈 핸들이 기본 상태에서도 은은하게 보이며 `tsc --noEmit`과 서버 200 검증이 통과함 |
| T022 | 완료 | 우하단 사이즈 조절 핸들 상시 표시 강화 | 핸들이 `z-50`, `opacity-100`, `text-white/90`로 렌더되어 외곽 컨트롤 위에 항상 표시됨 |
| T023 | 완료 | 코너 반응형 외곽 path 컨트롤 보정 | `Warp Size`가 코너를 피하지 않고 실제 perimeter 구간을 따라 직선-arc-우측 edge path로 휘어 렌더됨 |
| T024 | 완료 | 우하단 코너 사이즈 핸들 바 시인성 강화 | 어두운 받침 stroke와 밝은 foreground stroke가 함께 렌더되어 그라디언트 위에서도 핸들 바가 보임 |
| T025 | 완료 | 사이즈 조절 표시와 입력 반영 보정 | 우하단 핸들에 별도 그립 바가 보이고 W/H 입력이 draft/commit 방식으로 안정적으로 캔버스 preview에 반영됨 |
| T026 | 완료 | Warp Size 코너 슬라이더 기존 형태 유지 | 코너 반응은 유지하면서 36px 알약 표면, 6px 트랙, 고정 라벨, 14px thumb로 기존 슬라이더 형태를 맞춤 |
| T027 | 완료 | 코너 슬라이더 gap 겹침 보정 | SVG round cap이 gap 밖으로 튀어나오던 표면 path를 18px 안쪽으로 보정해 `Warp Size`와 `Noise` 사이 8px gap을 복구함 |
| T028 | 완료 | Noise 슬라이더 path 적용 | `Noise`도 perimeter path 슬라이더로 렌더되어 36px 알약 표면, 6px 트랙, 90도 라벨 회전이 적용됨 |
| T029 | 완료 | 외곽 path 슬라이더 공통화 | `Warp Size`와 `Noise`가 같은 path slider 계산을 사용하고 progress가 dash가 아닌 실제 path 조각으로 렌더됨 |
| T030 | 완료 | Noise 코너 라벨 path 보정 | `Noise` 라벨이 코너 곡선 구간에서는 SVG `textPath`를 따라 렌더되고 직선 구간에서는 기존 라벨 정렬을 유지함 |
| T031 | 완료 | Noise 우측 라벨 위치 보정 | `Noise`가 우측 세로 레일로 내려왔을 때 라벨 기준점이 상단 cap에 붙지 않도록 8px 아래로 보정됨 |
| T032 | 완료 | Noise 우측 라벨 축 보정 | 우측 세로 레일의 `Noise` 라벨이 36px SVG 폭 안쪽 중심축에 들어오도록 x 기준점이 보정됨 |
| T033 | 완료 | Noise 라벨 baseline 및 progress cap 보정 | 우측 세로 라벨에 baseline 중앙 정렬이 적용되고 path slider progress 시작점이 둥근 cap으로 렌더됨 |
| T034 | 완료 | Path 슬라이더 컨테이너 radius 통일 | `Warp Size`와 `Noise` 표면 컨테이너가 완전 알약 cap 대신 12px radius filled path로 렌더됨 |
| T035 | 완료 | Path 슬라이더 컨테이너 arc radius 보정 | 표면 컨테이너 코너가 `Q` 근사 대신 실제 `A 12 12` arc로 렌더되어 CSS radius와 더 맞게 보정됨 |
| T036 | 완료 | Path 슬라이더 코너 gap 고정 | 표면 edge가 샘플 직선이 아닌 실제 offset arc를 따라 캔버스 코너와의 간격을 일정하게 유지함 |
| T037 | 완료 | 캔버스 resize 중 previewWidth 동기화 | width/height 변경 직후 실제 frame 폭을 layout 단계에서 동기화해 외곽 컨트롤의 한 박자 지연을 줄임 |
| T038 | 완료 | 캔버스 좌하단 컬러 칩 표시 | 캔버스 좌측 하단 외곽에 컬러값 텍스트 없이 현재 팔레트 칩만 표시됨 |
| T039 | 완료 | 캔버스 컬러 칩 바 컨테이너 적용 | 컬러 칩이 드롭다운/슬라이더와 같은 바 형태 컨테이너 안에 텍스트 없이 배치됨 |
| T040 | 완료 | 캔버스 하단 우측 사이즈 입력 바 적용 | 캔버스 하단 우측 외곽에 W/H 입력이 바 형태 컨테이너로 배치되고 기존 사이즈 입력 로직을 공유함 |
| T041 | 완료 | 캔버스 하단 중앙 저장/다운로드 버튼 적용 | 캔버스 하단 중앙 외곽에 기존 저장/다운로드 동작을 공유하는 아이콘 버튼 바가 배치됨 |
| T042 | 완료 | 사이드바 화면 제거 | 화면 레이아웃에서 사이드바 렌더를 제거하고 캔버스 하단 액션/사이즈 입력은 유지됨 |
| T043 | 완료 | 우하단 내부 resize 그립 제거 | 우하단 사이즈 조절 버튼에서 내부 보조 그립을 제거하고 외곽 코너 핸들만 유지함 |
| T044 | 완료 | 우하단 resize 핸들 길이 축소 | 클릭 영역은 유지하고 보이는 외곽 SVG 핸들 스케일을 줄임 |
| T045 | 완료 | 우하단 resize 핸들 코너 정렬 보정 | 축소된 resize 핸들의 button height와 시각 inset을 offset 계산에 반영해 캔버스 코너 gap을 맞춤 |
| T046 | 완료 | 우하단 resize 핸들 배경 원 제거 | 코너 핸들 뒤의 원형 배경 span을 제거하고 SVG 핸들만 남김 |
| T047 | 완료 | 하단 외곽 컨트롤 순서 정렬 | 컬러칩, 사이즈 입력, 저장/다운로드 버튼을 하나의 하단 row에서 좌측부터 순서대로 배치함 |
| T048 | 완료 | 하단 사이즈 입력 숫자 여백 보정 | W/H 입력 폭과 오른쪽 padding을 늘려 숫자와 native number 버튼 사이 여백을 확보함 |
| T049 | 완료 | 하단 사이즈 입력 spinner 간격 재보정 | W/H 입력을 80px 폭과 왼쪽 정렬로 바꿔 숫자와 native spinner 사이 간격을 확보함 |
| T050 | 완료 | 하단 사이즈 입력 정렬형 stepper 적용 | native number spinner를 숨기고 오른쪽 고정 custom stepper로 숫자와 버튼 정렬을 안정화함 |
| T051 | 완료 | 그라디언트 서비스 개선 계획 문서화 | `docs/gradient-service-improvement-plan.md`에 8가지 개선 방향과 현재 A/B Lab 구현 상태를 저장함 |
| T052 | 완료 | 제품 방향 히스토리 운영 규칙 추가 | 제품 방향, 개선 제안, A/B 실험 가설, 비교 결과를 `docs/`와 state/task-board에 기록하도록 `AGENTS.md`에 명시함 |
| T053 | 완료 | 운영/제품 방향 문서 한글 작성 규칙 추가 | `docs/gradient-service-improvement-plan.md`를 한글로 전환하고 운영 문서는 기본 한글로 작성하도록 `AGENTS.md`에 명시함 |
| T054 | 완료 | B Lab 공유와 export 확장 | 공유 URL 상태 복원, PNG 1x/2x/4x, CSS snippet, Tailwind snippet export를 추가함 |
| T055 | 완료 | B Lab 설정 잠금과 결과 중심 라벨 추가 | 포인트/스타일/워프/노이즈 잠금과 결과 중심 스타일/워프 라벨을 추가하고 관련 컴포넌트를 300줄 이하로 분리함 |
| T056 | 완료 | B Lab 생성 히스토리 자동 기록 | Generate 실행 결과를 좌측 library dock에 history 항목으로 자동 저장하도록 연결함 |
| T057 | 완료 | 라이브러리 항목 관리 액션 추가 | dock 항목에 즐겨찾기, 이름 변경, 삭제 액션을 추가하고 API 저장 모델을 선택 필드로 확장함 |
| T058 | 완료 | B Lab 화면 깨짐 복구와 툴바 겹침 보정 | dev 서버 재시작으로 asset 404 상태를 복구하고 실험 툴바를 compact 한 줄 배치로 조정함 |
| T059 | 완료 | 캔버스 최소 크기 640 x 640 적용 | `CANVAS_MIN_HEIGHT`를 640으로 올려 입력, resize, snapshot 복원 최소 높이를 정사각 기준으로 맞춤 |
| T060 | 완료 | Generate 저장 부작용 제거 | Generate 자동 history 저장 경로를 끊고 다운로드도 저장 없이 현재 캔버스만 내려받도록 수정함 |
| T061 | 완료 | 사이즈 프리셋 용도와 비율 구체화 | Square 1:1, Story 9:16, Post 4:5, Wide 16:9로 라벨과 실제 크기를 export 기준에 맞춤 |
| T062 | 완료 | 사이즈 프리셋을 플랫폼 그룹 드롭다운으로 변경 | Web, Mobile, Social optgroup 아래에 용도와 해상도를 함께 표시하도록 상단 툴바를 정리함 |
| T063 | 완료 | 슬라이더 라벨 간격과 트랙 길이 통일 | `Warp`, `Warp Size`, `Noise`가 공통 12px 라벨 gap과 160px 트랙 길이를 사용하도록 정렬함 |
| T064 | 완료 | 컬러 포인트 핸들 중복 표시 수정 | 포인트 핸들이 표시되는 동안 `WarpPreview`가 숨겨져 원본 핸들과 워프 보조 점이 분리되어 보이지 않음 |
| T065 | 완료 | 사이즈 입력 hover 배경색 통일 | 하단 `W/H` 사이즈 입력 바 hover/focus/active 배경이 드롭다운/슬라이더와 같은 white overlay 톤을 사용함 |
| T066 | 완료 | 사이즈 프리셋 하단 사이즈 바 통합 | B Lab의 `Size preset`을 상단 실험 툴바에서 제거하고 하단 `W/H` 사이즈 입력 바 안의 `Preset` 메뉴로 통합함 |
| T067 | 완료 | 사이즈 프리셋 라벨/위치 정리 | 하단 사이즈 바가 `Custom W 640 H 640` 순서로 시작하고 프리셋 select가 별도 버튼 대신 선행 라벨처럼 동작함 |
| T068 | 완료 | 사이즈 프리셋 hover 상태 보정 | 하단 사이즈 프리셋 select의 hover 밝은 배경을 제거하고 cursor를 pointer로 바꿈 |
| T069 | 완료 | 사이즈 프리셋 focus 상태 보정 | 하단 사이즈 프리셋 select가 클릭/focus 후에도 별도 배경색이나 ring/border를 표시하지 않음 |
| T070 | 완료 | Warp 조절 flow overlay 추가 | `Warp`/`Warp Size` 슬라이더 조절 중 캔버스 위에 컬러 흐름선이 표시되고 `Warp Size`는 영향 범위 링도 함께 표시됨 |
| T071 | 완료 | Warp/Warp Size overlay 의미 분리 | `Warp`는 전체 흐름선만, `Warp Size`는 컬러 포인트 영향권 링만 표시하도록 조절 피드백을 분리함 |
| T072 | 완료 | Spread 렌더링 의미 적용 | 기존 `Warp Size`가 포인트 이동 배율이 아니라 실제 컬러 영향 범위를 조절하도록 렌더러와 라벨을 변경함 |
| T073 | 완료 | Warp 가이드라인 제거 | `Warp` 물결형 가이드라인을 제거하고 `Spread` 조절 시에만 컬러 영향권 링 overlay가 표시되도록 정리함 |
| T074 | 완료 | 코너 슬라이더 드래그 안정화 | 우측 상단 `Spread` 코너 슬라이더가 드래그 중 move 이벤트를 놓치지 않도록 pointer 처리와 cursor/touch 상태를 보강함 |
| T075 | 완료 | 우측 상단 컬러 포인트 조작 차단 해소 | `Spread` 코너 슬라이더의 빈 SVG 영역이 컬러 포인트를 덮지 않고, 컬러 포인트 드래그가 작은 핸들 밖에서도 이어짐 |
| T076 | 완료 | C Lab 및 A/B/C 비교 추가 | `/?ab=c-lab` UI glow 실험군과 `/?ab=compare` 3분할 비교가 추가되고 C Lab Generate가 전용 스타일/팔레트를 사용함 |
| T077 | 완료 | C Lab 레퍼런스 12종 스타일 등록 | 첨부 이미지의 12개 UI gradient 타일이 첫 번째 드롭다운에 등록되고 선택/Generate 시 프리셋 전체가 적용됨 |
| T078 | 완료 | C Lab 레퍼런스 전용 렌더러 적용 | 12개 스타일이 일반 mesh 평균 대신 inset shadow, diagonal band, radial core, orbit glow 계열 전용 픽셀 렌더러로 그려짐 |
| T079 | 완료 | C Lab 핸들/컨트롤 의미 연결 | 컬러 핸들이 전용 렌더러의 blob/ribbon 위치를 직접 바꾸고 C Lab 컨트롤이 Reference/Motion/Flow/Bloom/Grain 성격으로 정리됨 |
| T080 | 완료 | C Lab 포인트 기반 필드 렌더링 전환 | 전용 픽셀 렌더러를 제거하고 12개 레퍼런스 스타일이 공통 그라디언트 weight field에서 컬러 포인트 기준으로 생성됨 |
| T081 | 완료 | C Lab Vignette 컨트롤 추가 | `Grain` 다음 외곽 컨트롤에 `Vignette` 슬라이더를 추가하고 렌더러/스냅샷/공유/export 상태에 연결함 |
| T082 | 완료 | 컬러/사이즈 팝업 패널 스타일 통일 | 컬러 칩은 앱 내부 hex/swatch popover로 바꾸고 사이즈 프리셋은 공통 Radix Select 패널로 교체해 radius/surface/shadow를 통일함 |
| T083 | 완료 | C Lab 추가 실험 후보 정리 | 캔버스 radius 조절, 구조적 그라디언트 형태, 마스크 효과, smooth/steps 조절, fluid gradient 계열을 제품 개선 계획에 기록함 |
| T084 | 완료 | C Lab 캔버스 radius 조절 모드 추가 | 우하단 resize 핸들의 좌/우 끝을 radius 조절 영역으로 확장하고 radius 값을 share/export/snapshot 경로에 포함함 |
| T085 | 완료 | 사이즈/radius 핸들 hover 흔들림 제거 | 우하단 핸들의 hover scale transform을 제거하고 hover mode state 갱신을 줄여 커서만 바뀌고 geometry는 유지되도록 수정함 |
| T086 | 완료 | C Lab radius drag 감도 완화 | radius 조절 delta에 0.55 감도를 적용하고 Node 테스트를 `*.test.mjs`로 분리해 typecheck와 함께 검증되도록 정리함 |
