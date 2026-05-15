# PRD: Interactieve Start met Bridge 1-oefeningen op het speelbord

## Problem Statement

De huidige oefenhandencatalogus toont vaste bridgehanden, maar voelt nog niet als een gerichte leerervaring. Een beginner krijgt wel een reproduceerbare situatie, maar niet altijd een duidelijke vraag, directe feedback, een simpele retry-flow of een logische volgende oefening. Daardoor is het moeilijk om per leerdoel uit Start met Bridge 1 gericht te oefenen en te zien of een gekozen bod of kaart de bedoelde lesactie was.

De bestaande les-tafeltaken komen al dicht in de buurt: ze kunnen een verwacht bod of kaart herkennen, foute keuzes blokkeren en retry-feedback tonen. Dat patroon is nu echter les-gedreven en niet beschikbaar als algemene interactieve oefenmodus. Ook toont de oefenhandenpagina nog gewone, niet-interactieve handen en filters die niet meer passen bij de gewenste route.

## Solution

Bouw een interactieve oefenmodus voor Start met Bridge 1. De gebruiker kiest eerst een van de 12 SMB1-lessen en ziet daarna per leerdoel de beschikbare interactieve oefeningen. Een oefening start op de speeltafel via een `situatieseed`, zodat de speler direct in de relevante bied- of speelsituatie komt. De oefening stelt een korte vraag, valideert de gekozen actie tegen oefendata, blokkeert foute keuzes standaard, past correcte keuzes wel toe op de tafel en toont daarna feedback met `Opnieuw proberen` en `Volgende oefening`.

De oude brede oefenhandencatalogus verdwijnt uit de UI. Niet-interactieve oefenhanden mogen technisch blijven bestaan voor lessen, tests en regressies, maar gewone spelers zien alleen interactieve SMB1-oefeningen.

## User Stories

1. Als beginner wil ik een SMB1-les kunnen kiezen, zodat ik oefenstof vind die past bij mijn cursus.
2. Als beginner wil ik per les de leerdoelen zien, zodat duidelijk is wat ik aan het oefenen ben.
3. Als beginner wil ik alleen interactieve oefeningen zien, zodat ik niet in een gewone testhand terechtkom zonder feedback.
4. Als beginner wil ik een oefening direct aan de tafel starten, zodat ik bridge oefen in dezelfde omgeving als het spel.
5. Als beginner wil ik bij een biedsituatie de vraag boven de biedbox zien, zodat ik weet welk bod ik moet kiezen.
6. Als beginner wil ik bij een speelsituatie de vraag boven de gespeelde kaarten zien, zodat de vraag dicht bij de actuele slag staat.
7. Als beginner wil ik dat de oefening al bij mijn beslismoment begint, zodat ik niet eerst een hele hand hoef door te spelen.
8. Als beginner wil ik soms een korte automatische aanloopactie zien, zodat het voelt alsof ik net aan tafel aansluit.
9. Als beginner wil ik dat een fout bod of foute kaart meestal niet wordt gespeeld, zodat ik meteen opnieuw kan proberen zonder de situatie kwijt te raken.
10. Als beginner wil ik dat een goed bod of goede kaart wel op tafel komt, zodat mijn keuze echt onderdeel van het spel voelt.
11. Als beginner wil ik na een fout antwoord uitleg krijgen, zodat ik begrijp waar ik opnieuw naar moet kijken.
12. Als beginner wil ik feedback kunnen krijgen die specifiek is voor mijn gekozen bod of kaart, zodat de uitleg concreter is.
13. Als beginner wil ik na een goed antwoord korte positieve feedback krijgen, zodat ik weet waarom de actie paste.
14. Als beginner wil ik na een goede keuze opnieuw kunnen proberen, zodat ik dezelfde situatie kan herhalen.
15. Als beginner wil ik na een goede keuze naar de volgende interactieve oefening binnen dezelfde SMB1-lesroute kunnen gaan, zodat ik door kan oefenen.
16. Als beginner wil ik aan het einde van een oefenreeks terug naar de oefeningen kunnen, zodat ik een andere les of leerdoel kan kiezen.
17. Als beginner wil ik niet dat AI-suggesties het antwoord weggeven, zodat ik zelf moet nadenken.
18. Als beginner wil ik niet dat een aanbevolen kaart gemarkeerd wordt tijdens een actieve oefenvraag, zodat de juiste kaart niet visueel wordt verraden.
19. Als beginner wil ik dat meerdere juiste antwoorden mogelijk zijn, zodat equivalente biedingen of kaarten niet onterecht fout worden gerekend.
20. Als cursusmaker wil ik een leerdoel zonder goede tafeloefening compact kunnen tonen als `Nog geen tafeloefening`, zodat de dekking eerlijk zichtbaar blijft.
21. Als cursusmaker wil ik interactieve oefeningen aan SMB1-lesdoelen koppelen, zodat ik systematisch dekking kan opbouwen.
22. Als cursusmaker wil ik de SMB1-lessen en leerdoelen in JS-data beheren, zodat de UI en tests dezelfde bron van waarheid gebruiken.
23. Als cursusmaker wil ik `docs/smb1.md` verwijderen zodra de JS-data bestaat, zodat er geen dubbele SMB1-bron veroudert.
24. Als ontwikkelaar wil ik oefenstartposities via `situatieseed` definiëren, zodat biedverloop, beurt, dummy, lopende slag en gespeelde kaarten exact herstelbaar zijn.
25. Als ontwikkelaar wil ik oefeningdata los houden van cursusstructuurdata, zodat leerdoelen overzichtelijk blijven en oefeningen kunnen groeien.
26. Als ontwikkelaar wil ik oefenacties valideren tegen expliciete oefendata, zodat de algemene AI-engine geen harde lesclaims hoeft te doen.
27. Als ontwikkelaar wil ik bestaande niet-interactieve oefenhanden technisch laten bestaan, zodat lessen en regressietests niet onnodig breken.
28. Als ontwikkelaar wil ik de bestaande lesson-table-task logica generaliseren, zodat retry-feedback en actievalidatie niet dubbel worden gebouwd.
29. Als ontwikkelaar wil ik de eerste release met een kleine gevalideerde startset doen, zodat infrastructuur, UI en seed-herstel end-to-end bewezen zijn voordat alle leerdoelen gevuld worden.

## Implementation Decisions

- Start met Bridge 1 krijgt een JS-source-of-truth voor de 12 lessen en hun leerdoelen. Deze bron bevat les-id, lesnummer, lestitel en stabiele leerdoel-id's met tekst.
- Interactieve oefeningen komen in een aparte JS-catalogus die verwijst naar `lessonId` en `learningGoalId`. De cursusstructuur en oefeninginhoud blijven gescheiden.
- `docs/smb1.md` wordt verwijderd zodra de JS-data dezelfde inhoud als bron bevat.
- De oefenpagina toont geen brede catalogus, zoekveld, focusfilter of levelfilter meer. De eerste pagina toont alleen de 12 SMB1-lessen. De lesdetailweergave toont per leerdoel de interactieve oefeningen of `Nog geen tafeloefening`.
- De UI gebruikt alleen interactieve oefeningen: een oefening moet een `startSeed` en `question` hebben om zichtbaar te zijn.
- Een interactieve oefening start via `situatieseed`. Deze seed is de bron voor fase, beurt, veiling, contractcontext, dummyzichtbaarheid, afgeronde slagen en lopende slag.
- De standaard startmodus is direct op het beslismoment. Een latere of optionele intro-modus mag één actie eerder beginnen en automatisch doorspelen tot de speler aan de beurt is.
- Het vraagmodel ondersteunt bied- en kaartvragen met dezelfde hoofdstructuur. De verwachte actie bepaalt het type.
- Biedvragen verschijnen boven de biedbox. Kaartvragen verschijnen boven de gespeelde kaarten.
- Tijdens een actieve interactieve oefenvraag worden AI-suggestietekst en aanbevolen-kaartmarkering onderdrukt. De lokale gebruikersinstelling voor AI-suggesties blijft onveranderd.
- `expectedAction` is de bron van waarheid voor goed/fout. De engine mag helpen bij validatie en technische uitleg, maar bepaalt niet zelfstandig dat een niet-opgenomen keuze ook goed is.
- Meerdere juiste antwoorden zijn toegestaan via lijsten met toegestane calls of card ids.
- Foute keuzes worden standaard geblokkeerd voordat ze state veranderen. Een toekomstige demonstratiemodus mag foute keuzes tijdelijk laten uitspelen wanneer dat didactisch expliciet gewenst is.
- Correcte keuzes worden wel toegepast op de tafel. Daarna wordt de oefening als klaar gemarkeerd en toont de UI positieve feedback.
- `Opnieuw proberen` herlaadt altijd de oorspronkelijke `startSeed`, ook nadat een correct antwoord is toegepast.
- `Volgende oefening` zoekt de volgende interactieve oefening binnen dezelfde SMB1-lesroute. Als er geen volgende is, toont de UI `Terug naar oefeningen`.
- Feedback ondersteunt zowel algemene `wrong`-copy als `wrongByChoice` voor specifieke foute biedingen of kaarten.
- De bestaande les-tafeltaken mogen niet-interactieve oefenhanden blijven gebruiken. Ze hoeven niet tegelijk naar dit nieuwe oefenmodel te migreren.
- De eerste implementatie bevat infrastructuur plus een kleine startset: minimaal één biedvraag en één kaartvraag, gemaakt en gevalideerd met de bridge practice hand builder workflow.

## Testing Decisions

- Test extern gedrag, niet interne DOM-helperdetails. Belangrijk is wat de speler ziet en welke acties wel of niet state veranderen.
- Voeg unitdekking toe voor de SMB1-cursusdata: unieke les-id's, 12 lessen, stabiele leerdoel-id's en geen lege leerdoelteksten.
- Voeg unitdekking toe voor interactieve oefendata: elke oefening verwijst naar een bestaande les en leerdoel, heeft een `startSeed`, heeft een vraag, heeft een ondersteund actietype en heeft ten minste één correct antwoord.
- Ontbrekende oefeningen per leerdoel zijn toegestaan en geven geen testfalen. De UI moet deze als `Nog geen tafeloefening` kunnen tonen.
- Voeg unitdekking toe voor actievalidatie: juiste biedingen/kaarten slagen, foute keuzes geven algemene feedback, specifieke foute keuzes gebruiken `wrongByChoice`, en meerdere correcte antwoorden worden geaccepteerd.
- Voeg browserdekking toe voor de oefenpagina: leslijst zichtbaar, lesdetail toont leerdoelen, alleen interactieve oefeningen verschijnen, en startlinks openen de tafel met de juiste oefening.
- Voeg browserdekking toe voor de speeltafel: biedvraag boven biedbox, kaartvraag boven gespeelde kaarten, foute keuze wordt geblokkeerd, juiste keuze wordt toegepast, retry herstelt de startseed en volgende oefening navigeert binnen dezelfde lesroute.
- Gebruik bestaande testprior art: practice-hand catalogusvalidatie, lesson catalogusvalidatie, situation-seed restore tests en browserregressies rond lesson table tasks.
- Gebruik de bridge practice hand builder workflow voor nieuwe seed-oefeningen: leerdoel vertalen naar engine-observeerbare uitkomst, relevante regels controleren, seed herstellen in een schone appstate en de kleinste zinvolle test draaien.

## Out of Scope

- Volledige dekking van alle SMB1-leerdoelen in de eerste implementatiestap.
- Verwijderen van niet-interactieve oefenhanden uit de codebase of tests.
- Migreren van alle bestaande lessen naar interactieve oefeningen.
- Een volledige undo-engine voor foute keuzes.
- Demonstratiemodus waarin foute keuzes gecontroleerd mogen uitspelen.
- Simulatie, double-dummy of alternatieve scorelijnen.
- Algemene AI-feedback op random handen.
- Biedvragen buiten SMB1-route of meerdere conventieprofielen.
- Nieuwe bridge-regels bouwen alleen om een oefening mogelijk te maken; oefeningen moeten aansluiten op geïmplementeerde en uitlegbare engine-uitkomsten.

## Further Notes

De eerste verticale slice moet klein blijven: infrastructuur plus één gevalideerde biedoefening en één gevalideerde kaartoefening. Daarna kan SMB1-lesdoeldekking iteratief groeien. Elke nieuwe interactieve oefening moet een concrete, engine-observeerbare uitkomst hebben en mag geen sterkere claim maken dan de huidige engine en uitleglaag ondersteunen.

Er is al verwante infrastructuur aanwezig in de les-tafeltaken: verwacht bod/kaart, retry-feedback, blokkeren van foute keuzes en replay van dezelfde hand. De nieuwe oefenmodus moet dat patroon generaliseren zonder de rustige basisgame te belasten.
