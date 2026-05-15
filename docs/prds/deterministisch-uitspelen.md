# PRD: Deterministisch Uitspelen

## Problem Statement

Bridgetafel kan een hand volledig laten uitspelen via de bestaande speelengine, maar de speler moet ook late, volledig vastliggende eindspelen nog kaart voor kaart doorklikken. Dat kost tijd en voelt onnodig wanneer het verdere spelverloop volgens de zichtbare en gespeelde kaarten geen echte keuze meer bevat.

Een simpele claimfunctie is te sterk geformuleerd voor de huidige engine en kan bovendien verborgen informatie lekken. De speler heeft behoefte aan een rustige tafelactie die alleen verschijnt wanneer de app kan bewijzen dat de resterende slagwinnaars vastliggen op basis van zichtbare informatie, legaliteit en gespeelde kaarten.

## Solution

Voeg een aparte UX-flow toe met de knop `Uitspelen`. De knop verschijnt alleen tijdens het spelen wanneer de resterende winnaar per slag intern bewezen vastligt volgens zichtbare informatie, gespeelde kaarten, renonces, handgroottes en kaartlegaliteit. De feature gebruikt geen bridge-claimtaal zoals `Claimen` of `Geven`, omdat ook gemengde uitkomsten mogelijk zijn waarbij Noord/Zuid en Oost/West allebei nog slagen krijgen.

Wanneer de speler op `Uitspelen` klikt, opent een echt bevestigingsdialog. Het dialog toont compact hoeveel slagen automatisch worden uitgespeeld en hoeveel daarvan naar Noord/Zuid en Oost/West gaan. Na bevestiging speelt de app de resterende slagen direct uit via dezelfde kernprimitives als de bestaande test-/auto-complete-flow, zonder kaartanimatie, en toont daarna de bestaande scoreoverzicht-flow. Annuleren of Escape sluit alleen het dialog en laat het spel verdergaan.

## User Stories

1. As a beginner, I want an `Uitspelen` button when the rest of the hand is fixed, so that I do not have to click through meaningless card choices.
2. As a beginner, I want the feature to avoid the word `Claimen`, so that I do not think the app is making a bridge-law claim it cannot explain.
3. As a beginner, I want the feature to avoid the word `Geven`, so that mixed remaining outcomes still make sense.
4. As a beginner, I want `Uitspelen` to appear only when the app is certain, so that I can trust the button.
5. As a beginner, I want the button to stay available once the ending is proven, so that I can click it even if the AI has already continued part of the forced ending.
6. As a beginner, I want the AI to keep playing while the button is visible, so that the normal table rhythm is not interrupted unnecessarily.
7. As a beginner, I want the AI to pause while the confirmation dialog is open, so that the confirmation is not racing against a changing table.
8. As a beginner, I want a confirmation dialog before the hand is finished, so that an accidental click does not skip the ending.
9. As a beginner, I want to cancel the dialog with Escape or an annuleren action, so that I can continue playing manually.
10. As a beginner, I want the same `Uitspelen` button to remain after canceling, so that "not now" does not hide a still-valid option.
11. As a beginner, I want the dialog to show the total number of remaining slagen, so that I know how much will be skipped.
12. As a beginner, I want the dialog to show how many remaining slagen go to Noord/Zuid and Oost/West, so that mixed endings are understandable.
13. As a beginner, I want the final score overview to appear after automatic play-out, so that the normal end-of-hand moment remains intact.
14. As a beginner, I want the review slagenoverzicht to show the automatically played cards as ordinary slagen, so that the hand history remains readable.
15. As a desktop player, I want the `Uitspelen` button at the bottom right of the green table area, so that it feels like a local table action.
16. As a mobile player, I want the `Uitspelen` button under the `Noord - Partner` label, so that it stays near the visible table context without covering cards.
17. As a South declarer, I want both South and dummy information to count as visible, so that the app can prove endings from the hands I control.
18. As a South defender, I do not want North's hidden cards to count as visible proof, so that the app does not leak partner's hand.
19. As a defender, I want dummy and played cards to count as visible information, so that legal visible facts can still prove an ending.
20. As a player, I want renonces from earlier tricks to count as visible facts, so that the proof can use information everyone has legally seen.
21. As a player, I want unknown higher cards to block `Uitspelen`, so that the app never assumes a hidden card is harmless.
22. As a player, I want unknown trumps to block side-suit certainty, so that a possible ruff is never ignored.
23. As a player, I want multiple equivalent legal card choices to be accepted, so that the button can appear when A/K order or similar choices do not affect the winners.
24. As a player, I do not want the button if some legal choice changes a later winner, so that the app does not merely follow its preferred engine line.
25. As a maintainer, I want the proof to track exact winning seats internally, so that next-leader differences cannot be hidden behind team-level equality.
26. As a maintainer, I want the UI to summarize by team, so that the confirmation remains compact for beginners.
27. As a maintainer, I want the verifier to be a pure rules module with one stable public analysis function, so that the hard logic is unit-testable outside the browser.
28. As a maintainer, I want the browser flow to pass visible seats into the verifier, so that the rules layer does not encode South-specific UX assumptions.
29. As a maintainer, I want a node budget for verifier search, so that pathological positions fail closed instead of slowing the app.
30. As a developer, I want budget failures hidden in normal UI but visible in developer mode, so that beginners are not distracted and debugging remains possible.
31. As a developer, I want deterministic play-out execution to reuse existing card-play and trick-scoring primitives, so that review and scoring stay consistent.
32. As a developer, I want execution to hard fail if the actual automatic line disagrees with the proof, so that engine/proof mismatches are caught immediately.
33. As a lesson author, I want active lesson-board steps to be able to suppress `Uitspelen`, so that a lesson cannot be skipped through when it expects a specific interaction.
34. As a practice-hand user, I want ordinary practice hands to allow `Uitspelen`, so that reproducible hands can still be completed quickly.
35. As a tester, I want unit coverage for proof results and failure reasons, so that edge cases remain stable.
36. As a tester, I want browser smoke coverage for the button, dialog, auto-finish, score overview and review table, so that the end-to-end UX remains intact.

## Implementation Decisions

- The user-facing action is named `Uitspelen`, not `Claimen` or `Geven`.
- The feature can apply to mixed endings where both partnerships still win at least one remaining slag.
- The button is considered only at the start of a trick, when no card is currently in the trick.
- Once a deterministic ending is proven, the button can remain visible while the AI continues to play the proven prefix.
- A stored proof remains valid only while the current game state is still a prefix of the proven ending. If that prefix check fails, the proof is discarded and the app fails closed.
- The AI continues normal play while the button is visible.
- Opening the confirmation dialog pauses automatic play. Closing or canceling the dialog allows play to continue.
- The confirmation UI is a real dialog, not an inline popover.
- The dialog copy is compact and includes total remaining tricks plus the Noord/Zuid and Oost/West split.
- Confirming direct-finishes the hand and still shows the existing score overview.
- Automatically played remaining tricks are recorded as ordinary trick history. No separate claim metadata is added to the hand or trick records.
- The desktop button is positioned at the bottom right of the green table area.
- The mobile button is positioned under the `Noord - Partner` label.
- The proof uses visible seats supplied by the browser flow. South is always visible; dummy is visible after play begins; North is visible when the player controls the North/South declarer side; North remains hidden when South is defending; East/West are hidden unless one of them is dummy.
- The rules verifier must never use hidden cards as proof, even though the browser state contains them.
- Public hand sizes are allowed as proof facts. The verifier may know how many cards a hidden seat still has, but not which ranks or suits those cards are unless forced by visible facts.
- Played cards, visible hands, legal follow-suit obligations and observed renonces are valid proof facts.
- A hidden higher card blocks certainty unless it is literally impossible because it is played, visible, excluded by a proven renonce, or impossible under remaining hand size constraints.
- In suit contracts, side-suit winners are not certain while an unknown trump can still be held by a hidden hand that may legally ruff.
- Multiple legal cards are accepted only if every legal branch converges to the same exact winning seat sequence for the remaining tricks.
- Exact winning seat is the internal proof invariant, because the next leader matters. The UI may summarize the result by partnership.
- Hidden hands can be modeled conservatively. If a hidden leader may have several possible legal leads, `Uitspelen` is available only if every possible lead still converges to the same winning seat sequence.
- The verifier should use a node budget. Budget exhaustion returns "not available" and a developer-facing reason.
- The verifier should be implemented as a deep, pure rules module with a narrow public interface.
- The public rules facade should expose the verifier's analysis function for both unit tests and browser flow.
- A successful analysis result includes availability, remaining trick count, winning seat sequence, team split, and enough proof state to validate prefix continuity.
- A failed analysis result includes availability false and a reason suitable for unit tests and developer mode.
- Representative card play is not part of the visible proof. Execution can use the existing card-play engine to choose actual cards after the proof succeeds.
- The automatic play-out action is separate from the existing test slagenoverzicht action, but it reuses the same primitives for choosing cards, applying card-play transitions, scoring tricks and finishing the hand.
- During deterministic execution, each completed trick winner must match the next expected winner from the proof. A mismatch is a hard failure.
- Active lesson-board steps can suppress the button when they require specific interaction. Ordinary practice hands may show it.

## Testing Decisions

- Unit tests should focus on externally observable proof behavior: available/not available, reason, winning seat sequence and team split.
- Unit tests should cover visible topwinner endings in notrump.
- Unit tests should cover suit-contract endings where unknown trumps block side-suit certainty.
- Unit tests should cover endings where all higher cards are played or visible and `Uitspelen` becomes available.
- Unit tests should cover hidden higher cards blocking the proof.
- Unit tests should cover observed renonces making a later ruff or follow-suit threat impossible.
- Unit tests should cover multiple equivalent legal cards in the same hand converging to the same winner sequence.
- Unit tests should cover a legal branch that changes the next winning seat and therefore blocks availability.
- Unit tests should cover hidden leader branches that converge and hidden leader branches that do not.
- Unit tests should cover exact seat sensitivity, where the same partnership can win but a different seat would change the next leader.
- Unit tests should cover node-budget exhaustion as a fail-closed result.
- Unit tests should cover the public rules facade export and script loading order.
- Browser tests should verify the desktop button appears in a deterministic ending and opens the confirmation dialog.
- Browser tests should verify the dialog can be canceled without changing the hand state.
- Browser tests should verify confirming `Uitspelen` finishes the hand, shows the score overview, and leaves the review trick table with thirteen ordinary tricks.
- Browser tests should verify the dialog summary includes total remaining tricks and the Noord/Zuid versus Oost/West split.
- Browser tests should verify the button is not shown during an active lesson-board step that blocks the relevant interaction.
- Browser tests should verify the mobile placement does not cover the North label or cards.
- The play-out action should be tested through public behavior, not by asserting private loop internals.
- Required acceptance commands for the implementation are `npm run test:unit` and targeted browser coverage for the new UX. Run broader browser regression only if the table layout or shared flow changes create extra risk.

## Out of Scope

- Implementing a legal bridge claim procedure.
- Adding `Claimen` or `Geven` as separate user actions.
- Showing a separate claim summary block in review.
- Adding claim metadata to trick history, final score or repeat-code payloads.
- Using hidden-hand inference beyond visible legal facts, renonces and hand-size constraints.
- Full double-dummy analysis or probabilistic simulation.
- Showing long proof explanations in the normal gameplay UI.
- Animating the automatically played remaining cards.
- Raising the strength of the card-play AI as part of this feature.
- Supporting lesson feedback about whether the player should have clicked `Uitspelen`.

## Further Notes

This feature is deliberately conservative. It is better for `Uitspelen` to appear rarely than to appear once when the rest of the hand was not truly fixed from visible information.

The existing test slagenoverzicht flow is useful prior art because it already completes hands through the normal review and score path. The new feature should reuse those execution primitives, but the proof that an ending is deterministic must be a separate rules concern.

Developer mode may expose why `Uitspelen` is unavailable, especially for search-budget failures or hidden-card threats. Normal gameplay should remain quiet: no button means the app has not proven the ending.
