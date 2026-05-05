# AGENTS.md - Bridge-app

Projectcontext voor AI-agenten die aan deze repo werken.

## Doel

`bridge-app` is een kleine, build-vrije bridge-app om bridge te leren en te oefenen. De speler zit Zuid, biedt met een eenvoudige NBB/Barry's Vijfkaart Hoog AI-partner/tegenstanders, speelt de hand uit en kan daarna bieding, slagen en score reviewen.
Voor nu wordt de bied- speel- en speelplanuitleg voornamlijk gebruikt om te controleren of de speelengine correct is, en waarom hij wat doet. Op de lange termijn moet dit gebruikt worden als feedback voor de speler wanneer hij een fout maakt. Zo kan hij daarvan leren. 

Voor nu gebruikt de app de NBB/Barry's Vijfkaart Hoog- en `Start met Bridge 1 & 2`-cursusconventies als basis. Op lange termijn moet de app meerdere conventies kunnen ondersteunen en biedafspraken kunnen personaliseren per gebruiker of oefenset. De code-structuur moet daar nu al rekening mee houden: houd biedregels, conventiebetekenissen en UI-copy zoveel mogelijk modulair en voorkom hardcoded aannames die personalisatie later blokkeren.

Beginners moeten zonder veel uitleg kunnen zien:
- wie aan de beurt is;
- welke biedingen/kaarten legaal zijn;
- wanneer en waarom dummy verschijnt;
- wie een slag wint;
- wat het eindcontract en resultaat zijn;
- waarom de score zo uitkomt;
- wat de volgende actie is. (met AI suggestie aan)

## Werkprincipes

- Basisgame blijft rustig: zo weinig mogelijk tekstuele uitleg tijdens normaal spelen.
- Uitgebreide uitleg hoort in developermodus, AI-suggesties, review, woordenlijst of toekomstige lesmodus.
- Maak claims in de UI niet sterker dan de engine kan waarmaken.
- Gebruik altijd de sterkste geimplementeerde heuristiek. Geen keuzemenu voor zwakkere AI-sterktes.
- Houd beginner-UX belangrijker dan diepe engine-uitbreiding totdat de basisflow goed testbaar is.
- Bouw biedlogica zo dat de huidige NBB/Barry's Vijfkaart Hoog-afspraken later naast andere conventieprofielen kunnen bestaan.
- Check de huidige code voordat je TODO-items behoudt, verwijdert of toevoegt.
- `TODO.md` is de bron van waarheid voor open roadmapwerk; houd hem kort en verwijder afgeronde items.
- Vermijd grote redesigns tenzij expliciet gevraagd. Werk liever in kleine, verifieerbare stappen.

## Voorkeursworkflow

1. Lees eerst `README.md`, `TODO.md` en dit bestand.
2. Inspecteer relevante code voordat je een plan of wijziging maakt.
3. Maak bij niet-triviale taken een kort plan: inspectie, wijziging, tests, TODO/context update.
4. Pas kleine, gerichte wijzigingen toe.
5. Draai de kleinst zinvolle testset.
6. Werk `TODO.md` bij als een roadmapitem is afgerond of aangescherpt.
7. Sluit af met: gewijzigde bestanden, tests/resultaat, en de logisch volgende stap.

## Testcommando's

Installatie eenmalig:

```powershell
npm install
npx playwright install chromium
```

Gebruik bij voorkeur:

```powershell
npm run test:unit
```

Voor browser-smoke:

```powershell
npm run test:browser
```

Gericht per Playwright-project:

```powershell
npx playwright test tests/browser/smoke.spec.js --project=desktop-chromium
npx playwright test tests/browser/smoke.spec.js --project=mobile-chromium
```

Let op: de Playwright-projectnamen zijn `desktop-chromium` en `mobile-chromium`, niet `chromium`.

## Architectuur

De app heeft geen build step. `index.html` laadt plain browser scripts in dependency order.

Belangrijke plekken:

- `index.html` - DOM-structuur en scriptvolgorde.
- `styles.css` - layout, responsive gedrag en visuele states.
- `scripts/app.js` - bootstrap, gedeelde state, DOM refs, helpers en top-level rendering.
- `scripts/text-nl.js` - Nederlandse UI-copy.
- `scripts/settings.js` - opgeslagen instellingen.
- `scripts/seed.js` - handseed laden/kopieren en seed-UI.
- `scripts/bid-explanations.js` - bieduitleg-orchestratie voor AI-suggesties en developermodus.
- `scripts/render-hands.js` - kaarten en handen renderen.
- `scripts/render-auction.js` - biedlog en biedcontrols.
- `scripts/render-review.js` - slagenoverzicht, speeluitleg en handreview.
- `scripts/play-plan.js` - zichtbaar speelplan en tekst daarover.
- `scripts/auction-flow.js` - biedverloop en biedbeslissingen.
- `scripts/play-flow.js` - kaartspel, automatisch spel, legaliteit en slagvoortgang.
- `rules/play-plan.js` - compatibele ingang/aggregator voor speelplanlogica.
- `rules/play-plan/` - gesplitste speelplanmodules: gedeelde helpers, sans-atout en kleurcontract.
- `rules/card-play.js` - compatibele ingang/orchestrator voor kaartkeuzes.
- `rules/card-play/` - gesplitste kaartspelmodules: gedeelde helpers, uitkomsten en basisverdediging.
- `rules/bidding/systems/five-card-high/explanations-nl.js` - Nederlandse uitlegtekst gekoppeld aan het huidige Vijfkaart-Hoog-profiel.
- `rules/` - testbare bridge-regels, scoring, biedheuristiek, kaartspel en speelplanlogica.
- `tests/` - unit tests en Playwright-smoketests.

## UI- en uitlegafspraken

- Normale gameplay: visueel en compact, geen lange uitlegblokken.
- Developer mode: moet uitgebreide technische regelreferenties, heuristieken en testhulpmiddelen tonen.
- AI-suggesties: kort en eerlijk; formuleer als suggestie, niet als absolute waarheid.
- Review/woordenlijst: geschikt voor extra uitleg na afloop of op aanvraag.
- Toekomstige lessen/oefenmodus: plek voor uitgebreidere feedback en didactiek.
- Bij elke nieuwe bied- of speelfunctie moet de bijbehorende bied- of speeluitleg mee worden aangepast. Het moet duidelijk blijven waarom de AI iets biedt/speelt en welke regel(s), prioriteiten of heuristieken daarvoor gebruikt zijn.
- Op korte termijn is die uitleg vooral bedoeld om fouten te troubleshooten en enginegedrag te kunnen controleren.
- Op lange termijn, wanneer de engine robuust genoeg is, moet dezelfde uitlegstructuur ook feedback kunnen geven op foute biedingen of kaartkeuzes van de speler.

## Bied- en speelregels

- Nieuwe bied- of speelregels moeten testbaar zijn in `rules/` of bestaande testharnesses.
- Nieuwe bied- of speelregels moeten ook hun uitlegpad bijwerken: AI-beslissingen moeten een uitlegbare reden/regelnaam opleveren die in developer mode, AI-suggesties of review gebruikt kan worden.
- Voeg fixtures toe voor minimale punten/lengtes, prioriteit tussen alternatieven en legale vervolgen.
- Scheid contract, call-type en betekenis consequent. Bijvoorbeeld: `2D` na `1NT` kan een transfer zijn en betekent dan niet letterlijk ruiten.
- Voeg alleen gebruikerswaarschuwingen toe voor systeemafwijkingen als de app dat betrouwbaar kan bepalen.
- Behandel de huidige NBB/Barry's Vijfkaart Hoog- en `Start met Bridge 1 & 2`-afspraken als het eerste conventieprofiel, niet als universele waarheid.
- Houd biedregels/conventies zo modulair dat later andere systemen, persoonlijke afspraken en conventieschakelaars kunnen worden toegevoegd zonder de bestaande engine te herschrijven.
- Houd competitief bieden klein en gericht op concrete gaten uit tests of oefenhanden.

## Roadmapprioriteit

Volg de implementatievolgorde bovenaan `TODO.md`. Korte samenvatting van de huidige volgorde:

1. Houd de eerste `practice-hands/` catalogus actief in beginnerstests en regressietests; breid gericht uit waar testers of bugs extra vaste situaties vragen.
2. Houd de codebase onderhoudbaar met kleine architectuurrefactors wanneer een bestand of flow anders te groot wordt voor overzichtelijk vibe-coden.
3. Breid daarna alleen bewezen zwakke plekken uit: speelplan-randgevallen, basisverdediging, of biedcontext waar tests/gemist gedrag om vragen.
4. Pas later conventie-instellingen, personalisatie en simulatie/double-dummy toe.

## Veiligheid en onderhoud

- Claim alleen dat tests groen zijn als je ze daadwerkelijk hebt gedraaid en output hebt gezien.
- Let op bestaande uncommitted changes; ga er niet vanuit dat alles in de diff van jou is.
- Gebruik geen destructieve git- of filesystem-acties zonder expliciete toestemming.
- Houd contextbestanden klein en bruikbaar; geen lange sessielogs in dit bestand.
