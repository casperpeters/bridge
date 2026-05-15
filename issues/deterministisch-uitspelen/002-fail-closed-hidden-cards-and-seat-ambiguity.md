# Fail Closed on Hidden Higher Cards and Exact Winner-Seat Ambiguity

## What to build

Extend the deterministic ending analysis so it refuses to offer `Uitspelen` when hidden information could still change the exact winning-seat sequence. The proof must be seat-sensitive, not just partnership-sensitive, because the next leader changes the legal future.

## Acceptance criteria

- [ ] Hidden higher cards block availability unless they are played, visible, excluded by visible facts, or otherwise impossible.
- [ ] A branch that changes the exact next winning seat blocks availability, even if the same partnership would still win.
- [ ] South defender visibility does not treat North's hidden cards as proof.
- [ ] Failed analysis returns stable reason codes suitable for unit tests and developer diagnostics.
- [ ] Unit tests cover hidden higher-card blocking, exact seat sensitivity, and South-as-defender visibility.

## Blocked by

- `001-visible-notrump-uitspelen-path.md`

## User stories covered

- 4. As a beginner, I want `Uitspelen` to appear only when the app is certain, so that I can trust the button.
- 18. As a South defender, I do not want North's hidden cards to count as visible proof, so that the app does not leak partner's hand.
- 21. As a player, I want unknown higher cards to block `Uitspelen`, so that the app never assumes a hidden card is harmless.
- 24. As a player, I do not want the button if some legal choice changes a later winner, so that the app does not merely follow its preferred engine line.
- 25. As a maintainer, I want the proof to track exact winning seats internally, so that next-leader differences cannot be hidden behind team-level equality.
- 27. As a maintainer, I want the verifier to be a pure rules module with one stable public analysis function, so that the hard logic is unit-testable outside the browser.
- 35. As a tester, I want unit coverage for proof results and failure reasons, so that edge cases remain stable.
