# Start Practice Hands From Browser

## What to build

Make every practice hand card start the selected hand at the game table through ordinary hand URLs. This must not reuse or fake the existing app-lesmodus. The hand should load through the existing practice-hand and repeatable-hand infrastructure.

## Acceptance criteria

- [ ] Every practice hand card has a clear Start hand action.
- [ ] Start hand links to the game table with `hand=<id>`.
- [ ] The link includes return context for the practice browser where practical.
- [ ] Starting from the browser loads the selected `practice.id`.
- [ ] Starting from the browser does not set existing lesson-mode state unless a real app-lesson URL is used.
- [ ] Hand ids remain shareable in URLs.
- [ ] Browser coverage verifies that starting a hand from the practice browser loads the expected practice hand.

## Blocked by

- `003-build-practice-browser-page-with-global-search.md`

## User stories covered

- 8. As a beginner, I want a clear "Start hand" action, so that I can begin without understanding developer tools.
- 9. As a tester, I want practice hand ids visible, so that I can report exact reproducible situations.
