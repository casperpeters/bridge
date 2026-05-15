# Place Uitspelen Responsively on Desktop and Mobile

## What to build

Position the `Uitspelen` button as a quiet local table action: bottom right of the green table area on desktop, and under the `Noord - Partner` label on mobile. The button must not cover hands, labels, or the current trick.

## Acceptance criteria

- [ ] On desktop, the `Uitspelen` button appears at the bottom right of the green table area.
- [ ] On mobile, the `Uitspelen` button appears under the `Noord - Partner` label.
- [ ] The button does not cover the North label, North cards, South cards, or current trick area in targeted browser coverage.
- [ ] The placement remains compact and does not add long explanatory text to normal gameplay.

## Blocked by

- `001-visible-notrump-uitspelen-path.md`

## User stories covered

- 15. As a desktop player, I want the `Uitspelen` button at the bottom right of the green table area, so that it feels like a local table action.
- 16. As a mobile player, I want the `Uitspelen` button under the `Noord - Partner` label, so that it stays near the visible table context without covering cards.
- 36. As a tester, I want browser smoke coverage for the button, dialog, auto-finish, score overview and review table, so that the end-to-end UX remains intact.
