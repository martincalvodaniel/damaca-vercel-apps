# Archived delivery evidence

## 06 — Compact controls

- Starting capacity: 87% of 5 hours and 37% of 7 days.
- Added shared, accessible icon buttons and compact controls across the vault, sign-in, settings, access administration, and offline screens. The mobile navigation now places icons beside their labels. The app instructions record the default preference for recognizable icon actions.
- Biome, TypeScript, 42 tests, the Webpack build, and the compiled HTTP integration passed. Chrome completed setup, create, show, lock, recovery, and unlock at 320px, plus unlock at 1200px. Measured 36px icon buttons, 44px two-line credential rows, and 49px mobile navigation. Both widths had no horizontal overflow.
- The commit remains local because publishing the current `int` would include the unrelated unpublished commit `44e6431`.

## 07 — Password generation

- Starting capacity: 77% of 5 hours and 35% of 7 days.
- Reproduced out-of-range alphabet indices that appended `undefined`. Mapped accepted random bytes into the alphabet while keeping unbiased sampling. The entry form now confirms generation and keeps the field masked.
- Passed a deterministic regression, 1,000 generated samples of exactly 24 characters, 43 tests, TypeScript, Biome, and the Webpack build. Chrome at 320px confirmed generation, masking, and saving the exact generated value. Desktop unlock passed at 1200px.
- Publication is pending because `int` still contains the unrelated local commit `44e6431`.
