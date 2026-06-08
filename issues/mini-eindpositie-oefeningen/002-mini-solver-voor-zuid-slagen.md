# Mini-solver voor optimale Zuid-slagen bouwen

## Parent

`docs/prds/mini-eindpositie-oefeningen.md`

## What to build

Bouw een pure mini-solver voor volledig bekende kleine eindposities. De solver
rekent per legale startkaart uit hoeveel persoonlijke slagen Zuid maximaal maakt
bij optimaal vervolgspel, met ondersteuning voor sans-atout en troef.

## Acceptance criteria

- [ ] De solver ondersteunt 1 tot 7 kaarten per speler.
- [ ] De solver ondersteunt sans-atout en alle vier troefkleuren.
- [ ] De solver telt persoonlijke Zuid-slagen, niet contractslagen en niet automatisch NS-slagen.
- [ ] De solver retourneert het maximale Zuid-resultaat en de startkaarten die dat resultaat halen.
- [ ] De solver kan de gekozen startkaart beoordelen zonder hardcoded boekantwoord.
- [ ] Meerdere startkaarten die hetzelfde maximum halen worden allemaal goed gerekend.
- [ ] Unit tests dekken sans-atout, troef, meerdere optimale kaarten en niet-optimale kaarten.
- [ ] Unit tests dekken posities waarin Zuid leider is en posities waarin Zuid verdediger is.

## Blocked by

- `issues/mini-eindpositie-oefeningen/001-mini-eindpositie-model-en-validator.md`

## User stories covered

- 7. Als beginner wil ik het aantal slagen voor Zuid voorspellen, zodat ik vooruit moet rekenen.
- 23. Als ontwikkelaar wil ik een pure mini-solver voor 1 tot 7 kaarten per speler, zodat optimale startkaarten en Zuid-slagen testbaar zijn.
- 24. Als ontwikkelaar wil ik troef vanaf v1 ondersteunen, zodat opgaven met `Schoppen is troef` niet later een ander model nodig hebben.
