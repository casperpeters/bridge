# Kaartvraag end-to-end valideren op de speeltafel

## Parent

`docs/prds/interactive-smb1-oefeningen.md`

## What to build

Maak een interactieve kaartvraag speelbaar op de speeltafel. Tijdens een actieve kaartoefening staat de korte vraag boven de gespeelde kaarten, dicht bij de actuele slag. De speler kiest een kaart; foute kaarten worden standaard geblokkeerd voordat de slagstate verandert, en correcte kaarten worden wel gespeeld. Feedback komt uit de expliciete oefendata en ondersteunt meerdere correcte kaarten en keuze-specifieke foutcopy.

De kaartvraag mag dezelfde gegeneraliseerde validatielaag gebruiken als biedvragen, met aparte kaartmatching op card ids of toegestane kaartsets.

## Acceptance criteria

- [ ] Een actieve kaartvraag toont de vraag boven de gespeelde kaarten.
- [ ] Een fout maar legaal kaartkeuze verandert de lopende slag niet en toont retry-feedback.
- [ ] `wrongByChoice`-copy wordt gebruikt wanneer de gekozen kaart daarvoor specifieke feedback heeft.
- [ ] Een correcte kaart wordt gespeeld en markeert de oefening als afgerond.
- [ ] Meerdere correcte kaarten worden geaccepteerd wanneer de oefendata die opgeeft.
- [ ] Aanbevolen-kaartmarkering wordt tijdens de actieve kaartvraag onderdrukt zonder de lokale gebruikersinstelling te wijzigen.
- [ ] Unit tests dekken kaartvalidatie, meerdere juiste kaarten, algemene foutfeedback en `wrongByChoice`.
- [ ] Browserdekking toont vraag, blokkade van foute kaart, toepassing van correcte kaart en afgeronde feedback.

## Blocked by

- `issues/interactive-smb1-oefeningen/003-biedvraag-end-to-end-valideren-op-de-speeltafel.md`

## User stories covered

- 6. Als beginner wil ik bij een speelsituatie de vraag boven de gespeelde kaarten zien, zodat de vraag dicht bij de actuele slag staat.
- 9. Als beginner wil ik dat een fout bod of foute kaart meestal niet wordt gespeeld, zodat ik meteen opnieuw kan proberen zonder de situatie kwijt te raken.
- 10. Als beginner wil ik dat een goed bod of goede kaart wel op tafel komt, zodat mijn keuze echt onderdeel van het spel voelt.
- 11. Als beginner wil ik na een fout antwoord uitleg krijgen, zodat ik begrijp waar ik opnieuw naar moet kijken.
- 12. Als beginner wil ik feedback kunnen krijgen die specifiek is voor mijn gekozen bod of kaart, zodat de uitleg concreter is.
- 13. Als beginner wil ik na een goed antwoord korte positieve feedback krijgen, zodat ik weet waarom de actie paste.
- 14. Als beginner wil ik na een goede keuze opnieuw kunnen proberen, zodat ik dezelfde situatie kan herhalen.
- 18. Als beginner wil ik niet dat een aanbevolen kaart gemarkeerd wordt tijdens een actieve oefenvraag, zodat de juiste kaart niet visueel wordt verraden.
- 19. Als beginner wil ik dat meerdere juiste antwoorden mogelijk zijn, zodat equivalente biedingen of kaarten niet onterecht fout worden gerekend.
- 26. Als ontwikkelaar wil ik oefenacties valideren tegen expliciete oefendata, zodat de algemene AI-engine geen harde lesclaims hoeft te doen.
- 28. Als ontwikkelaar wil ik de bestaande lesson-table-task logica generaliseren, zodat retry-feedback en actievalidatie niet dubbel worden gebouwd.
