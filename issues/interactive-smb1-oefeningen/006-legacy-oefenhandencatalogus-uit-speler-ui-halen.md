# Legacy oefenhandencatalogus uit speler-UI halen

## Parent

`docs/prds/interactive-smb1-oefeningen.md`

## What to build

Haal de oude brede oefenhandencatalogus uit de gewone speler-UI. De oefenpagina wordt een SMB1-interactieve oefenroute zonder globaal zoekveld, catalogusfilter, focusfilter of levelfilter. Bestaande technische en niet-interactieve oefenhanden blijven beschikbaar in code, tests, lessen en regressies, maar gewone spelers komen vanuit de UI alleen bij interactieve SMB1-oefeningen.

## Acceptance criteria

- [ ] De gewone oefenpagina toont geen globale zoekfunctie, catalogusfilter, focusfilter of levelfilter meer.
- [ ] De gewone oefenpagina toont geen niet-interactieve technische oefenhandcards.
- [ ] Links vanuit het app-menu blijven naar de SMB1-interactieve oefenroute gaan.
- [ ] Bestaande practice-hand lookup, preparation, lesson-start en regressietests voor niet-interactieve handen blijven werken.
- [ ] Browserdekking bevestigt dat alleen interactieve SMB1-oefeningen zichtbaar zijn voor gewone spelers.
- [ ] Relevante bestaande smoke/regressietests rond de oude catalogus worden aangepast naar de nieuwe spelerroute zonder technische catalogusdekking te verliezen.

## Blocked by

- `issues/interactive-smb1-oefeningen/002-interactieve-oefencatalogus-en-situatieseed-startcontract-toevoegen.md`

## User stories covered

- 3. Als beginner wil ik alleen interactieve oefeningen zien, zodat ik niet in een gewone testhand terechtkom zonder feedback.
- 27. Als ontwikkelaar wil ik bestaande niet-interactieve oefenhanden technisch laten bestaan, zodat lessen en regressietests niet onnodig breken.
