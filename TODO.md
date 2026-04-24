# TODO: Routekaart Bridge-app

Enige bron van waarheid voor het product-, bied- en speelwerk van de bridge-app.

## Recente voortgang

- Eerste basis voor speelplannen toegevoegd: na de uitkomst, zodra de dummy zichtbaar is en Noord/Zuid leider zijn, toont de app een leidersplan met vaste slagen in sans-atout, verliezers in kleurcontracten, lange-kleurontwikkeling, entreerisico's, troef trekken en introevers in dummy.
- Fixturetests toegevoegd voor deze eerste speelplanheuristieken, zodat toekomstig kaartadvies dezelfde plandata kan gebruiken in plaats van losse UI-tekst te worden.
- `app.js` opgesplitst in kleinere browser-scripts onder `scripts/` voor tekst, instellingen, seeds, speelplanweergave, handweergave, biedweergave, review, biedverloop en speelverloop. De app blijft zonder build step werken via scriptvolgorde in `index.html`.
- Beginners-acceptatiechecklist toegevoegd aan de README, zodat testers kunnen controleren of een nieuwe speler beurt, legaliteit, dummy, slagwinnaar en score kan volgen.
- Altijd beschikbare feedbackknop toegevoegd: testers kunnen op elk moment een Markdown-rapport kopieren of mailen met bericht, fase, seed, biedverloop, slagen, score, handen en instellingen.
- Browser-smoketests toegevoegd met Playwright voor desktop en mobiel: laden, Zuid-bieding, dummy pas na de uitkomst, speelplanpaneel, een uitgespeelde hand, review en feedbackrapport.
- Kaartadvies aan de leiderskant gekoppeld aan het zichtbare speelplan: speelplanprioriteiten krijgen voorrang wanneer ze speelbaar zijn, en AI-suggesties plus speeluitleg verwijzen naar dezelfde planregel.
- Beginnersvriendelijke score-uitleg toegevoegd aan de handreview, met contractdoel, gehaalde slagen, kwetsbaarheid, contractpunten, overslagen/onderslagen, bonussen en eindscore.
- Scoremodus-instelling verwijderd: de app gebruikt altijd gewone bridgescore met kwetsbaarheid en contractbonussen.
- Bridgescoretests voor slembonussen en geredoubleerde contracten zijn aanwezig; toekomstig scorewerk moet vooral UI-uitleg en regressies rond biedmodelmigraties borgen.
- Beginnerstest 1 uitgevoerd met de README-checklist op schone standaardinstellingen. Testbord `1o0ab2mctaply` werd volledig uitgespeeld met simpele beginnersacties: Zuid paste, speelde telkens een legale kaart, zag slagpauzes, eindcontract, resultaat, score-uitleg en handreview zonder consolefouten.
- Contextuele dummy-uitleg toegevoegd: zodra de dummy na de uitkomst zichtbaar wordt, toont de tafel kort wie dummy is, wie leider is en of de speler verdedigt of beide Noord/Zuid-handen speelt.

## 1. Product- en testgereedheid

- Testresultaat beginnerstest 1: beurtstatus, biedlegaliteit, kaartlegaliteit, slagwinnaar, eindcontract, gemaakt aantal slagen en score-uitleg zijn aanwezig genoeg om een bord uit te spelen.
- Productgat beginnerstest 1: verberg `Test slagenoverzicht` buiten test- of ontwikkelmodus, of hernoem het expliciet als testerhulpmiddel; de knop staat nu tussen normale acties en verstoort het beginnerspad.
- Productgat beginnerstest 1: maak het eerste biedmoment beter begeleid zonder de volledige biedbox te verstoppen. Laat de biedbox beschikbaar, maar benadruk aanbevolen/logische acties, maak `Stop` en `Alert` minder prominent voor beginners, en geef korte redenen bij aanbevolen of disabled biedingen.
- Productgat beginnerstest 1: maak tijdens spelen de actieve hand zichtbaarder dan alleen de statusregel. Markeer de hand die moet spelen en voeg een korte reden toe bij beperkte legale kaarten, zoals "bekennen in harten".
- Productgat beginnerstest 1: geef bij klikken/tikken op een illegale kaart een korte, niet-blokkerende uitleg in plaats van stil niets te doen.
- Productgat beginnerstest 1: polijst review- en scorejargon voor beginners. Vervang of verklaar labels als `Handseed`, `uitkomst`, `overslag` en `deelscore` in de review of via inline hulp.
- Productgat beginnerstest 1: maak vervolgacties na afloop sterker bij de review zichtbaar: primair `Nieuwe hand`, secundair `Zelfde hand`, en feedback/testeracties apart.
- Gebruik score-uitleg, handreview, speelplanbetrouwbaarheid en de eerste beginnerstest als poort voordat diepe biedinfrastructuur leidend wordt.
- Blijf vervolgtests klein en observeer vooral waar spelers afhaken: beurt, biedlegaliteit, dummy, slagwinnaar, contractresultaat, score en vervolgactie.

## 2. Regels en score

- Gewone bridgescore met kwetsbaarheid en contractbonussen is de vaste scorebasis van de app.
- Rond de uitleg en regressietestdekking voor bestaande doubletten/redoubletten af voordat biedwerk dat afhankelijk is van score, kwetsbaarheid of offerbeslissingen verder wordt uitgebreid.
- Breid score- en kwetsbaarheidsafhankelijke biedlogica pas uit nadat het biedmodel expliciet onderscheid maakt tussen passen, contractbiedingen, doubletten en redoubletten.

## 3. Leerervaring

- Voeg een beginnersmodus toe die legale en illegale biedingen uitlegt voordat de gebruiker kiest.
- Leg na een menselijke bieding of kaartkeuze uit waarom die redelijk was, of wat een beter alternatief zou zijn geweest.
- Houd de formulering van AI-suggesties eerlijk totdat de bied- en speelengines sterker zijn: suggesties zijn heuristisch, niet gezaghebbend.
- Voeg woordenlijst-/hulpitems toe voor de kernbegrippen uit de UI: gever, kwetsbaarheid, contract, leider, dummy, slag, troef, kleur bekennen, manche, slem, overslag en onderslag.
- Voeg kleine, gerichte lessen toe voor openingsbiedingen, antwoorden op partner, kleur bekennen, troeven, dummyspel en scoren.
- Voeg samengestelde oefenspellen per onderwerp toe, zoals antwoorden op 1SA, hoge-kleurfits, uitkomsten, troef trekken en basisverdediging.
- Voeg ongedaan maken/herhalen toe voor de leermodus, ten minste voor de meest recente kaart in het spel.
- Breid het speelplanpaneel uit naar feedback na kaartkeuzes, maar alleen waar het plan de afweging eerlijk kan uitleggen.

## 4. Heuristisch model

- Gebruik altijd de sterkste geimplementeerde heuristiek in plaats van door spelers te kiezen sterktes beschikbaar te maken.
- Voeg beginnersveilige bieduitleg en samengestelde oefeningen toe zonder de AI-keuzemotor te verzwakken.
- Voeg uitlegbare planningsheuristieken toe voor leider en verdediging, zoals winnaars/verliezers tellen, troef trekken, duidelijke entrees bewaren, tweede hand laag, derde hand hoog en partners kleur terugspelen.
- Voeg simulatie of double-dummy-ondersteunde keuzes toe voor twijfelgevallen zodra die betrouwbaar genoeg zijn om standaard te worden.
- Houd UI-beschrijvingen eerlijk totdat elke heuristiek daadwerkelijk is geimplementeerd.
- Breid benoemde regelredenen uit van kaartspel naar bieden en toekomstige kaartspelregels, zodat AI-suggesties en ontwikkelaarsuitleg dezelfde bron van waarheid blijven gebruiken.
- Voeg fixturetests toe voor elke nieuwe heuristiek voordat de UI-taal sterker wordt gemaakt.

## 5. Competitief biedmodel

- Normaliseer de huidige gemengde biedrepresentatie naar expliciete biedtypen: `Pass`, `Bid`, `Double` en `Redouble`. Nu zijn passen/doubletten/redoubletten nog strings en contractbiedingen objecten; dat werkt, maar is geen stabiele basis voor diepere biedlogica.
- Sla biedcontext op met gever, kwetsbaarheid, positie, partnerschap, eerdere biedingen en huidig contract.
- Houd forcingstatus per partnerschap bij: forcing, mancheforcing, inviterend, afzwaaiend, alleen competitief.
- Houd na elke bieding getoonde handranges bij: HCP, totaalpunten, kleurlengtes, stops, steun, controles en handpatroon.
- Scheid het letterlijke contract van een bieding van de betekenis ervan. Voorbeeld: `2D` na `1NT` is een transfer, geen ruiten.
- Voeg bieduitleg toe voor alle AI-biedingen en muisover-/hulptekst voor gebruikers.

## 6. Conventiesysteem

- Blijf de NBB Vijfkaart Hoog-regelmodule uitbreiden voorbij de huidige basisdekking van de systeemkaart.
- Voeg regelmatching toe op basis van biedverlooppatroon, positie, kwetsbaarheid en partnerschapsstatus.
- Geef elke regel een betekenis, legale vervolgen, puntenrange, vormvoorwaarden en prioriteit.
- Ondersteun kunstmatige biedingen, alerts, forcingbiedingen en afzwaaibiedingen.
- Voeg fallbackregels toe voor onbekende biedverlopen, zodat de AI een veilige natuurlijke actie kan kiezen.
- Voeg later een biedsysteemselector toe als meerdere systemen nuttig worden, zoals Standaard Hoog, Acol of 2/1.
- Voeg conventieschakelaars toe: Stayman, transfers, negatieve doubletten, zwakke twee-openingen, Michaels, Unusual NT en Lebensohl.
- Waarschuw wanneer een gebruikersbieding buiten het geselecteerde systeem valt.

## 7. Competitieve biedhulpmiddelen

- Informatiedoubletten na een opening op eenniveau door de tegenpartij.
- Strafdoubletten in duidelijk gedefinieerde biedverlopen.
- Negatieve doubletten door antwoorder.
- Responsieve doubletten nadat partner heeft gevolgd en de tegenstanders verhogen.
- Supportdoubletten en redoubletten door opener.
- Acties in de balancing seat na twee passen.
- Cue-bids die een limietverhoging of beter tonen nadat partner heeft gevolgd.
- Ongebruikelijke `2NT` voor de twee laagste ongeboden kleuren.
- Michaels cue-bids over kleuropeningen op eenniveau.
- Eenvoudige, sprong- en preemptieve volgbiedingen.
- `1NT`-volgbiedingen met stopvereisten.
- Natuurlijke sans-atout-antwoorden na volgbiedingen.

## 8. Competitieve Vijfkaart Hoog-verlopen

- Antwoorden nadat partner opent en de tegenstanders volgen.
- Antwoorden nadat partner opent en de tegenstanders doubleren.
- Herbiedingen van opener na tussenbieden.
- Acties van advancer nadat partner heeft gevolgd.
- Competitieve verhogingen: enkele verhoging, gemengde verhoging, limietverhoging en preemptieve verhoging.
- Verhogingsbeslissingen in de stijl van de wet van het totale aantal slagen.
- Manchepogingen na competitieve verhogingen.
- Beslissingen tussen doorbieden en verdedigen op 2-, 3-, 4- en 5-niveau.
- Strafpasbeslissingen nadat partner doubleert.

## 9. Sans-atout-interventie

- Bepaal welke verdediging wordt gebruikt tegen een `1NT` van de tegenpartij, zoals natuurlijk, Cappelletti of DONT.
- Voeg systeem-aan-/systeem-uit-regels toe na interventie over onze `1NT`.
- Lebensohl na `1NT`-interventie.
- Gestolen-bieding-doubletten indien gewenst voor de beginnersmodus.
- Strafdoubletten en competitieve ontsnappingen na gedoubleerde sans-atoutcontracten.

## 10. Handevaluatie bij bieden

- Verfijn totaalpunten: korte-kleurpunten moeten afhangen van fit en honneurlocatie.
- Voeg evaluatie van kleurkwaliteit toe: honneurs, textuur, lengte en herbiedbaarheid.
- Voeg stopdetectie toe voor sans-atout-bieden.
- Voeg verliezerstelling toe voor verdelingshanden in competitieve biedverlopen.
- Voeg controles toe voor slemverkenning.
- Voeg fitkwaliteit toe: troeflengte, korte zijkleuren, werkende honneurs en verspilde waarden.
- Straf niet-ondersteunde honneurs in kleuren van de tegenstanders af.

## 11. Routekaart voor AI-verbetering

- Fase 1: maak heuristisch advies betrouwbaar voor beginnersbasis voordat sterkere feedback wordt toegevoegd.
- Voeg transparante betrouwbaarheidslabels toe voor AI-suggesties: basis, onzeker of gevorderd.
- Voeg fixturegebaseerde checks toe voor veelvoorkomende beginnersspellen voordat de begeleidingstaal wordt uitgebreid.
- Verbeter eerst openings- en antwoordheuristieken in ongestoorde biedverlopen.
- Verbeter daarna basisheuristieken voor kaartspel: uitkomsten, kleur bekennen, derde hand hoog, tweede hand laag en partners kleur terugspelen.
- Bouw voort op de eerste heuristieken voor sans-atout lange-kleurontwikkeling en entreebewuste eenvoudige/dubbele snits met sterker leiderplan.
- Houd kaartspelgedrag afgestemd op de sterkste geimplementeerde set heuristieken.
- Voeg feedback na keuzes alleen toe waar de motor de afweging eerlijk kan uitleggen.
- Behandel geavanceerd competitief bieden en simulatie als latere fases, niet als voorwaarden voor basiswaarde in het leren.

## 12. Biedzoekactie en simulatie

- Genereer mogelijke verborgen handen die passen bij het biedverloop.
- Schat contractuitkomsten met double-dummy of lichte playoutsimulatie.
- Gebruik simulatie voor competitieve twijfelkeuzes: passen, nog een keer bieden, doubleren of offeren.
- Bewaar handvoorwaarden en gesamplede spellen tijdelijk tijdens een biedverloop.
- Houd snelle heuristieken als standaardpad totdat simulatie betrouwbaar genoeg is om standaard te draaien.

## 13. Uitkomsten bij kaartspel

- Maak uitkomsten contractbewust: sans-atout- en kleurcontracten hebben verschillende prioriteiten nodig.
- Voeg gangbare uitkomstafspraken toe: hoogste van aaneengesloten honneurs, vierde van lengte, laag van drie kleintjes en singletonuitkomsten tegen kleurcontracten.
- Gebruik biedinformatie om partners kleur te verkiezen, de sterke kleur van de leider te vermijden en zwak gestopte kleuren aan te vallen.
- Voeg passieve uitkomsten toe wanneer het biedverloop suggereert dat de leider zijkleurkracht heeft.

## 14. Leidersplanning

- Breid de eerste telling van vaste winnaars in sans-atoutcontracten uit met blokkades en entreetiming.
- Breid de eerste verliezerstelling in kleurcontracten uit met betere dekkaarten, korte kleuren en troefcontrole.
- Houd het zichtbare speelplan als bron van waarheid voor kaartadvies aan de leiderskant.
- Breid lange-kleurontwikkeling uit voorbij de eerste sans-atoutbasis met aaneengesloten honneurs: entreechecks, geblokkeerde kleuren, timing en gevestigde winnaars incasseren.
- Bewaar entrees naar dummy en leidershand.
- Voorkom het blokkeren van kleuren bij het incasseren van winnaars.
- Breid snitdetectie uit voorbij de huidige entreebewuste sans-atoutbasis voor eenvoudige/dubbele snits: herhaalde snits, tweerichtingsgokjes, rijkere entreerangschikking en timing.
- Voeg hold-upspel toe in sans-atout wanneer verdedigers een lange kleur dreigen vrij te spelen.

## 15. Verdedigend spel

- Voeg regels toe voor tweede hand laag en derde hand hoog, met uitzonderingen.
- Dek honneurs wanneer dat verdedigende slagen kan promoveren.
- Speel partners uitkomstkleur terug wanneer dat verstandig is.
- Voorkom dat de leider wordt geholpen door van niet-ondersteunde honneurs weg te spelen.
- Speel troef wanneer dummy introefwaarde heeft of de leider op een crossruff lijkt te spelen.
- Incasseer downslagen wanneer de verdediging het contract kan verslaan.

## 16. Signaleren en afgooien

- Houd verdedigende signaalafspraken bij: aan-/afsignaal, count en kleurvoorkeur.
- Laat verdedigers signaleren met aaneengesloten lage kaarten wanneer zij de slag niet kunnen beinvloeden.
- Lees partners signalen en werk kleurvoorkeuren bij.
- Houd de beginnersmodus eenvoudig door signaalcomplexiteit te verbergen tenzij hints zijn ingeschakeld.

## 17. Kaartspelgeheugen en inferentie

- Houd elke gespeelde kaart bij en leid resterende kaarten per kleur af.
- Houd bekende renonces bij wanneer iemand geen kleur bekent.
- Schat verborgen kleurlengtes op basis van bieding en spel.
- Houd waarschijnlijke locaties van hoge kaarten bij.
- Gebruik zichtbaarheid van de dummy zodra de dummy verschijnt.
- Onderhoud voorwaarden per positie die zowel heuristieken als simulatie kunnen voeden.

## 18. Contractbewust kaartspel

- Laat de leider eerst optimaliseren voor het maken van het contract en daarna voor overslagen.
- Laat verdedigers eerst optimaliseren voor het verslaan van het contract en daarna voor extra onderslagen.
- Gebruik contractscore en kwetsbaarheid expliciet in kaartspelbeslissingen zodra kaartspelgeheugen en inferentie betrouwbaar genoeg zijn.
- Herken wanneer een offercontract het doel verandert van maken naar verlies minimaliseren.

## 19. Zoekactie en simulatie bij kaartspel

- Voeg double-dummy-solverintegratie of een lichte lokale zoeklaag toe.
- Genereer mogelijke verborgen spellen die passen bij bieding en spel.
- Evalueer kandidaatskaarten op basis van verwachte slagen.
- Gebruik snelle heuristieken totdat simulatie sterk en snel genoeg is om de permanente keuzelaag te worden.
- Bewaar gesamplede werelden tijdelijk tijdens een spel, zodat beslissingen consistent blijven.

## 20. Testen

- Voeg regressietests toe voor biedlegaliteit en doubletten/redoubletten zodra het getypeerde biedmodel bestaat; de huidige doublet/redoublet-functionaliteit moet daarbij gedrag behouden.
- Voeg fixturehanden toe voor veelvoorkomende competitieve Vijfkaart Hoog-biedverlopen.
- Voeg regressietests toe voor kunstmatige biedingen die het verkeerde eindcontract worden.
- Voeg tests toe voor kwetsbaarheidsgevoelige preempts en offers.
- Voeg tests toe voor SA-interventie en transfer-/Stayman-vervolgen.
- Voeg steekproef-smoketests met willekeurige spellen toe die volledige biedverlopen draaien zonder illegale biedingen.
- Vergelijk geselecteerde biedverlopen met referentievoorbeelden van NBB Vijfkaart Hoog-conventies.
- Voeg fixtures toe voor uitkomsten in sans-atout- en kleurcontracten.
- Voeg fixtures toe voor kleur bekennen, troeven, overtroeven en afgooien.
- Breid fixtures voor leidersspel uit voorbij de huidige eerste sans-atoutchecks voor lange-kleurontwikkeling en entreebewuste snits: troef trekken, winnaars incasseren, herhaalde snits, entreebehoud en randgevallen voor geblokkeerde kleuren.
- Voeg verdedigingsfixtures toe voor tweede hand laag, derde hand hoog, honneurs dekken en partners kleur terugspelen.
- Voeg steekproef-smoketests voor volledige willekeurige spellen toe die het spel afronden zonder illegale kaarten.
- Voeg regressietests toe voor dummyzichtbaarheid en regels voor gebruikerscontrole.
- Voeg browsersmoketests toe voor desktop- en mobiele layouts.

## 21. Toegankelijkheid en UI-polijsting

- Controleer bieden en kaartspel met alleen het toetsenbord.
- Voeg zichtbare focusstatussen toe voor elk interactief bedieningselement.
- Zorg dat screenreaderlabels rang en kleur bevatten voor zichtbare kaarten en verborgen kaarten als verborgen beschrijven.
- Zorg dat statusupdates duidelijk worden aangekondigd zonder te veel ruis te veroorzaken.
- Controleer de indeling op kleine telefoons, tablets, desktop en lage laptopviewports.
- Voeg ondersteuning voor verminderde beweging toe voor gebruikers die minder animatie willen.
- Maak de hintknop bruikbaar op aanraakapparaten, niet alleen bij muisover/focus.

## 22. Voorgestelde implementatievolgorde

1. Houd nieuwe UI- en flowwijzigingen binnen de nieuwe eigenaarsgrenzen van de kleine scripts in `scripts/`, zodat `scripts/app.js` vooral bootstrap en gedeelde helpers blijft.
2. Los de productgaten uit beginnerstest 1 op voordat de UI meer leermodus-belofte krijgt: testknop verbergen, biedmoment begeleiden zonder biedbox-frictie, actieve-handmarkering, illegale-kaartfeedback, reviewjargon en vervolgacties.
3. Versterk de speelplanengine voordat de UI meer belooft: geblokkeerde kleuren, entreetiming, incasseervolgorde, rijkere verliezerstelling en wanneer troef trekken moet wachten.
4. Voeg kaartspelgeheugen en inferentie vroeg toe: gespeelde kaarten, renonces, resterende lengtes en waarschijnlijke hoge-kaartlocaties vormen de basis voor sterker leider- en tegenspel.
5. Voeg samengestelde oefenhanden per plantype toe, omdat willekeurige spellen niet betrouwbaar genoeg de leermomenten tonen die testers moeten beoordelen.
6. Verbeter uitkomsten en basisverdediging met benoemde kaartspelregelresultaten en ontwikkelaarsmodus-uitleg om keuzes te valideren.
7. Start de diepe biedinfrastructuur: normaliseer biedingen naar getypeerde call-objecten, zodat `Pass`, `Bid`, `Double` en `Redouble` expliciet zijn.
8. Breng de bestaande doublet/redoublet-ondersteuning over op het getypeerde model en borg legaliteit, eindcontract, scoring en UI met regressietests.
9. Verbeter de basis-AI voor ongestoorde biedverlopen en voeg fixturechecks toe voor veelvoorkomende beginnersbiedingen.
10. Breid de huidige Vijfkaart Hoog-biedregels uit met herbruikbare biedbetekenissen, ranges en forcingstatus.
11. Voeg leerfuncties voor beginners toe waar de motor betrouwbaar is: uitleg van legale keuzes, woordenlijst/hulp en beperkte feedback na keuzes.
12. Voeg ongedaan maken/herhalen toe voor de leermodus.
13. Voeg kernhulpmiddelen voor competitief bieden toe: informatiedoubletten, negative doubles, eenvoudige volgbiedingen en `1NT`-volgbiedingen.
14. Voeg competitieve verhogingen, cue-bids, balancingacties en afspraken voor sans-atout-interventie toe.
15. Voeg optionele conventie-instellingen toe zodra het kerngedrag stabiel is.
16. Voeg simulatie of double-dummy-zoekactie toe voor twijfelgevallen in bieden en kaartspel.

## 23. Volgende stappen na de eerste speelplannen

1. Verbeter de plannauwkeurigheid, omdat beginnersfeedback alleen nuttig is als de app timing en onzekerheid eerlijk kan uitleggen.
2. Voeg daarna samengestelde handen per plantype toe, omdat willekeurige spellen niet betrouwbaar genoeg de leermomenten tonen die testers moeten beoordelen.
