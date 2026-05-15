# Add a First Deterministic Uitspelen Path for Visible Notrump Endings

## What to build

Add the first narrow `Uitspelen` flow for a clearly deterministic notrump ending where all remaining winners can be proven from visible cards and played cards. The player sees an `Uitspelen` button during play, confirms in a real dialog, and the hand finishes through the existing score and review flow with ordinary trick history.

The user-facing copy must use `Uitspelen`, not bridge-claim language such as `Claimen` or `Geven`.

## Acceptance criteria

- [ ] A pure rules analysis can report an available deterministic notrump ending with remaining trick count, exact winning-seat sequence, and Noord/Zuid versus Oost/West split.
- [ ] The public rules facade exposes the analysis function for unit tests and browser flow.
- [ ] During a proven ending, the browser shows an `Uitspelen` button during play.
- [ ] Clicking `Uitspelen` opens a real confirmation dialog with total remaining tricks and the team split.
- [ ] Confirming finishes the hand through existing play, scoring, score overview, and review behavior.
- [ ] The review trick table shows thirteen ordinary tricks after automatic play-out.
- [ ] Unit tests cover the available notrump case and the facade export.
- [ ] Targeted browser coverage verifies button, dialog, confirm, score overview, and review trick history.

## Blocked by

None - can start immediately.

## User stories covered

- 1. As a beginner, I want an `Uitspelen` button when the rest of the hand is fixed, so that I do not have to click through meaningless card choices.
- 2. As a beginner, I want the feature to avoid the word `Claimen`, so that I do not think the app is making a bridge-law claim it cannot explain.
- 3. As a beginner, I want the feature to avoid the word `Geven`, so that mixed remaining outcomes still make sense.
- 4. As a beginner, I want `Uitspelen` to appear only when the app is certain, so that I can trust the button.
- 8. As a beginner, I want a confirmation dialog before the hand is finished, so that an accidental click does not skip the ending.
- 11. As a beginner, I want the dialog to show the total number of remaining slagen, so that I know how much will be skipped.
- 12. As a beginner, I want the dialog to show how many remaining slagen go to Noord/Zuid and Oost/West, so that mixed endings are understandable.
- 13. As a beginner, I want the final score overview to appear after automatic play-out, so that the normal end-of-hand moment remains intact.
- 14. As a beginner, I want the review slagenoverzicht to show the automatically played cards as ordinary slagen, so that the hand history remains readable.
- 17. As a South declarer, I want both South and dummy information to count as visible, so that the app can prove endings from the hands I control.
- 26. As a maintainer, I want the UI to summarize by team, so that the confirmation remains compact for beginners.
- 27. As a maintainer, I want the verifier to be a pure rules module with one stable public analysis function, so that the hard logic is unit-testable outside the browser.
- 28. As a maintainer, I want the browser flow to pass visible seats into the verifier, so that the rules layer does not encode South-specific UX assumptions.
- 31. As a developer, I want deterministic play-out execution to reuse existing card-play and trick-scoring primitives, so that review and scoring stay consistent.
- 35. As a tester, I want unit coverage for proof results and failure reasons, so that edge cases remain stable.
- 36. As a tester, I want browser smoke coverage for the button, dialog, auto-finish, score overview and review table, so that the end-to-end UX remains intact.
