# PRD: Mini-eindpositie-oefeningen op de speeltafel

## Problem Statement

Start met Bridge bevat korte kaartcombinatie-opgaven waarin Zuid een kleine
speelpositie bekijkt, een startkaart kiest en voorspelt hoeveel slagen Zuid
maakt. De huidige app kan wel gewone oefenhanden en interactieve bied- of
kaartvragen starten, maar nog geen compacte eindposities genereren, als
`situatieseed` opslaan en op de speeltafel verwerken.

De speler wil deze boekachtige oefeningen op de echte bridgetafel doen, zonder
een volledige 52-kaartenhand, irrelevante voorgeschiedenis of extra
tegenstanderinfo te hoeven zien. Dummyzicht hoort normale tafelcontext te zijn;
alleen wanneer alle resterende kaarten open liggen moet de oefening dat
expliciet melden.

## Solution

Voeg een apart oefentype toe voor kleine eindposities. De auteur beschrijft een
compacte situatie met resterende kaarten, leider, dummy, uitkomer en troef of
sans-atout. De generator vult ontbrekende Noord/Oost-kaarten didactisch neutraal
aan, valideert de positie met een mini-solver en kan de positie als compacte
`situatieseed` v2 encoden.

De speler speelt altijd Zuid. In de eerste modus, `lead-and-predict`, selecteert
Zuid een startkaart en vult het aantal persoonlijke Zuid-slagen in. De kaart
wordt pas echt gespeeld na `Controleer`. Alleen als de startkaart optimaal is en
de voorspelling klopt, speelt de app de solverlijn uit via de gewone
kaarttransities. De bestaande speelgeschiedenis wordt daarna zichtbaar en toont
de gespeelde slagen. Uitgebreide uitleg verschijnt alleen na controle.

De oefenroute staat los van de bestaande SMB1-oefenroute, maar oefeningen kunnen
wel aan een SMB1-les en leerdoel gekoppeld worden. De eerste batch wordt gekoppeld
aan les 1, leerdoel `smb1-les01-trick-definition-and-winner`.

## User Stories

1. Als beginner wil ik korte kaartcombinaties op de speeltafel oefenen, zodat de oefening voelt als echt bridge.
2. Als beginner wil ik altijd Zuid spelen, zodat mijn perspectief stabiel blijft.
3. Als beginner wil ik zien welke hand dummy is, zodat de zichtbare kaarten logisch bij de tafel passen.
4. Als beginner wil ik geen extra uitleg krijgen dat dummy open ligt, zodat normale bridgecontext rustig blijft.
5. Als beginner wil ik expliciet lezen wanneer alle resterende kaarten open liggen, zodat ik weet dat dit een speciale open-kaartopgave is.
6. Als beginner wil ik een startkaart kunnen selecteren zonder dat hij meteen gespeeld wordt, zodat ik eerst ook mijn slagvoorspelling kan invullen.
7. Als beginner wil ik het aantal slagen voor Zuid voorspellen, zodat ik vooruit moet rekenen.
8. Als beginner wil ik pas na `Controleer` zien of mijn kaart en voorspelling goed zijn, zodat de oefening zichzelf niet weggeeft.
9. Als beginner wil ik gedeeltelijke feedback krijgen als mijn kaart goed is maar mijn voorspelling fout, zodat ik weet welk deel klopt.
10. Als beginner wil ik gedeeltelijke feedback krijgen als mijn voorspelling klopt voor een slechte kaart, zodat ik begrijp dat er een betere start is.
11. Als beginner wil ik opnieuw kunnen proberen zonder dat de kaart definitief gespeeld is, zodat een fout antwoord de positie niet kapot maakt.
12. Als beginner wil ik na een volledig goed antwoord de resterende slagen op tafel uitgespeeld zien, zodat de oplossing zichtbaar bridgegedrag is.
13. Als beginner wil ik na een goed antwoord de bestaande speelgeschiedenis zien, zodat ik de gespeelde slagen kan teruglezen.
14. Als beginner wil ik na controle uitgebreide uitleg krijgen, zodat ik begrijp waarom de startkaart en slagvoorspelling kloppen.
15. Als beginner wil ik geen hints of kaartadvies vooraf zien, zodat ik zelf moet nadenken.
16. Als beginner wil ik geen AI-suggestie, aanbevolen kaart of gewone `Uitspelen`-actie tijdens de actieve vraag zien, zodat het antwoord niet wordt verraden.
17. Als cursusmaker wil ik een compacte opgave kunnen invoeren, zodat ik boekopgaven zonder volledige deal kan vastleggen.
18. Als cursusmaker wil ik ontbrekende Noord/Oost-kaarten automatisch neutraal kunnen laten aanvullen, zodat irrelevante handen geen handwerk vragen.
19. Als cursusmaker wil ik uitgebreide uitleg verplicht kunnen vastleggen, zodat oefeningen niet alleen technisch juist maar ook didactisch bruikbaar zijn.
20. Als cursusmaker wil ik oefeningen aan SMB1-les en leerdoel koppelen, zodat de eerste batch in les 1 zichtbaar kan worden.
21. Als ontwikkelaar wil ik mini-eindposities als `situatieseed` v2 kunnen opslaan, zodat gegenereerde oefeningen reproduceerbaar en deelbaar zijn.
22. Als ontwikkelaar wil ik compacte seeds maar auteurvriendelijke catalogusdata, zodat bronnen reviewbaar blijven en repeat codes kort zijn.
23. Als ontwikkelaar wil ik een pure mini-solver voor 1 tot 7 kaarten per speler, zodat optimale startkaarten en Zuid-slagen testbaar zijn.
24. Als ontwikkelaar wil ik troef vanaf v1 ondersteunen, zodat opgaven met `Schoppen is troef` niet later een ander model nodig hebben.
25. Als ontwikkelaar wil ik oefeningen hard laten falen in tests wanneer solvervalidatie niet lukt, zodat slechte oefendata niet live komt.
26. Als ontwikkelaar wil ik ongeldige oefeningen voor spelers verbergen, zodat beginners nooit in een onbetrouwbare oefening komen.

## Implementation Decisions

- Mini-eindposities zijn een apart oefentype naast bestaande interactieve SMB1-oefeningen.
- De speler is altijd Zuid.
- Zuid mag leider of verdediger zijn, maar niet dummy.
- Wie leider is, verschilt per oefening. Dummy is de partner van de leider en kan Noord, Oost of West zijn, behalve Zuid.
- Dummykaarten zijn normale zichtbare tafelcontext en krijgen geen extra tekst.
- Een oefening met alle resterende kaarten zichtbaar moet dit expliciet in de oefentekst melden.
- De eerste ondersteunde modus is `lead-and-predict`.
- Het datamodel behoudt `mode`, zodat later `play-and-predict` kan worden toegevoegd zonder migratie.
- In `lead-and-predict` wordt een kaartklik eerst selectie, geen state-mutatie.
- `Controleer` past de gekozen kaart pas toe wanneer de oefening volledig goed is.
- Volledig goed betekent: de gekozen startkaart haalt het maximale aantal persoonlijke Zuid-slagen en de voorspelling is gelijk aan dat maximum.
- Een niet-optimale kaart met juiste voorspelling voor die kaart is gedeeltelijk goed, maar niet geslaagd.
- Een optimale kaart met verkeerde voorspelling is gedeeltelijk goed, maar niet geslaagd.
- Bij gedeeltelijk of fout antwoord wordt de volledige solverlijn niet getoond.
- Hints zijn buiten v1.
- Bij volledig goed antwoord speelt de app de solverlijn uit via bestaande kaart- en slagtransities.
- De bestaande speelgeschiedenis wordt na een goed antwoord zichtbaar en is de bron voor de lijnweergave.
- Tijdens een actieve mini-oefening worden AI-suggesties, aanbevolen-kaartmarkering, gewone `Uitspelen`-actie en live speelgeschiedenis onderdrukt.
- De auteurvriendelijke catalogusdata gebruikt minimaal `id`, `lessonId`, `learningGoalId`, `mode`, `situation` en `explanation`.
- `title`, losse tags, bronvelden, reviewfocus en expectedActions horen niet in v1.
- `explanation` is verplicht en bestaat ten minste uit een correcte uitleg en waarom-uitleg. Een veelgemaakte fout is optioneel.
- De standaard target is persoonlijke Zuid-slagen; dit staat niet per oefening in de data.
- De catalogus bewaart auteurvriendelijke kaartlijsten. De seed encodeert zo compact mogelijk.
- `situatieseed` v2 ondersteunt embedded mini-handen met minder dan 13 kaarten per speler.
- v2 hergebruikt bestaande korte keys waar dat helpt en voegt compacte handdata toe.
- v1 ondersteunt 1 tot 7 resterende kaarten per speler.
- Alle vier spelers moeten evenveel resterende kaarten hebben nadat generatie is voltooid.
- De solver kent intern alle vier resterende handen, ook wanneer de UI ze niet toont.
- Ontbrekende Noord/Oost-handen mogen automatisch worden aangevuld met didactisch neutrale kaarten.
- Als neutraal aanvullen de oplossing niet stabiel houdt, faalt de oefening en moet de auteur meer kaarten expliciet maken.
- `trump` is verplicht in `situation`; `null` betekent sans-atout.
- De app gebruikt intern een technisch contract om de bestaande tafelstate te laten werken. De oefen-UI toont alleen troef of sans-atout waar relevant.
- Eerste batch: alle 6 foto-opgaven zodra de kaartdata expliciet is bevestigd, inclusief de troefopgave.

## Testing Decisions

- Test externe oefengedrag en solverresultaten, niet DOM-helperdetails.
- Unit tests valideren mini-oefendata: ids, les- en leerdoelreferenties, mode, situation, gelijke handlengtes, 1-7 kaarten en verplichte uitleg.
- Unit tests valideren `situatieseed` v2 roundtrip voor compacte mini-handen.
- Unit tests bewijzen dat bestaande v1-situatieseeds blijven werken.
- Unit tests dekken mini-solverresultaten voor sans-atout en troef.
- Unit tests dekken meerdere optimale startkaarten, niet-optimale startkaarten en persoonlijke Zuid-slagentelling.
- Unit tests dekken neutrale aanvulling van ontbrekende Noord/Oost-kaarten en fail-fast wanneer aanvulling de oplossing niet stabiel houdt.
- Browserdekking controleert dat een mini-oefening op de speeltafel start met Zuid als speler en dummy zichtbaar volgens bridgecontext.
- Browserdekking controleert dat kaartselectie voor `Controleer` de kaart nog niet speelt.
- Browserdekking controleert fout, gedeeltelijk goed en volledig goed antwoord.
- Browserdekking controleert dat na een volledig goed antwoord de solverlijn als gewone slagen in de speelgeschiedenis staat.
- Browserdekking controleert dat advies, aanbevolen kaart, gewone `Uitspelen` en live speelgeschiedenis tijdens de actieve vraag niet zichtbaar zijn.
- Voor de eerste implementatie is `npm run test:unit` plus gerichte browser smoke voldoende. Brede browserregressie is nodig wanneer gedeelde tafelrendering of responsive layout wijzigt.

## Out of Scope

- Een in-app auteurinterface.
- Vrije tekst parseren zoals `Zuid: AV2, West: HB3`.
- Probabilistische analyse met onbekende kaarten.
- Volledige double-dummy analyse voor gewone 13-kaartenhanden.
- Hints vooraf.
- `play-and-predict` end-to-end implementeren.
- Bronmetadata, tags, reviewFocus of uitgebreide catalogusfilters.
- Automatisch OCR gebruiken op boekfoto's.
- Een volledige 52-kaartenhand genereren voor elke mini-opgave.
- Zuid als dummy ondersteunen.

## Further Notes

De eerste implementatie moet klein blijven: infrastructuur, een pure solver, seed
v2, een `lead-and-predict` tafeldoorloop en een canary-oefening met bevestigde
kaartdata. Daarna kan de eerste batch van zes opgaven worden toegevoegd.

De bestaande deterministische `Uitspelen`-feature is nuttige prior art voor het
uitspelen via gewone kaarttransities en speelgeschiedenis, maar de mini-solver
heeft een ander doel: optimale uitkomst berekenen in een volledig bekende kleine
eindpositie.
