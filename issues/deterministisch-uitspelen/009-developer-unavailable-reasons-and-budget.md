# Expose Developer-Only Unavailable Reasons and Budget Failures

## What to build

Add a node budget to deterministic analysis so difficult positions fail closed instead of slowing the app. Keep ordinary gameplay quiet, but expose unavailable reasons, including budget exhaustion, in developer mode for debugging.

## Acceptance criteria

- [ ] The deterministic verifier accepts or applies a search node budget.
- [ ] Budget exhaustion returns an unavailable result with a stable developer/test reason.
- [ ] Normal gameplay does not show unavailable explanations when `Uitspelen` is absent.
- [ ] Developer mode can show why `Uitspelen` is unavailable for budget failures and hidden-card threats.
- [ ] Unit tests cover budget exhaustion as a fail-closed result.

## Blocked by

- `002-fail-closed-hidden-cards-and-seat-ambiguity.md`
- `004-visible-renonces-follow-suit-and-hand-sizes.md`

## User stories covered

- 29. As a maintainer, I want a node budget for verifier search, so that pathological positions fail closed instead of slowing the app.
- 30. As a developer, I want budget failures hidden in normal UI but visible in developer mode, so that beginners are not distracted and debugging remains possible.
- 35. As a tester, I want unit coverage for proof results and failure reasons, so that edge cases remain stable.
