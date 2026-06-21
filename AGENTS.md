# AGENTS.md — AgentOS Foundation v2.4.0 Lite-aligned for Photogradient

최소 토큰으로 Photogradient 작업을 진행하되, Lite 에디션의 파일 예산과 리팩터링 규칙을 적용한다. 이 프로젝트의 실제 작업 루트는 현재 저장소 루트이며, 상위 폴더의 AgentOS 템플릿 디렉토리는 참고용으로만 본다.

## 핵심 규칙

- 전체 저장소나 전체 `docs/`를 읽지 않는다.
- AgentOS Lite zip 원본 구조로 `docs/states/`, `docs/templates/`, `docs/reports/`, `docs/handoffs/`를 확장하지 않는다.
- 변경 작업이면 `docs/state.md`와 `docs/task-board.md`만 먼저 읽는다.
- 작업 유형에 맞는 workflow 하나만 추가로 읽는다.
- 한 번에 태스크 1개만 수행한다.
- 다음 태스크는 사용자 승인 없이는 진행하지 않는다.
- 새 패키지 설치, init, registry add, MCP 설정은 사용자 승인 후 실행한다.
- 비밀키, 토큰, 개인정보는 출력하거나 기록하지 않는다.
- `.next`, `.next.*`, `.DS_Store`, `node_modules`는 운영 문서나 Git 추적 대상으로 보지 않는다.
- 파일당 250줄 이하를 권장한다.
- 파일당 300줄 초과를 금지한다.
- 300줄에 가까워지면 기능 추가보다 분리/정리를 우선한다.

## 라우팅

| 작업 유형 | 판단 기준 | 추가 문서 |
|---|---|---|
| General | 질문, 설명, 검토 | 없음 |
| Feature | 만들기, 추가, 구현 | `docs/workflows/feature.md` |
| Bugfix | 오류, 안 됨, 실패, 깨짐 | `docs/workflows/bugfix.md` |
| Refactor | 구조 개선, 정리, 분리, 중복 제거 | `docs/workflows/refactor.md` |
| Release | 배포, 릴리즈, 최종 점검 | `docs/workflows/release.md` |
| UI | 화면, 컴포넌트, 스타일, 아이콘, 폰트, 차트, 모션 | `docs/workflows/feature.md` + `docs/design/style-system-rules.md` |

## UI 핵심 규칙

- 기존 컴포넌트와 스타일 시스템을 먼저 사용한다.
- 새 UI/아이콘/폰트/차트/모션 라이브러리는 사용자 승인 전 설치하지 않는다.
- shadcn/ui는 기본 컴포넌트 레이어로 쓰되, Photogradient visual preset과 grid rhythm으로 확장한다.
- UI 작업 전 `docs/design/style-system-rules.md`를 확인한다.
- 수평 리듬은 grid 기반, 수직 리듬은 4px baseline/spacing scale 기반으로 맞춘다.
- Vega/Nova/Luma/Rhea/Mira/Maia/Lyra/Sera는 Bklit UI가 아니라 Photogradient visual style preset이다.
- Bklit UI는 chart/data visualization 작업에만 사용한다.
- 단순 모션은 CSS/Tailwind transition으로 해결한다.
- Anime.js/GSAP은 복잡한 timeline 또는 scroll interaction이 필요할 때만 검토한다.
- 아이콘은 `currentColor`, 접근성 label, `aria-hidden` 여부를 확인한다.

## 승인 명령

아래 문구만 단독 메시지일 때 다음 태스크 승인이다.

- `진행`
- `계속`
- `다음`
- `승인`
- `진행해줘`

`해줘`, `수정해줘`, `검토해줘`, `설명해줘`는 자동 승인 명령이 아니다.

## 완료 시 기록

의미 있는 작업 묶음이 끝났다면 `docs/state.md`와 `docs/task-board.md`만 갱신한다. 버튼 라운드, 색상, shadow 같은 작은 반복 조정은 여러 건을 묶어서 한 번에 기록한다. 상세 report/handoff는 사용자가 요청할 때만 만든다.
