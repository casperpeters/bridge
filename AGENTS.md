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

1. Start altijd met:
   - `README.md`
   - `TODO.md`
   - `AGENTS.md`
   - `docs/architecture.md`
   - `git status --short`
2. Bepaal het taaktype: simpele vraag of commandotaak, bugfix, biedregel, speelregel, UI/UX-flow, test/refactor of review.
3. Inspecteer gericht met `rg` en relevante bestanden. Lees niet breder dan nodig.
4. Bij bugs: probeer eerst het probleem te reproduceren of maak een kleine falende test/fixture.
5. Bij niet-triviale taken: maak een kort plan met inspectie, wijziging, tests, acceptatiecriterium en eventuele `TODO.md`-update.
6. Pas kleine, gerichte wijzigingen toe.
7. Bij bied- of speelgedrag: update regels, uitlegpad en tests/fixtures samen.
8. Bij UI-wijzigingen: controleer desktop en mobiel waar relevant, houd normale gameplay compact en plaats uitgebreide uitleg alleen in developer mode, AI-suggesties, review of lesmodus.
9. Draai de kleinst zinvolle testset: unit tests voor regels/logica, browser smoke voor UI-flow, volledige testset alleen bij gedeelde of risicovolle wijzigingen.
10. Werk `TODO.md` alleen bij als een roadmapitem is afgerond, vervallen of concreter geworden.
11. Sluit af met: gewijzigde bestanden, tests/resultaat, eventuele risico's en de logisch volgende stap.

Gebruik `docs/ai-prompts.md` als promptbibliotheek wanneer een taakomschrijving nog te breed of vaag is, of wanneer je een herbruikbaar startsjabloon nodig hebt voor bugfixes, biedregels, speelregels, UI-flow, refactors, reviews of oefenhanden.

## Testcommando's

De app zelf heeft geen build step of server nodig. Open `index.html` direct in een browser. Als lokale assets worden geblokkeerd, start een simpele statische server:

```powershell
python -m http.server 8000
```

Open daarna `http://localhost:8000`.

Installatie eenmalig:

```powershell
npm install
npx playwright install chromium
```

Volledige testset:

```powershell
npm test
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
Playwright start zelf `node tests/static-server.js 4173` via `playwright.config.js`; start voor `npm run test:browser` dus geen losse server tenzij je handmatig test.

Alleen bij werk aan de Remotion-promovideo:

```powershell
npm run video:studio
npm run video:still
npm run video:render
```

Beschouw `video/out/` als gegenereerde output.

## Architectuur

Zie `docs/architecture.md` voor de actuele architectuur, scriptvolgorde, module-indeling, uitlegpaden en belangrijke codepaden.

Houd architectuurinformatie daar bij. Vermijd dubbele of verouderde modulelijsten in dit bestand.

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
