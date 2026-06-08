# Lead-and-predict tafelflow toevoegen

## Parent

`docs/prds/mini-eindpositie-oefeningen.md`

## What to build

Maak de eerste speelbare mini-oefenflow op de bridgetafel. De speler selecteert
als Zuid een startkaart, vult het voorspelde aantal persoonlijke Zuid-slagen in
en controleert beide antwoorden tegelijk. De kaart wordt pas gespeeld bij een
volledig goed antwoord.

## Acceptance criteria

- [ ] Een mini-oefening start op de speeltafel vanuit `situatieseed` v2.
- [ ] Zuid is altijd de speler; Zuid kan leider of verdediger zijn.
- [ ] Dummy ligt zichtbaar volgens normale bridgecontext.
- [ ] Bij open-kaartopgaven meldt de oefening expliciet dat alle resterende kaarten open liggen.
- [ ] Een kaartklik selecteert de kaart maar speelt hem nog niet.
- [ ] Het oefenpaneel bevat invoer voor het aantal Zuid-slagen en een `Controleer`-actie.
- [ ] Volledig goed antwoord speelt de gekozen kaart en solverlijn uit via gewone kaarttransities.
- [ ] Fout of gedeeltelijk goed antwoord muteert de tafelstate niet definitief en laat opnieuw proberen.
- [ ] Browserdekking controleert start, selectie zonder spelen, fout, gedeeltelijk goed en volledig goed.

## Blocked by

- `issues/mini-eindpositie-oefeningen/003-neutrale-aanvulling-en-seed-v2.md`

## User stories covered

- 1. Als beginner wil ik korte kaartcombinaties op de speeltafel oefenen, zodat de oefening voelt als echt bridge.
- 6. Als beginner wil ik een startkaart kunnen selecteren zonder dat hij meteen gespeeld wordt, zodat ik eerst ook mijn slagvoorspelling kan invullen.
- 8. Als beginner wil ik pas na `Controleer` zien of mijn kaart en voorspelling goed zijn, zodat de oefening zichzelf niet weggeeft.
- 11. Als beginner wil ik opnieuw kunnen proberen zonder dat de kaart definitief gespeeld is, zodat een fout antwoord de positie niet kapot maakt.
