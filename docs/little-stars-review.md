# Little Stars implementation and review

Base: `39e6869840b30294b336d7a68e52350c88bbb5ca`.
Work branch: `improve/little-stars-child-friendly` (local; remote write is blocked pending browser authentication).

## Audit

The repository is a static GitHub Pages collection with independent, self-contained HTML games. Read the repository instructions, root index integration and the complete ABC 123 source. Other unrelated games were inventoried, not exhaustively audited or modified.

Original issues: hidden overflow and fixed positioning could clip tall activities and landscape screens; a delayed counting callback could update a screen after leaving it; speech completion and cancellation could advance an obsolete quiz; letter cards and the star jar were clickable divs; zoom was disabled; narration did not have a persistent replay control; progress maxima doubled as cursors, causing resumption to stick after a complete cycle; confetti and shaking were visually busy.

## Changes

- Retain all 26 letter associations, numbers 1–10, touch counting, letter recognition, number recognition, quantity recognition, adaptive 2/3 choices, and star rewards.
- Rebuild the interface with large native buttons, visible keyboard focus, semantic labels, fixed-location home/speaker/star controls, gentler feedback and reduced-motion support.
- Responsive, flowing layout with safe-area padding and compact landscape treatment. Scrolling remains possible rather than hiding inaccessible content. No external fonts, libraries or assets in the shipped game.
- English narration and persistent replay; explicit next buttons remove speech-dependent navigation. Screen changes cancel speech and scheduled effects. Voice failure and unavailable storage get visible explanations.
- Keep `abc123-stars` as `{abc,num}` and `abc123-seen` as `{abcSeen,numSeen}` for existing users and the arcade index. Add a separate `abc123-cursor-v1` for resumption after looping. Do not reset or delete stored keys. Merge persisted maxima before saving, but simultaneous writes in different tabs are not an atomic cross-tab counter.
- Put grown-up guidance and the existing `../` arcade link in a separate parent panel. No reset control or analytics added.

## Actual validation

`JSDOM_PATH=/tmp/little-stars-test/node_modules/jsdom node tests/abc123.test.cjs`

Passed 434 DOM assertions/actions before and after formatting. Tests exercise all letters and numbers, both number quiz variants, correct and incorrect answers, helpful hints, double-tap guards, full activity loops, legacy progress, independent cursors and reload, home navigation during celebration, star jar, replay and voice-test controls, malformed/blocked storage, missing/failed speech synthesis, and reduced-motion mode. Speech is mocked: this validates requests and control flow, not audible speech or pronunciation. JSDOM does not validate layout or real browser touch input.

JavaScript parsing passed. Local Chromium could not launch (environment socket permission error); installing Playwright browser binaries failed. Work's browser could not reach the local server. Therefore viewport screenshots, real browser interaction, physical iPhone/Android/tablet tests, actual audio output, screen-reader behavior and device safe-area behavior are NOT yet verified.

## Before release

1. Complete authenticated GitHub access; push only this branch and open a draft PR.
2. Provide an isolated branch preview; do not change the live Pages source.
3. Test portrait 320/375/390/430px, phone landscape, tablet and desktop widths, including 10 objects and 3 choices. Check every visible control, zoom, keyboard focus, device audio and reduced motion.
4. Test existing saved progress on the original website origin. A separate preview origin has separate storage and will start with its own stars.
5. Parent/child review on an actual iPhone and Android device. Merge/publish only after owner approval.

No remote branch, PR or preview has yet been created. Main and the live site are unchanged.
