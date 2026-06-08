# Mini-eindpositie-model en validator toevoegen

## Parent

`docs/prds/mini-eindpositie-oefeningen.md`

## What to build

Introduceer het compacte datamodel voor mini-eindpositie-oefeningen en valideer
dat oefeningen alleen publiceerbaar zijn wanneer ze compleet, klein en
didactisch uitlegbaar zijn. De eerste catalogus mag nog geen zichtbare speler-UI
hebben, maar moet wel een canary-oefening kunnen bevatten die aan SMB1 les 1 en
het leerdoel `smb1-les01-trick-definition-and-winner` gekoppeld is.

## Acceptance criteria

- [ ] Mini-oefeningen gebruiken minimaal `id`, `lessonId`, `learningGoalId`, `mode`, `situation` en `explanation`.
- [ ] `mode` accepteert in v1 `lead-and-predict` en reserveert het model voor latere modi.
- [ ] De validator eist Zuid als speler en verbiedt Zuid als dummy.
- [ ] De validator eist expliciete troefinformatie met `null` voor sans-atout.
- [ ] De validator accepteert 1 tot 7 resterende kaarten per speler na generatie.
- [ ] De validator eist gelijke resterende handlengtes voor alle vier spelers na generatie.
- [ ] De validator eist uitgebreide uitleg met ten minste correcte uitleg en waarom-uitleg.
- [ ] De canary-oefening verwijst naar SMB1 les 1 en `smb1-les01-trick-definition-and-winner`.
- [ ] Unit tests falen bij ontbrekende referenties, ongeldige dummy, ongelijke handlengtes, te grote posities en ontbrekende uitleg.

## Blocked by

None - can start immediately.

## User stories covered

- 17. Als cursusmaker wil ik een compacte opgave kunnen invoeren, zodat ik boekopgaven zonder volledige deal kan vastleggen.
- 19. Als cursusmaker wil ik uitgebreide uitleg verplicht kunnen vastleggen, zodat oefeningen niet alleen technisch juist maar ook didactisch bruikbaar zijn.
- 20. Als cursusmaker wil ik oefeningen aan SMB1-les en leerdoel koppelen, zodat de eerste batch in les 1 zichtbaar kan worden.
- 25. Als ontwikkelaar wil ik oefeningen hard laten falen in tests wanneer solvervalidatie niet lukt, zodat slechte oefendata niet live komt.
