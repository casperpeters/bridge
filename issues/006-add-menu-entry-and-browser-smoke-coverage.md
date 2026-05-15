# Add Menu Entry And Browser Smoke Coverage

## What to build

Add an `Oefenhanden` entry to the app menu that opens the separate practice browser page. Add browser smoke coverage for the complete navigation path from the game menu to searching, filtering, and starting a hand.

## Acceptance criteria

- [ ] The app menu contains an `Oefenhanden` entry.
- [ ] The entry opens the separate practice browser page.
- [ ] Browser smoke verifies the practice page loads.
- [ ] Browser smoke verifies searching for a term such as `troef trekken` returns results.
- [ ] Browser smoke verifies filtering by `Start met Bridge 1`.
- [ ] Browser smoke verifies selecting an SMB1 lesson filters to that lesson.
- [ ] Browser smoke verifies Start hand opens the game table and loads the expected practice id.
- [ ] `npm run test:browser` passes.

## Blocked by

- `003-build-practice-browser-page-with-global-search.md`
- `005-start-practice-hands-from-browser.md`

## User stories covered

- 1. As a beginner, I want to open "Oefenhanden" from the menu, so that I can practice specific bridge situations.
- 2. As a beginner, I want a separate practice page, so that browsing practice hands does not clutter the game table.
- 19. As a developer, I want browser smoke coverage for the menu and practice page, so that the new navigation does not regress.
