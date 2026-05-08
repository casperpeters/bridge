# AI-prompts

Status: levend hulpmiddel
Scope: `bridge-app`

Dit document is een promptbibliotheek voor terugkerende AI-agenttaken in deze repo. Het vervangt geen instructies:

- `AGENTS.md` blijft leidend voor werkwijze en projectafspraken.
- `TODO.md` blijft leidend voor open roadmapwerk.
- `docs/architecture.md` blijft leidend voor architectuur en module-indeling.

Gebruik deze prompts als startpunt en vul altijd concrete context in: practice-hand-id, situation seed, verwachte uitkomst, actuele uitkomst, relevante bestanden of testcommando.

## Basisprompt

```text
Taak:

Context:

Verwacht gedrag:

Huidig gedrag:

Acceptatiecriterium:

Verificatie:
```

## Bugfix

```text
Onderzoek en fix deze bug klein en gericht.

Reproduceer eerst met de opgegeven seed/practice hand of maak een minimale falende test.
Lees `README.md`, `TODO.md`, `AGENTS.md` en `docs/architecture.md`.
Werk met bestaande patronen en behoud beginner-UX compact.

Bug:

Stappen om te reproduceren:

Verwacht:

Actueel:

Verificatie:
```

## Biedregel

```text
Voeg of corrigeer deze biedregel voor het huidige Vijfkaart-Hoog-profiel.

Houd contract, call-type en betekenis gescheiden.
Werk regel, uitlegpad en fixtures samen bij.
Behandel deze afspraak als profielspecifiek, niet als universele bridgewaarheid.

Situatie/auction:

Hand/range:

Verwachte bieding:

Waarom volgens systeem:

Verificatie:
```

## Speelregel of kaartadvies

```text
Voeg of corrigeer deze speelregel/kaartadviesheuristiek.

Koppel leideradvies waar mogelijk aan het zichtbare speelplan.
Geef alleen harde feedback als de heuristiek betrouwbaar genoeg is.
Werk ruleId/reason, Nederlandse uitleg en tests/fixtures samen bij.

Contract en leider:

Dummy/hand/speelverloop:

Verwachte kaart of planactie:

Waarom:

Verificatie:
```

## UI-flow

```text
Pas deze UI-flow klein en gericht aan.

Houd de normale gameplay rustig en visueel.
Zet uitgebreide uitleg alleen in developer mode, AI-suggesties, review, woordenlijst of lesmodus.
Controleer desktop en mobiel als de layout of beginnerflow verandert.

Flow:

Probleem:

Gewenst gedrag:

Acceptatiecriterium:

Verificatie:
```

## Oefenhand of les

```text
Voeg een reproduceerbare oefensituatie toe.

Gebruik een stabiele practice-hand-id en een kort leerdoel.
Koppel lescopy aan bestaande engine-uitleg waar mogelijk.
Voeg alleen keuze-feedback toe als de engine die betrouwbaar kan onderbouwen.

Leerdoel:

Gewenste situatie:

Verwachte actie:

Reviewpunt:

Verificatie:
```

## Refactor

```text
Voer deze refactor klein en compatibel uit.

Behoud public API's via `bridge-rules.js` en aggregator-bestanden.
Verplaats code alleen naar een gerichte module als dat overzicht of testbaarheid verbetert.
Laat gedrag gelijk en draai de kleinst zinvolle regressietests.

Te verbeteren gebied:

Waarom nu:

Grenzen van de wijziging:

Verificatie:
```

## Review

```text
Review deze wijziging als code-review.

Prioriteer bugs, regressierisico's, ontbrekende tests en onduidelijke contracten.
Geef bevindingen eerst, met file/line referenties.
Houd stijlvoorkeuren ondergeschikt aan echt risico.

Scope:

Waar extra op letten:
```

## Prompt-checklist

- Noem altijd concrete input: seed, practice-hand-id, auction, contract, kaartpositie of browserflow.
- Beschrijf verwacht gedrag en huidig gedrag apart.
- Geef aan welke test of browsercheck bewijs moet leveren.
- Vraag bij bied- of speelwerk expliciet om uitlegpad en fixtures.
- Vraag bij UI-werk expliciet om desktop/mobiel-check als de flow zichtbaar verandert.
- Vermijd brede prompts zoals "maak de AI beter" zonder concrete situatie of regressietest.
