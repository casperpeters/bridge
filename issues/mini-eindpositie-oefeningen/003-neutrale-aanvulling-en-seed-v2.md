# Neutrale aanvulling en situatieseed v2 ondersteunen

## Parent

`docs/prds/mini-eindpositie-oefeningen.md`

## What to build

Laat compacte mini-opgaven ontbrekende Noord/Oost-handen automatisch aanvullen
met neutrale resterende kaarten en encodeer de gevalideerde eindpositie als
compacte `situatieseed` v2. Bestaande `situatieseed` v1 repeat codes moeten
ongewijzigd blijven werken.

## Acceptance criteria

- [ ] Ontbrekende Noord/Oost-handen worden aangevuld tot dezelfde resterende lengte als Zuid en dummy.
- [ ] Aanvulling kiest didactisch neutrale kaarten en valideert dat de solveruitkomst stabiel blijft.
- [ ] Als geen stabiele neutrale aanvulling bestaat, faalt de oefening in validatie.
- [ ] `situatieseed` v2 kan embedded mini-handen met minder dan 13 kaarten per speler dragen.
- [ ] v2 seed encoding gebruikt compacte kaartstrings en korte payload keys.
- [ ] De app kan een v2 mini-eindpositie herstellen naar echte tafelstate met contract, leider, dummy, uitkomer en beurt.
- [ ] Bestaande v1 `situatieseed` parsing en restore blijven compatibel.
- [ ] Unit tests dekken v2 roundtrip, v1 regressie en neutrale aanvulling.

## Blocked by

- `issues/mini-eindpositie-oefeningen/002-mini-solver-voor-zuid-slagen.md`

## User stories covered

- 18. Als cursusmaker wil ik ontbrekende Noord/Oost-kaarten automatisch neutraal kunnen laten aanvullen, zodat irrelevante handen geen handwerk vragen.
- 21. Als ontwikkelaar wil ik mini-eindposities als `situatieseed` v2 kunnen opslaan, zodat gegenereerde oefeningen reproduceerbaar en deelbaar zijn.
- 22. Als ontwikkelaar wil ik compacte seeds maar auteurvriendelijke catalogusdata, zodat bronnen reviewbaar blijven en repeat codes kort zijn.
