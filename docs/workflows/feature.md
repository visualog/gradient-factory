# Feature Workflow

## 읽는 경우

새 기능, 화면, 컴포넌트, API, 저장 로직을 만들 때만 읽는다.

## 절차

1. 목표를 한 문장으로 정리한다.
2. 이번에 끝낼 작은 slice를 정한다.
3. 관련 파일만 수정한다.
4. 가능한 검증을 한다.
5. `docs/state.md`와 `docs/task-board.md`를 갱신하고 멈춘다.


## UI 작업 압축 규칙

- 기존 컴포넌트와 스타일 시스템을 먼저 사용한다.
- UI 작업이면 `docs/design/style-system-rules.md`를 먼저 읽고 그 규칙을 따른다.
- 새 라이브러리는 사용자 승인 후 설치한다.
- shadcn/Bklit/Icons0/Pretendard/GSAP/Anime.js는 필요한 경우에만 검토한다.
- shadcn/ui는 기본 컴포넌트 레이어로 두고 Photogradient preset, grid rhythm, vertical rhythm으로 확장한다.
- 단순 모션은 CSS/Tailwind transition으로 처리한다.
- 접근성, 반응형, empty/error/loading 상태를 가능한 범위에서 확인한다.
