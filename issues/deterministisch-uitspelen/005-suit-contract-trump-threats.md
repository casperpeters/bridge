# Handle Suit Contracts and Unknown Trump Threats Conservatively

## What to build

Extend deterministic proof to suit contracts while treating unknown trumps conservatively. A side-suit winner is not certain if a hidden hand might legally ruff with an unknown trump.

## Acceptance criteria

- [ ] Suit-contract analysis blocks side-suit certainty while an unknown hidden trump could legally ruff.
- [ ] A side-suit ending can become available when visible cards, played cards, renonces, and hand-size facts prove no relevant ruff can occur.
- [ ] The analysis keeps exact winning-seat sequence as the success invariant.
- [ ] Unit tests cover unknown trump blocking and a proven no-ruff suit-contract ending.

## Blocked by

- `004-visible-renonces-follow-suit-and-hand-sizes.md`

## User stories covered

- 4. As a beginner, I want `Uitspelen` to appear only when the app is certain, so that I can trust the button.
- 20. As a player, I want renonces from earlier tricks to count as visible facts, so that the proof can use information everyone has legally seen.
- 22. As a player, I want unknown trumps to block side-suit certainty, so that a possible ruff is never ignored.
- 27. As a maintainer, I want the verifier to be a pure rules module with one stable public analysis function, so that the hard logic is unit-testable outside the browser.
- 35. As a tester, I want unit coverage for proof results and failure reasons, so that edge cases remain stable.
