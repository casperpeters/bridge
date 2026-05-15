# Support Equivalent Legal Card Choices Without Changing Winners

## What to build

Allow `Uitspelen` when a player has multiple legal card choices but every legal branch still converges to the same exact winning-seat sequence. This should cover simple equivalent choices, such as interchangeable top winners, without depending on the card-play AI's preferred order.

## Acceptance criteria

- [ ] The analysis explores legal choices enough to prove that equivalent alternatives converge to the same exact winner sequence.
- [ ] The button remains unavailable when at least one legal branch changes a future exact winner.
- [ ] The proof result remains independent from the representative automatic card-play line.
- [ ] Unit tests cover converging equivalent choices and a non-converging legal branch.

## Blocked by

- `001-visible-notrump-uitspelen-path.md`
- `002-fail-closed-hidden-cards-and-seat-ambiguity.md`

## User stories covered

- 23. As a player, I want multiple equivalent legal card choices to be accepted, so that the button can appear when A/K order or similar choices do not affect the winners.
- 24. As a player, I do not want the button if some legal choice changes a later winner, so that the app does not merely follow its preferred engine line.
- 25. As a maintainer, I want the proof to track exact winning seats internally, so that next-leader differences cannot be hidden behind team-level equality.
- 27. As a maintainer, I want the verifier to be a pure rules module with one stable public analysis function, so that the hard logic is unit-testable outside the browser.
- 35. As a tester, I want unit coverage for proof results and failure reasons, so that edge cases remain stable.
