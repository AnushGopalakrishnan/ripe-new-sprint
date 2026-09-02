# Careers pillars interaction benchmark

Date: 2026-09-02

URL: `http://localhost:55020/careers`

Scenario: eight repeated card-to-card hover transitions at a 1440 × 1000 Chromium viewport.

## Result

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Main-thread task time | 562.71 ms | 360.00 ms | -36.0% |
| Style recalculation time | 64.08 ms | 57.53 ms | -10.2% |
| Style recalculation count | 1,064 | 1,000 | -6.0% |
| Layout work | 0 ms | 0 ms | unchanged |
| Paint events | 1,344 | 0 | -100% |
| Paint duration | 49.10 ms | 0 ms | -100% |
| Raster tasks | 1,704 | 172 | -89.9% |
| Raster duration | 95.37 ms | 25.51 ms | -73.3% |
| Pre-paint duration | 46.04 ms | 39.85 ms | -13.4% |
| Average frame interval | 8.34 ms | 8.33 ms | unchanged |
| p95 frame interval | 9.20 ms | 9.10 ms | -1.1% |
| Worst frame interval | 15.50 ms | 9.40 ms | -39.4% |
| Frames over 20 ms | 0 | 0 | unchanged |

The JS heap delta rose from 1.14 MB to 1.36 MB in this single traced run. Heap deltas during DevTools tracing are noisy and do not indicate retained memory; the interaction uses bounded state, clears timers/animation frames, and does not accumulate DOM nodes per transition.

## Change

The previous implementation animated `clip-path` across a duplicated full-grid foreground, repainting and rerasterizing text throughout every spring transition. The optimized implementation uses a fixed-size, `overflow: hidden` highlight viewport. The viewport and its counter-moving foreground strip animate with GPU-friendly `translate3d()` transforms, preserving the exact wipe mask, spring, magnetic delay, cursor drift, mobile direction, and pointer-exit behavior.

Pointer movement is requestAnimationFrame-throttled, and card bounds are read once on pointer entry rather than on every pointer event.

## Method

Metrics came from Chromium via Playwright and the Chrome DevTools Protocol using `Performance.getMetrics`, requestAnimationFrame sampling, and an identical tracing category set before and after. The bundled gstack browser could not be built because its pinned Bun installer checksum did not match the current downloaded installer; the integrity check was not bypassed.
