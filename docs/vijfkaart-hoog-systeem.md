# Vijfkaart-Hoog Systeem Voor De Cursus

Status: intern cursuscontract  
Scope: alle lessen, oefenhanden, AI-suggesties, reviewteksten en developer-uitleg die het huidige `fiveCardHigh` profiel gebruiken.

Dit document legt vast welk Vijfkaart-Hoog biedsysteem deze cursus gebruikt. Het is geen volledige wedstrijdsysteemkaart. Het is de didactische norm voor de app: lessen mogen eenvoudiger uitleggen dan de engine redeneert, maar ze mogen niet een ander systeem aanleren.

De huidige basis is het in de app geimplementeerde NBB/Barry's Vijfkaart Hoog-profiel, aangevuld met afspraken uit `Start met Bridge 1 & 2` waar die al in code en uitleg zijn verwerkt.

Belangrijke codebronnen:

- `rules/bidding/systems/five-card-high/`
- `rules/bidding/systems/five-card-high/explanations-nl.js`
- `scripts/learning/glossary.js`
- `practice-hands/catalog/`
- `tests/unit/vijfkaart-hoog-*.test.js`

## Gebruik In De Cursus

Alle lessen gebruiken hetzelfde conventieprofiel:

- `1SA` in de app betekent hetzelfde als `1NT` in de code.
- Nederlandse kleurafkortingen: `K` = klaveren, `R` = ruiten, `H` = harten, `S` = schoppen.
- Symbolen in lescopy mogen: `1♣`, `1♦`, `1♥`, `1♠`, `1SA`.
- HCP betekent honneurpunten: Aas 4, Heer 3, Vrouw 2, Boer 1.
- Zodra een fit is gevonden, mag de app fitpunten gebruiken in plaats van alleen HCP.
- Een biedkaartje kan een kunstmatige betekenis hebben. Voorbeeld: `2♦` na `1SA` betekent in dit systeem harten, niet letterlijk ruiten.

Als code, uitleg en dit document uit elkaar lopen, moeten ze samen worden bijgewerkt. Nieuwe lessen mogen geen alternatieve afspraken introduceren zonder expliciet nieuw conventieprofiel.

## Openingsbod: Basisvolgorde

Voor beginners blijft de denkrichting:

1. Heb ik genoeg om te openen?
2. Heb ik een speciale SA-, sterke of preemptieve opening?
3. Heb ik een vijfkaart hoog die ik natuurlijk moet openen?
4. Anders open ik een lage kleur of pas ik.

De engine hanteert deze praktische prioriteiten:

| Opening | Betekenis in deze cursus | Beginnersuitleg |
| --- | --- | --- |
| Pas | Geen passende opening. | Te weinig kracht en geen geschikte lange kleur voor een zwakke opening. |
| `1SA` | 15-17 HCP en een evenwichtige verdeling. | Begrensde opening: partner weet meteen je kracht en handtype. |
| `1♥` / `1♠` | 12-19 HCP, of een lichte Regel-van-20-opening, met minstens een vijfkaart hoog. | Een opening in harten of schoppen belooft altijd minimaal vijf kaarten in die kleur. |
| `1♦` | Meestal 12-19 HCP, minstens een vierkaart ruiten, geen betere `1SA` of hoge-kleuropening volgens de prioriteiten. | De normale lage-kleuroplossing met ruitenlengte. |
| `1♣` | Meestal 12-19 HCP. Kan een vangnetopening zijn en dus vanaf een tweekaart klaveren voorkomen. | De laagste of veiligste lage-kleuropening als niets anders past. |
| `2♣` | Sterke kunstmatige opening: ongeveer 20+ HCP of een zeer sterke speelslagenhand. | Later cursusmateriaal; beginners hoeven vooral te herkennen dat dit niet natuurlijk klaveren belooft. |
| `2SA` | 20-22 HCP en een evenwichtige verdeling. | Sterke SA-opening. |
| `2♦` / `2♥` / `2♠` | Zwakke twee: goede zeskaart en beperkte kracht, meestal 6-10 HCP. | Preemptief: je neemt biedruimte weg en beschrijft een lange kleur. |
| `3♣` t/m `4♠` | Preemptief met een nog langere kleur en beperkte kracht. | Later cursusmateriaal. |

### 1SA Gaat Voor

`1SA` belooft 15-17 HCP en een evenwichtige verdeling: 4-3-3-3, 4-4-3-2 of 5-3-3-2.

De app mag dus met een 5-3-3-2-hand en een vijfkaart hoog toch `1SA` openen als de hand precies 15-17 HCP heeft. In lessen moet dit rustig worden uitgelegd: `1♥` en `1♠` beloven wel een vijfkaart, maar niet elke vijfkaart hoog wordt automatisch met `1♥` of `1♠` geopend.

Voorbeeld:

- Zuid heeft 15 HCP, vijf schoppen, verder 3-3-2 en overal dekking.
- Opening: `1SA`, omdat de hand evenwichtig is en in de 15-17-range valt.

### Openen Met Een Vijfkaart Hoog

`1♥` en `1♠` beloven minimaal een vijfkaart.

Open de langste kleur. Met twee vijfkaarten open je de hoogste van de twee. Een langere lage kleur kan voorrang krijgen boven een vijfkaart hoog, omdat de app de langste kleur niet wil verbergen.

Voorbeelden:

- 13 HCP, vijf harten, geen `1SA`-verdeling: open `1♥`.
- 12 HCP, vijf schoppen en vijf ruiten: open `1♠`, de hoogste van twee vijfkaarten.
- 12 HCP, vijf schoppen en zes klaveren: open `1♣`, omdat de lage kleur langer is.

### Lage-Kleuropeningen

`1♣` en `1♦` zijn de openingen voor handen die niet als `1SA`, `1♥` of `1♠` worden behandeld.

Voor beginners is de kern:

- `1♦` belooft meestal minstens een vierkaart ruiten.
- `1♣` kan kort zijn en is soms de vangnetopening.
- Met meerdere vierkaarten open je de laagste geschikte kleur.
- Met twee vijfkaarten open je de hoogste kleur.

Voorbeelden:

- 12 HCP, 4-4-3-2 met vier harten en vier ruiten, geen `1SA`: open `1♦`.
- 13 HCP, 4-4-3-2 met vier harten, vier schoppen en slechts twee klaveren, geen `1SA`: open `1♣` als vangnet.
- 14 HCP, vijf klaveren en vier ruiten: open `1♣`.

## Openingskracht En Regel Van 20

Met 12+ HCP open je meestal, tenzij een speciale reden anders zegt.

Met 10-11 HCP mag je soms toch openen via de Regel van 20:

```text
HCP + lengte van je twee langste kleuren >= 20
```

De app vraagt daarbij ook dat de meeste punten in die lange kleuren zitten. Een lichte opening met losse punten in korte kleuren wordt dus niet automatisch geaccepteerd.

Voorbeelden:

- 11 HCP, vijf schoppen, vier harten, de honneurs vooral in schoppen en harten: `11 + 5 + 4 = 20`, dus open `1♠`.
- 11 HCP, vijf schoppen, vier harten, maar de honneurs vooral in ruiten en klaveren: pas, want de lange kleuren zijn niet sterk genoeg.
- 10 HCP, vijf ruiten en vijf klaveren met de punten in die kleuren: mag volgens de Regel van 20 een lage kleur openen.

## Zwakke Twee En Preempts

`2♦`, `2♥` en `2♠` zijn zwakke twee-openingen.

Beginnersregel:

- een goede zeskaart;
- beperkte kracht, meestal 6-10 HCP;
- geen gewone opening op eenniveau;
- bedoeld om de tegenpartij biedruimte af te nemen.

De engine kent extra randgevallen, zoals een "lelijke" 11-punter die de Regel van 20 niet haalt. Die nuance hoort niet in de eerste beginnersuitleg; in lescopy volstaat: "zeskaart, beperkte kracht".

Voorbeelden:

- 8 HCP met `KQJxxx` in ruiten en verder weinig: open `2♦`.
- 9 HCP met goede zeskaart schoppen: open `2♠`.
- 11 HCP met zes schoppen en genoeg verdeling om de Regel van 20 te halen: meestal geen zwakke twee, maar een lichte `1♠`-opening.

Preemptieve openingen op drie- en vierniveau tonen een langere kleur en beperkte kracht. Die worden alleen uitgebreid behandeld wanneer een latere les daar expliciet over gaat.

## Antwoorden Op Een KleurOpening

Een antwoord op partners opening heet een bijbod. In deze cursus is het eerste bijbod eenvoudig en herkenbaar.

Algemene basis:

- Met minder dan 6 HCP pas je meestal.
- Zoek een fit in partners hoge kleur vroeg.
- Toon een eigen biedbare kleur als dat op het juiste niveau kan.
- Als niets goed past, kan `1SA` het vuilnisbakkenbod zijn.

### Na `1♥` Of `1♠`

Omdat `1♥` en `1♠` een vijfkaart beloven, is driekaart steun al genoeg voor een achtkaartfit.

| Antwoord | Betekenis |
| --- | --- |
| `2♥` / `2♠` | 6-9 fitpunten, minstens driekaart steun. |
| `3♥` / `3♠` | Ongeveer 10-11 fitpunten, inviterend. |
| `4♥` / `4♠` | Ongeveer 12+ fitpunten, manche. |
| Nieuwe kleur op eenniveau | Minstens vierkaart, 6+ HCP, bijvoorbeeld `1♥ - 1♠`. |
| Nieuwe kleur op tweeniveau | Minstens vierkaart en ongeveer 10+ HCP. |
| `1SA` | Vuilnisbakkenbod: meestal 6-9 HCP, geen steun, geen geschikte eigen kleur op eenniveau. |
| `2SA` | Ongeveer 10-11 HCP zonder betere fit of kleur. |
| `3SA` | Manchekracht zonder betere fit of kleur. |

Voorbeeld:

- Partner opent `1♠`. Jij hebt 7 HCP en drie schoppen. Antwoord `2♠`, want er is samen minstens een 5-3 fit.
- Partner opent `1♥`. Jij hebt 7 HCP, twee harten en vier schoppen. Antwoord `1♠`, want dat kan nog op eenniveau.
- Partner opent `1♠`. Jij hebt 7 HCP, twee schoppen en geen kleur die je goed kunt bieden. Antwoord `1SA`.

### Na `1♣` Of `1♦`

Na een lage-kleuropening zoekt de cursus eerst een hoge-kleurfit als dat rustig kan.

| Situatie | Afspraak |
| --- | --- |
| Na `1♣` | `1♦`, `1♥` of `1♠` kan vanaf een vierkaart en 6+ HCP. Met gelijke vierkaarten kiest de app laag genoeg om ruimte te houden. |
| Na `1♦` | `1♥` of `1♠` kan vanaf een vierkaart en 6+ HCP. |
| `1♦ - 2♣` | Vierkaart klaveren en ongeveer 10+ HCP. |
| Steun voor `1♣` | Meestal vijfkaart steun, omdat `1♣` kort kan zijn. |
| Steun voor `1♦` | Meestal vierkaart steun. |
| `1SA` | Vuilnisbakkenbod: meestal 6-9 HCP, geen steun, geen geschikte hoge kleur op eenniveau. |
| `2SA` / `3SA` | Inviterend of manche met een passende SA-hand en geen betere hoge-kleurfit. |

Voorbeeld:

- Partner opent `1♣`. Jij hebt 6 HCP en vier harten: bied `1♥`.
- Partner opent `1♦`. Jij hebt 8 HCP, geen vierkaart hoog en vier ruiten: bied `2♦`.
- Partner opent `1♣`. Jij hebt 7 HCP, geen vierkaart ruiten/harten/schoppen en maar vier klaveren: bied `1SA`, niet `2♣`.

### Het Vuilnisbakkenbod `1SA`

`1SA` als bijbod na partners kleuropening is geen belofte van een mooie sans-atouthand.

Het betekent meestal:

- 6-9 HCP;
- geen steun voor partners kleur;
- geen eigen kleur die je op eenniveau kunt bieden;
- geen genoeg kracht voor een nieuwe kleur op tweeniveau.

Voorbeeld:

- `1♠ - 1SA`: antwoorder heeft vaak 6-9 HCP, minder dan drie schoppen en geen hand die sterk genoeg is om op tweeniveau een eigen kleur te bieden.

## Openaars Herbieding En Tweede Bijbod

Na het eerste antwoord beschrijft openaar zijn hand verder.

Basisprioriteiten voor openaar:

- Steun partners nieuwe hoge kleur met vierkaart steun.
- Herbied een eigen zeskaart.
- Bied SA met een evenwichtige hand.
- Toon een tweede kleur met een echt tweekleurenspel.
- Na partners verhoging: pas met minimum, invite met extra waarden, bied manche met genoeg gezamenlijke kracht.

Basisprioriteiten voor antwoorder bij het tweede bijbod:

- 6-9 HCP: houd het laag, geef preferentie of pas.
- 10-11 HCP: inviteer, vaak met `2SA` of een verhoging.
- 12+ HCP: zoek of bied de manche.
- Als drie echte kleuren zijn geboden en er is nog geen duidelijk eindcontract: gebruik vierde-kleur-forcing.

Voorbeeld:

```text
1♥ - 1♠
2♦ - ?
```

Met 6-9 HCP geeft antwoorder vaak preferentie naar `2♥` als dat het minst misleidend is. Met 10-11 HCP kan `2SA` inviterend zijn. Met 12+ HCP en geen duidelijk contract kan `3♣` vierde-kleur-forcing zijn.

## Stayman Na `1SA`

`2♣` na `1SA` is Stayman.

Betekenis:

- vraagt openaar naar een vierkaart hoog;
- zoekt een 4-4 fit in harten of schoppen;
- wordt in de app gebruikt vanaf ongeveer 8 HCP met een vierkaart hoog.

Antwoorden van openaar:

| Antwoord | Betekenis |
| --- | --- |
| `2♦` | Geen vierkaart harten of schoppen. |
| `2♥` | Vierkaart harten. |
| `2♠` | Vierkaart schoppen. |

Als openaar beide hoge vierkaarten heeft, toont de huidige regel eerst harten.

Vervolg door antwoorder:

- Met fit en 8-9 HCP: inviteer op drieniveau.
- Met fit en 10+ HCP: bied de hoge-kleurmanche.
- Zonder fit en 8-9 HCP: `2SA`.
- Zonder fit en 10+ HCP: `3SA`.

Voorbeeld:

```text
1SA - 2♣
2♠ - 4♠
```

Antwoorder vroeg met Stayman, openaar toonde een vierkaart schoppen, en antwoorder koos met genoeg kracht de manche in de gevonden fit.

## Jacoby-Transfers Na `1SA`

Jacoby-transfer betekent dat antwoorder de kleur onder zijn echte hoge kleur biedt.

| Bod na `1SA` | Betekenis |
| --- | --- |
| `2♦` | Vraagt openaar `2♥` te bieden. Antwoorder toont minstens een vijfkaart harten. |
| `2♥` | Vraagt openaar `2♠` te bieden. Antwoorder toont minstens een vijfkaart schoppen. |

Waarom:

- de sterke `1SA`-hand wordt meestal leider;
- antwoorder kan met zwakke handen toch zijn lange hoge kleur laten spelen;
- met sterkere handen kan antwoorder daarna inviteren of de manche bieden.

Voorbeelden:

```text
1SA - 2♦
2♥ - pas
```

Antwoorder heeft harten en is zwak genoeg om in `2♥` te stoppen.

```text
1SA - 2♥
2♠ - 3SA
```

Antwoorder heeft meestal precies vijf schoppen en manchekracht. Openaar mag met driekaart schoppen nog naar `4♠` corrigeren.

```text
1SA - 2♦
2♥ - 3♥
```

Antwoorder heeft een zeskaart of langer in harten en inviterende kracht.

Vervolgdetails zoals twee hoge kleuren na transfer worden wel door de engine herkend, maar horen niet bij de eerste uitleg. Ze kunnen in een latere les of developer-uitleg worden genoemd.

## Na `2SA`

Na een natuurlijke `2SA`-opening gebruikt de app dezelfde familie afspraken een niveau hoger:

- `3♣` is Stayman.
- `3♦` vraagt `3♥`.
- `3♥` vraagt `3♠`.

Omdat `2SA` al 20-22 HCP toont, is minder kracht bij antwoorder nodig om naar de manche te gaan. Dit is geen beginnerskern, maar lessen mogen het gebruiken zodra `1SA`-vervolgen bekend zijn.

## Sterke `2♣`

`2♣` is kunstmatig en sterk.

Basis:

- niet natuurlijk klaveren;
- ongeveer 20+ HCP, of een hand met zeer veel speelslagen;
- partner mag dit niet behandelen als een gewone lage-kleuropening.

Antwoorden:

- `2♦` is afwachtend, meestal 0-7 HCP.
- Een positief kleurantwoord toont ongeveer 8+ HCP en een goede vijfkaart met minstens twee tophonneurs.
- `2SA` kan een positief antwoord zonder geschikte kleur zijn.

Na een `2SA`-herbieding door de `2♣`-openaar gelden Stayman en transfers alsof er een sterke SA-hand is getoond.

Voor beginners wordt sterke `2♣` vooral als herkenpunt behandeld. De volledige vervolgstructuur wordt uitgesteld.

## Vierde-Kleur-Forcing

Vierde-kleur-forcing is mancheforcing in deze app.

Het ontstaat wanneer het partnerschap al drie echte kleuren heeft geboden en antwoorder de vierde, nog niet geboden kleur biedt als kunstmatig vraagbod.

Betekenis:

- kunstmatig, niet per se lengte in de vierde kleur;
- vraagt openaar zijn hand verder te beschrijven;
- belooft genoeg kracht om minstens de manche te bereiken;
- hoort in uitleg als conventioneel en alertbaar te worden behandeld.

Voorbeeld:

```text
1♥ - 1♠
2♦ - 3♣
```

`3♣` is hier vierde-kleur-forcing. Het zegt niet: "ik wil klaveren spelen". Het vraagt openaar om extra informatie.

Antwoorden van openaar, in gewone taal:

- toon driekaart steun voor antwoorders eerste kleur als die er is;
- bied SA met een stop in de vierde kleur;
- herbied je openingskleur met extra lengte;
- herbied je tweede kleur als dat het beste beschikbare omschrijvende bod is.

Daarna kiest antwoorder een manche.

## `4SA` Azenvragen

In deze cursus is `4SA` klassiek azenvragen wanneer er een troefkleur is afgesproken.

Dit volgt de glossary-definitie:

| Antwoord | Betekenis |
| --- | --- |
| `5♣` / `5K` | 0 of 4 azen. |
| `5♦` / `5R` | 1 aas. |
| `5♥` / `5H` | 2 azen. |
| `5♠` / `5S` | 3 azen. |

Voorbeeld:

```text
1SA - 2♥
2♠ - 4SA
5♥ - 5♠
```

Na de transfer is schoppen de afgesproken troefkleur. `4SA` vraagt azen. `5♥` toont twee azen. Als de vrager weet dat er samen twee azen ontbreken, zwaait hij af in `5♠`.

Voor beginners:

- Gebruik `4SA` alleen als azenvraag met een duidelijke troefkleur.
- Leg nog geen Roman Keycard Blackwood, herenvragen, controlebiedingen of kwantitatieve `4SA` uit.

## Competitief Bieden

De beginnerscursus hoeft competitief bieden niet vroeg te behandelen. Als een oefenhand of AI-suggestie toch competitie bevat, gebruikt de app deze beperkte afspraken.

Huidige basis:

- Een eenvoudig volgbod toont een goede vijfkaart of langer.
- Op eenniveau kan een volgbod vanaf ongeveer 8 HCP.
- Op tweeniveau vraagt een volgbod meestal 10+ HCP.
- Kwetsbaarheid kan de eisen verhogen.
- `1SA` als volgbod toont 15-17 HCP, evenwichtige verdeling en dekking in de kleur van de tegenpartij.
- Een informatiedoublet toont openingskracht, kortheid in de kleur van de tegenpartij en aansluiting in de ongeboden kleuren.
- Na partners informatiedoublet moet je bieden als de rechtertegenstander past; `1SA` na zo'n doublet belooft 6-9 HCP, SA-verdeling, dekking en geen betere ongeboden vierkaart.
- Tegen zwakke twee- en preemptieve openingen gebruikt de app eenvoudige volgboden, SA met dekking en informatiedoubletten.

Voor beginners geldt: behandel competitie pas als het lesdoel dat vraagt. Normale openings- en antwoordlessen blijven ongestoord.

## Bewust Uitgesteld

Deze details worden bewust niet zwaar gemaakt in de beginnerscursus, ook als de engine er soms al een eenvoudige regel voor heeft:

- volledige vervolgstructuur na sterke `2♣`;
- volledige antwoorden op zwakke twee- en preemptieve openingen;
- alle transfervervolgen met 5-4 of 5-5 in de hoge kleuren;
- slem bieden buiten klassiek `4SA` azenvragen;
- directe SA-slems op basis van gezamenlijke HCP;
- competitief bieden na meerdere biedrondes;
- kwetsbaarheidsafwegingen bij elk competitief bod;
- betekenis van alerts buiten Stayman, transfers, vierde-kleur-forcing en `4SA` azenvragen.

Deze afspraken worden voorlopig niet als cursusstof gebruikt en mogen niet stilzwijgend in beginnerslessen opduiken:

- negative doubles;
- supportdoubletten;
- responsive doubles;
- balancing;
- cue-bids;
- Michaels;
- Unusual NT;
- Lebensohl;
- strafpas- en cue-bid-vervolgen na partners informatiedoublet;
- Roman Keycard Blackwood en herenvragen;
- conventieprofielen of persoonlijke biedafspraken.

## Didactische Checklist Voor Nieuwe Lessen

Gebruik deze checklist bij nieuwe biedlessen of oefenhanden:

- Noem alleen de afspraak die de speler nu nodig heeft.
- Houd normale gameplay compact; plaats extra uitleg in lesmodus, review, AI-suggesties of developer mode.
- Scheid het biedkaartje van de betekenis bij kunstmatige biedingen.
- Gebruik dezelfde puntengrenzen en betekenissen als dit document.
- Toon voorbeelden met `1SA`, `1♥`, `1♠`, `1♣` en `1♦` voordat competitief bieden wordt geintroduceerd.
- Voeg bij nieuwe biedregels ook uitleg en testfixtures toe.
- Maak claims niet sterker dan de engine kan waarmaken.

