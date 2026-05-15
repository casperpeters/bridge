# Pause Automatic Play While the Confirmation Dialog Is Open

## What to build

Make the confirmation dialog a stable pause point for automatic play. Opening the dialog freezes automatic continuation; Escape, close, or `Annuleren` closes only the dialog and returns to the same playable hand state.

## Acceptance criteria

- [ ] Opening the `Uitspelen` confirmation dialog pauses automatic AI continuation.
- [ ] Escape closes the dialog without playing cards or changing hand state.
- [ ] The cancel action closes the dialog without playing cards or changing hand state.
- [ ] After canceling, normal play can continue and a still-valid `Uitspelen` option remains available.
- [ ] Browser coverage verifies cancel/Escape behavior and state stability.

## Blocked by

- `001-visible-notrump-uitspelen-path.md`

## User stories covered

- 7. As a beginner, I want the AI to pause while the confirmation dialog is open, so that the confirmation is not racing against a changing table.
- 8. As a beginner, I want a confirmation dialog before the hand is finished, so that an accidental click does not skip the ending.
- 9. As a beginner, I want to cancel the dialog with Escape or an annuleren action, so that I can continue playing manually.
- 10. As a beginner, I want the same `Uitspelen` button to remain after canceling, so that "not now" does not hide a still-valid option.
- 36. As a tester, I want browser smoke coverage for the button, dialog, auto-finish, score overview and review table, so that the end-to-end UX remains intact.
