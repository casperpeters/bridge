# Release-startset met gevalideerde SMB1-oefeningen uitbreiden

## Parent

`docs/prds/interactive-smb1-oefeningen.md`

## What to build

Breid de eerste interactieve SMB1-startset uit met een kleine, bewezen verzameling oefeningen die de infrastructuur representatief gebruikt. Voeg alleen oefeningen toe waarvan de gewenste bied- of kaartactie engine-observeerbaar is en door bestaande regels/uitlegpaden wordt ondersteund. Waar didactisch nuttig mag een oefening een korte automatische aanloopactie hebben, zolang de speler nog steeds direct bij het bedoelde beslismoment uitkomt.

Gebruik de bridge practice hand builder workflow voor nieuwe seed-oefeningen: leerdoel vertalen naar engine-observeerbare uitkomst, relevante regels controleren, seed herstellen in een schone appstate en de kleinst zinvolle test draaien.

## Acceptance criteria

- [ ] De startset bevat meerdere interactieve bied- en kaartoefeningen verspreid over de eerst gekozen SMB1-lessen.
- [ ] Elke oefening verwijst naar een bestaand SMB1-leerdoel en heeft een concrete engine-observeerbare verwachte actie.
- [ ] Elke oefening heeft een stabiele `startSeed`, vraagtekst, correcte feedback en foutfeedback.
- [ ] Waar meerdere juiste acties logisch zijn, staan die expliciet in de oefendata.
- [ ] Oefeningen met een korte automatische aanloop starten maximaal een actie voor het beslismoment en spelen daarna gecontroleerd door tot de speler aan zet is.
- [ ] Nieuwe oefeningen hebben unit- en/of browserdekking passend bij hun regressierisico.
- [ ] De UI blijft eerlijk over ontbrekende dekking met `Nog geen tafeloefening` voor leerdoelen zonder oefening.

## Blocked by

- `issues/interactive-smb1-oefeningen/004-kaartvraag-end-to-end-valideren-op-de-speeltafel.md`
- `issues/interactive-smb1-oefeningen/005-retry-volgende-oefening-en-terugroute-afronden.md`

## User stories covered

- 8. Als beginner wil ik soms een korte automatische aanloopactie zien, zodat het voelt alsof ik net aan tafel aansluit.
- 19. Als beginner wil ik dat meerdere juiste antwoorden mogelijk zijn, zodat equivalente biedingen of kaarten niet onterecht fout worden gerekend.
- 21. Als cursusmaker wil ik interactieve oefeningen aan SMB1-lesdoelen koppelen, zodat ik systematisch dekking kan opbouwen.
- 24. Als ontwikkelaar wil ik oefenstartposities via `situatieseed` definiëren, zodat biedverloop, beurt, dummy, lopende slag en gespeelde kaarten exact herstelbaar zijn.
- 25. Als ontwikkelaar wil ik oefeningdata los houden van cursusstructuurdata, zodat leerdoelen overzichtelijk blijven en oefeningen kunnen groeien.
- 29. Als ontwikkelaar wil ik de eerste release met een kleine gevalideerde startset doen, zodat infrastructuur, UI en seed-herstel end-to-end bewezen zijn voordat alle leerdoelen gevuld worden.
