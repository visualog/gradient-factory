# State

- Current Task: 없음
- Status: 캔버스 외곽 경로 기반 컨트롤 배치 적용
- Latest Summary: 우측 코너에 고정돼 있던 `Noise` 아크 슬라이더와 flex wrap 기반 컨트롤 스택을 제거하고, Gradient/Warp Shape/Warp/Warp Size/Noise를 하나의 시퀀스로 계산해 캔버스 외곽 경로 위에 배치했습니다. `ResizeObserver`로 실제 preview width를 측정하고, 누적 컨트롤 길이가 상단 직선 구간을 넘으면 top-right quarter arc와 right edge 방향으로 이어지도록 좌표와 회전값을 계산합니다. 최소 캔버스 크기는 `640 x 320`으로 분리 적용했고, 캔버스 렌더는 `requestAnimationFrame`으로 coalescing합니다. `./node_modules/.bin/tsc --noEmit` 통과 및 `http://127.0.0.1:3033/` 200 확인 완료.
- Next Step: 우측 edge에 회전 배치된 Radix Slider의 pointer interaction을 실제 브라우저에서 확인하고, 필요하면 vertical/custom slider로 분리하세요.
