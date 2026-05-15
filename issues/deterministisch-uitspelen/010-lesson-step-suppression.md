# Let Active Lesson-Board Steps Suppress Uitspelen

## What to build

Allow guided lesson-board steps to suppress `Uitspelen` when the lesson expects a specific interaction. Ordinary practice hands should still allow the button whenever the deterministic proof succeeds.

## Acceptance criteria

- [ ] Active lesson-board steps can suppress `Uitspelen` when they require the player to make or observe a specific interaction.
- [ ] Ordinary practice hands do not suppress `Uitspelen` by default.
- [ ] Suppression is controlled by lesson/practice flow state, not by hardcoded hand ids.
- [ ] Browser coverage verifies the button is hidden during a suppressing lesson step.
- [ ] Browser or unit coverage verifies ordinary practice hands can still show `Uitspelen` when proof succeeds.

## Blocked by

- `001-visible-notrump-uitspelen-path.md`

## User stories covered

- 33. As a lesson author, I want active lesson-board steps to be able to suppress `Uitspelen`, so that a lesson cannot be skipped through when it expects a specific interaction.
- 34. As a practice-hand user, I want ordinary practice hands to allow `Uitspelen`, so that reproducible hands can still be completed quickly.
- 36. As a tester, I want browser smoke coverage for the button, dialog, auto-finish, score overview and review table, so that the end-to-end UX remains intact.
