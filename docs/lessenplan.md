# Lessenplan Bridgetafel

Status: inhoudelijke cursusstructuur
Scope: `bridge-app` lesmodus, oefenhanden en toekomstige lesfeedback

Dit lessenplan beschrijft een cursus van 12 online bridgelessen voor beginners tot lichtgevorderden. De cursus leert bridge via Vijfkaart-Hoog, in de geest van NBB/Barry's Vijfkaart Hoog en `Start met Bridge 1 & 2`, maar blijft zo geschreven dat andere conventieprofielen later naast dit eerste profiel kunnen bestaan.

Het doel is niet om een boek droog na te vertellen. De app moet voelen als een rustige oefentafel met een vriendelijke coach naast je: korte uitleg, herkenbare situaties, "wat zou jij bieden?"-momenten, oefenen op het bestaande bridge-bord en daarna terugkijken waarom iets werkte.

## Systeembron

`docs/vijfkaart-hoog-systeem.md` is het cursuscontract voor biedafspraken. Dit lessenplan mag afspraken eenvoudiger uitleggen dan de engine redeneert, maar mag geen ander systeem aanleren.

Belangrijke cursusafspraken uit dat document:

- `1SA` in lescopy is dezelfde bieding als `1NT` in code en oefenhanden.
- 1SA gaat voor bij 15-17 HCP en een evenwichtige verdeling, ook als de hand een vijfkaart hoog in een 5-3-3-2-verdeling heeft.
- 1 harten en 1 schoppen beloven minstens een vijfkaart, behalve dat een langere lage kleur soms eerst geopend wordt.
- 1 ruiten belooft meestal minstens een vierkaart ruiten.
- 1 klaveren kan een vangnetopening zijn en dus korter zijn dan beginners verwachten.
- Na een gevonden Fit mag de cursus over Fitpunten spreken in plaats van alleen HCP.
- Kunstmatige biedingen moeten altijd als betekenis worden uitgelegd, niet alleen als biedkaartje: Stayman, Jacoby-transfer, Vierde-kleur-forcing en Azenvragen zijn daar de eerste voorbeelden van.

## Glossary-afspraak

`scripts/learning/glossary.js` is de vaste bron voor jargon. Lescopy gebruikt daarom bij voorkeur exact dezelfde termen als de glossary, zodat de bestaande glossary-functionaliteit woorden kan herkennen en klikbaar kan maken wanneer lescopy via `BridgeGlossary.linkifyText` wordt weergegeven.

Belangrijke vaste termen in deze cursus:

- HCP
- Fit
- Manche
- Stayman
- Jacoby-transfer
- Vuilnisbakkenbod
- Vierde-kleur-forcing
- Informatiedoublet
- Zwakke twee
- Regel van 20
- Azenvragen
- Slem
- Troef
- Leider
- Dummy
- Uitkomst
- Stopper
- Entree
- Werkkleur

Richtlijn voor implementatie:

- Gebruik glossary-termen letterlijk in titels, kernbegrippen, theorieblokken, quizfeedback en reviewtekst.
- Vermijd nieuwe synoniemen als de glossary al een term heeft.
- Gebruik "1SA" in lescopy voor sans-atout, maar map in engine/UI waar nodig naar de bestaande `1NT`-call.
- Biedingen mogen in UI-copy als `1C`, `1D`, `1H`, `1S` of als "1 klaveren", "1 ruiten", "1 harten", "1 schoppen" worden getoond. Houd de uitleg begrijpelijker dan de notatie.

## Didactische lijn

De cursus bouwt in kleine stappen op:

1. Eerst tafelritme: slagen, contract, troef, leider en Dummy.
2. Dan handwaardering: HCP, verdeling, Fit en simpele biedkeuzes.
3. Daarna Vijfkaart-Hoog-openingen volgens het cursuscontract: eerst kracht en speciale openingen, dan pas natuurlijke kleuren.
4. Daarna antwoorden en herbiedingen.
5. Pas daarna Manche, Sans-atout-conventies, speelplan, tegenspel en competitie.
6. Sterkere afspraken komen pas in les 12 als kennismaking, niet als examen.

Nieuwe begrippen worden pas gebruikt nadat ze in dezelfde of een eerdere les zijn uitgelegd. Als een latere les teruggrijpt op een begrip, mag de tekst kort herhalen: "We kennen Fit al: samen minstens acht kaarten in een kleur."

## Standaard lesformat

Elke les bestaat uit:

- titel;
- leerdoelen;
- kernbegrippen;
- korte theorieblokken;
- interactieve biedvoorbeelden;
- interactieve speelvoorbeelden op het bestaande bridge-bord;
- korte tafelsituaties vanuit een hoofdstuk, meestal 1 bod, 1 kaart, 1 slagmoment of 1 reviewcheck;
- minimaal 6 oefenvragen;
- minimaal 4 oefenhanden;
- korte leuke eindopdracht.

Oefenhanden hieronder gebruiken bestaande ids waar mogelijk. Ontbrekende situaties krijgen voorstel-ids. Die ids zijn nog geen implementatiebelofte; ze geven aan welke vaste handen later in `practice-hands/` nuttig zijn.

### Lesoverzicht in de app

Het overzicht op `lessons/index.html` blijft bewust compact. Per geselecteerde les toont het alleen:

- de titel;
- de leerdoelen;
- een enkele knop `Start les`.

Noem daar niet elk hoofdstuk, lesonderdeel, oefenmoment of quizblok apart, en maak die onderdelen daar ook niet los openklikbaar. De speler kiest eerst een les; de losse lespagina zelf mag daarna met kaartnavigatie, oefeningen en tafellussen door de onderdelen lopen.

## Lesmodus met korte tafelsituaties

De lesmodus gebruikt de bestaande bridgetafel niet als losse volledige game, maar als korte oefenlus binnen een hoofdstuk. De speler start vanuit een concreet hoofdstuk, doet aan tafel het gevraagde kernmoment, ziet een klaar-kaart en keert met `Terug naar les` terug naar hetzelfde hoofdstuk.

Standaard flow:

1. Het hoofdstuk legt de situatie kort uit.
2. De oefenlink opent `index.html` met `lesson`, `hand`, `chapter` en een `return`-URL naar de oorspronkelijke lesplek, bijvoorbeeld `lessons/index.html?lesson=...#chapter-id` of een losse `lessons/NN-slug.html#stap`.
3. De tafel toont het gewone bord, met het lespaneel op de plek van de speelgeschiedenis.
4. De coachkaart/spotlight wijst het relevante onderdeel aan, bijvoorbeeld biedbox, legale kaarten, Dummy, slaggebied of review.
5. De speler doet de afgesproken actie: meestal 1 bod of 1 kaart.
6. Zodra de `tableTask` klaar is, verschijnt een afrondingskaart met `Terug naar les` en optioneel `Nog eens proberen`.
7. Gewone gameplay blijft daarna geblokkeerd of gedempt totdat de speler een van die knoppen kiest.

Gebruik deze korte tafelrondes om les en bord aan elkaar te knopen zonder de beginner uit het hoofdstuk te trekken. Een volledige hand uitspelen blijft mogelijk, maar is een bewuste uitzondering voor lessen die juist een hele speel- of reviewflow nodig hebben.

### Metadata-contract

Elke hoofdstukstart naar de tafel hoort genoeg context mee te geven om terug te keren:

- `lesson`: les-id.
- `hand`: oefenhand-id.
- `chapter`: hoofdstuk-id en anker.
- `return`: doel-URL naar hetzelfde leshoofdstuk of dezelfde stap.

Hoofdstukken met een korte tafelronde gebruiken `tableTask`:

- `type`: `bid`, `card`, `trick`, `review` of `hand`.
- `completion`: bijvoorbeeld `southBid`, `northSouthCard`, `trickWinnerShown`, `reviewReached` of `handComplete`.
- `doneTitle`, `doneBody`, `returnLabel` en optioneel `retryLabel`.

Hoofdstukken kunnen daarnaast `boardGuidance` gebruiken voor spotlight en flow:

- targets: `contract`, `bidControls`, `auctionLog`, `dummy`, `legalCards`, `trumpCards`, `trickArea`, `trickWinner`, `review` en `lessonPanel`;
- gates: `none`, `allowHumanBid`, `allowHumanPlay` en `advanceTrick`.

Blokkeer alleen kernmomenten. De tafel moet blijven voelen als bridge spelen, niet als een formulier invullen.

### Rustige lesinstellingen

Tijdens lesmodus gelden tijdelijke instellingen:

- `showPlayHistory = false`;
- `guidanceMode = false`;
- `developerMode = false`.

De app bewaart deze tijdelijke waarden niet in `localStorage`; na verlaten van lesmodus keren opgeslagen voorkeuren terug. Lescopy en tests moeten daarom uitgaan van een rustig lespaneel, niet van developer-uitleg of AI-suggestiepanelen.

### Voorbeelden per huidige les

- Les 1 gebruikt `draw-trumps-001` als korte speelronde: de speler speelt een kaart in de bekennen-situatie en krijgt daarna `Terug naar les`.
- Les 2 gebruikt `one-nt-opening-001` als korte biedronde: Zuid kiest het openingsbod, ziet `Bod gedaan` en keert terug naar het hoofdstuk over 1SA herkennen.
- Les 2 gebruikt `opening-pass-001` op dezelfde manier voor openingskracht versus pas.

Voor toekomstige lessen is de voorkeurskeuze steeds de kleinste tafelactie die het lesdoel zichtbaar maakt: bij Stayman 1 conventioneel bod, bij uitkomst 1 kaart, bij speelplan 1 planactie na Dummy reveal, bij score 1 reviewcheck.

## Cursusoverzicht

1. Wat is bridge? Slagen, contract, troef, Leider en Dummy.
2. Kaarten waarderen: HCP, verdeling, Fit en eerste biedlogica.
3. Openen in Vijfkaart-Hoog: 1SA, 1 klaveren, 1 ruiten, 1 harten, 1 schoppen.
4. Antwoorden op een Opening: steun, nieuwe kleur, 1SA-Vuilnisbakkenbod.
5. Herbiedingen van Openaar en responder: Minimum, Maximum, Invite.
6. De hoge-kleurenfit vinden en naar Manche bieden.
7. Sans-atout: 1SA-opening, Stayman en Jacoby-transfer.
8. Speelplan als Leider: Troef trekken, Verliezers tellen, Aftroeven.
9. Sans-atout spelen: Werkkleur, Stopper, Ophouden en Entree.
10. Tegenspel: Uitkomst, signaleren op beginnersniveau, Vrijspelen.
11. Competitief bieden: Volgbod, Informatiedoublet, Kwetsbaarheid.
12. Sterkere afspraken: Zwakke twee, Vierde-kleur-forcing, Azenvragen en Slemintro.

---

## Les 1 - Wat is bridge?

Slagen, Contract, Troef, Leider en Dummy.

### Leerdoelen

- Je herkent Noord, Oost, Zuid en West en weet wie partners zijn.
- Je begrijpt dat een Slag uit vier kaarten bestaat.
- Je weet dat het Contract vertelt hoeveel slagen de Leider moet maken.
- Je ziet wat Troef doet en wat Sans-atout betekent.
- Je weet wanneer Dummy open komt en wie de kaarten van Dummy speelt.

### Kernbegrippen

Slag, Contract, Troef, Sans-atout, Leider, Dummy, Uitkomst, Kleur bekennen.

### Korte theorieblokken

- De tafel als toneel: jij zit Zuid, partner Noord, de tegenstanders Oost/West. Jullie spelen niet tegen de app, maar samen met partner tegen het andere paar.
- Een Slag is een rondje van vier kaarten. De hoogste kaart van de gevraagde kleur wint, behalve wanneer Troef wordt gespeeld.
- Het Contract is de belofte van de bieding. Bij 4 schoppen moet de Leider tien slagen maken, omdat zes slagen de basis zijn en het niveau daar bovenop komt.
- Dummy is de open partnerhand van de Leider. Dummy komt pas na de Uitkomst open, alsof het doek opengaat na de eerste scene.

### Interactieve biedvoorbeelden

- Herken het eindcontract: de app toont `1S - pas - 2S - pas - 4S - pas - pas - pas`. Vraag: "Wat is het Contract en welke kleur is Troef?"
- Contract naar slagen: toon 1SA, 2 harten, 3SA en 4 schoppen. Laat de speler het aantal benodigde slagen kiezen.
- Wie wordt Leider? Toon een korte bieding waarin Noord/Zuid het Contract winnen. Laat de speler aanwijzen wie de speelsoort als eerste bood.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `draw-trumps-001` direct in de speelfase. Begeleid de speler langs Uitkomst, Dummy reveal, Kleur bekennen en Slagwinnaar.
- Pauzeer na een complete Slag en vraag: "Welke kaart won deze Slag, en wie begint nu?"
- Laat een simpele Troef-slag zien: iemand kan niet bekennen en mag troeven. Vraag of Troef de Slag wint.

### Oefenvragen

1. Hoeveel kaarten speelt iedere speler in een Slag?
2. Wanneer komt Dummy open?
3. Wie speelt de kaarten van Dummy?
4. Wat betekent Troef?
5. Hoeveel slagen moet je maken in 3SA?
6. Wat moet je doen als je de gevraagde kleur nog hebt?

### Oefenhanden

- `draw-trumps-001` - bestaand: Dummy, Troef en Kleur bekennen.
- `lesson-01-follow-suit-001` - voorstel: alleen legaliteit en bekennen oefenen.
- `lesson-01-trump-wins-001` - voorstel: Troef wint wanneer de gevraagde kleur ontbreekt.
- `lesson-01-contract-reading-001` - voorstel: contractdoel en Leider herkennen.

### Eindopdracht

Geef na een bord een mini-commentaar alsof je sportverslaggever bent: "Het Contract was ..., Dummy kwam open na ..., en de Slag werd gewonnen door ..."

---

## Les 2 - Kaarten waarderen

HCP, verdeling, Fit en eerste biedlogica.

### Leerdoelen

- Je telt HCP met Aas 4, Heer 3, Vrouw 2, Boer 1.
- Je herkent een evenwichtige verdeling.
- Je ziet waarom lengte in een kleur belangrijk is.
- Je begrijpt Fit als samen minstens acht kaarten in een kleur.
- Je maakt een eerste simpele keuze: pas, 1SA, of een kleur openen.

### Kernbegrippen

HCP, Honneur, Evenwichtige verdeling, Fit, Fitpunten, Opening, Openingskracht, Regel van 20.

### Korte theorieblokken

- HCP is de snelle krachtmeter. Aas is 4, Heer 3, Vrouw 2, Boer 1. Een hand met twee azen en een vrouw heeft dus 10 HCP.
- Verdeling is het landschap van je hand. Een 5-3-3-2-hand voelt anders dan een 6-4-2-1-hand, zelfs met hetzelfde aantal HCP.
- Fit betekent dat jij en partner samen minstens acht kaarten in een kleur hebben. Een Fit is fijn, omdat Troef dan vaker controle geeft.
- Bij 15-17 HCP en een evenwichtige verdeling is 1SA in dit systeem de eerste kandidaat. Dat geldt ook als de evenwichtige hand een vijfkaart hoog heeft.
- De Regel van 20 is een eerste blik op lichte openingen: HCP plus de lengtes van je twee langste kleuren. Dit is nog geen vrijbrief, maar een nuttige beginnerslamp.

### Interactieve biedvoorbeelden

- Tel en kies: Zuid heeft 15 HCP en een evenwichtige verdeling. Vraag: "Open je 1SA of een kleur?"
- Vijfkaart maar toch SA: Zuid heeft 16 HCP, vijf schoppen en 5-3-3-2. Vraag waarom 1SA volgens deze app voorgaat.
- Regel van 20: toon een hand met 11 HCP en twee lange kleuren. Laat de speler HCP + lengtes optellen.
- Fit-detective: partner toont vijf harten, jij hebt drie harten. Vraag: "Hebben jullie samen een Fit?"

### Interactieve speelvoorbeelden op het bridge-bord

- Start `one-nt-opening-001` en laat de speler voor het bieden eerst HCP tellen.
- Gebruik een bord met een duidelijke Fit en laat na Dummy reveal zien dat extra Troef controle geeft.
- Laat in review zien hoeveel HCP Noord/Zuid samen ongeveer hadden en of dat paste bij het Contract.

### Oefenvragen

1. Hoeveel HCP telt Aas-Heer-Vrouw-Boer samen?
2. Welke verdeling is evenwichtiger: 5-3-3-2 of 6-4-2-1?
3. Wat is een Fit?
4. Je hebt 12 HCP. Is dat meestal genoeg om te openen?
5. Wat tel je op bij de Regel van 20?
6. Waarom kan een lange kleur extra waarde hebben?
7. Waarom kan 1SA soms voorgaan boven een vijfkaart hoog?

### Oefenhanden

- `one-nt-opening-001` - bestaand: 15-17 HCP en evenwichtige verdeling.
- `opening-pass-001` - bestaand: te weinig Openingskracht.
- `one-heart-opening-001` - bestaand: HCP plus vijfkaart hoog.
- `lesson-02-rule-of-20-001` - voorstel: lichte Opening via Regel van 20.

### Eindopdracht

Maak een "handpaspoort" van Zuid: HCP, verdeling, langste kleur, en je eerste biedidee in een zin.

---

## Les 3 - Openen in Vijfkaart-Hoog

1SA, 1 klaveren, 1 ruiten, 1 harten en 1 schoppen.

### Leerdoelen

- Je kent de basisvolgorde voor een Opening in Vijfkaart-Hoog.
- Je opent 1SA met 15-17 HCP en een evenwichtige verdeling.
- Je opent 1 harten of 1 schoppen met een vijfkaart hoog en openingskracht, behalve wanneer 1SA of een langere lage kleur volgens het systeem voorgaat.
- Je gebruikt 1 ruiten als normale lage-kleuropening met ruitenlengte.
- Je begrijpt dat 1 klaveren een vangnetopening kan zijn en dus niet altijd een lange klaverenkleur belooft.

### Kernbegrippen

Opening, Openaar, Openingskracht, Hoge kleuren, Lage kleuren, Sans-atout, Evenwichtige verdeling, Regel van 20, Eenkleurenspel, Tweekleurenspel, Zwakke twee.

### Korte theorieblokken

- Vijfkaart-Hoog geeft veel aandacht aan harten en schoppen. Hoge kleuren scoren prettig, want 4 harten en 4 schoppen zijn Manche.
- 1SA is precieser dan veel beginners denken: 15-17 HCP en evenwichtige verdeling. In deze app gaat 1SA voor, ook met een 5-3-3-2-hand en een vijfkaart hoog.
- 1 harten en 1 schoppen beloven minstens vijf kaarten. Open de langste kleur; met twee vijfkaarten open je de hoogste van de twee.
- Een langere lage kleur kan voorgaan boven een vijfkaart hoog. Met vijf schoppen en zes klaveren open je in dit cursuscontract dus 1 klaveren.
- 1 ruiten belooft meestal minstens vier ruiten. 1 klaveren kan kort zijn en is soms de vangnetopening als niets anders past.
- Met lichte handen kijk je voorzichtig naar de Regel van 20. De app moet dit niet als universele waarheid verkopen, maar als Vijfkaart-Hoog-afspraak binnen dit profiel.

### Interactieve biedvoorbeelden

- Sorteer de openingen: vier handen verschijnen. De speler kiest uit pas, 1SA, 1 harten, 1 schoppen, 1 klaveren of 1 ruiten.
- "De vijfkaart hoog, tenzij...": toon 13 HCP met vijf schoppen en vier harten. Vraag: "Welke hoge kleur open je?"
- "1SA gaat voor": toon 16 HCP met vijf schoppen en 5-3-3-2. Vraag waarom 1SA hier de systeemopening is.
- "Langste kleur niet verstoppen": toon 12 HCP met vijf schoppen en zes klaveren. Vraag waarom 1 klaveren in beeld komt.
- "Openingscasino": toon twaalf handen achter elkaar. De speler kiest snel uit pas, 1 klaveren, 1 ruiten, 1 harten, 1 schoppen, 1SA of zwakke twee.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `one-heart-opening-001`; laat de speler eerst de opening kiezen en daarna zien welk Contract eruit kan groeien.
- Start `one-spade-opening-001`; vergelijk het met de hartenhand: dezelfde logica, andere hoge kleur.
- Start `minor-opening-find-major-001`; laat zien dat een lage-kleur Opening later alsnog een hoge kleur kan vinden.

### Oefenvragen

1. Welke kleuren heten Hoge kleuren?
2. Wanneer past 1SA als Opening?
3. Wat belooft 1 harten of 1 schoppen minimaal?
4. Waarom kan 1 klaveren kort zijn?
5. Wat doe je met 10 HCP en geen lange kleur?
6. Waarom kan een langere lage kleur soms voorgaan boven een vijfkaart hoog?
7. Wat check je eerst: genoeg kracht, speciale opening, of favoriete kleur? Leg je volgorde uit.

### Oefenhanden

- `one-nt-opening-001` - bestaand: 1SA-opening.
- `one-heart-opening-001` - bestaand: 1 harten met vijfkaart, geen 1SA-prioriteit.
- `one-spade-opening-001` - bestaand: 1 schoppen met vijfkaart, geen 1SA-prioriteit.
- `minor-opening-find-major-001` - bestaand: lage-kleur Opening als startpunt.
- `lesson-03-one-nt-*` - geimplementeerd: extra 1SA-herkenning, inclusief 1SA met vijfkaart hoog.
- `lesson-03-one-heart-*`, `lesson-03-one-spade-*` en `lesson-03-two-five-majors-001` - geimplementeerd: hoge-kleur openingen.
- `lesson-03-one-club-*` en `lesson-03-one-diamond-*` - geimplementeerd: lage-kleur openingen en 1 klaveren als vangnet.
- `lesson-03-pass-*` - geimplementeerd: passen, inclusief afgewezen Regel van 20 en slechte zwakke-twee-kleur.
- `lesson-03-rule20-*` - geimplementeerd: lichte openingen via Regel van 20.
- `lesson-03-weak-two-*` - geimplementeerd: zwakke twee als bonusherkenning.

### Eindopdracht

Speel "Openingscasino": kies snel per hand uit pas, 1 klaveren, 1 ruiten, 1 harten, 1 schoppen, 1SA of zwakke twee. Daarna kun je openingsbingo aan tafel doen: vind minstens een keer pas, 1SA, een hoge-kleur Opening en een lage-kleur Opening.

---

## Les 4 - Antwoorden op een Opening

Steun, nieuwe kleur en 1SA-Vuilnisbakkenbod.

### Leerdoelen

- Je herkent wanneer je partner kunt steunen.
- Je weet dat steun in een hoge kleur vaak met drie kaarten al genoeg is.
- Je toont een eigen nieuwe kleur wanneer steun ontbreekt en je hand daarvoor geschikt is.
- Je gebruikt het 1SA-Vuilnisbakkenbod als rustige opvang voor handen zonder steun en zonder goed eenhoogtebod.
- Je ziet dat passen na partners Opening niet de automatische veilige keuze is.

### Kernbegrippen

Bijbod, Fit, Vuilnisbakkenbod, Hoge kleuren, Lage kleuren, Forcing, Minimum.

### Korte theorieblokken

- Na partners Opening ben jij responder. Je eerste vraag is vriendelijk praktisch: "Kan ik partner steunen?"
- Na 1 harten of 1 schoppen is driekaart steun vaak genoeg voor een Fit, omdat partner minstens vijf kaarten belooft.
- Na 1 ruiten is steun meestal vanaf vier ruiten logisch. Na 1 klaveren vraagt steun vaker om vijf klaveren, omdat 1 klaveren kort kan zijn.
- Een nieuwe kleur vertelt partner: "Hier heb ik ook iets." In beginnerslessen houden we dat kort en concreet.
- Het 1SA-Vuilnisbakkenbod klinkt onaardig, maar is heel nuttig: 6-9 punten, geen steun, geen betere nieuwe kleur op eenhoogte. De vuilnisbak is hier gewoon netjes gesorteerd.

### Interactieve biedvoorbeelden

- Partner opent 1 schoppen, jij hebt drie schoppen en 8 punten. Vraag: "2 schoppen of 1SA?"
- Partner opent 1 harten, jij hebt vijf schoppen en geen hartensteun. Vraag: "Toon je schoppen?"
- Partner opent 1 ruiten, jij hebt 7 punten, geen vierkaart hoog en geen ruitensteun. Vraag of 1SA-Vuilnisbakkenbod past.
- Partner opent 1 klaveren, jij hebt vier klaveren en 7 punten. Vraag waarom 1SA soms eerlijker is dan klaveren steunen.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `response-raise-after-1s-001`; laat de speler de driekaart steun vinden en later de Troef-fit zien.
- Start `response-new-suit-after-1h-001`; laat zien dat het Contract soms anders eindigt dan partners eerste kleur.
- Gebruik een voorstelhand voor 1SA-Vuilnisbakkenbod en laat in review zien waarom dit bod niet per se een prachtige SA-hand belooft.

### Oefenvragen

1. Partner opent 1 schoppen. Hoeveel schoppen heb je meestal nodig voor steun?
2. Wat betekent Fit?
3. Wanneer denk je aan een nieuwe kleur als antwoord?
4. Wat is het 1SA-Vuilnisbakkenbod?
5. Belooft 1SA-Vuilnisbakkenbod altijd goede Stoppers in alle kleuren?
6. Waarom steun je 1 klaveren voorzichtiger dan 1 harten of 1 schoppen?
7. Waarom is direct passen met 7 punten na partners Opening vaak te voorzichtig?

### Oefenhanden

- `response-raise-after-1s-001` - bestaand: steun na 1 schoppen.
- `response-new-suit-after-1h-001` - bestaand: nieuwe kleur na 1 harten.
- `minor-opening-find-major-001` - bestaand: antwoord in hoge kleur na lage-kleur Opening.
- `lesson-04-trash-1nt-response-001` - voorstel: 1SA-Vuilnisbakkenbod.

### Eindopdracht

Speel "partnerpost": schrijf na je antwoordbod een ansichtkaart aan partner met precies een zin: "Ik bied ..., want ik heb ..."

---

## Les 5 - Herbiedingen van Openaar en responder

Minimum, Maximum en Invite.

### Leerdoelen

- Je herkent dat het eerste bod nog niet het hele verhaal vertelt.
- Je begrijpt Minimum en Maximum als onder- en bovenkant van je beloofde range.
- Je gebruikt een Invite om partner te vragen door te gaan met een Maximum.
- Je ziet hoe Openaar en responder samen laag kunnen stoppen of naar Manche kunnen groeien.
- Je houdt biedingen uitlegbaar: kracht, verdeling en Fit blijven de drie ankers.

### Kernbegrippen

Herbieding, Minimum, Maximum, Invite, Openaar, Bijbod, Fit, Manche.

### Korte theorieblokken

- De eerste biedronde is een begroeting, geen autobiografie. De Herbieding vertelt meer: minimum, extra lengte, steun of Sans-atout.
- Met een Minimum rem je af. Met een Maximum mag je extra interesse tonen.
- Een Invite is een beleefde vraag: "Partner, als jij aan de bovenkant zit, gaan we naar Manche; anders blijven we lager."
- Openaar steunt partners nieuwe hoge kleur met vierkaart steun, herbiedt een eigen zeskaart, biedt Sans-atout met een evenwichtige hand of toont een tweede kleur met een echt tweekleurenspel.
- Beginners hoeven nog niet elke route te kennen. Ze moeten vooral leren luisteren naar wat partner al beloofd heeft.

### Interactieve biedvoorbeelden

- `1H - 1S - 2H`: vraag wat Openaar extra vertelt. Antwoord: meestal langere harten en geen sterke sprong.
- `1S - 2S - 3S`: vraag of 3S een eindbod of Invite is.
- Responder heeft 10-11 punten na partners 1SA-herbieding. Vraag: "pas, invite of Manche?"

### Interactieve speelvoorbeelden op het bridge-bord

- Start een fit-hand waarin de bieding op 2 hoog stopt; laat zien dat laag stoppen soms volwassen bridge is.
- Start een invite-hand en laat het eindcontract afhangen van partners Minimum of Maximum.
- Speel een bord uit en laat in review de biedladder zien: Opening, antwoord, Herbieding, eindcontract.

### Oefenvragen

1. Wat betekent Minimum in de bieding?
2. Wat betekent Maximum?
3. Wat probeert een Invite te bereiken?
4. Partner nodigt uit en jij hebt een Maximum. Wat doe je meestal?
5. Partner nodigt uit en jij hebt een Minimum. Waarom mag je passen?
6. Wat kan Openaar met vierkaart steun voor responders hoge kleur doen?
7. Waarom is een Herbieding vaak informatiever dan het eerste bod?

### Oefenhanden

- `response-raise-after-1s-001` - bestaand: simpele verhoging als basis.
- `lesson-05-opener-minimum-rebid-001` - voorstel: Openaar remt af met Minimum.
- `lesson-05-opener-maximum-accepts-001` - voorstel: Maximum accepteert Invite.
- `lesson-05-responder-invite-001` - voorstel: responder nodigt uit na fit.

### Eindopdracht

Speel "thermostaat bieden": zet na elke bieding de meter op koud, lauw of warm. Koud is stoppen, warm is Manche zoeken.

---

## Les 6 - De hoge-kleurenfit vinden en naar Manche bieden

Fit in harten of schoppen, en wanneer 4 hoog dichtbij komt.

### Leerdoelen

- Je zoekt actief naar een Fit in harten of schoppen.
- Je begrijpt waarom hoge-kleurmanches vaak aantrekkelijk zijn.
- Je telt gezamenlijke kracht globaal met HCP en Fitpunten.
- Je weet dat 4 harten en 4 schoppen meestal Manche zijn.
- Je onderscheidt stoppen op 2 hoog, inviteren op 3 hoog en bieden naar 4 hoog.

### Kernbegrippen

Fit, Fitpunten, Manche, Hoge kleuren, Invite, Troef trekken, Contractpunten.

### Korte theorieblokken

- Een hoge-kleurenfit is een beetje als goede wandelschoenen: de route wordt niet automatisch makkelijk, maar je hebt grip.
- Met samen ongeveer 25 punten en een Fit kijk je vaak naar Manche in 4 harten of 4 schoppen.
- Extra Troef en korte kleuren kunnen na een Fit meer waard worden. Daarom bestaan Fitpunten.
- Na 1 harten of 1 schoppen is de beginnersladder: 2 hoog met 6-9 Fitpunten, 3 hoog als Invite met ongeveer 10-11 Fitpunten, 4 hoog met ongeveer 12+ Fitpunten.
- Bied niet meteen de berg op. Soms is 2 hoog genoeg, soms nodig je uit, soms ga je naar 4 hoog.

### Interactieve biedvoorbeelden

- Partner opent 1 schoppen, jij hebt 6-9 punten en drie schoppen. Vraag: "2S, 3S of 4S?"
- Partner opent 1 harten, jij hebt 12 punten en vier harten. Vraag waarom 4 harten in beeld komt.
- Partner opent 1 schoppen, jij hebt steun maar ook een singleton. Laat de speler Fitpunten herwaarderen.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `game-bonus-vulnerable-001`; laat zien hoe een Manchecontract een concreet slagendoel wordt.
- Start `draw-trumps-001`; koppel de gevonden Fit aan Troef trekken.
- Start een voorstelhand waarin te hoog bieden faalt; laat review rustig tonen dat 3 hoog genoeg was.

### Oefenvragen

1. Waarom zijn harten en schoppen belangrijk in Vijfkaart-Hoog?
2. Hoeveel kaarten samen heb je nodig voor een Fit?
3. Welk contract is een Manche: 2 schoppen, 3 schoppen of 4 schoppen?
4. Wat is het verschil tussen 2S en 3S na partners 1S-opening?
5. Wanneer ga je met een Fit extra naar korte kleuren kijken?
6. Hoeveel Fitpunten passen ongeveer bij direct 4 hoog na partners 1 hoog?
7. Waarom is Troef trekken vaak nuttig in een hoge-kleurcontract?

### Oefenhanden

- `response-raise-after-1s-001` - bestaand: Fit vinden.
- `game-bonus-vulnerable-001` - bestaand: Manchebonus zichtbaar.
- `draw-trumps-001` - bestaand: Troef trekken na Fit.
- `lesson-06-major-fit-invite-001` - voorstel: invite naar 3 hoog.

### Eindopdracht

Geef je partnerschap een teamnaam nadat je een hoge-kleurenfit vindt. Bonuspunt als de naam iets zegt over Troef.

---

## Les 7 - Sans-atout

1SA-opening, Stayman en Jacoby-transfer.

### Leerdoelen

- Je herkent de 1SA-opening: 15-17 HCP en evenwichtige verdeling.
- Je gebruikt Stayman om een vierkaart hoge kleur te vragen.
- Je gebruikt Jacoby-transfer met minstens een vijfkaart hoog.
- Je scheidt het biedkaartje van de betekenis: 2 ruiten kan harten betekenen.
- Je begrijpt waarom de sterke 1SA-hand vaak Leider blijft.

### Kernbegrippen

Sans-atout, 1SA, Stayman, Jacoby-transfer, Conventioneel bod, Hoge kleuren, Fit, Leider.

### Korte theorieblokken

- 1SA is een nette visitekaart: "15-17 HCP, evenwichtig." Partner weet daardoor meteen veel.
- Stayman is de vraag: "Partner, heb jij een vierkaart harten of schoppen?" In deze app gebruik je Stayman meestal vanaf ongeveer 8 HCP met een vierkaart hoog.
- Jacoby-transfer is de overdracht: met vijf harten bied je 2 ruiten, zodat partner 2 harten biedt; met vijf schoppen bied je 2 harten, zodat partner 2 schoppen biedt. Het bod is dus Conventioneel.
- Het slimme bij transfers: de sterke SA-hand wordt vaak Leider, en haar kaarten blijven verborgen voor de tegenpartij.
- Na een Jacoby-transfer kan responder zwak passen, inviteren of met Manchekracht verder bieden. De eerste les hierover houdt het bij de herkenbare hoofdroutes.

### Interactieve biedvoorbeelden

- Na 1SA heb je 8 punten en 4-4 in de hoge kleuren. Vraag: "Gebruik je Stayman?"
- Na 1SA heb je vijf harten. Vraag: "Welk Jacoby-transfer-bod gebruik je?"
- Na 1SA heb je geen vierkaart hoog en genoeg voor Manche. Vraag: "3SA of eerst Stayman?"

### Interactieve speelvoorbeelden op het bridge-bord

- Start `stayman-after-1nt-001`; laat de speler zien dat 2 klaveren een vraag is, geen klaverencontract.
- Start `transfer-to-hearts-001`; laat de bieding eindigen in harten en wijs aan wie Leider wordt.
- Start `transfer-to-spades-001`; vergelijk de overdracht naar schoppen met de hartenroute.

### Oefenvragen

1. Welke HCP-range hoort bij een gewone 1SA-opening?
2. Wat vraagt Stayman?
3. Wat belooft Jacoby-transfer meestal in de hoge kleur?
4. Wat betekent 2 ruiten na partners 1SA in de transferafspraak?
5. Wat betekent 2 harten na partners 1SA in de transferafspraak?
6. Waarom is het vaak prettig dat de 1SA-openaar Leider wordt?
7. Wat is een Conventioneel bod?

### Oefenhanden

- `one-nt-opening-001` - bestaand: 1SA-opening.
- `stayman-after-1nt-001` - bestaand: Stayman.
- `transfer-to-hearts-001` - bestaand: Jacoby-transfer naar harten.
- `transfer-to-spades-001` - bestaand: Jacoby-transfer naar schoppen.

### Eindopdracht

Speel "geheime boodschap": noteer bij elk conventioneel bod wat het kaartje zegt en wat het echt betekent.

---

## Les 8 - Speelplan als Leider

Troef trekken, Verliezers tellen en Aftroeven.

### Leerdoelen

- Je stopt na Dummy reveal om een speelplan te maken.
- Je telt Verliezers in een kleurcontract op beginnersniveau.
- Je herkent wanneer Troef trekken logisch is.
- Je ziet wanneer Aftroeven in Dummy juist eerst moet gebeuren.
- Je gebruikt het speelplanpaneel als suggestie, niet als magisch orakel.

### Kernbegrippen

Leider, Dummy, Verliezers, Troef trekken, Aftroeven, Afgooien, Entree, Speelplan.

### Korte theorieblokken

- Na de Uitkomst komt Dummy open. Dat is het moment voor een korte pauze: "Wat is Troef? Welke Verliezers zie ik? Waar zitten mijn kansen?"
- Troef trekken voorkomt vaak dat tegenstanders jouw hoge kaarten aftroeven.
- Soms moet je juist eerst Aftroeven in Dummy, voordat je alle Troef weghaalt. Timing is het verschil tussen plan en paniek.
- Een goede Leider hoeft niet alles te zien. Begin met een klein plan voor de eerstvolgende paar slagen.

### Interactieve biedvoorbeelden

- Toon een bieding naar 4 schoppen. Vraag: "Wat is Troef en hoeveel slagen zijn nodig?"
- Laat twee mogelijke Contracten zien: 3SA of 4 harten met Fit. Vraag welk contract waarschijnlijk makkelijker speelt.
- Na een Fit-bieding vraagt de app: "Wat verwacht je straks als eerste te controleren: Troef of Sans-atout-stoppers?"

### Interactieve speelvoorbeelden op het bridge-bord

- Start `draw-trumps-001`; volg het zichtbare plan om eerst Troef te trekken.
- Start `short-trump-ruff-001`; laat zien wanneer Dummy een korte kleur kan Aftroeven.
- Start `discard-loser-on-winner-001`; laat een Verliezer verdwijnen op een winnaar.

### Oefenvragen

1. Wanneer maak je als Leider je eerste echte speelplan?
2. Wat betekent Verliezers tellen?
3. Waarom trek je vaak Troef?
4. Wanneer kan Aftroeven in Dummy nuttig zijn?
5. Wat is een Entree?
6. Waarom moet je soms een planactie doen voordat je Troef trekt?

### Oefenhanden

- `draw-trumps-001` - bestaand: Troef trekken.
- `short-trump-ruff-001` - bestaand: korte Troef in Dummy benutten.
- `long-side-suit-ruff-001` - bestaand: lange zijkleur en Aftroeven.
- `discard-loser-on-winner-001` - bestaand: Afgooien van een Verliezer.

### Eindopdracht

Noem je speelplan in maximaal vijf woorden, bijvoorbeeld "eerst Troef, dan klaveren". Als het langer wordt, is het nog geen plan maar een roman.

---

## Les 9 - Sans-atout spelen

Werkkleur, Stopper, Ophouden en Entrees.

### Leerdoelen

- Je kiest een Werkkleur om extra slagen te ontwikkelen.
- Je begrijpt Stopper als rem op een gevaarlijke tegenkleur.
- Je gebruikt Ophouden om communicatie bij de tegenpartij te verstoren.
- Je plant Entrees naar de hand met vrije kaarten.
- Je ziet dat Sans-atout vaak draait om tempo: wie is eerder klaar?

### Kernbegrippen

Sans-atout, Werkkleur, Stopper, Ophouden, Entree, Vrijspelen, Lengteslagen, Gevaarlijke hand.

### Korte theorieblokken

- In Sans-atout is er geen Troef om je te redden. Je wint door hoge kaarten, Lengteslagen en goede timing.
- Een Werkkleur is de kleur waar je extra slagen uit wilt persen. Meestal is dat een lange kleur met honneurs.
- Een Stopper voorkomt dat de tegenpartij meteen een hele kleur opruimt.
- Ophouden voelt tegennatuurlijk: je kunt nemen, maar doet het nog niet. Soms verbreek je zo de lijn tussen de tegenstanders.

### Interactieve biedvoorbeelden

- Na 1SA - 3SA vraagt de app: "Waarom kiezen we Sans-atout in plaats van een kleur?"
- Toon een hand met geen hoge-kleurfit maar genoeg HCP. Vraag: "3SA of zoeken naar 4 harten?"
- Laat een bieding naar 1SA zien en vraag welke informatie de 1SA-bieder al gaf: HCP en verdeling.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `notrump-develop-long-suit-001`; laat de speler de Werkkleur kiezen.
- Start `notrump-unblock-long-suit-001`; laat zien hoe een Blokkade kan ontstaan.
- Gebruik een voorstelhand met Ophouden: de speler kiest of hij de eerste of tweede Slag neemt.

### Oefenvragen

1. Wat ontbreekt er in Sans-atout?
2. Wat is een Werkkleur?
3. Waarom zijn Entrees belangrijk?
4. Wat doet een Stopper?
5. Wanneer kan Ophouden slim zijn?
6. Waarom kan een lange kleur later extra slagen opleveren?

### Oefenhanden

- `notrump-develop-long-suit-001` - bestaand: Werkkleur vrijspelen.
- `notrump-unblock-long-suit-001` - bestaand: Blokkade en Entree.
- `one-nt-opening-001` - bestaand: 1SA als contractbasis.
- `lesson-09-hold-up-001` - voorstel: Ophouden met Stopper.

### Eindopdracht

Kies een Werkkleur en geef hem een bijnaam, zoals "de ruitenmachine". Daarna moet je uitleggen hoe die machine slagen gaat maken.

---

## Les 10 - Tegenspel

Uitkomst, signaleren op beginnersniveau en Vrijspelen.

### Leerdoelen

- Je kiest een veilige Uitkomst op beginnersniveau.
- Je herkent een Serie en waarom uitkomen uit een Serie partner helpt.
- Je gebruikt simpele principes: tweede hand laag, derde hand hoog.
- Je ziet dat tegenspelers ook kleuren kunnen Vrijspelen.
- Je signaleert eenvoudig: aanmoedigen of liever niet, zonder ingewikkelde afspraken.

### Kernbegrippen

Tegenspelers, Uitkomst, Serie, Honneur, Tweede hand laag, Derde hand hoog, Vrijspelen, Signaleren.

Let op: "tweede hand laag", "derde hand hoog" en "signaleren" staan nog niet allemaal als afzonderlijke glossary-termen. Gebruik ze wel consistent, maar overweeg later glossary-items toe te voegen zodra de lescopy wordt geimplementeerd.

### Korte theorieblokken

- Als tegenspeler ben je geen toeschouwer. Jij en partner proberen het Contract te verslaan.
- Uitkomen uit een Serie, zoals Heer-Vrouw-Boer, is vaak vriendelijk voor partner: je vertelt iets en geeft minder snel een slag weg.
- Tweede hand laag en derde hand hoog zijn beginnersregels, geen natuurwetten. Ze geven houvast wanneer je nog geen beter plan ziet.
- Vrijspelen kan ook voor de verdediging: hoge kaarten eruit werken zodat lagere kaarten later winnen.

### Interactieve biedvoorbeelden

- Toon het eindcontract 4 harten door Zuid. Vraag: "Wie komt uit?"
- Laat de bieding zien waarin de leider schoppen heeft geboden. Vraag welke kleur de verdediging misschien liever niet opent.
- Toon een Contract in Sans-atout en vraag waarom een lange kleur als aanvalskleur aantrekkelijk kan zijn.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `lead-sequence-001`; de speler kiest de Uitkomst uit een Serie.
- Start `lead-avoid-unsupported-honor-001`; laat zien waarom onder een losse Honneur riskant kan zijn.
- Start `defense-unblock-honor-001`; laat een eenvoudige partnerhulp zien.

### Oefenvragen

1. Wie komt uit tegen een Contract?
2. Waarom is een Serie prettig om uit te komen?
3. Wat betekent derde hand hoog?
4. Wanneer is tweede hand laag vaak logisch?
5. Kunnen Tegenspelers ook een kleur Vrijspelen?
6. Waarom moet signaleren op beginnersniveau simpel blijven?

### Oefenhanden

- `lead-sequence-001` - bestaand: Uitkomst uit Serie.
- `lead-singleton-001` - bestaand: korte kleur als Uitkomst-idee.
- `lead-avoid-unsupported-honor-001` - bestaand: geen onnodig riskante Honneur.
- `defense-unblock-honor-001` - bestaand: partner helpen door te deblokkeren.

### Eindopdracht

Speel "partnerfluisteraar": kies een kaart en zeg in een zin welke boodschap partner daar hopelijk uit haalt.

---

## Les 11 - Competitief bieden

Volgbod, Informatiedoublet en Kwetsbaarheid.

### Leerdoelen

- Je begrijpt dat de tegenpartij soms opent voordat jij aan de beurt bent.
- Je herkent een Volgbod als natuurlijk bod met eigen kleur.
- Je herkent een Informatiedoublet als vraag aan partner, niet als straf.
- Je ziet dat Kwetsbaarheid invloed heeft op risico.
- Je leert dat competitief bieden klein en voorzichtig begint.

### Kernbegrippen

Volgbod, Informatiedoublet, Doublet, Biedplicht, Kwetsbaarheid, Openingskracht, Hoge kleuren, Lage kleuren.

### Korte theorieblokken

- Competitief bieden begint zodra beide paren meedoen. De tafel wordt drukker, dus de afspraken moeten juist simpeler en scherper zijn.
- Een Volgbod zegt: "Ik heb een eigen kleur die ik wil noemen." In deze app is dat meestal een goede vijfkaart of langer: op eenniveau vanaf ongeveer 8 HCP, op tweeniveau meestal 10+ HCP.
- Een 1SA-Volgbod is juist geen Vuilnisbakkenbod: het toont 15-17 HCP, evenwichtige verdeling en dekking in de kleur van de tegenpartij.
- Een Informatiedoublet zegt meestal: "Partner, ik heb Openingskracht, kortheid in hun kleur en steun voor de ongeboden kleuren. Kies jij maar." Dat is iets anders dan straf.
- Kwetsbaarheid is het waarschuwingslampje van de score. Down gaan kan duurder zijn, maar een gemaakte Manche levert ook meer op.

### Interactieve biedvoorbeelden

- Rechts opent 1 ruiten, Zuid heeft vijf schoppen en genoeg kracht. Vraag: "Is 1 schoppen als Volgbod logisch?"
- Rechts opent 1 harten, Zuid heeft 16 HCP, evenwichtige verdeling en harten gedekt. Vraag waarom 1SA als Volgbod iets heel anders belooft dan het 1SA-Vuilnisbakkenbod.
- Links opent 1 klaveren, partner doubleert, rechts past. Vraag waarom Zuid meestal moet bieden: Biedplicht.
- Toon dezelfde hand kwetsbaar en niet-kwetsbaar. Vraag of de speler even enthousiast blijft over een dun Volgbod.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `simple-overcall-001`; laat het Volgbod leiden tot een speelbaar kleurcontract.
- Start `takeout-double-response-forced-001`; laat de speler na partners Informatiedoublet een kleur kiezen.
- Start `takeout-double-response-notrump-001`; laat zien dat Sans-atout alleen past met de juiste hand en dekking.

### Oefenvragen

1. Wat is een Volgbod?
2. Wat vraagt een Informatiedoublet aan partner?
3. Waarom is een Informatiedoublet niet hetzelfde als een strafdoublet?
4. Wat betekent Biedplicht na partners Informatiedoublet?
5. Wat verandert Kwetsbaarheid aan je risico?
6. Wat belooft 1SA als Volgbod?
7. Waarom moet een competitief bod extra uitlegbaar zijn?

### Oefenhanden

- `simple-overcall-001` - bestaand: natuurlijk Volgbod.
- `takeout-double-response-forced-001` - bestaand: verplichte kleur na Informatiedoublet.
- `takeout-double-response-notrump-001` - bestaand: 1SA na Informatiedoublet.
- `takeout-double-response-game-001` - bestaand: sterke reactie na Informatiedoublet.

### Eindopdracht

Doe de "drukke tafel"-challenge: na elke bieding zeg je hardop van welk paar het bod is en of het natuurlijk, vraagstellend of voorzichtig is.

---

## Les 12 - Sterkere afspraken

Zwakke twee, Vierde-kleur-forcing, Azenvragen en Slemintro.

### Leerdoelen

- Je maakt kennis met Zwakke twee als preemptieve Opening.
- Je begrijpt Vierde-kleur-forcing als kunstmatige vraag, niet als echte kleurbelofte.
- Je ziet Azenvragen als stap richting Slem, niet als standaard trucje.
- Je onderscheidt Manche, Kleinslem en Grootslem.
- Je leert wanneer je sterker bieden rustig moet onderzoeken en wanneer je moet afzwaaien.

### Kernbegrippen

Zwakke twee, Preemptief bod, Vierde-kleur-forcing, Forcing, Azenvragen, Slem, Kleinslem, Grootslem, Manche, Conventioneel bod.

### Korte theorieblokken

- Zwakke twee is een opening van 2 ruiten, 2 harten of 2 schoppen met een goede zeskaart en beperkte kracht, meestal 6-10 HCP. Het doel is tegelijk beschrijven en de tegenpartij ruimte afpakken.
- Vierde-kleur-forcing ontstaat nadat het partnerschap al drie echte kleuren heeft geboden. De vierde kleur is dan een kunstmatige vraag; in deze app is het Mancheforcing.
- Azenvragen is in deze cursus klassiek 4SA met een afgesproken Troefkleur. Het gaat pas over Slem als er al genoeg gezamenlijke kracht en controle lijkt te zijn.
- Slem is feestelijk, maar duur als je te optimistisch bent. Kleinslem vraagt twaalf slagen; Grootslem alle dertien.

### Interactieve biedvoorbeelden

- Openingskeuze: Zuid heeft zes schoppen en weinig HCP. Vraag of Zwakke twee in aanmerking komt.
- Biedverloop met drie kleuren geboden: toon de vierde kleur en vraag waarom Vierde-kleur-forcing geen natuurlijke kleur hoeft te beloven.
- Na sterke fit en veel HCP vraagt de speler met 4SA naar azen. Laat zien hoe Azenvragen naar 5-niveau kan leiden en waarom afzwaaien soms slim is.
- Toon de klassieke antwoorden op 4SA: 5 klaveren is 0 of 4 azen, 5 ruiten is 1 aas, 5 harten is 2 azen en 5 schoppen is 3 azen.

### Interactieve speelvoorbeelden op het bridge-bord

- Start `small-slam-after-2nt-001`; laat zien hoeveel slagen Kleinslem vraagt.
- Start `blackwood-after-2nt-transfer-001`; laat Azenvragen en afzwaaien zien in review.
- Gebruik een voorstelhand voor Zwakke twee; laat zien hoe een lange Troef-kleur in het spelen werkt, maar ook kwetsbaar kan zijn.

### Oefenvragen

1. Wat belooft Zwakke twee in grote lijnen?
2. Waarom heet een Preemptief bod storend?
3. Wat vraagt Vierde-kleur-forcing?
4. Wanneer is een bod Forcing?
5. Hoeveel slagen vraagt Kleinslem?
6. Wat vraagt 4SA in deze cursus wanneer er een Troefkleur is afgesproken?
7. Waarom gebruik je Azenvragen niet zomaar zonder plan?

### Oefenhanden

- `small-slam-after-2nt-001` - bestaand: Kleinslem in Sans-atout.
- `blackwood-after-2nt-transfer-001` - bestaand: Azenvragen en afzwaaien.
- `lesson-12-weak-two-001` - voorstel: Zwakke twee openen.
- `lesson-12-fourth-suit-forcing-001` - voorstel: Vierde-kleur-forcing als vraagbod.

### Eindopdracht

Speel de "slemthermometer": geef na de bieding een temperatuur van 1 tot 5. 1 is "stoppen met thee", 5 is "Slem onderzoeken".

---

## Implementatienotities

Deze cursusstructuur is inhoudelijk. Implementatie kan per les klein gebeuren:

1. Werk het gedeelde lescontract uit in `scripts/learning/lessons.js` met korte hoofdstukken, oefenhanden, `tableTask` en `boardGuidance`.
2. Zet rijke vraagsets, casinos, races of filters voor standalone pagina's in een lesdata-module, zodat de pagina-controller alleen rendert en interactie afhandelt.
3. Voeg alleen ontbrekende oefenhanden toe die echt nodig zijn voor die les.
4. Houd de kaart op `lessons/index.html` compact: titel, leerdoelen en een knop `Start les`.
5. Koppel tafeloefeningen vanuit hoofdstukken met `chapter`, `return`, een compacte `tableTask` en alleen noodzakelijke `boardGuidance`.
6. Kies voor korte tafelsituaties bij voorkeur 1 bod, 1 kaart, 1 slagmoment of 1 reviewcheck; gebruik `type: hand` alleen als de les echt een volledige hand vraagt.
7. Houd normale gameplay rustig; uitgebreide tekst hoort in lesmodus, review, AI-suggesties of developer mode.
8. Laat lesfeedback alleen hard corrigeren als de engine de regel betrouwbaar kan onderbouwen.
9. Draai voor lesdata minimaal `npm run test:unit`; draai browser smoke wanneer lesson navigation, startflow, `tableTask` completion of bordbegeleiding wijzigt.

## Acceptatiecriteria voor de hele cursus

- Alle 12 lessen hebben een duidelijke opbouw en gebruiken geen jargon voordat het is uitgelegd.
- Het lesoverzicht blijft compact: titel, leerdoelen en een enkele `Start les`-knop per geselecteerde les.
- Alle kernbegrippen gebruiken de spelling uit `glossary.js`.
- Alle biedafspraken volgen `docs/vijfkaart-hoog-systeem.md`.
- Elke les bevat minimaal 6 oefenvragen en minimaal 4 oefenhanden of voorstelhanden.
- Elke les bevat minstens een biedmoment en een speelvoorbeeld op het bestaande bridge-bord.
- Elke hoofdstukstart naar het bridge-bord keert met `Terug naar les` terug naar hetzelfde hoofdstuk.
- Korte tafelsituaties hebben een duidelijke `tableTask` completion en blokkeren of dempen de gewone flow na afronding.
- Lesmodus overschrijft opgeslagen instellingen niet; developer mode, AI-suggesties en speelgeschiedenis blijven tijdelijk uit tijdens de tafelsituatie.
- De toon blijft vriendelijk, helder en speels.
- De cursus ondersteunt de huidige Vijfkaart-Hoog-afspraken zonder te doen alsof ze universeel zijn.
- De route eindigt met lichtgevorderde herkenning, niet met de claim dat spelers alle conventies zelfstandig beheersen.
