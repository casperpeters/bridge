# Expose Practice Catalog Metadata

## What to build

Expose the existing oefenhandencatalogi through a stable practice-hands API so UI and tests can list catalogs with a title, description, key/id, and their hands. Existing technical catalogs remain flat lists.

## Acceptance criteria

- [ ] All existing practice-hand collections are available through a catalog metadata API.
- [ ] Each catalog exposes a stable key/id, display title, description, and hand list.
- [ ] Ordinary technical catalogs remain flat lists; no invented lesson or chapter structure is added.
- [ ] Existing practice-hand lookup and preparation behavior remains compatible.
- [ ] Unit tests cover catalog metadata and keep existing practice-hand validation green.

## Blocked by

None - can start immediately.

## User stories covered

- 9. As a tester, I want practice hand ids visible, so that I can report exact reproducible situations.
- 11. As a maintainer, I want existing technical catalogs to remain visible, so that regression and domain-focused practice still works.
- 12. As a maintainer, I want ordinary catalogs to stay flat lists for now, so that we do not invent fake structure.
- 18. As a developer, I want the practice browser data to be testable outside the DOM, so that search/filter behavior is reliable.
- 20. As a teacher/tester, I want SMB1 and technical catalogs both visible, so that I can approach the same situation by course route or bridge topic.
