# State

- Current Task: 없음
- Status: 캔버스 resize 중 previewWidth 동기화
- Latest Summary: 컨트롤 path geometry는 실제 `previewWidth`를 기준으로 계산하지만, 사이즈 조절 중 `width/height` state가 먼저 바뀌고 `ResizeObserver`가 다음 타이밍에 실제 frame 폭을 반영해 컨트롤이 한 박자 늦게 따라올 수 있었습니다. `useLayoutEffect`에서 width/height 변경 직후 실제 frame `getBoundingClientRect().width`를 paint 전에 동기화하도록 추가했습니다. 브라우저에서 width 640/680/648 상태의 `Noise` 왼쪽 edge가 canvas right + 12px에 맞고, 720/752 코너 상태에서도 `Warp Size`가 offset arc를 유지하는 것을 확인했습니다. `./node_modules/.bin/tsc --noEmit`, 서버 200 응답, 파일 예산 250줄 이하 유지 확인.
- Next Step: 실제 드래그 resize 중 컨트롤이 캔버스 외곽 gap 12px을 유지하며 따라오는지 시각 확인하세요.
