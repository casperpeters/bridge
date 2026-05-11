# Lesformat Bridgetafel

Status: herbruikbaar inhoudelijk lesformat  
Scope: de 12 lessen uit `docs/lessenplan.md`, oefenhanden, quizzen en toekomstige lesfeedback

Dit format is de standaardvorm voor alle Bridgetafel-lessen, tenzij een les aantoonbaar beter werkt met een andere setup. Het format is inhoudelijk bedoeld: het helpt lessen schrijven die later netjes passen in `scripts/learning/lessons.js`, oefenhanden in `practice-hands/` en glossary-linking via `scripts/learning/glossary.js`.

Gebruik `docs/vijfkaart-hoog-systeem.md` als systeembron. Lescopy mag simpeler zijn dan de engine, maar mag geen andere biedafspraken aanleren.

## Ontwerpprincipes

- Schrijf voor online leren: korte stukken, vaak klikken, meteen feedback.
- Laat de speler steeds iets doen: kiezen, tellen, aanwijzen, voorspellen of proberen aan tafel.
- Gebruik glossary-termen letterlijk wanneer ze in `glossary.js` staan.
- Houd normale gameplay compact; uitgebreide uitleg hoort in de les, review, AI-suggesties of developer mode.
- Maak feedback vriendelijk en concreet: wat zag je, waarom is dat logisch, wat probeer je nu?
- Geef geen harde foutcorrectie als de engine of oefenhand het niet betrouwbaar kan onderbouwen.
- Gebruik `1SA` in lescopy; map naar `1NT` waar code of oefenhanden dat nodig hebben.
- Gebruik de bridgetafel voor korte, concrete lesmomenten: meestal 1 bod, 1 kaart, 1 slagmoment of 1 reviewcheck.
- Laat terugkeer naar de les altijd expliciet zijn via `Terug naar les`; geen automatische redirect na een tafelsituatie.

## Vaste lesopbouw

Elke les gebruikt deze onderdelen in deze volgorde:

1. Welkom aan tafel - korte, leuke introductie.
2. Wat leer je vandaag? - 3 tot 5 concrete leerdoelen.
3. De situatie - een herkenbare bridgevraag.
4. De theorie in kleine stappen - maximaal 5 korte blokken.
5. Kijk mee aan tafel - een uitgewerkt bied- of speelvoorbeeld.
6. Jij bent aan de beurt - interactieve vraag met feedback.
7. Oefenen met handen - automatisch genereerbare handen met criteria.
8. Veelgemaakte beginnersfouten - 3 tot 5 valkuilen.
9. Mini-quiz - minimaal 6 vragen.
10. Eindchallenge - leuke opdracht op het bestaande bridge-bord.
11. Samenvatting - 5 kernzinnen.

Deze opbouw hoort bij de losse lespagina zelf. Het algemene lessenoverzicht toont niet al deze onderdelen.

## Lessenoverzicht

Op `lessons/index.html` is de leskaart een rustige keuzehulp, geen inhoudsopgave. Per geselecteerde les staat daar alleen:

- de titel;
- `Leerdoelen`;
- een enkele knop `Start les`.

Richtlijnen:

- Toon op het overzicht geen losse hoofdstukken, onderdelen, quizzen, oefenhanden of tafelmomenten.
- Maak onderdelen op het overzicht niet apart openklikbaar.
- Gebruik geen extra kop boven de startknop als de knop zelf al `Start les` zegt.
- De losse lespagina mag daarna wel kaartnavigatie, oefeningen, quizzen en tafellussen tonen.
- `lesson.summary` mag bestaan als interne korte belofte of fallback, maar het overzicht gebruikt primair `learningGoals`.

## Kaartnavigatie voor losse lespagina's

Nieuwe losse lespagina's gebruiken de gedeelde kaartstructuur uit `styles/lesson-cards.css` en `scripts/learning/lesson-cards.js`. Daarmee ziet de cursist steeds een leskaart tegelijk en staat de `Vorige`/`Volgende`-balk onder de actieve kaart.

Minimaal HTML-contract:

```html
<link rel="stylesheet" href="styles/lesson-cards.css" />

<main data-lesson-card-page>
  <nav class="lesson-anchor-nav" aria-label="Onderdelen van deze les" data-lesson-card-nav>
    <a href="#leerdoelen">Leerdoelen</a>
    <a href="#theorie">Theorie</a>
  </nav>

  <section id="leerdoelen" class="lesson-section-card" data-lesson-card>
    <h2>Wat leer je vandaag?</h2>
  </section>

  <section id="theorie" class="lesson-section-card" data-lesson-card>
    <h2>De theorie in kleine stappen</h2>
  </section>

  <div class="lesson-card-controls" aria-label="Navigatie door leskaarten" data-lesson-card-controls>
    <button class="lesson-card-nav" type="button" data-lesson-previous>Vorige</button>
    <p class="lesson-card-status" aria-live="polite">
      <span data-lesson-card-position></span>
      <strong data-lesson-card-title></strong>
    </p>
    <button class="lesson-card-nav" type="button" data-lesson-next>Volgende</button>
  </div>
</main>

<script src="scripts/learning/lesson-cards.js"></script>
```

Richtlijnen:

- Elke kaart heeft een uniek `id`, een `h2` en `data-lesson-card`.
- De ankerlinks in `data-lesson-card-nav` verwijzen naar die kaart-ids.
- De navigatiebalk staat na de leskaarten, dus onderaan de actieve kaart.
- Les-specifieke CSS mag extra layoutclasses toevoegen, maar de kaartnavigatie blijft in de gedeelde CSS.
- Les-specifieke JavaScript regelt alleen oefeningen, quizzen of handgeneratie; kaartnavigatie blijft in `lesson-cards.js`.

## Lesmetadata

Vul dit bovenaan elke les intern in, ook als niet alles zichtbaar wordt voor de speler.

```text
Lesnummer:
Titel:
Korte belofte:
Hoofdfocus: Bieden / Spelen / Score / Review / Tegenspel
Voorkennis:
Nieuwe glossary-termen:
Herhaalde glossary-termen:
Biedprofiel: fiveCardHigh
Primaire oefenhanden:
Benodigde engine-uitleg: ruleId, planAction of reviewtekst
Wanneer feedback hard mag zijn:
Wanneer feedback voorzichtig moet blijven:
Hoofdstukken met tafelsituatie:
Return-doel per hoofdstuk:
```

## Hoofdstukken en korte tafelsituaties

Een leshoofdstuk mag de bestaande bridgetafel gebruiken als korte oefenlus. De speler leest of beantwoordt iets in de les, klikt op oefenen, doet aan tafel precies het kernmoment, ziet een klaar-kaart en kiest daarna zelf `Terug naar les`.

Gebruik dit voor:

- 1 bod kiezen, bijvoorbeeld openen met `1SA` of passen;
- 1 kaart spelen, bijvoorbeeld kleur bekennen of een uitkomst kiezen;
- 1 slagmoment bekijken, bijvoorbeeld Dummy reveal of Slagwinnaar;
- 1 reviewmoment controleren, bijvoorbeeld Contract, resultaat of score;
- alleen uitzonderlijk een volledige hand uitspelen.

Schrijf elke tafelsituatie als hoofdstuktaak:

```yaml
chapter:
  id: een-sa-opening-herkennen
  title: 1SA-hand herkennen
  handId: one-nt-opening-001
  tableTask:
    type: bid
    completion: southBid
    doneTitle: Bod gedaan
    doneBody: Je hebt het openingsbod gekozen. Ga terug naar de les om de keuze te vergelijken.
    returnLabel: Terug naar les
    retryLabel: Nog eens proberen
  boardGuidance:
    - id: valueThenBid
      target: bidControls
      gate: allowHumanBid
      badge: Openingskeuze
      title: Waardeer eerst Zuid
      body: Tel HCP, kijk of de verdeling evenwichtig is en kies daarna het openingsbod.
      buttonLabel: Ik kies mijn bod
```

`chapter.id` is het anker waarnaar de speler terugkeert. Een startlink naar de tafel bevat daarom minimaal `lesson`, `hand`, `chapter` en een `return`-URL naar de oorspronkelijke lesplek, bijvoorbeeld `lessons/index.html?lesson=...#chapter-id` of een losse `lessons/NN-slug.html#stap`.

### `tableTask`

`tableTask` beschrijft wanneer een korte tafelsituatie klaar is en wat de speler daarna ziet.

Velden:

- `type`: `bid`, `card`, `trick`, `review` of `hand`.
- `completion`: concrete klaarvoorwaarde, bijvoorbeeld `southBid`, `northSouthCard`, `trickWinnerShown`, `reviewReached` of `handComplete`.
- `doneTitle`: korte titel op de klaar-kaart.
- `doneBody`: 1 tot 2 zinnen die het lesmoment afronden.
- `returnLabel`: meestal `Terug naar les`.
- `retryLabel`: optioneel; gebruik dit alleen wanneer opnieuw proberen didactisch zinvol is.

Richtlijnen:

- Kies de kleinste completion die het lesdoel bewijst.
- Bij `bid` is meestal 1 bod door Zuid genoeg.
- Bij `card` is meestal 1 kaart door Zuid of Dummy genoeg.
- Bij `trick` stopt de situatie zodra de Slagwinnaar zichtbaar is.
- Bij `review` stopt de situatie zodra het relevante reviewpaneel is bereikt.
- Bij `hand` speelt de speler bewust de hele hand uit; gebruik dit spaarzaam.
- Na completion hoort gewone gameplay geblokkeerd of gedempt te blijven totdat de speler `Terug naar les` of `Nog eens proberen` kiest.

### `boardGuidance`

`boardGuidance` is de coachlaag op de tafel. Gebruik die voor spotlight en alleen voor noodzakelijke flowblokkades.

Ondersteunde targets:

- `contract`
- `bidControls`
- `auctionLog`
- `dummy`
- `legalCards`
- `trumpCards`
- `trickArea`
- `trickWinner`
- `review`
- `lessonPanel`

Ondersteunde gates:

- `none` - alleen spotlight/uitleg, geen blokkade.
- `allowHumanBid` - blokkeert het bod totdat de speler de coachstap bevestigt.
- `allowHumanPlay` - blokkeert de kaart totdat de speler de coachstap bevestigt.
- `advanceTrick` - laat de speler bewust naar de volgende slag gaan.

Gebruik gates alleen bij kernmomenten. Als de speler al veilig verder kan zonder uitleg te missen, gebruik `gate: none`.

### Tijdelijke lesinstellingen

In lesmodus zijn rustige tafelinstellingen tijdelijk leidend:

- `showPlayHistory = false`;
- `guidanceMode = false`;
- `developerMode = false`.

Deze waarden mogen opgeslagen voorkeuren niet overschrijven. Lescopy mag er dus niet van uitgaan dat developer-uitleg, AI-suggesties of speelgeschiedenis zichtbaar blijven tijdens een korte tafelsituatie.

## 1. Welkom aan tafel

Doel: de speler ontspannen binnenhalen en nieuwsgierig maken.

Richtlijn:

- 2 tot 4 korte zinnen.
- Noem een herkenbaar tafelmoment, niet meteen een theoriehoofdstuk.
- Een klein grapje mag, maar de bridgevraag moet helder blijven.
- Eindig met een zachte actie: "Kijk eerst eens naar Zuid" of "We gaan samen tellen."

Voorbeeldvorm:

```text
Welkom aan tafel. Vandaag draait alles om [leskern].
Je hoeft nog niet alles perfect te zien; je zoekt alleen het eerste goede spoor.
Aan het einde kun je [concreet resultaat] aan een echte hand herkennen.
```

## 2. Wat leer je vandaag?

Doel: de les belooft concreet gedrag, geen abstract hoofdstuk.

Richtlijn:

- 3 tot 5 leerdoelen.
- Begin elk leerdoel met een werkwoord: herken, tel, kies, verklaar, speel, vergelijk.
- Koppel minimaal 2 leerdoelen aan glossary-termen.
- Laat elk leerdoel terugkomen in oefening, quiz of eindchallenge.

Voorbeeldvorm:

```text
- Je herkent [glossary-term] in een echte bieding.
- Je kiest tussen [optie A] en [optie B] met de afspraak uit Vijfkaart-Hoog.
- Je legt in een zin uit waarom [bod/kaart] logisch is.
- Je probeert dit op het bridge-bord met een vaste oefenhand.
```

## 3. De situatie

Doel: een herkenbare bridgevraag zetten voordat de theorie begint.

Richtlijn:

- 1 concrete vraag aan Zuid, Noord/Zuid of de leider.
- Gebruik echte tafelcontext: kwetsbaarheid, dealer, biedverloop, dummy of slagpositie alleen als dat nodig is.
- Laat de speler eerst voorspellen voordat de uitleg antwoord geeft.
- Houd de vraag geschikt voor beginners: een beste eerste stap is genoeg.

Voorbeeldvorm:

```text
Zuid is aan de beurt. Partner heeft [bod/actie] gedaan.
Je hebt [kracht/verdeling/speelpositie].
Wat is nu je eerste vraag aan jezelf?
```

Goede situatievragen:

- "Open je met 1SA of met een kleur?"
- "Hebben Noord/Zuid samen een Fit?"
- "Welke kleur wordt je Werkkleur in Sans-atout?"
- "Wie komt uit, en wanneer verschijnt Dummy?"

## 4. De theorie in kleine stappen

Doel: maximaal 5 korte theorieblokken die elk maar een idee dragen.

Elke theorieblok gebruikt dit vaste mini-format:

```text
### Stap [nummer] - [korte titel]

Kernzin:
[Een zin die de speler mag onthouden.]

Uitleg:
[3 tot 6 korte zinnen. Maximaal een nieuw idee.]

Glossary-termen:
[2 tot 5 termen uit glossary.js, letterlijk gespeld.]

Probeer zelf:
[Een kleine tel-, kies-, wijs-aan- of voorspelvraag.]

Directe feedback:
- Als goed: [waarom dit klopt].
- Als bijna: [welk detail ontbreekt].
- Als mis: [waar opnieuw naar kijken].
```

Regels voor theorieblokken:

- Maximaal 5 blokken per les.
- Maximaal 90 woorden uitleg per blok.
- Minstens 1 "Probeer zelf"-moment na elke 2 blokken; liever in elk blok.
- Gebruik glossary-termen waar passend, vooral in titels, kernzinnen, feedback en quiz.
- Leg kunstmatige biedingen altijd uit als betekenis, niet alleen als kaartje. Voorbeeld: `2R` na `1SA` kan Jacoby-transfer naar harten zijn.
- Herhaal oude begrippen kort wanneer ze nodig zijn: "We kennen Fit al: samen minstens acht kaarten in een kleur."

Voorbeeld van een theorieblok:

```text
### Stap 2 - Stayman vraagt naar een hoge kleur

Kernzin:
Stayman is een vraag naar een vierkaart harten of schoppen.

Uitleg:
Na een 1SA-opening weet partner al veel: 15-17 HCP en een Evenwichtige verdeling. Met Stayman zoekt responder een 4-4 Fit in de Hoge kleuren. Het bod 2K betekent dan niet: "ik wil klaveren spelen", maar: "partner, heb jij een vierkaart hoog?"

Glossary-termen:
Stayman, Sans-atout, HCP, Evenwichtige verdeling, Fit, Hoge kleuren, Conventioneel bod

Probeer zelf:
Je hebt 8 HCP en vier harten na partners 1SA. Vraag je met Stayman?

Directe feedback:
- Als goed: Ja, je zoekt eerst of er een hoge-kleurfit is.
- Als bijna: Let op: vierkaart hoog is precies waarom Stayman bestaat.
- Als mis: Kijk opnieuw naar de combinatie 1SA, HCP en vierkaart hoog.
```

## 5. Kijk mee aan tafel

Doel: een uitgewerkt voorbeeld waarin de speler ziet hoe de theorie aan tafel klinkt.

Kies per les een biedvoorbeeld of speelvoorbeeld. Gebruik beide alleen als dat de les niet te lang maakt.

Format voor een biedvoorbeeld:

```text
Situatie:
[Dealer, kwetsbaarheid indien relevant, Zuid-hand of Noord/Zuid-context.]

Biedverloop:
1. [Bod] - [korte betekenis]
2. [Bod] - [korte betekenis]
3. [Eindcontract of tussenconclusie]

Waarom dit werkt:
[Korte uitleg met glossary-termen.]

Let op:
[Een beginnerverwarring, bijvoorbeeld biedkaartje versus betekenis.]
```

Format voor een speelvoorbeeld:

```text
Situatie:
[Contract, leider, dummy, uitkomst.]

Kijkstappen:
1. Wat is het Contract?
2. Wie is Leider en wie is Dummy?
3. Wat is Troef of is het Sans-atout?
4. Wat is het eerste plan: Troef trekken, Werkkleur kiezen, Stopper bewaren, Aftroeven of iets anders?
5. Welke kaart probeer je nu?

Waarom dit werkt:
[Korte uitleg met glossary-termen en eventueel planAction.]
```

Feedbackregel: de tekst zegt niet "dit is altijd goed", maar "in deze situatie is dit logisch omdat ...".

## 6. Jij bent aan de beurt

Doel: de speler maakt zelf een keuze en krijgt directe feedback.

Richtlijn:

- 1 hoofdvraag per lesonderdeel.
- 2 tot 4 opties.
- Elke optie krijgt eigen feedback.
- De juiste optie krijgt een korte bevestiging plus reden.
- Foute opties leggen uit welk detail je over het hoofd ziet.
- Bied bij twijfel een tweede poging aan in plaats van meteen door te gaan.

Invulvorm:

```text
Vraag:
[Wat bied/speel/kies je nu?]

Opties:
A. [optie]
B. [optie]
C. [optie]

Feedback:
A. [correct/bijna/mis + uitleg]
B. [correct/bijna/mis + uitleg]
C. [correct/bijna/mis + uitleg]

Glossary-termen in feedback:
[termen]
```

Geschikte interacties:

- Kies het bod.
- Kies de kaart.
- Wijs Leider, Dummy, Troef of Uitkomst aan.
- Tel HCP.
- Tel benodigde slagen bij het Contract.
- Kies tussen Troef trekken, Aftroeven, Werkkleur ontwikkelen of Stopper bewaren.

## 7. Oefenen met handen

Doel: elke les heeft oefenhanden die vastgelegd of automatisch genereerbaar zijn.

Elke les bevat minimaal 4 handen of handcriteria:

- 1 instaphand: precies het lesdoel, weinig ruis.
- 1 variatiehand: hetzelfde doel met een kleine draai.
- 1 herkenningshand: speler moet kiezen of de regel wel of niet past.
- 1 challengehand: lesdoel in een echte tafelcontext met review.

Gebruik bestaande oefenhand-id's waar mogelijk. Ontbrekende handen krijgen een voorstel-id en criteria, zonder te doen alsof ze al bestaan.

Criteriaformat:

```yaml
- id: lesson-[nn]-[slug]-001
  status: bestaand | voorstel
  lesdoel: "..."
  fase: bidding | play | review | score
  startmodus: auction | play | complete
  spelerstaak: "Wat moet Zuid/de leider/de tegenspeler doen?"
  tableTask:
    type: bid | card | trick | review | hand
    completion: southBid | northSouthCard | trickWinnerShown | reviewReached | handComplete
    doneTitle: ""
    doneBody: ""
    returnLabel: "Terug naar les"
    retryLabel: ""
  systeemafspraak: "fiveCardHigh"
  vaste_context:
    dealer: any | N | E | S | W
    kwetsbaarheid: any | none | NS | EW | both
    biedverloop_prefix: []
    contract: ""
    leider: ""
    uitkomst: ""
  handcriteria:
    zuid:
      hcp: ""
      verdeling: ""
      vereiste_kaarten: []
      verboden_patronen: []
    noord:
      hcp: ""
      verdeling: ""
      vereiste_kaarten: []
    oost_west:
      constraints: []
  verwachte_actie:
    bieding: ""
    kaart: ""
    planactie: ""
  uitleg_moet_noemen:
    glossary: []
    ruleIds: []
    waarschuwing: ""
  acceptatiecheck:
    - "De legale actie is beschikbaar."
    - "De AI-suggestie of review noemt dezelfde reden als de les."
    - "De speler kan na afloop zien waarom het resultaat klopt."
```

Voorbeeldcriteria voor een biedhand:

```yaml
- id: lesson-07-stayman-find-fit-001
  status: voorstel
  lesdoel: "Stayman gebruiken na 1SA om een hoge-kleurfit te zoeken."
  fase: bidding
  startmodus: auction
  spelerstaak: "Zuid kiest het antwoord op partners 1SA-opening."
  systeemafspraak: "fiveCardHigh"
  vaste_context:
    dealer: N
    kwetsbaarheid: any
    biedverloop_prefix: ["N:1SA"]
  handcriteria:
    zuid:
      hcp: "8-9"
      verdeling: "minstens een vierkaart harten of schoppen, geen vijfkaart hoog"
    noord:
      hcp: "15-17"
      verdeling: "Evenwichtige verdeling"
  verwachte_actie:
    bieding: "2K als Stayman"
  uitleg_moet_noemen:
    glossary: ["Stayman", "Sans-atout", "Fit", "Hoge kleuren", "Conventioneel bod"]
  acceptatiecheck:
    - "2K wordt uitgelegd als Stayman, niet als natuurlijk klaveren."
    - "De vervolgactie zoekt een Fit in harten of schoppen."
    - "Na het gevraagde bod verschijnt een klaar-kaart met Terug naar les."
```

Voorbeeldcriteria voor een speelhand:

```yaml
- id: lesson-08-draw-trumps-generated-001
  status: voorstel
  lesdoel: "Als Leider eerst Troef trekken wanneer er geen urgente Aftroever is."
  fase: play
  startmodus: play
  spelerstaak: "Zuid maakt een eerste speelplan na Dummy reveal."
  vaste_context:
    contract: "4S door Zuid"
    leider: S
    uitkomst: "veilig zijkleurkaartje door West"
  handcriteria:
    noord_zuid:
      fit: "minstens 8 schoppen samen"
      losers: "zichtbare Verliezers, maar geen directe noodzaak om eerst af te troeven"
    oost_west:
      constraints: ["tegenpartij heeft 3 tot 5 troeven samen"]
  verwachte_actie:
    planactie: "Troef trekken"
  uitleg_moet_noemen:
    glossary: ["Leider", "Dummy", "Troef", "Troef trekken", "Verliezers"]
  acceptatiecheck:
    - "Het speelplanpaneel adviseert Troef trekken."
    - "Review maakt duidelijk waarom troefcontrole nuttig was."
```

## 8. Veelgemaakte beginnersfouten

Doel: valkuilen benoemen zonder de speler af te straffen.

Richtlijn:

- 3 tot 5 valkuilen.
- Elke valkuil bevat: fout, waarom begrijpelijk, betere vraag, korte retry.
- Koppel valkuilen aan echte lesfeedback of quizdistractors.

Invulvorm:

```text
1. Valkuil: [wat doet een beginner?]
   Waarom begrijpelijk: [welke gedachte zit erachter?]
   Betere vraag: [waar moet de speler eerst naar kijken?]
   Feedbackzin: [vriendelijke zin in de app]
```

Voorbeelden:

- "1SA als Vuilnisbakkenbod verwarren met een sterke Sans-atout-hand."
- "Bij Jacoby-transfer naar het biedkaartje kijken en vergeten wat het betekent."
- "Te snel Troef trekken terwijl Dummy eerst een korte kleur kan Aftroeven."
- "Een Volgbod doen met alleen punten, maar zonder goede kleur."

## 9. Mini-quiz

Doel: minimaal 6 korte vragen die begrip checken voordat de eindchallenge begint.

Richtlijn:

- Minimaal 6 vragen.
- Mix herkenning, toepassing en kleine uitleg.
- Maximaal 4 antwoordopties.
- Elke vraag krijgt feedback voor goed en fout.
- Minimaal 3 vragen gebruiken glossary-termen letterlijk.
- Minimaal 1 vraag gebruikt een mini-biedverloop of mini-speelpositie.
- Minimaal 1 vraag vraagt om "waarom", maar het antwoord blijft kort.

Quizformat:

```text
Vraag [nummer]:
[vraag]

Type:
meerkeuze | juist/onjuist | volgorde | wijs aan | korte uitleg

Opties:
- [optie]
- [optie]
- [optie]

Correct:
[antwoord]

Feedback goed:
[bevestiging + reden]

Feedback fout:
[hint + correcte anker]

Glossary-termen:
[termen]
```

Vragenmix per les:

1. Begrip: "Wat betekent [term]?"
2. Herkenning: "Welke hand past bij [regel]?"
3. Toepassing: "Wat bied of speel je?"
4. Grensgeval: "Waarom is dit net geen [regel]?"
5. Tafelritme: "Wie is aan de beurt of wie wordt Leider?"
6. Uitleg: "Maak de zin af: ik kies dit omdat ..."

## 10. Eindchallenge

Doel: de les eindigt met een kleine missie op het bestaande bridge-bord.

Richtlijn:

- Gebruik een bestaande oefenhand of voorstel-id uit deze les.
- Geef een leuk doel, geen examenstress.
- Laat de speler voor de eerste actie voorspellen.
- Laat na afloop review of lesfeedback drie dingen teruggeven: keuze, resultaat, lesdoel.
- Maak succes haalbaar: de challenge mag over de juiste beslissing gaan, niet alleen over perfecte score.

Invulvorm:

```text
Challenge:
[speelse opdrachtnaam]

Start:
[handId, startmodus, hoofdstuk-id, tableTask en eventuele boardGuidance]

Missie:
[wat moet de speler proberen?]

Succescheck:
- [eerste juiste keuze]
- [lesdoel zichtbaar in spel of review]
- [klaar-kaart verschijnt na de afgesproken completion]
- [Terug naar les opent hetzelfde hoofdstuk]
- [speler kan in een zin uitleggen waarom]

Reviewzin:
[korte afronding met glossary-termen]
```

Voorbeelden:

- "Openingsbingo: vind in vier handen pas, 1SA, een hoge-kleuropening en een lage-kleuropening."
- "Geheime boodschap: noteer bij elk Conventioneel bod wat het kaartje zegt en wat het betekent."
- "Speelplan in vijf woorden: kies na Dummy reveal je eerste planactie."

## 11. Samenvatting

Doel: precies 5 kernzinnen die de speler mag onthouden op de losse lespagina. Dit is niet de compacte kaart op `lessons/index.html`.

Richtlijn:

- 5 zinnen, geen bullets met bijzinnen die stiekem paragrafen worden.
- Elke zin is zelfstandig en concreet.
- Gebruik glossary-termen letterlijk waar passend.
- Herhaal de belangrijkste grens: wanneer geldt de regel wel, wanneer niet?
- Laat de laatste zin vooruitwijzen naar oefenen of de volgende les.

Invulvorm:

```text
1. [Kernzin over het hoofdbegrip.]
2. [Kernzin over de keuze aan tafel.]
3. [Kernzin over een belangrijke uitzondering of grens.]
4. [Kernzin over feedback/review.]
5. [Kernzin die de speler meeneemt naar de volgende hand.]
```

## Glossary-termen per les

Gebruik deze termbank als startpunt. Voeg alleen termen toe als ze in `glossary.js` staan of bewust als toekomstige glossary-term zijn gemarkeerd.

| Les | Primaire glossary-termen |
| --- | --- |
| 1 | Slag, Contract, Troef, Sans-atout, Leider, Dummy, Uitkomst, Kleur bekennen |
| 2 | HCP, Honneur, Evenwichtige verdeling, Fit, Fitpunten, Opening, Openingskracht, Regel van 20 |
| 3 | Opening, Openaar, Openingskracht, Hoge kleuren, Lage kleuren, Sans-atout, Evenwichtige verdeling, Regel van 20 |
| 4 | Bijbod, Fit, Vuilnisbakkenbod, Hoge kleuren, Lage kleuren, Forcing, Minimum |
| 5 | Herbieding, Minimum, Maximum, Invite, Openaar, Bijbod, Fit, Manche |
| 6 | Fit, Fitpunten, Manche, Hoge kleuren, Invite, Troef trekken, Contractpunten |
| 7 | Sans-atout, Stayman, Jacoby-transfer, Conventioneel bod, Hoge kleuren, Fit, Leider |
| 8 | Leider, Dummy, Verliezers, Troef trekken, Aftroeven, Afgooien, Entree |
| 9 | Sans-atout, Werkkleur, Stopper, Ophouden, Entree, Vrijspelen, Lengteslagen, Gevaarlijke hand |
| 10 | Tegenspelers, Uitkomst, Serie, Honneur, Vrijspelen |
| 11 | Volgbod, Informatiedoublet, Doublet, Biedplicht, Kwetsbaarheid, Openingskracht, Hoge kleuren, Lage kleuren |
| 12 | Zwakke twee, Vierde-kleur-forcing, Forcing, Azenvragen, Slem, Kleinslem, Grootslem, Manche, Conventioneel bod |

Let op: "Speelplan", "Signaleren", "tweede hand laag" en "derde hand hoog" zijn inhoudelijk nuttig, maar staan niet allemaal als losse glossary-termen. Markeer ze bij implementatie als gewone lescopy of voeg later expliciete glossary-items toe.

## Compleet invulsjabloon

Kopieer dit blok voor een nieuwe lesuitwerking.

```markdown
# Les [nummer] - [titel]

## Welkom aan tafel

[2 tot 4 korte zinnen.]

## Wat leer je vandaag?

- [Leerdoel 1.]
- [Leerdoel 2.]
- [Leerdoel 3.]
- [Optioneel leerdoel 4.]
- [Optioneel leerdoel 5.]

## De situatie

[Een herkenbare bridgevraag aan Zuid, Noord/Zuid, Leider of Tegenspelers.]

## De theorie in kleine stappen

### Stap 1 - [titel]

Kernzin: [...]

Uitleg: [...]

Glossary-termen: [...]

Probeer zelf: [...]

Directe feedback:
- Als goed: [...]
- Als bijna: [...]
- Als mis: [...]

### Stap 2 - [titel]

Kernzin: [...]

Uitleg: [...]

Glossary-termen: [...]

Probeer zelf: [...]

Directe feedback:
- Als goed: [...]
- Als bijna: [...]
- Als mis: [...]

### Stap 3 - [titel]

Kernzin: [...]

Uitleg: [...]

Glossary-termen: [...]

Probeer zelf: [...]

Directe feedback:
- Als goed: [...]
- Als bijna: [...]
- Als mis: [...]

### Stap 4 - [titel]

Kernzin: [...]

Uitleg: [...]

Glossary-termen: [...]

Probeer zelf: [...]

Directe feedback:
- Als goed: [...]
- Als bijna: [...]
- Als mis: [...]

### Stap 5 - [titel]

Kernzin: [...]

Uitleg: [...]

Glossary-termen: [...]

Probeer zelf: [...]

Directe feedback:
- Als goed: [...]
- Als bijna: [...]
- Als mis: [...]

## Kijk mee aan tafel

Situatie: [...]

Bied- of speelverloop:
1. [...]
2. [...]
3. [...]

Waarom dit werkt: [...]

Let op: [...]

## Jij bent aan de beurt

Vraag: [...]

Opties:
A. [...]
B. [...]
C. [...]

Feedback:
A. [...]
B. [...]
C. [...]

## Oefenen met handen

### Hand 1 - Instap

- id:
- status: bestaand | voorstel
- lesdoel:
- tableTask:
- criteria:
- verwachte actie:
- uitleg moet noemen:

### Hand 2 - Variatie

- id:
- status: bestaand | voorstel
- lesdoel:
- tableTask:
- criteria:
- verwachte actie:
- uitleg moet noemen:

### Hand 3 - Herkenning

- id:
- status: bestaand | voorstel
- lesdoel:
- tableTask:
- criteria:
- verwachte actie:
- uitleg moet noemen:

### Hand 4 - Challenge

- id:
- status: bestaand | voorstel
- lesdoel:
- tableTask:
- criteria:
- verwachte actie:
- uitleg moet noemen:

## Veelgemaakte beginnersfouten

1. Valkuil: [...]
   Betere vraag: [...]
   Feedbackzin: [...]

2. Valkuil: [...]
   Betere vraag: [...]
   Feedbackzin: [...]

3. Valkuil: [...]
   Betere vraag: [...]
   Feedbackzin: [...]

## Mini-quiz

1. Vraag: [...]
   Opties: [...]
   Correct: [...]
   Feedback goed: [...]
   Feedback fout: [...]

2. Vraag: [...]
   Opties: [...]
   Correct: [...]
   Feedback goed: [...]
   Feedback fout: [...]

3. Vraag: [...]
   Opties: [...]
   Correct: [...]
   Feedback goed: [...]
   Feedback fout: [...]

4. Vraag: [...]
   Opties: [...]
   Correct: [...]
   Feedback goed: [...]
   Feedback fout: [...]

5. Vraag: [...]
   Opties: [...]
   Correct: [...]
   Feedback goed: [...]
   Feedback fout: [...]

6. Vraag: [...]
   Opties: [...]
   Correct: [...]
   Feedback goed: [...]
   Feedback fout: [...]

## Eindchallenge

Challenge: [...]

Start: [...]

Missie: [...]

Succescheck:
- [...]
- [...]
- [...]
- [Klaar-kaart verschijnt op de tafel.]
- [Terug naar les keert terug naar hetzelfde hoofdstuk.]

Reviewzin: [...]

## Samenvatting

1. [...]
2. [...]
3. [...]
4. [...]
5. [...]
```

## Acceptatiecheck per les

Een les is formatklaar wanneer dit allemaal klopt:

- Alle verplichte onderdelen staan erin.
- De theorie heeft maximaal 5 blokken.
- Elk theorieblok heeft passende glossary-termen of bewust geen jargon.
- De les gebruikt de biedafspraken uit `docs/vijfkaart-hoog-systeem.md`.
- Kunstmatige biedingen scheiden biedkaartje en betekenis.
- Er is minimaal 1 echte interactievraag met feedback per les.
- De mini-quiz heeft minimaal 6 vragen.
- Er zijn minimaal 4 oefenhanden of handcriteria.
- De eindchallenge start op het bestaande bridge-bord.
- De leskaart op `lessons/index.html` toont alleen titel, leerdoelen en een enkele startknop.
- Elke bridge-bordstart vanuit een hoofdstuk heeft `chapter`, `return` en waar nodig een compacte `tableTask`.
- Elke korte tafelsituatie heeft een duidelijke completion, klaar-kaart en expliciete `Terug naar les`.
- `boardGuidance` blokkeert alleen kernmomenten; spotlights zonder noodzakelijke actie gebruiken `gate: none`.
- De samenvatting bestaat uit precies 5 kernzinnen.
- Feedback is alleen hard waar de engine of oefenhand dat betrouwbaar ondersteunt.
