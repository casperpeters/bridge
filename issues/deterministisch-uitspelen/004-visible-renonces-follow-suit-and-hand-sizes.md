# Use Renonces, Legal Follow-Suit Facts, and Hidden Hand Sizes in Proof

## What to build

Teach the deterministic analysis to use visible bridge facts beyond visible cards: played cards, observed renonces, legal follow-suit obligations, and public remaining hand sizes. The proof may use those facts to exclude impossible hidden holdings, while still failing closed when uncertainty remains.

## Acceptance criteria

- [ ] Played cards and visible hands are used as proof facts.
- [ ] Observed renonces can exclude a hidden hand from following suit or ruffing later where appropriate.
- [ ] Public remaining hand sizes can be used to reject impossible hidden holdings without revealing ranks or suits.
- [ ] The analysis still fails closed if the visible facts do not prove every remaining exact winner.
- [ ] Unit tests cover renonce-based availability and cases where visible facts remain insufficient.

## Blocked by

- `002-fail-closed-hidden-cards-and-seat-ambiguity.md`

## User stories covered

- 19. As a defender, I want dummy and played cards to count as visible information, so that legal visible facts can still prove an ending.
- 20. As a player, I want renonces from earlier tricks to count as visible facts, so that the proof can use information everyone has legally seen.
- 21. As a player, I want unknown higher cards to block `Uitspelen`, so that the app never assumes a hidden card is harmless.
- 27. As a maintainer, I want the verifier to be a pure rules module with one stable public analysis function, so that the hard logic is unit-testable outside the browser.
- 29. As a maintainer, I want a node budget for verifier search, so that pathological positions fail closed instead of slowing the app.
- 35. As a tester, I want unit coverage for proof results and failure reasons, so that edge cases remain stable.
