# Feedback, speelgeschiedenis en adviesonderdrukking afronden

## Parent

`docs/prds/mini-eindpositie-oefeningen.md`

## What to build

Rond de leerfeedback af voor mini-eindpositie-oefeningen. Tijdens de actieve
vraag blijft de tafel rustig en geeft de app het antwoord niet weg. Na een
volledig goed antwoord wordt de bestaande speelgeschiedenis zichtbaar en toont
het oefenpaneel samenvatting plus uitgebreide auteur-uitleg.

## Acceptance criteria

- [ ] Tijdens een actieve mini-oefening zijn AI-suggesties en aanbevolen-kaartmarkering onderdrukt.
- [ ] De gewone `Uitspelen`-actie is tijdens de actieve vraag niet zichtbaar.
- [ ] Live speelgeschiedenis is tijdens het beantwoorden niet zichtbaar.
- [ ] Bij gedeeltelijk goed antwoord toont de app welk deel klopt zonder de volledige solverlijn te tonen.
- [ ] Bij volledig goed antwoord wordt de bestaande speelgeschiedenis zichtbaar.
- [ ] De gespeelde solverlijn staat als gewone slagen in de bestaande speelgeschiedenis.
- [ ] Uitgebreide auteur-uitleg verschijnt alleen na controle.
- [ ] Browserdekking controleert adviesonderdrukking en speelgeschiedenis na goed antwoord.

## Blocked by

- `issues/mini-eindpositie-oefeningen/004-lead-and-predict-tafelflow.md`

## User stories covered

- 12. Als beginner wil ik na een volledig goed antwoord de resterende slagen op tafel uitgespeeld zien, zodat de oplossing zichtbaar bridgegedrag is.
- 13. Als beginner wil ik na een goed antwoord de bestaande speelgeschiedenis zien, zodat ik de gespeelde slagen kan teruglezen.
- 14. Als beginner wil ik na controle uitgebreide uitleg krijgen, zodat ik begrijp waarom de startkaart en slagvoorspelling kloppen.
- 16. Als beginner wil ik geen AI-suggestie, aanbevolen kaart of gewone `Uitspelen`-actie tijdens de actieve vraag zien, zodat het antwoord niet wordt verraden.
