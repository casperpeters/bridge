# PRD: Oefenhanden-catalogus

## Problem Statement

Bridgetafel heeft al losse oefenhanden en bestaande app-lessen, maar er is nog geen rustige, vindbare oefenhanden-catalogus waarmee spelers of testers gericht situaties kunnen kiezen. Daarnaast moet `Start met Bridge 1` als cursusgerichte route kunnen bestaan naast de huidige app-lesroute, zonder dat de bestaande lessen meteen hernummerd of herbouwd worden.

De gebruiker wil oefenhanden kunnen vinden op basis van catalogus, SMB1-les, focus/type en zoekterm, en daarna direct een hand starten.

## Solution

Voeg een aparte oefenhandenpagina toe met globale zoekfunctie en filters. De pagina toont alle bestaande oefenhandencatalogi als platte lijsten en voegt `Start met Bridge 1` toe als cursusgerichte ingang met lessen 1-12.

SMB1-oefenhanden mogen bestaande geteste oefenhanden hergebruiken via een eigen stabiele SMB1-id en `sourceHandId`. De huidige app-lessen blijven voorlopig ongewijzigd. Een oefenhand start via een gewone hand-URL, zonder bestaande lesmodus te misbruiken.

## User Stories

1. As a beginner, I want to open "Oefenhanden" from the menu, so that I can practice specific bridge situations.
2. As a beginner, I want a separate practice page, so that browsing practice hands does not clutter the game table.
3. As a beginner, I want to search all practice hands globally, so that I can find topics like "troef trekken" without knowing the catalog.
4. As a beginner, I want to filter by catalog, so that I can choose between bidding, defense, play-plan, scoring, and SMB1.
5. As a beginner, I want SMB1 to show lessons 1-12, so that the structure matches my course material.
6. As a beginner, I want to click an SMB1 lesson, so that I see only the hands for that lesson.
7. As a beginner, I want each practice hand card to show a short goal, so that I know what I am practicing.
8. As a beginner, I want a clear "Start hand" action, so that I can begin without understanding developer tools.
9. As a tester, I want practice hand ids visible, so that I can report exact reproducible situations.
10. As a tester, I want source hand ids visible for SMB1 reused hands, so that I can see when two entries share the same deal.
11. As a maintainer, I want existing technical catalogs to remain visible, so that regression and domain-focused practice still works.
12. As a maintainer, I want ordinary catalogs to stay flat lists for now, so that we do not invent fake structure.
13. As a maintainer, I want SMB1 catalog metadata validated, so that every SMB1 hand remains course-structured.
14. As a maintainer, I want every SMB1 lesson to have at least one hand, so that the route is complete.
15. As a maintainer, I want every SMB1 App-focus goal covered by at least one engine-backed hand, so that "complete coverage" is meaningful.
16. As a maintainer, I want existing hands reusable under SMB1 ids, so that deal maintenance stays small.
17. As a maintainer, I want the current app-lessons left alone, so that lesson restructuring can happen later as a deliberate project.
18. As a developer, I want the practice browser data to be testable outside the DOM, so that search/filter behavior is reliable.
19. As a developer, I want browser smoke coverage for the menu and practice page, so that the new navigation does not regress.
20. As a teacher/tester, I want SMB1 and technical catalogs both visible, so that I can approach the same situation by course route or bridge topic.

## Implementation Decisions

- Add a separate practice browser page rather than a modal.
- Add a menu entry labelled "Oefenhanden" that links to the practice browser page.
- Treat SMB1 as a course-oriented catalog layer, not as a replacement for current app-lessons.
- Preserve existing app-lesson numbering and lesson mode for now.
- Add SMB1 metadata to practice hands: course, lesson, topic, goal, expected focus, expected actions, review focus, and source hand id where reused.
- Allow SMB1 hands to reuse existing tested scenarios under new stable SMB1 ids.
- Show all existing catalogs as ordinary flat lists.
- Show SMB1 with lesson filters/lesson overview.
- Make search global across all catalogs.
- Make filters composable: catalog, SMB1 lesson, focus/type, and level.
- Keep practice hand cards compact: title, catalog, SMB1 lesson where applicable, goal, tags/focus, id/source id, and Start hand.
- Start hands through ordinary hand URLs, not lesson-mode URLs.
- Use the existing practice hand preparation and repeatable hand infrastructure.
- Keep long explanations out of the browser cards; teaching points and engine details remain for review, AI suggestions, developer mode, or later detail views.

## Testing Decisions

- Unit tests should validate catalog structure and search/filter behavior through public APIs, not DOM internals.
- SMB1 validation should check course metadata, lesson range, required fields, source hand existence, and per-lesson coverage.
- SMB1 tests should encode the 12 lesson labels as constants instead of parsing Markdown.
- Existing practice-hand tests should continue to verify engine expectations for auctions, play plans, card-play and scoring.
- Browser smoke should cover menu link, practice page load, global search, catalog filter, SMB1 lesson filter, and starting a hand.
- Required acceptance commands: `npm run test:unit` and `npm run test:browser`.

## Out of Scope

- Renumbering or restructuring existing app-lessons into SMB1.
- Adding a full lesson mode for SMB1 practice hands.
- Creating fake basis/grens/contrast hands for every lesson.
- Building detailed hand explanation pages.
- Changing bidding or card-play engine rules unless a reused fixture exposes a real bug.
- Full browser regression suite unless smoke tests reveal risk.

## Further Notes

The key domain distinction is now: **SMB1-lesroute** is the course structure from `docs/smb1.md`; **App-les** is the current Bridgetafel lesson structure; **Oefenhandencatalogus** is the reusable hand layer. These should remain separate until a later deliberate lesson-route migration.
