# Aparte route en eerste batch mini-oefeningen toevoegen

## Parent

`docs/prds/mini-eindpositie-oefeningen.md`

## What to build

Maak mini-eindpositie-oefeningen vindbaar als aparte route naast de bestaande
SMB1-oefenroute, met koppeling naar SMB1 les 1. Voeg de eerste batch toe zodra
de zes opgaven uit de foto expliciet als kaartdata zijn bevestigd.

## Acceptance criteria

- [ ] De oefenpagina toont een aparte route voor mini-eindposities of kaartcombinaties.
- [ ] Mini-oefeningen blijven onderscheidbaar van gewone interactieve SMB1 bied- en kaartvragen.
- [ ] De eerste zichtbare oefeningen zijn gekoppeld aan `smb1-les01`.
- [ ] De eerste batch gebruikt `smb1-les01-trick-definition-and-winner` als leerdoel.
- [ ] De zes foto-opgaven worden alleen ingevoerd na expliciete bevestiging van kaartdata.
- [ ] De batch bevat ook de troefopgave.
- [ ] Oefeningen zonder geldige solveruitkomst zijn niet zichtbaar voor spelers en falen in tests.
- [ ] Browserdekking controleert route, les-1-koppeling en starten van een batchoefening.

## Blocked by

- `issues/mini-eindpositie-oefeningen/005-feedback-geschiedenis-en-onderdrukking.md`

## User stories covered

- 20. Als cursusmaker wil ik oefeningen aan SMB1-les en leerdoel koppelen, zodat de eerste batch in les 1 zichtbaar kan worden.
- 26. Als ontwikkelaar wil ik ongeldige oefeningen voor spelers verbergen, zodat beginners nooit in een onbetrouwbare oefening komen.
