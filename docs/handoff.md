# Handoff - Gradient Factory

## Current State

- Repo root: `photogradient/`
- GitHub remote: `https://github.com/visualog/gradient-factory.git`
- Branch: `main`
- Local dev URL: `http://127.0.0.1:3033/`
- Current operating rules: `AGENTS.md` now defines a Photogradient-specific Ultra Lite workflow.
- Latest validation in this session:
  - `./node_modules/.bin/tsc --noEmit` passed.
  - `curl -I http://127.0.0.1:3033/` returned `200 OK`.

## What Changed In This Session

- Canvas size constraints were changed from one generic minimum to separate minimums:
  - width: `640`
  - height: `320`
- The canvas color point handles now appear only when the mouse is inside the canvas area.
- The resize handle was reduced to the bottom-right corner handle only.
- Resize handle styling was changed from circular dots to rounded bar/corner handle styling.
- The top controls were moved out of the side panel and onto the canvas perimeter area:
  - Gradient select
  - Warp Shape select
  - Warp slider
  - Warp Size slider
  - Noise slider
- The old fixed Noise corner arc was removed.
- A first path-based perimeter layout was added:
  - Uses `ResizeObserver` to measure the rendered canvas preview width.
  - Calculates cumulative control distance along the top edge.
  - Continues controls through the top-right quarter arc and down the right edge when top space runs out.
- Canvas rendering is coalesced with `requestAnimationFrame` to reduce perceived lag while sliders and handles update.
- `captureGradient()` renders once synchronously before saving/downloading so snapshots stay current.
- Operational docs were updated:
  - `AGENTS.md`
  - `docs/state.md`
  - `docs/task-board.md`

## Important Implementation Files

- `src/app/page.tsx`
  - Main editor UI, canvas renderer, control placement, resize/drag handling.
  - New perimeter-related constants/functions:
    - `CONTROL_RAIL_GAP`
    - `CONTROL_ITEM_GAP`
    - `CONTROL_HEIGHT`
    - `PERIMETER_CONTROLS`
    - `perimeterControlDistance`
    - `perimeterControlWidth`
    - `perimeterControlStyle`
  - Current perimeter layout is still a first pass and should be treated as unfinished.
- `src/components/ui/slider.tsx`
  - Radix Slider wrapper.
  - Works for straight sliders, but is not suitable for true curved track sliders.
- `src/components/ui/select.tsx`
  - Radix Select wrapper with chevron and portal-safe styling.
- `src/app/globals.css`
  - Contains global and color input styling used by the UI.
- `docs/state.md`
  - Current high-level state.
- `docs/task-board.md`
  - Task ledger.

## Critical Design Issue To Continue

The user does not want controls simply placed or rotated around the canvas.

The intended behavior is:

- Controls form one continuous inline sequence.
- The sequence starts at the top-left outside the canvas.
- As the sequence reaches the top-right canvas corner, the relevant controller itself should follow the rounded corner.
- `Warp Size` should visually bend into an arc as it reaches the corner and continue into `Noise`.
- `Noise` should feel connected to that same path, not like a separate fixed vertical slider.
- During canvas resizing, controls that approach the corner should react smoothly and naturally.

Current implementation only calculates control container positions along a perimeter path. It does not yet make the slider track itself bend. This is why the result can still look wrong.

## Technical Direction For Next Session

Do not keep trying to solve the curved slider with Radix Slider rotation.

Radix Slider is good for straight horizontal/vertical tracks, but it is the wrong primitive for:

- A track that transitions from straight line to corner arc.
- A thumb moving along a curved path.
- A single slider visually bridging top edge and right edge.

Use a custom path-based slider for any control that can intersect the corner.

Recommended next architecture:

1. Keep Radix Select for dropdowns.
2. Keep Radix Slider only for controls that remain fully straight on the top edge.
3. Add a custom SVG path slider for perimeter-intersecting controls:
   - start with `Warp Size`
   - then connect/align `Noise`
4. Define one shared canvas perimeter path:
   - top straight segment
   - top-right quarter arc
   - right vertical segment
5. Measure rendered canvas size with `ResizeObserver`.
6. Recalculate path points on resize.
7. Move slider thumbs by path distance, not by rotated DOM coordinates.
8. Use `requestAnimationFrame` for pointer updates so resizing and dragging stay smooth.

Useful references:

- ResizeObserver: `https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver`
- requestAnimationFrame: `https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame`
- CSS Motion Path concept: `https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_motion_path`
- SVG path methods to consider in browser APIs:
  - `SVGGeometryElement.getTotalLength()`
  - `SVGGeometryElement.getPointAtLength()`

## Validation Notes

Use this validation flow while the dev server is running:

```bash
./node_modules/.bin/tsc --noEmit
curl -I http://127.0.0.1:3033/
```

Avoid `npm run build` while the dev server is active in this checkout. Prior sessions mixed dev/build `.next` outputs and caused CSS/runtime issues. If a production build is needed, stop the dev server first, clear stale `.next` state carefully, then build.

## Known Risks

- Current perimeter layout rotates whole control containers. That is not enough for the desired visual result.
- A rotated Radix Slider may not have natural pointer behavior because its internal math is still based on straight slider orientation.
- The current `Warp Size` and `Noise` relationship is not yet visually continuous in the way the reference video shows.
- No Playwright/browser screenshot verification has been performed for the latest perimeter path pass.
- The dev server is currently expected at `http://127.0.0.1:3033/`.

## Suggested Next Prompt

```text
photogradient repo에서 이어서 진행해줘. 먼저 AGENTS.md, docs/state.md, docs/task-board.md, docs/handoff.md를 읽고 현재 상태를 파악해줘. 목표는 캔버스 외곽 컨트롤을 reference처럼 자연스럽게 이어지게 만드는 거야. Radix Slider를 회전해서 해결하지 말고, 캔버스 perimeter path 기반 custom SVG slider를 구현해줘. 특히 Warp Size 슬라이더가 top-right 코너에 닿으면 트랙 자체가 아크 형태로 휘고 Noise와 같은 경로에서 이어져야 해. ResizeObserver로 캔버스 표시 크기를 측정하고 requestAnimationFrame으로 resize/drag 중 부드럽게 반응하도록 구현해줘. 구현 후 ./node_modules/.bin/tsc --noEmit 과 http://127.0.0.1:3033/ 응답 확인까지 해줘.
```
