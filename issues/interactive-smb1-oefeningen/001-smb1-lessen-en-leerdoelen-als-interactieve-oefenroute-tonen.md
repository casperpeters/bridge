# SMB1-lessen en leerdoelen als interactieve oefenroute tonen

## Parent

`docs/prds/interactive-smb1-oefeningen.md`

## What to build

Maak Start met Bridge 1 beschikbaar als JS-source-of-truth voor de 12 lessen en hun stabiele leerdoelen, en gebruik die bron om de oefenpagina als SMB1-lesroute te tonen. De eerste weergave toont alleen de 12 SMB1-lessen. De lesdetailweergave toont per leerdoel de beschikbare interactieve oefeningen of compact `Nog geen tafeloefening`.

Verwijder `docs/smb1.md` zodra dezelfde cursusstructuur en leerdoelen volledig uit de JS-data komen, zodat er geen dubbele bron voor SMB1-inhoud overblijft.

## Acceptance criteria

- [ ] De SMB1-cursusdata bevat precies 12 lessen met stabiele les-id's, lesnummers, lestitels en niet-lege leerdoel-id's/teksten.
- [ ] De oefenpagina toont als eerste scherm alleen de SMB1-lessen en geen brede technische cataloguslijst.
- [ ] Een SMB1-lesdetail toont alle leerdoelen voor die les in cursusvolgorde.
- [ ] Leerdoelen zonder gekoppelde interactieve oefening tonen `Nog geen tafeloefening`.
- [ ] Unit tests valideren de SMB1-cursusdata en falen bij dubbele of lege ids/teksten.
- [ ] Browserdekking controleert dat de leslijst en een lesdetail met leerdoelen zichtbaar zijn.
- [ ] `docs/smb1.md` is verwijderd wanneer de JS-data dezelfde broninformatie dekt.

## Blocked by

None - can start immediately.

## User stories covered

- 1. Als beginner wil ik een SMB1-les kunnen kiezen, zodat ik oefenstof vind die past bij mijn cursus.
- 2. Als beginner wil ik per les de leerdoelen zien, zodat duidelijk is wat ik aan het oefenen ben.
- 20. Als cursusmaker wil ik een leerdoel zonder goede tafeloefening compact kunnen tonen als `Nog geen tafeloefening`, zodat de dekking eerlijk zichtbaar blijft.
- 22. Als cursusmaker wil ik de SMB1-lessen en leerdoelen in JS-data beheren, zodat de UI en tests dezelfde bron van waarheid gebruiken.
- 23. Als cursusmaker wil ik `docs/smb1.md` verwijderen zodra de JS-data bestaat, zodat er geen dubbele SMB1-bron veroudert.
