# Agent Task Rules

Status: procedureel hulpmiddel
Scope: taaktype-specifieke werkinstructies voor AI-agenten

Gebruik dit document wanneer het taaktype onduidelijk of risicovol is. Dit is
geen domeindocument, architectuurdocument of roadmap.

## Bronnen Per Onderwerp

- Projectrouting en contextbudget: `AGENTS.md`
- Runnen, installeren, testen en deployen: `README.md`
- Open roadmapwerk: `TODO.md`
- Architectuur, modulegrenzen en documentenstructuur: `docs/architecture.md`
- Vijfkaart-Hoog biedafspraken: `docs/vijfkaart-hoog-systeem.md`
- Promptsjablonen: `docs/ai-prompts.md`

## Bugfix

- Reproduceer eerst met de opgegeven seed, practice hand of browserflow.
- Als de bug niet direct reproduceerbaar is, maak waar zinvol een kleine
  falende test of fixture.
- Fix klein en gericht; voorkom opportunistische refactors.
- Voeg regressiedekking toe wanneer het gedrag stabiel te vangen is.
- Controleer of feedback/repeat codes reproduceerbaar blijven wanneer de bug
  daar verband mee heeft.

## Biedregel

- Lees `docs/vijfkaart-hoog-systeem.md`.
- Werk regel, uitlegpad en tests/fixtures samen bij.
- Scheid contract, call-type en betekenis consequent.
- Test minimumgevallen, grenswaarden, prioriteit tussen alternatieven en legale
  vervolgen.
- Behandel nieuwe afspraken als profielspecifiek voor het huidige
  Vijfkaart-Hoog-profiel.
- Voeg alleen gebruikerswaarschuwingen toe als de app de afwijking betrouwbaar
  kan bepalen.

## Speelregel Of Kaartadvies

- Werk ruleId/reason, Nederlandse uitleg en tests/fixtures samen bij.
- Koppel leideradvies waar mogelijk aan het zichtbare speelplan.
- Geef alleen harde feedback als de heuristiek betrouwbaar genoeg is.
- Houd onzekere heuristiek als suggestie, niet als absolute correctie.
- Test kleur bekennen, troeven, uitkomst, tweede/derde hand, afgooien,
  leiderplan of verdediging afhankelijk van de wijziging.

## UI-Flow

- Houd normale gameplay rustig, visueel en compact.
- Zet uitgebreide uitleg alleen in developer mode, AI-suggesties, review,
  woordenlijst of lesmodus.
- Claim in UI-copy niet meer zekerheid dan de engine kan onderbouwen.
- Controleer desktop en mobiel als layout, flow of beginnerbegrip verandert.
- Voeg browser smoke of regressiedekking toe wanneer de beginnerflow zichtbaar
  wijzigt.

## Oefenhand Of Les

- Gebruik stabiele practice-hand-id's en een kort leerdoel.
- Houd oefenhanden reproduceerbaar met id, seed of `situatieseed:`.
- Koppel lescopy aan bestaande engine-uitleg waar mogelijk.
- Voeg alleen keuze-feedback toe wanneer de engine die betrouwbaar kan
  onderbouwen.
- Houd SMB1-lesroute, App-les en Oefenhandencatalogus taalkundig gescheiden.

## Refactor

- Lees `docs/architecture.md`.
- Houd gedrag gelijk tenzij de taak expliciet gedrag wijzigt.
- Houd public API's via `bridge-rules.js`, `BridgeApp`, `BridgeAppContext`,
  `BridgeAppTestHooks` en aggregator-bestanden stabiel.
- Verplaats code alleen wanneer overzicht of testbaarheid echt verbetert.
- Houd wijzigingen klein genoeg om met een gerichte testset te verifieren.
- Laat scriptvolgorde en browser-globals niet impliciet veranderen.

## Testwerk

- Kies de kleinste testset die het risico afdekt.
- Unit tests zijn leidend voor pure regels en state-transitions.
- Browser smoke is passend voor zichtbare beginnerflow.
- Browser regression is passend voor brede UI-, les-, restore- of reviewrisico's.
- Zeg expliciet welke tests zijn gedraaid en welke niet.

## Review

- Neem een code-review houding aan: bevindingen eerst.
- Prioriteer bugs, regressierisico's, ontbrekende tests en onduidelijke
  contracten.
- Onderbouw bevindingen met file/line referenties.
- Houd stijlvoorkeuren ondergeschikt aan echt risico.
- Als er geen bevindingen zijn, zeg dat duidelijk en benoem resterende
  testgaten of risico's.
