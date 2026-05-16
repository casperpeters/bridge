# Retry, volgende oefening en terugroute afronden

## Parent

`docs/prds/interactive-smb1-oefeningen.md`

## What to build

Rond de navigatie na een correcte interactieve oefenactie af. Na afronding krijgt de speler korte feedback met `Opnieuw proberen` en, wanneer beschikbaar, `Volgende oefening`. Opnieuw proberen herstelt altijd de oorspronkelijke `startSeed`, ook nadat de correcte actie al op tafel is toegepast. Volgende oefening blijft binnen dezelfde SMB1-lesroute en volgt de oefenvolgorde. Als er geen volgende oefening is, toont de UI `Terug naar oefeningen`.

## Acceptance criteria

- [ ] Na een correcte oefenactie toont de UI korte correcte feedback.
- [ ] `Opnieuw proberen` herlaadt de oorspronkelijke `startSeed` en zet oefenstatus en tafelstate terug naar het beslismoment.
- [ ] `Volgende oefening` opent de volgende interactieve oefening binnen dezelfde SMB1-lesroute.
- [ ] De volgende-oefeninglogica slaat leerdoelen zonder interactieve oefening over.
- [ ] Bij de laatste interactieve oefening toont de UI `Terug naar oefeningen`.
- [ ] De terugroute opent de SMB1-oefenpagina op de relevante lesdetailweergave.
- [ ] Browserdekking controleert retry-herstel, volgende-oefeningnavigatie en laatste-oefening-terugroute.

## Blocked by

- `issues/interactive-smb1-oefeningen/003-biedvraag-end-to-end-valideren-op-de-speeltafel.md`
- `issues/interactive-smb1-oefeningen/004-kaartvraag-end-to-end-valideren-op-de-speeltafel.md`

## User stories covered

- 14. Als beginner wil ik na een goede keuze opnieuw kunnen proberen, zodat ik dezelfde situatie kan herhalen.
- 15. Als beginner wil ik na een goede keuze naar de volgende interactieve oefening binnen dezelfde SMB1-lesroute kunnen gaan, zodat ik door kan oefenen.
- 16. Als beginner wil ik aan het einde van een oefenreeks terug naar de oefeningen kunnen, zodat ik een andere les of leerdoel kan kiezen.
