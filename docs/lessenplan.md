# Lessenplan Bridgetafel

Status: voorstel  
Scope: `bridge-app` lesmodus en oefenhanden

Dit lessenplan vertaalt de huidige 12-delige lesroute naar een praktische product- en implementatierichting. Het doel is niet om een boek te vervangen, maar om beginners met korte uitleg, vaste oefenhanden en betrouwbare feedback steeds zelfstandiger bridge te laten spelen.

## Doelgroep

Primaire doelgroep:

- Beginners die de app gebruiken om bridge stap voor stap te leren.
- Testers die nog niet alle bridgebegrippen kennen.
- Later: spelers die Vijfkaart Hoog / Start met Bridge 1 & 2 willen oefenen.

Voor deze doelgroep geldt:

- Minder tekst tijdens normaal spelen is beter.
- Lesmodus mag meer uitleg geven, maar per stap kort.
- Feedback moet alleen stellig zijn wanneer de engine het betrouwbaar weet.
- Herhaalbaarheid is belangrijk: elke les moet vaste oefenhanden kunnen starten.

## Didactische principes

1. Eerst tafelritme, dan regels.  
   De speler moet eerst begrijpen wie aan de beurt is, wat een slag is, wanneer dummy verschijnt en hoe een hand eindigt.

2. Een les heeft een concreet mini-doel.  
   Bijvoorbeeld: “herken 15-17 gebalanceerd” of “bekennen moet”. Geen brede hoofdstukken zonder actie.

3. Theorie wordt gekoppeld aan een oefenhand.  
   Elke les moet minstens een oefenhand hebben die het lesdoel zichtbaar maakt.

4. Feedback is sober en betrouwbaar.  
   Geen harde foutmelding wanneer de bied- of speelengine onzeker is. Dan liever: “De app zou hier X overwegen omdat...”

5. Herhaling zit in review.  
   Na de hand moet de speler kunnen teruglezen: contract, bieding, slagen, score en het lespunt.

6. De basisgame blijft rustig.  
   Uitgebreide uitleg hoort in `lessons.html`, AI-suggesties, review, woordenlijst of developer mode.

## Lesformat

Elke les krijgt bij voorkeur deze structuur:

```text
1. Instapvraag / mini-uitleg
2. Kernbegrip in maximaal 3 korte punten
3. Miniquiz of herkenvraag
4. Start oefenhand
5. Reviewfeedback gekoppeld aan het lesdoel
6. Optioneel: tweede oefenhand voor herhaling
```

Velden in `scripts/learning/lessons.js`:

- `id` - stabiele les-id.
- `number` - routevolgorde.
- `title` - korte titel.
- `challenge` - wat de speler gaat proberen.
- `focus` - labels voor routekaart.
- `handIds` - oefenhanden die bij de les horen.
- `chapters` - korte hoofdstukken met blocks, quiz en oefenlinks.
- `reviewFeedback` - lesgerichte feedback na afloop.
- `teachingPoints` - kernpunten die in de review terugkomen.
- `startMode` - bijvoorbeeld `play` als de les direct bij het spelen start.

## Route-overzicht

### Fase 1 - Tafelritme en kaartspel

Doel: de speler kan een hand volgen zonder biedtheorie te hoeven begrijpen.

#### Les 1: Wat is bridge?

Huidige status: rijk uitgewerkt.

Leerdoelen:

- Vier spelers en partners herkennen.
- Begrijpen wat een slag is.
- Dummy herkennen na de uitkomst.
- Bekennen toepassen.

Oefenhand:

- `draw-trumps-001`

Acceptatie:

- Speler kan zeggen wie Zuid, Noord, Oost en West zijn.
- Speler begrijpt dat dummy pas na de uitkomst open komt.
- Speler ziet waarom niet elke kaart legaal speelbaar is.

Volgende verbetering:

- Houd deze les als kwaliteitslat voor lessen 2-12.

#### Les 2: Punten en handtypen

Huidige status: compact route-item.

Leerdoelen:

- Honneurpunten tellen: A=4, H=3, V=2, B=1.
- Gebalanceerde hand herkennen.
- Begrijpen waarom 1SA een begrensde opening is.

Oefenhand:

- `one-nt-opening-001`

Benodigde content:

- Mini-uitleg honneurpunten.
- Herkenvraag: “Hoeveel punten heeft Zuid?”
- Herkenvraag: “Is deze hand gebalanceerd?”
- Oefening waarin Zuid of AI 1SA opent.

Reviewfeedback:

- Puntenaantal van Zuid.
- Waarom 1SA logisch was of waarom een kleur beter was.

Acceptatie:

- Speler kan een simpele 15-17 SA-hand herkennen.

### Fase 2 - Eerste biedbeslissingen

Doel: de speler begrijpt de eerste Vijfkaart Hoog-keuzes zonder competitief bieden.

#### Les 3: Eerste openingen

Leerdoelen:

- Openen vanaf voldoende kracht.
- Vijfkaart hoog prioriteit geven.
- Verschil tussen 1 harten, 1 schoppen, 1SA en lage-kleur opening globaal zien.

Oefenhand:

- `one-heart-opening-001`

Benodigde content:

- “Heb ik genoeg om te openen?”
- “Heb ik een vijfkaart hoog?”
- Miniquiz met 3 handen: pas, 1H/1S, 1SA.

Reviewfeedback:

- Regel die de opening koos.
- Korte uitleg van punten + lengte.

Acceptatie:

- Speler begrijpt waarom een vijfkaart hoog vaak eerst komt.

#### Les 4: Fit zoeken na 1 hoog

Leerdoelen:

- Partnersteun herkennen.
- Driekaart steun na 1 hoog begrijpen.
- Simpele verhoging versus manche-interesse globaal onderscheiden.

Oefenhand:

- `response-raise-after-1s-001`

Benodigde content:

- Wat is een fit?
- Waarom 8+ kaarten samen prettig is.
- Oefenvraag: “Partner opent 1S, jij hebt 3 schoppens. Is er steun?”

Reviewfeedback:

- Aantal troeven samen.
- Waarom verhogen rustiger is dan een nieuwe kleur bieden.

Acceptatie:

- Speler kan steun na 1 hoog herkennen.

#### Les 5: Zonder fit: nieuwe kleur of SA

Leerdoelen:

- Geen fit met partners hoge kleur herkennen.
- Eigen biedbare kleur tonen.
- SA overwegen bij gebalanceerde hand zonder fit.

Oefenhand:

- `response-new-suit-after-1h-001`

Benodigde content:

- Beslisboom: steun? eigen kleur? SA?
- Uitleg dat een nieuwe kleur forcing/zoekend kan zijn, afhankelijk van systeemniveau.
- Korte quiz met “wel/geen fit”.

Reviewfeedback:

- Waarom nieuwe kleur tonen beter was dan partner direct steunen.

Acceptatie:

- Speler begrijpt dat “geen fit” niet automatisch passen betekent.

#### Les 6: Openingen in lage kleuren

Leerdoelen:

- Lage-kleur opening als startpunt zien, niet als definitieve troefkeuze.
- Na 1K/1R zoeken naar hoge kleuren.
- Vierkaart hoog als antwoord herkennen.

Oefenhand:

- `minor-opening-find-major-001`

Benodigde content:

- “Lage kleur opent vaak de bieding, maar hoge kleuren blijven belangrijk.”
- Herkenvraag: welke hoge kleur kan responder tonen?

Reviewfeedback:

- Waarom responder een hoge kleur toont in plaats van de lage kleur te steunen.

Acceptatie:

- Speler ziet dat een lage-kleur opening niet meteen betekent: we spelen klaveren/ruiten.

### Fase 3 - Contract, score en speelplan

Doel: de speler koppelt bieden aan contractdoel en leert planmatig spelen.

#### Les 7: Contractdoelen en score

Leerdoelen:

- Contractniveau lezen.
- Begrijpen hoeveel slagen nodig zijn.
- Manchebonus herkennen, vooral kwetsbaar.

Oefenhand:

- `game-bonus-vulnerable-001`

Benodigde content:

- “4H betekent 10 slagen.”
- Waarom kwetsbaar gemaakte manche 620 kan scoren.
- Miniquiz: hoeveel slagen nodig voor 2H, 3SA, 4H?

Reviewfeedback:

- Contractdoel.
- Gehaalde slagen.
- Scoreopbouw.

Acceptatie:

- Speler kan contractniveau naar benodigde slagen vertalen.

#### Les 8: Spelen als leider: maak een plan

Leerdoelen:

- Winners/losers globaal herkennen.
- Troeven trekken wanneer dat veilig en logisch is.
- Speelplanpaneel gebruiken zonder te verdrinken in details.

Oefenhand:

- `draw-trumps-001`

Benodigde content:

- “Stop even na dummy: wat is troef, wat kan misgaan?”
- Troeven trekken als basisidee.
- Miniquiz: wanneer is troeven trekken vaak goed?

Reviewfeedback:

- Welke planregel actief was.
- Of kaartadvies het zichtbare plan volgde.

Acceptatie:

- Speler gebruikt het speelplanpaneel als hulp, niet als ruis.

#### Les 9: Dummy en tempo

Leerdoelen:

- Dummy als bron van slagen/entrees zien.
- Een verliezer weggooien op een winnaar.
- Timing begrijpen: kans eerst gebruiken voordat de tegenpartij aan slag komt.

Oefenhand:

- `discard-loser-on-winner-001`

Benodigde content:

- Voorbeeld: verliezer in hand weg op hoge kaart in dummy.
- Herkenvraag: welke verliezer kan verdwijnen?

Reviewfeedback:

- Welke discard-kans er was.
- Waarom timing belangrijk was.

Acceptatie:

- Speler ziet dummy niet alleen als extra kaarten, maar als planonderdeel.

### Fase 4 - Tegenspel en conventies

Doel: speler leert basisverdediging en de eerste conventionele SA-vervolgen.

#### Les 10: Basis tegenspel

Leerdoelen:

- Uitkomen uit een honneurserie.
- Tweede hand laag / derde hand hoog als basisidee herkennen.
- Partner helpen met veilige, uitlegbare regels.

Oefenhand:

- `lead-sequence-001`

Benodigde content:

- “Tegen kleurcontract: start liever uit een serie dan onder een losse honneur.”
- Miniquiz: welke kaart uit HVB?

Reviewfeedback:

- Uitkomstregel die de app koos.
- Waarom die uitkomst partner helpt.

Acceptatie:

- Speler begrijpt minstens een eenvoudige veilige uitkomstregel.

#### Les 11: 1SA-vervolgen: Stayman en Jacoby

Leerdoelen:

- Stayman als vraag naar vierkaart hoog herkennen.
- Jacoby-transfer als overdracht naar vijfkaart hoog herkennen.
- Contractbetekenis scheiden van biedbetekenis: 2R kan harten betekenen.

Oefenhand:

- `stayman-after-1nt-001`

Benodigde extra oefenhanden:

- Een Jacoby-transfer naar harten.
- Een Jacoby-transfer naar schoppen.
- Een Stayman-hand met wel/geen fit.

Benodigde content:

- Twee tegels: “vraag” vs “overdracht”.
- Korte waarschuwing: het bod zegt niet altijd letterlijk de kleur.
- Miniquiz: wat betekent 2K na 1SA? Wat betekent 2R na 1SA?

Reviewfeedback:

- Welke conventie gebruikt werd.
- Wat het bod betekent, niet alleen welk contract geboden werd.

Acceptatie:

- Speler kan uitleggen dat sommige biedingen afspraken zijn.

### Fase 5 - Integratie en zelfstandigheid

Doel: speler speelt hele spellen en gebruikt review om zelf te leren.

#### Les 12: Reviewles: hele spellen

Leerdoelen:

- Hele hand spelen zonder stap-voor-stap instructie.
- Review gebruiken om bieding, slagen en score terug te lezen.
- Herhaalcode/feedback gebruiken wanneer iets onduidelijk is.

Oefenhand:

- `game-bonus-vulnerable-001`

Benodigde content:

- Checklist voor na een bord:
  - Wat was het contract?
  - Wie was leider?
  - Hoeveel slagen waren nodig?
  - Hoeveel slagen zijn gemaakt?
  - Welke bieding of kaart was het meest leerzaam?

Reviewfeedback:

- Geen lange nieuwe theorie; vooral terugwijzen naar reviewonderdelen.

Acceptatie:

- Speler kan na afloop zelfstandig de review lezen en een concrete vraag/feedback formuleren.

## Implementatievolgorde

Aanbevolen volgorde, klein en testbaar:

1. Maak les 2 rijk zoals les 1: hoofdstukken, quiz, reviewfeedback.
2. Daarna lessen 3-6 rijk maken, want die vormen de eerste biedbasis.
3. Daarna lessen 7-9, omdat score en speelplan zichtbaar veel beginnerwaarde geven.
4. Daarna les 10 en 11, met extra oefenhanden waar de huidige catalogus nog dun is.
5. Sluit af met les 12 als integratieles en testerchecklist.

Niet alles tegelijk omzetten. Per les:

- update `scripts/learning/lessons.js`;
- voeg ontbrekende oefenhand toe in `practice-hands/catalog/`;
- voeg/werk unit tests bij;
- draai `npm run test:unit`;
- draai browser smoke als de lesson page of startflow verandert.

## Benodigde nieuwe oefenhanden

Waarschijnlijk nuttig:

- Les 2: extra 12-14 gebalanceerd, zodat speler ziet waarom niet 1SA openen.
- Les 3: pas-hand met te weinig punten; 1S-opening naast 1H-opening.
- Les 4: 3-kaart steun en 4-kaart steun na 1 hoog.
- Les 5: geen fit maar eigen vier/vijfkaart.
- Les 6: lage-kleur opening met responder vierkaart hoog.
- Les 9: tweede discard/tempo-situatie.
- Les 11: Jacoby-transfer naar harten en schoppen; Stayman met misfit.
- Les 12: een neutraal volledig bord zonder speciale truc, voor eindtoets.

## Feedbackniveaus

### Tijdens normale game

- Minimaal.
- Alleen turn, legaliteit, suggestie indien AI-suggesties aan staan.

### Tijdens les

- Korte missie bovenin.
- Gerichte hints alleen voor het lesdoel.
- Geen algemene bridgecollege-tekst naast de tafel.

### Na afloop in review

- Contract en score.
- Lespunten.
- Eventuele biedfeedback.
- Kaartfeedback alleen als de regel betrouwbaar is.

### Developer mode

- Technische regel-id's, heuristieken en enginekeuzes.
- Geschikt voor CP/Tungsten om gedrag te debuggen.

## Test- en acceptatiecriteria

Per les:

- Les staat in `BridgeLessons.allLessons()` met unieke id.
- `validateLessons(practiceHands)` blijft groen.
- Alle `handIds` bestaan.
- Hoofdstukken hebben titel, summary en geldige quizopties.
- Oefenlink opent de juiste hand.
- Review toont lespunten na afloop.
- Geen harde feedbackclaim zonder enginebewijs.

Voor de hele route:

- `npm run test:unit` groen.
- Browser smoke groen als lesson navigation of startflow wijzigt.
- Beginner kan les 1-3 doorlopen zonder uitleg buiten de app.

## Productnotities

- Les 1 is de kwaliteitslat: rustig, concreet, hoofdstukken + oefening.
- Lessen 2-12 mogen eerst compact blijven, maar elke uitbreiding moet dezelfde structuur volgen.
- De woordenlijst moet begrippen uit lessen ondersteunen, niet vervangen.
- Lesfeedback moet later kunnen groeien naar foutgerichte feedback, maar nu vooral enginegedrag en lesdoel uitleggen.
- Het lessenplan moet meegroeien met echte testerfeedback; concrete afhakers zijn belangrijker dan theoretische volledigheid.

## Aanbevolen volgende stap

Werk les 2 volledig uit als sjabloon voor de rest:

- hoofdstukken voor honneurpunten, handverdeling en 1SA;
- miniquiz over punten tellen;
- reviewfeedback voor `one-nt-opening-001`;
- eventueel een extra oefenhand met te weinig punten voor 1SA;
- unit test dat les 2 hoofdstukken en quiz bevat.
