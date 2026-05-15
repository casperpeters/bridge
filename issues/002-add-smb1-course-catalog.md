# Add SMB1 Course Catalog With Engine-Verified Hands

## What to build

Add a `Start met Bridge 1` oefenhandencatalogus with stable SMB1 ids, lesson 1-12 metadata, topic/goal/review metadata, and complete App-focus coverage from the SMB1 structure. Existing tested hands should be reused where they fit via `sourceHandId`.

Use the `bridge-practice-hand-builder` skill for selecting, reusing, designing, or repairing hands. Each SMB1 learning goal must agree with the implemented engine, the Vijfkaart Hoog system documentation, the explanation path, and the expected test outcome.

## Acceptance criteria

- [ ] Every SMB1 hand has `course: "start-met-bridge-1"`.
- [ ] Every SMB1 hand has a stable `smb1-lesXX-...` id.
- [ ] Every SMB1 hand has lesson, topic, goal, expected focus, expected actions, and review focus metadata.
- [ ] Reused hands include a valid `sourceHandId`.
- [ ] Each SMB1 hand has an engine-observable expectation: bid plus `ruleId`, play-plan priority, card-play plus `ruleId`, or score component.
- [ ] Every SMB1 lesson 1-12 has at least one hand.
- [ ] Every App-focus learning goal from the SMB1 structure is covered by at least one engine-backed hand.
- [ ] Existing hands are searched first and reused where they fit.
- [ ] New or repaired hands are validated with the bridge-practice-hand-builder validation flow and then with `npm run test:unit`.
- [ ] Conflicts between SMB1 lesson intent, system documentation, engine behavior, and explanation coverage are explicitly noted or resolved with a narrower learning goal.

## Blocked by

- `001-expose-practice-catalog-metadata.md`

## User stories covered

- 5. As a beginner, I want SMB1 to show lessons 1-12, so that the structure matches my course material.
- 6. As a beginner, I want to click an SMB1 lesson, so that I see only the hands for that lesson.
- 10. As a tester, I want source hand ids visible for SMB1 reused hands, so that I can see when two entries share the same deal.
- 13. As a maintainer, I want SMB1 catalog metadata validated, so that every SMB1 hand remains course-structured.
- 14. As a maintainer, I want every SMB1 lesson to have at least one hand, so that the route is complete.
- 15. As a maintainer, I want every SMB1 App-focus goal covered by at least one engine-backed hand, so that "complete coverage" is meaningful.
- 16. As a maintainer, I want existing hands reusable under SMB1 ids, so that deal maintenance stays small.
- 17. As a maintainer, I want the current app-lessons left alone, so that lesson restructuring can happen later as a deliberate project.
- 20. As a teacher/tester, I want SMB1 and technical catalogs both visible, so that I can approach the same situation by course route or bridge topic.
