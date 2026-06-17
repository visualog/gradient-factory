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
| T010 | 대기 | style preset selector 구현 또는 Next 보안 패치 | 사용자가 다음 slice를 승인하고 검증이 통과함 |
