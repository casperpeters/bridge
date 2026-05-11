# TODO: Routekaart Bridge-app

Enige bron van waarheid voor open product-, bied- en speelwerk. Opgeschoond na codecheck op 2026-04-28.

## Werkprincipes

- Basisgame blijft rustig: zo weinig mogelijk tekstuele uitleg tijdens normaal spelen.
- Uitgebreide uitleg hoort in developermodus, AI-suggesties, review, woordenlijst of toekomstige lesmodus.
- Houd UI-wijzigingen binnen de passende `scripts/`-submap; `scripts/app.js` blijft alleen de bootstrap-shell en gedeelde helpers horen in runtime-modules.
- Gebruik altijd de sterkste geimplementeerde heuristiek. Geen keuzemenu voor zwakkere AI-sterktes.
- Maak claims in de UI niet sterker dan de engine kan waarmaken.
- Voeg fixture- of smoketests toe bij nieuwe bied-, speel- of scorelogica.

## Voorgestelde implementatievolgorde

1. Houd de eerste `practice-hands/` catalogus actief in beginnerstests en regressietests; breid gericht uit waar testers of bugs extra vaste situaties vragen.
2. Houd de codebase onderhoudbaar met kleine architectuurrefactors wanneer een bestand of flow anders te groot wordt voor overzichtelijk vibe-coden.
3. Breid daarna alleen bewezen zwakke plekken uit: speelplan-randgevallen, basisverdediging, of biedcontext waar tests/gemist gedrag om vragen.
4. Pas later conventie-instellingen, personalisatie en simulatie/double-dummy toe.

## Korte termijn

### Product- en testgereedheid

- Ruim de normale beginnersflow op: feedbackknoppen en geavanceerde biedhulpmiddelen mogen de hoofdactie niet visueel verdringen.
- Houd actieve-handbegeleiding vooral visueel; voeg alleen minimale tekst toe wanneer een beperking anders onduidelijk is, bijvoorbeeld bij kleur bekennen.
- Breid kaartanimatie later gericht uit met delen, slagen opruimen, dummy reveal en review-/slagoverzichtanimaties; houd `prefers-reduced-motion` leidend.
- Gebruik de README-checklist voor de volgende beginnerstest-2-herhaling en noteer alleen concrete afhakers.

### Oefenhanden en leerbare situaties

- Breid de aparte lespagina gericht uit met extra vaste situaties, meer uitgewerkte instapmissies en betrouwbaardere keuze-feedback.
- Breid de eerste `practice-hands/` catalogus verder uit met extra dummyspel en concrete bied-/speelmissers uit testgebruik.
- Houd oefenspellen reproduceerbaar met oefenhand-id en kort testdoel.
- Houd uitleg buiten de basisgame; oefenmodus, AI-suggesties en developermodus mogen meer tekst bevatten.

### Speelplan en kaartadvies

- Breid daarna speelplan-randgevallen verder uit met keuzes waar meerdere even sterke planregels tegelijk speelbaar zijn.
- Verfijn kleurcontractplannen later verder met specifieke kleurcontractsnits en complexere communicatie tussen beide leiderhanden.
- Houd kaartadvies aan leiderskant gekoppeld aan het zichtbare speelplan; AI-suggesties en developermodus-uitleg moeten dezelfde planregel noemen.
- Voeg alleen feedback na kaartkeuzes toe waar de planregel betrouwbaar genoeg is. Anders hoogstens: legaal, onzeker, of "de app zou X suggereren".

### Basisverdediging

- Breid basisverdediging alleen verder uit wanneer tests of oefenhanden concrete gemiste situaties tonen.

### Bieden

- Breid bestaande biedcontext uit met kwetsbaarheid, positie, partnerschap, huidig contract en getoonde ranges waar die nog ontbreken.
- Scheid contract, call-type en betekenis consequent. Voorbeeld: `2D` na `1NT` kan een transfer zijn en dus niet letterlijk ruiten betekenen.
- Verbeter resterende ongestoorde Vijfkaart Hoog-vervolgen alleen gericht op concrete gaten uit tests of oefenhanden; 1SA-vervolgen met Stayman/Jacoby-transfer hebben nu specifieke uitleg en fixtures.
- Voeg alleen gebruikerswaarschuwingen toe voor biedingen buiten systeem wanneer de app dat betrouwbaar kan vaststellen.
- Houd nieuw competitief bieden klein en testbaar; veel basisgevallen zoals eenvoudige volgbiedingen, kwetsbaarheidsbewuste volgbodgrenzen, raises na volgbod, steun na zwakke sprongvolgbiedingen, 1SA-volgbodvervolgen en informatiedoubletten bestaan al.
- Herintroduceer negative doubles pas met NBB-passende voorwaarden, opener-reacties alsof partner de hoge kleur bood, passende minimumkracht/safe-spot-logica, uitleg en fixtures.
- Breid `agreedTrumpFromAuction` later conservatief uit met nog ontbrekende fit-scenario's voordat extra Blackwood-routes worden toegevoegd:
  - Stayman-fit: 1SA-2K-2H/2S en responder kiest/verhoogt die hoge kleur.
  - Opener steunt responders hoge kleur na een nieuwe-kleurantwoord, bijvoorbeeld 1R-1S-2S.
  - Responder steunt openaars tweede kleur of reverse-kleur expliciet.
  - Sterke 2K-vervolgen waarbij een positieve kleur of openaars herbiedkleur expliciet wordt gesteund.
  - Zwakke twee- en preemptsteun, inclusief situaties waar twee kaarten tegenover een bekende 6+/7+-kaart al een fit is.
  - Volgbod- en sprongvolgbodsteun na competitie.
  - Antwoorden en herbiedingen na informatiedoublet waarbij partners kleur als troef wordt gekozen.
  - Lage-kleurfits alleen toevoegen als de betekenis betrouwbaar is; vermijd vage minor-preferenties als Blackwood-trigger.

### Testen

- Houd unit tests groen voor scoring, typed calls, doubles/redoubles, biedlegaliteit, dummyzichtbaarheid en play-planprioriteiten.
- Voeg fixtures toe voor elke nieuwe biedregel: minimale punten/lengtes, prioriteit tussen alternatieven en legale vervolgbiedingen.
- Voeg fixtures toe voor elke nieuwe speelregel: uitkomst, tweede/derde hand, kleur bekennen, troeven, afgooien, leiderplan en verdediging.
- Voeg periodiek een browser-smoketest toe voor de echte beginnerflow op desktop en mobiel.

### Architectuur en onderhoudbaarheid

- Houd de nieuwe `BridgeAppRuntime`-modulegrenzen scherp: nieuwe UI-flow registreert via `BridgeAppModules.register...(runtime)` en gebruikt geen impliciete app-globals.
- Introduceer pure state-transitions voor kernacties zoals hand starten, bod toepassen, veiling afronden, kaart spelen en slag doorschuiven. UI-code roept transitions aan en rendert daarna opnieuw.
- Splits grote regelbestanden per bridge-domein wanneer je eraan werkt: `card-play` heeft nu losse modules voor uitkomsten, speelplan volgen, leiderspel en basisverdediging. Splits Vijfkaart-Hoog rebids/competitive later naar auction families.
- Houd de gesplitste `rules/play-plan/` modules per domein klein: gedeelde helpers in `common`, sans-atout in `notrump`, kleurcontract in `suit-contract`.
- Houd bestaande public API's via `bridge-rules.js` en index/aggregator-bestanden stabiel tijdens refactors.

## Lange termijn

### Lessen en oefenmodus

- Werk lessen 4-12 later net zo rijk uit als les 1, 2 en 3, met interactieve vragen, gerichte oefenstart en betrouwbare reviewfeedback per lesdoel.
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

- Bouw het resterende competitieve bieden stapsgewijs uit: negative doubles, supportdoubletten, responsive doubles, balancing, cue-bids, Michaels, Unusual NT en Lebensohl.
- Voeg verborgen-hand-inferentie toe bovenop de gespeelde kaarten: renonces, resterende lengtes en waarschijnlijke hoge-kaartlocaties.
- Laat leider en verdedigers contractbewuster spelen: eerst contract maken/verslaan, daarna overslagen/extra downslagen.
- Voeg pas simulatie of double-dummy-ondersteuning toe wanneer die snel, betrouwbaar en uitlegbaar genoeg is om de standaardheuristieken te verbeteren.
