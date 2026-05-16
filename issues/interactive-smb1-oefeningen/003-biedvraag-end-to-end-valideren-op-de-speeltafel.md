# Biedvraag end-to-end valideren op de speeltafel

## Parent

`docs/prds/interactive-smb1-oefeningen.md`

## What to build

Maak een interactieve biedvraag speelbaar op de speeltafel. Tijdens een actieve biedoefening staat de korte vraag boven de biedbox. De speler kiest een bod; foute biedingen worden standaard geblokkeerd voordat de veilingstate verandert, en correcte biedingen worden wel toegepast. Feedback komt uit de expliciete oefendata, inclusief algemene foutcopy, keuze-specifieke foutcopy en korte correcte feedback.

De bestaande lesson-table-task validatie mag hiervoor worden gegeneraliseerd, zodat retry-feedback en actievalidatie niet dubbel ontstaan.

## Acceptance criteria

- [ ] Een actieve biedvraag toont de vraag boven de biedbox.
- [ ] Een fout maar legaal bod verandert de veilingstate niet en toont retry-feedback.
- [ ] `wrongByChoice`-copy wordt gebruikt wanneer de gekozen call daarvoor specifieke feedback heeft.
- [ ] Een correct bod wordt aan de veiling toegevoegd en markeert de oefening als afgerond.
- [ ] Meerdere correcte biedingen worden geaccepteerd wanneer de oefendata die opgeeft.
- [ ] AI-suggestietekst wordt tijdens de actieve biedvraag onderdrukt zonder de lokale gebruikersinstelling te wijzigen.
- [ ] Unit tests dekken biedvalidatie, meerdere juiste calls, algemene foutfeedback en `wrongByChoice`.
- [ ] Browserdekking toont vraag, blokkade van fout bod, toepassing van correct bod en afgeronde feedback.

## Blocked by

- `issues/interactive-smb1-oefeningen/002-interactieve-oefencatalogus-en-situatieseed-startcontract-toevoegen.md`

## User stories covered

- 5. Als beginner wil ik bij een biedsituatie de vraag boven de biedbox zien, zodat ik weet welk bod ik moet kiezen.
- 9. Als beginner wil ik dat een fout bod of foute kaart meestal niet wordt gespeeld, zodat ik meteen opnieuw kan proberen zonder de situatie kwijt te raken.
- 10. Als beginner wil ik dat een goed bod of goede kaart wel op tafel komt, zodat mijn keuze echt onderdeel van het spel voelt.
- 11. Als beginner wil ik na een fout antwoord uitleg krijgen, zodat ik begrijp waar ik opnieuw naar moet kijken.
- 12. Als beginner wil ik feedback kunnen krijgen die specifiek is voor mijn gekozen bod of kaart, zodat de uitleg concreter is.
- 13. Als beginner wil ik na een goed antwoord korte positieve feedback krijgen, zodat ik weet waarom de actie paste.
- 14. Als beginner wil ik na een goede keuze opnieuw kunnen proberen, zodat ik dezelfde situatie kan herhalen.
- 17. Als beginner wil ik niet dat AI-suggesties het antwoord weggeven, zodat ik zelf moet nadenken.
- 19. Als beginner wil ik dat meerdere juiste antwoorden mogelijk zijn, zodat equivalente biedingen of kaarten niet onterecht fout worden gerekend.
- 26. Als ontwikkelaar wil ik oefenacties valideren tegen expliciete oefendata, zodat de algemene AI-engine geen harde lesclaims hoeft te doen.
- 28. Als ontwikkelaar wil ik de bestaande lesson-table-task logica generaliseren, zodat retry-feedback en actievalidatie niet dubbel worden gebouwd.
