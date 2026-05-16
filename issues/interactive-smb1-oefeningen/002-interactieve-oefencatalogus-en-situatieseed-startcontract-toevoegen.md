# Interactieve oefencatalogus en situatieseed-startcontract toevoegen

## Parent

`docs/prds/interactive-smb1-oefeningen.md`

## What to build

Voeg een aparte interactieve oefencatalogus toe die los staat van de SMB1-cursusstructuurdata. Een zichtbare interactieve oefening verwijst naar een bestaande SMB1-les en leerdoel, heeft een `startSeed`, een korte vraag en expliciete verwachte actie. Startlinks openen de speeltafel via een `situatieseed`, zodat de speler direct bij het bedoelde bied- of speelmoment begint.

Niet-interactieve oefenhanden blijven technisch bestaan voor lessen, tests en regressies, maar worden niet als gewone speler-oefeningen in deze nieuwe route getoond.

## Acceptance criteria

- [ ] Interactieve oefendata leeft in een aparte catalogus die verwijst naar bestaande SMB1-les- en leerdoel-id's.
- [ ] Alleen oefeningen met een `startSeed`, `question` en ondersteund actietype zijn zichtbaar in de SMB1-oefenroute.
- [ ] Een startlink opent de tafel met een `situatieseed` en herstelt fase, beurt, veiling, contractcontext, dummy, afgeronde slagen en lopende slag waar de seed die bevat.
- [ ] De eerste startset bevat minimaal een gevalideerde biedoefening en een gevalideerde kaartoefening.
- [ ] Ontbrekende oefeningen per leerdoel zijn toegestaan en breken validatie niet.
- [ ] Unit tests valideren referenties, seed-aanwezigheid, vraagtekst, actietype en minstens een correct antwoord.
- [ ] Browserdekking controleert dat startlinks de tafel openen met de juiste interactieve oefencontext.

## Blocked by

- `issues/interactive-smb1-oefeningen/001-smb1-lessen-en-leerdoelen-als-interactieve-oefenroute-tonen.md`

## User stories covered

- 3. Als beginner wil ik alleen interactieve oefeningen zien, zodat ik niet in een gewone testhand terechtkom zonder feedback.
- 4. Als beginner wil ik een oefening direct aan de tafel starten, zodat ik bridge oefen in dezelfde omgeving als het spel.
- 7. Als beginner wil ik dat de oefening al bij mijn beslismoment begint, zodat ik niet eerst een hele hand hoef door te spelen.
- 20. Als cursusmaker wil ik een leerdoel zonder goede tafeloefening compact kunnen tonen als `Nog geen tafeloefening`, zodat de dekking eerlijk zichtbaar blijft.
- 21. Als cursusmaker wil ik interactieve oefeningen aan SMB1-lesdoelen koppelen, zodat ik systematisch dekking kan opbouwen.
- 24. Als ontwikkelaar wil ik oefenstartposities via `situatieseed` definiëren, zodat biedverloop, beurt, dummy, lopende slag en gespeelde kaarten exact herstelbaar zijn.
- 25. Als ontwikkelaar wil ik oefeningdata los houden van cursusstructuurdata, zodat leerdoelen overzichtelijk blijven en oefeningen kunnen groeien.
- 27. Als ontwikkelaar wil ik bestaande niet-interactieve oefenhanden technisch laten bestaan, zodat lessen en regressietests niet onnodig breken.
- 29. Als ontwikkelaar wil ik de eerste release met een kleine gevalideerde startset doen, zodat infrastructuur, UI en seed-herstel end-to-end bewezen zijn voordat alle leerdoelen gevuld worden.
