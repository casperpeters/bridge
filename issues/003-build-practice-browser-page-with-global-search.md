# Build Practice Browser Page With Global Search

## What to build

Build a separate oefenhandenpagina that lists all practice hands through the catalog metadata API. The page supports global search across all catalogs and composable filters for catalog, focus/type, and level. Existing technical catalogs are shown as flat results.

## Acceptance criteria

- [ ] A separate practice browser page exists and can load without starting the game table.
- [ ] The page lists practice hands from all exposed catalogs.
- [ ] Search is global across id, title, goal/test goal, catalog, lesson metadata, topic, focus, and review focus where available.
- [ ] Filters can narrow results by catalog.
- [ ] Filters can narrow results by focus/type.
- [ ] Filters can narrow results by level.
- [ ] Practice hand cards show title, catalog, short goal, focus/tags, id, and Start hand action.
- [ ] Long teaching points, full auctions, and detailed engine expectations are not shown in the compact card.
- [ ] Search/filter behavior is covered by unit tests through a testable module or public API, not DOM internals.

## Blocked by

- `001-expose-practice-catalog-metadata.md`

## User stories covered

- 2. As a beginner, I want a separate practice page, so that browsing practice hands does not clutter the game table.
- 3. As a beginner, I want to search all practice hands globally, so that I can find topics like "troef trekken" without knowing the catalog.
- 4. As a beginner, I want to filter by catalog, so that I can choose between bidding, defense, play-plan, scoring, and SMB1.
- 7. As a beginner, I want each practice hand card to show a short goal, so that I know what I am practicing.
- 9. As a tester, I want practice hand ids visible, so that I can report exact reproducible situations.
- 11. As a maintainer, I want existing technical catalogs to remain visible, so that regression and domain-focused practice still works.
- 12. As a maintainer, I want ordinary catalogs to stay flat lists for now, so that we do not invent fake structure.
- 18. As a developer, I want the practice browser data to be testable outside the DOM, so that search/filter behavior is reliable.
- 20. As a teacher/tester, I want SMB1 and technical catalogs both visible, so that I can approach the same situation by course route or bridge topic.
