# AGENTS.md - Bridge-app

Compacte werkinstructies voor AI-agenten in deze repo. Dit bestand is een
routeringsdocument: houd het klein en zet details in de juiste bronbestanden.

## Projectkern

`bridge-app` is een build-vrije bridge-leerapp. De speler zit Zuid, biedt met
AI-partner/tegenstanders, speelt een hand uit en kan daarna bieding, slagen en
score reviewen.

Beginner-UX gaat voor: normale gameplay blijft rustig, visueel en compact.
Uitgebreide uitleg hoort alleen in developer mode, AI-suggesties, review,
woordenlijst of lesmodus.

Het huidige biedprofiel is NBB/Barry's Vijfkaart Hoog met afspraken uit
`Start met Bridge 1 & 2`. Behandel dit als het eerste conventieprofiel, niet
als universele bridgewaarheid.

## Contextbudget

- Lees naast dit bestand alleen documenten die nodig zijn voor het taaktype.
- Open geen gelinkte docs uit gewoonte.
- Gebruik `rg` voor gerichte inspectie.
- Vat lange bronnen samen; plak geen grote bestandsinhoud in de chat.
- Verwijs naar bestanden, testnamen, oefenhand-id's en `situatieseed:` codes in
  plaats van lange context te kopieren.

## Basisflow

1. Start met `git status --short` en lees dit bestand.
2. Bepaal het taaktype: simpele vraag/commandotaak, bugfix, biedregel,
   speelregel, UI-flow, oefenhand/les, refactor, testwerk of review.
3. Lees alleen de relevante bron:
   - roadmap/planning: `TODO.md`
   - architectuur, modulegrenzen of documentenstructuur: `docs/architecture.md`
   - Vijfkaart-Hoog biedafspraken: `docs/vijfkaart-hoog-systeem.md`
   - run/test/deploy details: `README.md`
   - brede of vage prompt: `docs/ai-prompts.md`
   - onduidelijk of risicovol taaktype: `docs/agent-task-rules.md`
4. Inspecteer gericht met `rg` en relevante bestanden.
5. Reproduceer bugs of maak een kleine falende test waar zinvol.
6. Wijzig klein en volgens bestaande patronen.
7. Draai de kleinste zinvolle testset.
8. Sluit af met gewijzigde bestanden, tests/resultaat, risico's en de logische
   volgende stap.

## Taakroutering

- Biedwerk: lees `docs/vijfkaart-hoog-systeem.md`; werk regel, uitlegpad en
  tests/fixtures samen bij.
- Speelwerk: werk ruleId/reason, uitlegpad en tests/fixtures samen bij.
- UI-flow: houd basisgame compact; controleer desktop en mobiel wanneer layout
  of beginnerflow verandert.
- Refactor: lees `docs/architecture.md`; houd public API's en aggregator-
  entrypoints stabiel.
- Roadmap: `TODO.md` is de enige bron van waarheid voor open roadmapwerk.
- Feedbacksheet-werk: gebruik de bridge-feedback-sheet skill wanneer de taak om
  feedbackrijen, statussen, oorzaken of fixvoorstellen gaat.
- Oefenhanden: gebruik de bridge-practice-hand-builder skill wanneer je
  reproduceerbare practice hands of `situatieseed:` codes maakt of repareert.
- Architectuurverbetering: gebruik de improve-codebase-architecture skill; voer
  eerst de afgesproken grilling loop voordat je bestanden wijzigt.

## Testkeuze

Kies de kleinste zinvolle testset:

- regels/logica: `npm run test:unit`
- zichtbare beginnerflow: `npm run test:browser`
- brede UI/regressie: `npm run test:browser:regression` of
  `npm run test:browser:all`
- snelle gate: `npm test`

Zie `README.md` voor installatie, Playwright-projectnamen, full test,
feedback-live tests en Remotion-commando's.

## Veiligheid

- Claim tests alleen als je ze echt hebt gedraaid en output hebt gezien.
- Respecteer bestaande uncommitted changes; revert niets zonder expliciete
  opdracht.
- Gebruik geen destructieve git- of filesystem-acties zonder expliciete
  toestemming.
- Raak bestaande wijzigingen niet aan tenzij ze nodig zijn voor de taak. Werk
  ermee, niet eroverheen.
- Houd contextbestanden klein; geen sessielogs in docs.
