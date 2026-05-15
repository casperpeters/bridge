# Document Practice Catalog Architecture

## What to build

Update lightweight project documentation so future work keeps the distinction between SMB1-lesroute, App-les, and Oefenhandencatalogus clear. Document the practice browser as the visible entrypoint for browsing oefenhanden, and keep app-lesson restructuring explicitly out of this slice.

## Acceptance criteria

- [ ] Architecture documentation explains that the practice browser is a separate page for browsing oefenhanden.
- [ ] Architecture documentation explains that SMB1 is a cursusgerichte oefenhandencatalogus naast existing App-lessen.
- [ ] Documentation states that existing app-lessons are not renumbered or restructured in this feature.
- [ ] TODO/roadmap documentation is updated only if a roadmap item is genuinely made more concrete or completed.
- [ ] The domain language remains consistent with SMB1-lesroute, App-les, and Oefenhandencatalogus.

## Blocked by

- `002-add-smb1-course-catalog.md`
- `003-build-practice-browser-page-with-global-search.md`
- `004-add-smb1-lesson-navigation-to-practice-browser.md`

## User stories covered

- 13. As a maintainer, I want SMB1 catalog metadata validated, so that every SMB1 hand remains course-structured.
- 15. As a maintainer, I want every SMB1 App-focus goal covered by at least one engine-backed hand, so that "complete coverage" is meaningful.
- 17. As a maintainer, I want the current app-lessons left alone, so that lesson restructuring can happen later as a deliberate project.
- 18. As a developer, I want the practice browser data to be testable outside the DOM, so that search/filter behavior is reliable.
