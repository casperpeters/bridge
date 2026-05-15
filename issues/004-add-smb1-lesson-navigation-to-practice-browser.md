# Add SMB1 Lesson Navigation To Practice Browser

## What to build

Extend the oefenhandenpagina with a `Start met Bridge 1` lesson overview. Clicking an SMB1 lesson applies the SMB1 catalog filter and the selected lesson filter. SMB1 result cards show lesson number and source hand id where available.

## Acceptance criteria

- [ ] The practice browser exposes a `Start met Bridge 1` catalog route.
- [ ] SMB1 shows lessons 1-12 as navigable filters.
- [ ] Clicking an SMB1 lesson filters results to that lesson.
- [ ] SMB1 cards show `Les X`.
- [ ] SMB1 cards show `sourceHandId` when present.
- [ ] Global search still works together with the SMB1 catalog and lesson filters.
- [ ] Ordinary catalogs remain flat lists and do not gain fake lesson structure.
- [ ] Browser or unit coverage verifies SMB1 lesson filtering behavior.

## Blocked by

- `002-add-smb1-course-catalog.md`
- `003-build-practice-browser-page-with-global-search.md`

## User stories covered

- 5. As a beginner, I want SMB1 to show lessons 1-12, so that the structure matches my course material.
- 6. As a beginner, I want to click an SMB1 lesson, so that I see only the hands for that lesson.
- 7. As a beginner, I want each practice hand card to show a short goal, so that I know what I am practicing.
- 10. As a tester, I want source hand ids visible for SMB1 reused hands, so that I can see when two entries share the same deal.
- 13. As a maintainer, I want SMB1 catalog metadata validated, so that every SMB1 hand remains course-structured.
- 14. As a maintainer, I want every SMB1 lesson to have at least one hand, so that the route is complete.
- 15. As a maintainer, I want every SMB1 App-focus goal covered by at least one engine-backed hand, so that "complete coverage" is meaningful.
- 20. As a teacher/tester, I want SMB1 and technical catalogs both visible, so that I can approach the same situation by course route or bridge topic.
