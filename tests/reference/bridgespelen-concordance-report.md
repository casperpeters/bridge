# Bridgespelen Vijfkaart-Hoog Concordantie

Laatst bijgewerkt: 2026-05-05.

Dit rapport vat de handmatig genormaliseerde referentieclaims samen uit Bridgespelen.nl voor het huidige Vijfkaart-Hoog-profiel. De uitvoerbare claims staan in `tests/reference/bridgespelen-five-card-high.js` en worden getest via `tests/unit/bridgespelen-concordance.test.js`.

## Huidige stand

- Totaal: 42 claims.
- `match`: 38 claims waar bron en engine overeenkomen.
- `intentionalExtension`: 3 claims waar de engine bewust ruimer/sterker is dan de site.
- `siteSimplification`: 1 claim waar de site didactisch vereenvoudigt of overlappende regels geeft.
- `codeBug`: 0 claims.

## Pagina: bijbod na 1H/1S

Bron: https://www.bridgespelen.nl/vijf-kaart-hoog-bijbod-majeurs-van-5.html

- 14 claims vastgelegd.
- 13 `match`.
- 1 `siteSimplification`.

De pagina noemt bij zonder fit zowel `2SA` met 10-11 punten en verdeelde hand zonder biedbare hoge kleur, als `2K/2R` met 4+ kaart en 10+ punten. In handen met 10-11 HCP, een gebalanceerde verdeling en een vierkaart lage kleur overlappen die regels. De engine kiest daar de forcing nieuwe kleur (`2K`/`2R`), omdat dat meer informatie geeft en nog steeds binnen de paginaregel voor nieuwe kleuren valt.

## Bewuste uitbreidingen

Deze verschillen blijven groen in de concordantietest:

- Zwakke twee met een lelijke 11-punter die de Regel van 20 niet haalt.
- Preemptieve klaverenopeningen naast ruiten/harten/schoppen.
- Kwetsbaar met een uitzonderlijke sterke 7-kaart en 6 HCP veiliger op tweehoogte openen in plaats van driehoogte forceren.

## Testen

Gebruik:

```powershell
npm run test:unit
```

De concordantietest faalt bewust wanneer een claim als `codeBug` is gemarkeerd. Een afwijking die inhoudelijk beter of bewuster is, hoort als `intentionalExtension` of `siteSimplification` met rationale in de catalogus.
