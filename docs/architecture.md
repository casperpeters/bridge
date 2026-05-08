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
index.html
  +-- laadt CSS en browser scripts in vaste volgorde
  +-- bevat DOM-structuur voor tafel, bieding, dialogs en review

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
  +-- index/aggregator en catalogus met reproduceerbare oefensituaties

tests/
  +-- unit tests voor regels en flows
  +-- Playwright smoke tests voor echte beginnerflow
```

## Runtime model

De app heeft geen build step. `index.html` laadt scripts direct in dependency order. Modules gebruiken een UMD-achtig patroon:

- In Node-tests exporteren ze via `module.exports`.
- In de browser registreren ze zichzelf op `globalThis`, meestal onder `BridgeRulesParts`, `BridgeRules`, of een specifieke app-global.

Dit houdt de app simpel, maar betekent dat scriptvolgorde een architectuurcontract is. Wijzigingen aan exports of scriptvolgorde moeten altijd met tests worden gecontroleerd.

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
- `rules/play-plan/notrump.js` - sans-atout plannen.
- `rules/play-plan/suit-contract.js` - kleurcontractplannen.
- `rules/card-play/common.js` - gedeelde card-play context en result helpers.
- `rules/card-play/opening-leads.js` - uitkomsten.
- `rules/card-play/play-plan-following.js` - kaartkeuzes die expliciet het plan volgen.
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
- seed/situation restore;
- dialogs;
- feedbackrapportage.

Huidige kern:

- `scripts/app.js` - bootstrap, gedeelde state, DOM refs, shared helpers en top-level orchestration.
- `scripts/flow/` - veilingflow, kaartspelflow, legaliteit, automatic play en slagvoortgang.
- `scripts/render/` - rendering per UI-deel, zichtbare speelplantekst en scoretabel-UI.
- `scripts/state/` - pure state-transitions, localStorage settings, `situatieseed:` codec, repeat-code, situation seed en herstel.
- `scripts/learning/` - lessen, woordenlijst en bieduitleg voor AI-suggesties/review.
- `scripts/copy/text-nl.js` - Nederlandse UI-copy.

Richtlijn: `scripts/app.js` mag bootstrap en gedeelde infrastructuur blijven, maar nieuwe UI-flow hoort waar mogelijk in de passende submap. Als een flow groeit, eerst extracten naar een gerichte module in plaats van `app.js` groter maken.

#### Situatieseed-herstelcontract

Een gewone herhaalcode herstelt alleen de kaartverdeling of een oefenhand. Een `situatieseed:` herstelt een volledig reproduceerbare spelsituatie bovenop die basis. Het minimale contract is dat laden van een situatieseed exact dezelfde engine-toestand oplevert voor:

- `dealSeed`, bordnummer, deler en kwetsbaarheid;
- oefenhand-context wanneer de seed naar een `practice-hands/` scenario verwijst;
- fase: bieden, spelen of complete hand;
- actuele beurt, inclusief de speler die na herstel aan zet is;
- volledig biedverloop, inclusief passen, contractbiedingen, doubletten, redoubletten, Stop en Alert;
- afgeleid contract, leider, dummy en uitkomsthand zodra de veiling klaar is;
- alle afgeronde slagen, lopende slag, slagentelling en winnaar per afgeronde slag;
- de pauzestand na een complete maar nog niet doorgeschoven slag;
- eindscore en resultaat wanneer de situatie een uitgespeelde of rondgepaste hand beschrijft.

Herstel mag afgeleide uitleg opnieuw berekenen in plaats van letterlijk opslaan: bied- en speelverklaringen, speelplan, AI-suggesties, statuscopy en reviewtekst moeten na herstel opnieuw uit regels en state kunnen ontstaan. Gebruikersinstellingen zoals developermodus, AI-suggesties en speelgeschiedenis horen niet in de situatieseed; ze blijven lokale voorkeuren. Als biedsystemen of persoonlijke conventies later instelbaar worden, moet de situatieseed ook het actieve conventieprofiel en de relevante afspraak-overrides vastleggen, zodat oude feedback reproduceerbaar blijft.

### 5. Practice-hands layer

Locatie: `practice-hands/`

Doel:

- `practice-hands/index.js` blijft de publieke aggregator.
- `practice-hands/catalog/` bevat reproduceerbare beginner-, test- en regressiesituaties.
- Elk oefenspel heeft een kort doel en een stabiele id.
- Oefenhanden verbinden productleren met testdekking.

Aanbevolen patroon:

- Voeg oefenhanden toe wanneer een beginnerstest, bug of regelgat daarom vraagt.
- Houd ids stabiel; bestaande links en repeat-codes mogen niet breken.
- Gebruik oefenhanden in unit tests en/of browser smoke tests wanneer ze regressierisico afdekken.

### 6. Styling layer

Locaties:

- `styles.css`
- `styles/`

Doel:

- `styles.css` blijft de compatibility/aggregator entrypoint voor bestaande laadvolgorde.
- `styles/` bevat domeingerichte CSS: base, layout, table, auction, dialogs, review en responsive gedrag.

Richtlijn:

- Houd visuele states voorspelbaar: beurt, legaliteit, dummyzichtbaarheid, trick pause, developer-only en dialogs.
- Responsive gedrag hoort bij voorkeur in `styles/responsive.css`.
- Voorkom dat CSS utility/layout-regels browsersemantiek zoals `[hidden]` breken.

## State model

De centrale runtime state leeft nu in `scripts/app.js`. Belangrijke velden:

- `phase` - idle, bidding, playing, hand-over enzovoort.
- `hands`, `originalHands` - actuele en oorspronkelijke kaarten.
- `auction`, `contract`, `declarer`, `dummy` - veilingresultaat.
- `currentTrick`, `trickHistory`, `tricks` - speelverloop.
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
- Browser smoke tests: `tests/browser/smoke.spec.js`
- Referentie/concordance tests: `tests/reference/`

Commandos:

```powershell
npm run test:unit
npm run test:browser
npm test
```

Richtlijn:

- Bridge-regels: unit tests.
- Browserflow of visuele beginnerflow: Playwright smoke.
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

1. `scripts/app.js` blijft een zwaartepunt.  
   Mitigatie: nieuwe flows naar gerichte modules; pure transitions uitbreiden.

2. Biedprofielbestanden worden groot, vooral `rebids.js`, `competitive.js` en `explanations-nl.js`.  
   Mitigatie: splitsen per auction family wanneer eraan gewerkt wordt, niet als losse megarewrite.

3. Uitleg kan losraken van engine-regels.  
   Mitigatie: `rule-copy-coverage.test.js` bewaakt dat geteste `ruleId`s een Nederlands uitlegpad houden.

4. Scriptvolgorde is fragiel door build-vrije architectuur.  
   Mitigatie: `script-order.test.js` en stabiele facade via `bridge-rules.js`.

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
3. Splits toekomstige uitbreidingen van `scripts/app.js` standaard naar gerichte modules.
4. Splits grote Vijfkaart Hoog-bestanden alleen wanneer een concreet roadmapitem dat gebied raakt.
5. Houd nieuwe `ruleId`-fixtures gekoppeld aan Nederlandse uitleg, zodat de coverage-test nuttig blijft.
