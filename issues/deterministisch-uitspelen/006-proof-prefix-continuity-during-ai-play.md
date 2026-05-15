# Keep Stored Proofs Valid Across Continued AI Play

## What to build

Once a deterministic ending is proven, keep that proof available while normal AI play continues along the proven prefix. Discard the proof if the actual state stops matching the stored expected sequence. During confirmed automatic play-out, each completed trick winner must match the proof; a mismatch is a hard failure.

## Acceptance criteria

- [ ] A successful proof can be stored with enough state to validate prefix continuity.
- [ ] The `Uitspelen` button can remain visible while AI play advances through the proven ending.
- [ ] Canceling or ignoring the button does not invalidate a still-matching proof.
- [ ] A stale proof is discarded when the current state is no longer a prefix of the proven ending.
- [ ] Confirmed play-out hard fails if an automatically completed trick winner disagrees with the next expected winner.
- [ ] Browser or unit coverage verifies the button remains available across a matching prefix and disappears for a stale proof.

## Blocked by

- `001-visible-notrump-uitspelen-path.md`
- `002-fail-closed-hidden-cards-and-seat-ambiguity.md`

## User stories covered

- 5. As a beginner, I want the button to stay available once the ending is proven, so that I can click it even if the AI has already continued part of the forced ending.
- 6. As a beginner, I want the AI to keep playing while the button is visible, so that the normal table rhythm is not interrupted unnecessarily.
- 10. As a beginner, I want the same `Uitspelen` button to remain after canceling, so that "not now" does not hide a still-valid option.
- 25. As a maintainer, I want the proof to track exact winning seats internally, so that next-leader differences cannot be hidden behind team-level equality.
- 32. As a developer, I want execution to hard fail if the actual automatic line disagrees with the proof, so that engine/proof mismatches are caught immediately.
- 36. As a tester, I want browser smoke coverage for the button, dialog, auto-finish, score overview and review table, so that the end-to-end UX remains intact.
