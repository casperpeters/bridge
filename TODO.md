# TODO: Routekaart Bridge-app

Enige bron van waarheid voor open product-, bied- en speelwerk. Opgeschoond na codecheck op 2026-04-28.

## Werkprincipes

- Basisgame blijft rustig: zo weinig mogelijk tekstuele uitleg tijdens normaal spelen.
- Uitgebreide uitleg hoort in developermodus, AI-suggesties, review, woordenlijst of toekomstige lesmodus.
- Houd UI-wijzigingen binnen de bestaande scripts onder `scripts/`; `scripts/app.js` blijft vooral bootstrap en gedeelde helpers.
- Gebruik altijd de sterkste geimplementeerde heuristiek. Geen keuzemenu voor zwakkere AI-sterktes.
- Maak claims in de UI niet sterker dan de engine kan waarmaken.
- Voeg fixture- of smoketests toe bij nieuwe bied-, speel- of scorelogica.

## Voorgestelde implementatievolgorde

1. Gebruik de eerste `practice-hands/` catalogus in beginnerstests en regressietests; breid gericht uit waar testers of bugs extra vaste situaties vragen.
2. Breid daarna alleen bewezen zwakke plekken uit: speelplan-randgevallen, basisverdediging, of biedcontext waar tests/gemist gedrag om vragen.
3. Pas later conventie-instellingen, personalisatie en simulatie/double-dummy toe.

## Recente bevindingen

- Beginnerstest 2 op standaardinstellingen is gedraaid op 2026-04-28. Basisflow, biedlegaliteit, dummy, slagwinnaars, score-uitleg, `Nieuwe hand`, `Zelfde hand` en feedback waren voldoende duidelijk; geen apart review-actieblok nodig.
- Enige echte afhaker was de status bij de openingsuitkomst: die gebruikte ten onrechte "Bekennen". Dit is opgelost met aparte copy voor `Jij komt uit. Kies een kaart.` en een browser-smoketest.

## Korte termijn

### Product- en testgereedheid

- Ruim de normale beginnersflow op: feedbackknoppen en geavanceerde biedhulpmiddelen mogen de hoofdactie niet visueel verdringen.
- Houd actieve-handbegeleiding vooral visueel; voeg alleen minimale tekst toe wanneer een beperking anders onduidelijk is, bijvoorbeeld bij kleur bekennen.
- Voeg het beginnerstest-2-scenario toe aan de README-checklist zodat de volgende ronde dezelfde punten controleert zonder extra uitleg.

### Oefenhanden en leerbare situaties

- Breid de eerste `practice-hands/` catalogus verder uit voor nieuwe kleur na `1H/1S`, eenvoudige volgbiedingen, negative double, uitkomsten en dummyspel.
- Houd oefenspellen reproduceerbaar met oefenhand-id en kort testdoel.
- Houd uitleg buiten de basisgame; oefenmodus, AI-suggesties en developermodus mogen meer tekst bevatten.

### Speelplan en kaartadvies

- Breid daarna speelplan-randgevallen verder uit met keuzes waar meerdere even sterke planregels tegelijk speelbaar zijn.
- Verfijn kleurcontractplannen later verder met specifieke kleurcontractsnits en complexere communicatie tussen beide leiderhanden.
- Houd kaartadvies aan leiderskant gekoppeld aan het zichtbare speelplan; AI-suggesties en developermodus-uitleg moeten dezelfde planregel noemen.
- Voeg alleen feedback na kaartkeuzes toe waar de planregel betrouwbaar genoeg is. Anders hoogstens: legaal, onzeker, of "de app zou X suggereren".

### Basisverdediging

- Voorkom dat verdedigers zonder reden van niet-ondersteunde honneurs wegspelen.
- Voeg simpele troefuitkomsten/-switches toe wanneer dummy introefwaarde heeft of crossruff dreigt.

### Bieden

- Breid bestaande biedcontext uit met kwetsbaarheid, positie, partnerschap, huidig contract en getoonde ranges waar die nog ontbreken.
- Scheid contract, call-type en betekenis consequent. Voorbeeld: `2D` na `1NT` kan een transfer zijn en dus niet letterlijk ruiten betekenen.
- Verbeter resterende ongestoorde Vijfkaart Hoog-vervolgen alleen gericht op concrete gaten uit tests of oefenhanden; 1SA-vervolgen met Stayman/Jacoby-transfer hebben nu specifieke uitleg en fixtures.
- Voeg alleen gebruikerswaarschuwingen toe voor biedingen buiten systeem wanneer de app dat betrouwbaar kan vaststellen.
- Houd nieuw competitief bieden klein en testbaar; veel basisgevallen zoals eenvoudige volgbiedingen, raises na volgbod, 1SA-volgbodvervolgen en negative doubles bestaan al.

### Testen

- Houd unit tests groen voor scoring, typed calls, doubles/redoubles, biedlegaliteit, dummyzichtbaarheid en play-planprioriteiten.
- Voeg fixtures toe voor elke nieuwe biedregel: minimale punten/lengtes, prioriteit tussen alternatieven en legale vervolgbiedingen.
- Voeg fixtures toe voor elke nieuwe speelregel: uitkomst, tweede/derde hand, kleur bekennen, troeven, afgooien, leiderplan en verdediging.
- Voeg periodiek een browser-smoketest toe voor de echte beginnerflow op desktop en mobiel.

## Lange termijn

### Lessen en oefenmodus

- Voeg korte lessen toe voor openingsbiedingen, antwoorden op partner, kleur bekennen, troeven, dummyspel, uitkomsten, basisverdediging en scoren.
- Voeg ongedaan maken/herhalen toe voor de leermodus, minstens voor de meest recente kaart.
- Voeg keuze-feedback toe in lessen, niet in de rustige basisgame, en alleen wanneer de engine de uitleg betrouwbaar kan onderbouwen.

### Toegankelijkheid en slechtziendenmodus

- Voeg een modus voor slechtzienden toe met grotere kaarten, hoog contrast, minder visuele afhankelijkheid en duidelijke focusvolgorde.
- Controleer bieden en kaartspel volledig met toetsenbord.
- Zorg dat screenreaders kaartkleur, rang, beurt, contract, dummy en slagwinnaar zinvol kunnen volgen zonder overdreven veel statusruis.
- Ondersteun verminderde beweging.

### Meertaligheid

- Verplaats UI-tekst naar een taalstructuur die Nederlands, Engels en later andere talen ondersteunt.
- Zorg dat bridgebegrippen en woordenlijst per taal kunnen verschillen zonder spelregels te kopieren.

### Gepersonaliseerde biedconventies

- Voeg later een biedsysteemselector toe, bijvoorbeeld NBB Vijfkaart Hoog, Acol of 2/1.
- Voeg persoonlijke conventie-instellingen toe, zoals Stayman, transfers, supportdoubletten, Michaels, Unusual NT en Lebensohl.
- Bewaar conventieprofielen per gebruiker of oefenset.
- Waarschuw wanneer een bieding buiten het gekozen persoonlijke systeem valt, maar alleen als de app dat betrouwbaar kan bepalen.

### Sterkere bridge-engine

- Bouw het resterende competitieve bieden stapsgewijs uit: supportdoubletten, responsive doubles, balancing, cue-bids, Michaels, Unusual NT en Lebensohl.
- Voeg verborgen-hand-inferentie toe bovenop de gespeelde kaarten: renonces, resterende lengtes en waarschijnlijke hoge-kaartlocaties.
- Laat leider en verdedigers contractbewuster spelen: eerst contract maken/verslaan, daarna overslagen/extra downslagen.
- Voeg pas simulatie of double-dummy-ondersteuning toe wanneer die snel, betrouwbaar en uitlegbaar genoeg is om de standaardheuristieken te verbeteren.
