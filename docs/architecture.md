# Architectuur

Status: actueel
Scope: `bridge-app`

Dit document beschrijft de actuele architectuur en gewenste groeirichting van Bridgetafel: een build-vrije, statische bridge-leerapp waarin spelregels, biedafspraken, UI-flow en uitlegpaden gescheiden blijven zodat de app stap voor stap kan groeien zonder een grote rewrite.

## Doelen

- Beginners rustig door een volledige bridgehand leiden.
- Bridge-logica testbaar houden buiten de browser-UI.
- Bied-, speel- en scorebeslissingen uitlegbaar maken voor AI-suggesties, developer mode, review en toekomstige lesfeedback.
- De huidige NBB/Barry's Vijfkaart Hoog-afspraken behandelen als eerste conventieprofiel, niet als universele waarheid.
- De app build-vrij en makkelijk te deployen houden.
- Refactors klein houden en publieke entrypoints stabiel houden.

## Niet-doelen

- Geen volledige double-dummy engine op korte termijn.
- Geen claim dat AI-suggesties perfecte bridgeadviezen zijn.
- Geen grote frameworkmigratie zolang plain HTML/CSS/JS voldoende blijft.
- Geen uitgebreid tekstonderwijs in de normale basisgame; lange uitleg hoort in lesmodus, review, AI-suggesties of developer mode.

## Hoog-overzicht

```text
index.html / lessons/index.html / lessons/01-cards.html / lessons/02-card-valuation.html / lessons/03-openings.html / practice/index.html
  +-- laadt CSS en browser scripts in vaste volgorde
  +-- index bevat DOM-structuur voor tafel, bieding, dialogs en review
  +-- lessons bevat de rustige lespagina en start oefenhanden via index queryparameters
  +-- losse hoofdstukpagina's kunnen interactieve lesstappen tonen zonder de speeltafel te laden
  +-- practice is de aparte browserpagina voor de Oefenhandencatalogus en start handen via gewone hand-URL's

bridge-rules.js
  +-- public facade voor testbare bridge-regels
  +-- bundelt core, auction, scoring, bidding, play-plan en card-play

rules/
  +-- pure of grotendeels pure bridge-domeinlogica
  +-- CommonJS voor tests, browser globals voor appgebruik

scripts/
  +-- browser orchestration, UI state, rendering, copy en user actions
  +-- roept rules/ aan en rendert resultaten

practice-hands/
  +-- index/aggregator, SMB1-cursusdata en catalogus met reproduceerbare oefensituaties

tests/
  +-- unit tests voor regels en flows
  +-- Playwright smoke tests voor snelle beginnerflow en aparte browserregressie
```

## Runtime model

De app heeft geen build step. `index.html` laadt scripts direct in dependency order. Modules gebruiken een UMD-achtig patroon:

- In Node-tests exporteren ze via `module.exports`.
- In de browser registreren ze zichzelf op `globalThis`, meestal onder `BridgeRulesParts`, `BridgeRules`, of een specifieke app-global.

Dit houdt de app simpel, maar betekent dat scriptvolgorde een architectuurcontract is. Wijzigingen aan exports of scriptvolgorde moeten altijd met tests worden gecontroleerd.
`scripts/script-manifest.js` is het onderhoudsmanifest voor deze scriptgroepen; `tests/unit/script-order.test.js` valideert dat de HTML-pagina's dat manifest blijven volgen.

## Laagindeling

### 1. Domain/rules layer

Locatie: `rules/`

Verantwoordelijk voor bridge-inhoud die zonder DOM getest moet kunnen worden:

- kaartmodel, seats, teams, kwetsbaarheid en deal helpers;
- biedlegaliteit en veilingafronding;
- contract, declarer en scoreberekening;
- biedsysteemdispatch en Vijfkaart Hoog-regels;
- speelplanlogica;
- kaartlegaliteit en kaartkeuzeheuristieken.

Richtlijn:

- Houd functies zo veel mogelijk input-output gedreven.
- Resultaten van AI-keuzes moeten een `ruleId`, korte reden of uitlegbaar resultaat kunnen teruggeven.
- Nieuwe bridge-regels krijgen fixtures/unit tests met minimale punten/lengtes, prioriteiten en legale vervolgen.

Belangrijke entrypoints:

- `rules/core.js`
- `rules/auction.js`
- `rules/scoring.js`
- `rules/score-table.js`
- `rules/bidding/index.js`
- `rules/play-plan.js`
- `rules/card-play.js`
- `bridge-rules.js`

### 2. Bidding systems layer

Locatie: `rules/bidding/`

`rules/bidding/index.js` is de dispatcher. Het kiest een biedprofiel op basis van `systemId` en vult standaardafspraken aan met eventuele overrides.

Huidig profiel:

- `rules/bidding/systems/five-card-high/`

Belangrijke subdomeinen:

- `opening.js` - openingen.
- `responses.js` - antwoorden.
- `rebids.js` - herbiedingen.
- `competitive.js` - competitief bieden.
- `conventions.js` - conventiebetekenissen en defaults.
- `explanations-nl.js` - Nederlandse uitleg gekoppeld aan regelresultaten.
- `index.js` - profielentrypoint.

Architectuurregel: scheid contract, call-type en betekenis. Bijvoorbeeld: een `2D`-bod kan in context een transfer zijn en betekent dan niet letterlijk ruiten.

### 3. Play-plan en card-play layer

Locaties:

- `rules/play-plan.js`
- `rules/play-plan/`
- `rules/card-play.js`
- `rules/card-play/`

Doel:

- Eerst een zichtbaar, begrijpelijk speelplan maken.
- Daarna kaartadvies waar mogelijk aan dat plan koppelen.
- Verdedigingsregels klein en uitlegbaar houden.

Aanbevolen eigenaarschap:

- `rules/card-play.js` - compatibele orchestrator: bepaalt de kaartkeuzevolgorde in `chooseCardPlay`, maar houdt geen tweede handmatige helperexportlijst bij. De entrypoint compose't exports uit de card-play deelmodules automatisch en voegt `chooseCardPlay` toe.
- `rules/play-plan/common.js` - gedeelde tellingen, winners/losers en helpers.
- `rules/play-plan/endgame-runout.js` - zichtbare eindspelreeks-search die door sans-atout en kleurcontractplannen wordt gedeeld.
- `rules/play-plan/notrump.js` - sans-atout plannen.
- `rules/play-plan/suit-contract.js` - composer voor kleurcontractplannen; domeinlogica staat in `rules/play-plan/suit-contract/` voor basis/verliezers, troef-timing, introevers, snits en zijkleur/afgooiplannen.
- `rules/card-play/common.js` - gedeelde card-play context en result helpers.
- `rules/card-play/opening-leads.js` - uitkomsten.
- `rules/card-play/play-plan-following.js` - dispatcher voor kaartkeuzes die expliciet het plan volgen; domeinlogica staat in `rules/card-play/play-plan-following/` voor SA, introevers, troeven, zijkleur/afgooien en gedeelde planhelpers.
- `rules/card-play/declarer-play.js` - leider-specifieke heuristiek.
- `rules/card-play/defense.js` - basisverdediging.

Nieuwe kaartkeuzes moeten aangeven of ze zeker genoeg zijn voor feedback. Onzekere heuristiek mag als suggestie verschijnen, maar niet als harde lescorrectie.

Nieuwe card-play helpers horen in de passende deelmodule. Als ze alleen door tests, uitleg of tooling nodig zijn, exporteer ze daar; `rules/card-play.js` neemt ze automatisch mee via compositie. Alleen helpers die `chooseCardPlay` zelf aanroept hoeven in de orchestrator lokaal te worden gedestructureerd.

### 4. Browser app layer

Locatie: `scripts/`

Verantwoordelijk voor:

- DOM-referenties;
- app-state;
- user actions;
- rendering;
- instellingen;
- herhaalcode/situation restore;
- dialogs;
- feedbackrapportage.

Huidige kern:

- `scripts/app.js` - dunne bootstrap-shell: dependencies controleren, runtime maken, modules registreren, bootstrap starten, public API publiceren en de eerste hand/les starten.
- `scripts/app/runtime.js` - bouwt `BridgeAppRuntime` met `runtime.state`, `runtime.els`, `runtime.dom`, `runtime.constants`, `runtime.rules`, `runtime.transitions`, `runtime.media` en `runtime.timers`.
- `scripts/app/helpers.js` - gedeelde formatting-, seat-, kaart-, bied- en scorehelpers op `runtime.helpers`.
- `scripts/app/hand-start.js`, `scripts/app/bootstrap.js`, `scripts/app/public-api.js` - handstart/replay, top-level DOM-listeners en compatibele `BridgeApp`/`BridgeAppTestHooks`.
- `scripts/flow/` - veilingflow, contract reveal, kaartspelflow, legaliteit, automatic play, slagvoortgang en handafronding.
- `scripts/render/` - rendering per UI-deel, render-orchestratie, layout/status/guidance, zichtbare speelplantekst en scoretabel-UI.
- `scripts/state/` - pure state-transitions, afgeleide review-playback, localStorage settings, `situatieseed:` codec, herhaalcode en herstel.
- `scripts/ui/` - kleine UI-controllers voor app-menu, instellingen en dialogs.
- `scripts/feedback/` - feedbackdialog, rapportpayload, kopieer- en submitflow.
- `scripts/learning/` - lessen, lesson-start vanuit URL/oefenhand, standalone lespagina, gedeelde leskaartnavigatie, woordenlijst en bieduitleg voor AI-suggesties/review. `lessons.js` blijft de publieke `BridgeLessons`-facade; lesdefinities, cloning en validatie staan in `scripts/learning/catalog/`, tafeltaaklogica staat in `scripts/learning/table/`, en gedeelde standalone-leshelpers voor hand parsing/analyse, kaart-rendering en lespagina-links staan in `scripts/learning/shared/`. Rijke standalone lessen mogen eigen controllers houden, maar herbruikbare vraagsets en tafelkoppelingen horen in aparte data-modules zoals `lesson-02-valuation-data.js` en `lesson-03-openings-data.js`.
- `scripts/practice/` - UI-controller voor de aparte oefenhandenpagina. `browser-page.js` is alleen verantwoordelijk voor `practice/index.html`: controls vullen, routequery's lezen/schrijven, resultaten renderen en Start-hand-links naar de speeltafel maken.
- `scripts/copy/text-nl.js` - Nederlandse UI-copy.

Runtime/factory-contract:

- Browsermodules registreren zichzelf onder `globalThis.BridgeAppModules`, bijvoorbeeld `BridgeAppModules.registerPlayFlow(runtime)`.
- Modules lezen app-context via de ontvangen `runtime`; geen impliciete vrije `state`, `els`, `seats`, `slotEls`, `seatEls`, timers of layoutqueries.
- Flowmodules vullen vooral `runtime.actions`; rendermodules vullen vooral `runtime.render`; gedeelde kleine helpers horen in `runtime.helpers`.
- Public API-namen blijven compatibel via `BridgeApp`, `BridgeAppContext` en `BridgeAppTestHooks`, maar intern is `runtime` de enige app-context.

Richtlijn: `scripts/app.js` blijft alleen de shell. Nieuwe UI-flow hoort in de passende submap en registreert zichzelf via het runtime/factory-contract.

#### Herhaalcode-herstelcontract

De publieke herhaalcode is bij voorkeur een compacte `situatieseed:`. Die herstelt een volledig reproduceerbare spelsituatie bovenop de interne basis-seed voor de kaartverdeling. Het repeat-code veld staat alleen in developermodus. Gewone basis-seeds en oefenhand-id's blijven los laadbaar; kopieren en feedbackrapporten gebruiken de compacte situatieseed-vorm. Het minimale contract is dat laden van een situatieseed exact dezelfde engine-toestand oplevert voor:

- `dealSeed`, bordnummer, deler en kwetsbaarheid;
- oefenhand-context wanneer de seed naar een `practice-hands/` scenario verwijst;
- fase: bieden, contract tonen, spelen of complete hand;
- actuele beurt, inclusief de speler die na herstel aan zet is;
- volledig biedverloop, inclusief passen, contractbiedingen, doubletten, redoubletten, Stop en Alert;
- afgeleid contract, leider, dummy en uitkomsthand zodra de veiling klaar is;
- alle afgeronde slagen, lopende slag, slagentelling en winnaar per afgeronde slag;
- de pauzestand na een complete maar nog niet doorgeschoven slag;
- eindscore en resultaat wanneer de situatie een uitgespeelde of rondgepaste hand beschrijft.

Herstel mag afgeleide uitleg opnieuw berekenen in plaats van letterlijk opslaan: bied- en speelverklaringen, speelplan, AI-suggesties, statuscopy en reviewtekst moeten na herstel opnieuw uit regels en state kunnen ontstaan. Gebruikersinstellingen zoals developermodus, AI-suggesties en speelgeschiedenis horen niet in de situatieseed; ze blijven lokale voorkeuren. Als biedsystemen of persoonlijke conventies later instelbaar worden, moet de situatieseed ook het actieve conventieprofiel en de relevante afspraak-overrides vastleggen, zodat feedback reproduceerbaar blijft.

Compacte payloadvelden:

- `s`, `b`, `d`, `u`, `p`, `t` - basis-seed, bord, deler, kwetsbaarheid, fase en beurt.
- `a` - veiling als compacte arrays `[seat, call, stop?, alert?]`.
- `k`, `c`, `w` - afgeronde slagen, lopende slag en wacht-op-slagdoorschuifstatus.
- `x`, `r`, `m`, `l`, `e` - optioneel contract, leider, dummy, uitkomsthand en les-id.

### 5. Practice-hands layer

Locaties:

- `practice-hands/`
- `practice/index.html`
- `scripts/practice/`

Doel:

- `practice-hands/index.js` blijft de publieke aggregator.
- `practice-hands/smb1-course.js` bevat de JS-source-of-truth voor de 12 Start met Bridge 1-lessen en hun stabiele leerdoelen.
- `practice-hands/catalog/` bevat de Oefenhandencatalogus: reproduceerbare beginner-, test-, regressie- en cursusgerichte situaties.
- `practice-hands/catalog-model.js` is eigenaar van het DOM-onafhankelijke browse/filtermodel: catalogus-, focus-, niveau- en SMB1-lesfilters, zoektekst en facets.
- Elk oefenspel heeft een kort doel en een stabiele id.
- Oefenhanden verbinden productleren met testdekking.
- `practice/index.html` is de aparte practice browser page voor de SMB1-lesroute. Deze pagina toont eerst de 12 lessen en daarna per leerdoel of er al een interactieve tafeloefening beschikbaar is; de technische oefenhandencatalogus blijft beschikbaar via de bestaande JS-API.
- De SMB1-lesroute is gemodelleerd als cursusgerichte Oefenhandencatalogus `start-met-bridge-1`. Deze catalogus leeft naast de bestaande technische catalogi en naast bestaande App-lessen.
- Een App-les blijft een bestaande interactieve Bridgetafel-les met eigen huidige nummering en tafelkoppeling. Deze oefenhandencatalogus-feature hernummert of herstructureert bestaande App-lessen expliciet niet; een latere lesmigratie moet als apart project gebeuren.
- Een SMB1-oefenhand mag een bestaande bronhand hergebruiken via metadata zoals `sourceHandId`, zolang de SMB1-id, het SMB1-lesdoel en de engine-observeerbare verwachting stabiel blijven.

Aanbevolen patroon:

- Voeg oefenhanden toe wanneer een beginnerstest, bug of regelgat daarom vraagt.
- Houd ids stabiel; bestaande links en herhaalcodes mogen niet breken.
- Gebruik oefenhanden in unit tests en/of browser smoke tests wanneer ze regressierisico afdekken.
- Houd SMB1-lesroute, App-les en Oefenhandencatalogus in docs, metadata en UI-copy gescheiden: SMB1 ordent oefenhanden per cursusles, App-lessen blijven de bestaande interactieve lessen, en de Oefenhandencatalogus is de browsebare verzameling reproduceerbare handen.

### 6. Styling layer

Locaties:

- `styles.css`
- `styles/`

Doel:

- `styles.css` blijft de compatibility/aggregator entrypoint voor bestaande laadvolgorde.
- `styles/` bevat domeingerichte CSS: base, layout, table, auction, dialogs, review en responsive gedrag.
- `styles/card.css` bevat de gedeelde visuele kaartbasis; gameplay voegt daar `.card`-gedrag aan toe, lessen gebruiken eigen lesson-classes bovenop `.playing-card`.
- `styles/lesson-cards.css` bevat de gedeelde kaartnavigatie voor losse lespagina's; les-specifieke stylesheets zoals `lesson-hand-valuation.css` en `lesson-openings.css` voegen alleen inhoudelijke layout en oefenvormen toe.
- Component-specifieke responsive regels mogen naast het domeinbestand staan; `styles/auction-responsive.css` is eigenaar van biedtafel-, bidbox- en auction-log-responsiveness.

Richtlijn:

- Houd visuele states voorspelbaar: beurt, legaliteit, dummyzichtbaarheid, trick pause, developer-only en dialogs.
- Algemene responsive layout blijft in `styles/responsive.css`; domeinspecifieke responsive regels horen bij hun domein wanneer dat onderhoudbaarheid verbetert.
- Voorkom dat CSS utility/layout-regels browsersemantiek zoals `[hidden]` breken.

## State model

De centrale runtime state wordt gemaakt in `scripts/app/runtime.js` en leeft tijdens de app-run op `runtime.state`. Belangrijke velden:

- `phase` - idle, bidding, contract-reveal, playing, complete.
- `hands`, `originalHands` - actuele en oorspronkelijke kaarten.
- `auction`, `contract`, `declarer`, `dummy` - veilingresultaat.
- `currentTrick`, `trickHistory`, `tricks` - speelverloop.
- `reviewCursor` - afgeleide kaart-voor-kaart replaypositie na afloop; verandert geen echte hand-, slag- of scorestate.
- `playPlan`, `playExplanations` - uitlegbare speelkeuzes.
- `dealSeed`, `practice`, `feedbackStatus` - reproduceerbaarheid en feedback.
- `developerMode`, `guidanceMode`, `showPlayHistory` - UX-instellingen.

Gewenste richting:

```text
user action
  -> pure transition waar mogelijk
  -> rules/ berekent bridge-inhoud
  -> state wordt beperkt aangepast
  -> render-functies tekenen afgeleide UI opnieuw
```

Nieuwe kernacties moeten bij voorkeur eerst als pure transition ontworpen worden, daarna pas aan DOM/UI gekoppeld worden.
Huidige eerste transitions staan in `scripts/state/state-transitions.js` voor handstart, bieding toepassen, veilingcontext afronden, rondpas, kaart spelen, slag doorschuiven en hand afronden.

## Uitleg-architectuur

Uitleg is geen bijzaak; het is een productlaag bovenop de engine.

```text
rules decision
  -> ruleId / reason / planAction
  -> explanation lookup or formatter
  -> AI suggestion, developer mode, review, lesson feedback
```

Afspraken:

- Elke nieuwe bied- of speelregel moet een uitlegpad hebben.
- AI-suggesties zijn kort en voorzichtig geformuleerd.
- Developer mode mag technisch en uitgebreider zijn.
- Review mag achteraf meer context geven.
- Toekomstige lesfeedback mag alleen harde correcties geven wanneer de engine dat betrouwbaar kan onderbouwen.

Coverage-contract:

- `tests/unit/rule-copy-coverage.test.js` draait mee met `npm run test:unit` via `tests/run-tests.js`.
- De test haalt belangrijke `ruleId`s uit bestaande unit- en browsertests.
- `fiveCardHigh.*` regels moeten Nederlandse bieduitleg hebben in `rules/bidding/systems/five-card-high/explanations-nl.js`.
- Kaartspelregels moeten Nederlandse speeluitleg hebben in `scripts/flow/play-flow.js`.
- `playPlan.*` regels mogen hun copy hebben in `scripts/flow/play-flow.js` of in de zichtbare speelplantekst van `scripts/render/play-plan.js`.
- Voeg bij nieuwe engine-regels dus altijd samen toe: regel/heuristiek, fixture met verwachte `ruleId`, en het bijbehorende uitlegpad.

## Teststrategie

Testlagen:

- Unit tests: `tests/unit/`
- Snelle browser smoke tests: `tests/browser/smoke.spec.js`
- Brede browserregressie: `tests/browser/regression.spec.js`
- Referentie/concordance tests: `tests/reference/`

Commandos:

```powershell
npm run test:unit
npm run test:browser
npm run test:browser:regression
npm run test:browser:all
npm run test:full
npm test
```

Richtlijn:

- Bridge-regels: unit tests.
- Kritieke browserflow of visuele beginnerflow: snelle Playwright smoke.
- Brede UI-, les-, glossary-, review- en restore-dekking: browserregressie.
- `npm test`: snelle dev/CI-gate met unit tests plus browser smoke.
- `npm run test:full`: unit tests plus alle browsertests.
- Scriptvolgorde en public API: gerichte unit tests.
- RuleId/uitleg-koppeling: `rule-copy-coverage.test.js`.
- Nieuwe oefenhanden: catalogusvalidatie plus waar nuttig een scenario-test.

## Deployment

De app blijft een static site:

- geen bundler;
- geen server-side runtime;
- assets en scripts direct hostbaar;
- GitHub Pages of elke statische host is voldoende.

Zie `DEPLOY.md` voor hostingdetails.

## Belangrijkste architectuurrisico's

1. Scriptvolgorde en runtime-registraties blijven fragiel door de build-vrije architectuur.  
   Mitigatie: `script-order.test.js`, duidelijke `BridgeAppModules.register...` functies en harde dependency-errors in `scripts/app.js`.

2. Biedprofielbestanden worden groot, vooral `rebids.js`, `competitive.js` en `explanations-nl.js`.  
   Mitigatie: splitsen per auction family wanneer eraan gewerkt wordt, niet als losse megarewrite.

3. Uitleg kan losraken van engine-regels.  
   Mitigatie: `rule-copy-coverage.test.js` bewaakt dat geteste `ruleId`s een Nederlands uitlegpad houden.

4. Public API en test hooks kunnen ongemerkt afwijken van browsermodules.  
   Mitigatie: `scripts/app/public-api.js` als enige public API-builder en browser-smoke met `BridgeAppTestHooks`.

5. Beginner-UX kan overladen raken door developer/testfunctionaliteit.  
   Mitigatie: normale flow compact houden; geavanceerde uitleg in developer mode, review, lessen of woordenlijst.

## Voorgestelde conventies

### Nieuwe rule toevoegen

1. Voeg pure logica toe in het juiste `rules/` subdomein.
2. Geef resultaat een duidelijke `ruleId` of reden.
3. Voeg Nederlandse uitleg toe waar de UI die kan tonen.
4. Voeg unit fixtures toe voor minimumgevallen, prioriteit en de verwachte `ruleId`.
5. Verbind pas daarna aan browserflow of AI-suggestie.

### Nieuwe UI-flow toevoegen

1. Houd statewijziging klein en centraal.
2. Gebruik bestaande render-modules of maak een gerichte nieuwe module.
3. Voeg alleen tekst toe aan de basisgame als het echt nodig is.
4. Voeg smoke coverage toe als de beginnerflow verandert.

### Nieuwe les/oefenhand toevoegen

1. Voeg oefenhand toe met stabiele id en leerdoel.
2. Valideer catalogus via tests.
3. Koppel lescopy aan concrete engine-uitleg waar mogelijk.
4. Gebruik geen harde foutfeedback als de engine onzeker is.

## Aanbevolen volgende stappen

1. Bespreek of deze laagindeling klopt als gewenste richting.
2. Voeg een klein `docs/decisions.md` toe voor architectuurbesluiten, bijvoorbeeld build-vrij blijven en facade stabiel houden.
3. Houd toekomstige app-uitbreidingen aan het runtime/factory-contract en voorkom nieuwe impliciete app-globals.
4. Splits grote Vijfkaart Hoog-bestanden alleen wanneer een concreet roadmapitem dat gebied raakt.
5. Houd nieuwe `ruleId`-fixtures gekoppeld aan Nederlandse uitleg, zodat de coverage-test nuttig blijft.
