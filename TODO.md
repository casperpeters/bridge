# TODO: Bridge App Roadmap

Single source of truth for the bridge app's product, auction, and card-play work.

## 1. Product And Tester Readiness

- Add a beginner-learning acceptance checklist: a new player should understand whose turn it is, what bids/cards are legal, why dummy appears, who won each trick, and how the score was calculated.
- Add a lightweight issue/feedback template for testers.

## 2. Rules And Scoring

- Add a beginner-friendly score explanation in the hand review: contract trick value, overtricks/undertricks, game/partscore/slam bonus, and vulnerability effect.
- Add doubles and redoubles before scoring-dependent bidding work expands.

## 3. Learning Experience

- Add a beginner mode that explains legal and illegal calls before the user chooses.
- After a human bid or card choice, explain why it was reasonable or what a better alternative would have been.
- Keep AI-suggestion wording honest until the bidding and play engines are stronger: suggestions are heuristic, not authoritative.
- Add glossary/help entries for core bridge terms used in the UI: dealer, vulnerability, contract, declarer, dummy, trick, trump, follow suit, game, slam, overtrick, undertrick.
- Add small focused lessons for opening bids, responding to partner, following suit, trumping, dummy play, and scoring.
- Add curated practice deals by topic, such as 1NT responses, major-suit fits, opening leads, drawing trumps, and basic defense.
- Add undo/replay support for learning mode, at least for the most recent card play.

## 4. Heuristic Model

- Always use the strongest implemented heuristic instead of exposing player-selectable strength levels.
- Add beginner-safe bidding explanations and curated practice without weakening the AI choice engine.
- Add explainable planning heuristics for declarer and defense, such as winner/loser counting, drawing trumps, preserving obvious entries, second-hand-low, third-hand-high, and returning partner's suit.
- Add simulation or double-dummy-assisted choices for close decisions when they are reliable enough to become the default.
- Keep UI descriptions honest until each heuristic is actually implemented.
- Extend named rule reasons from card play into bidding and future card-play rules so AI suggestions and developer explanations keep using the same source of truth.
- Add fixture tests for each new heuristic before strengthening the UI language.

## 5. Competitive Auction Model

- Add explicit call types: `Pass`, `Bid`, `Double`, and `Redouble`.
- Store auction context with dealer, vulnerability, seat, partnership, prior calls, and current contract.
- Track forcing status for each partnership: forcing, game-forcing, invitational, signoff, competitive-only.
- Track shown hand ranges after every call: HCP, total points, suit lengths, stoppers, support, controls, and hand pattern.
- Separate a bid's literal contract from its meaning. Example: `2D` after `1NT` is a transfer, not diamonds.
- Add bid explanations for all AI calls and user hover/help text.

## 6. Convention System

- Keep extending the NBB Vijfkaart Hoog rules module beyond the current basic system-card coverage.
- Add rule matching by auction sequence pattern, seat, vulnerability, and partnership state.
- Give each rule a meaning, legal followups, point range, shape constraints, and priority.
- Support artificial bids, alerts, forcing bids, and signoff bids.
- Add fallback rules for unknown auctions so the AI can choose a safe natural action.
- Add a bidding system selector later if multiple systems become useful, such as Standaard Hoog, Acol, or 2/1.
- Add convention toggles: Stayman, transfers, negative doubles, weak twos, Michaels, Unusual NT, Lebensohl.
- Warn when a user bid is outside the selected system.

## 7. Competitive Auction Tools

- Takeout doubles after opposing one-level openings.
- Penalty doubles in clearly defined auctions.
- Negative doubles by responder.
- Responsive doubles after partner overcalls and opponents raise.
- Support doubles and redoubles by opener.
- Balancing-seat actions after two passes.
- Cue bids showing limit raise or better after partner overcalls.
- Unusual `2NT` for the two lowest unbid suits.
- Michaels cue bids over one-level suit openings.
- Simple, jump, and preemptive overcalls.
- `1NT` overcalls with stopper requirements.
- Natural notrump advances after overcalls.

## 8. Competitive Vijfkaart Hoog Sequences

- Responses after partner opens and opponents overcall.
- Responses after partner opens and opponents double.
- Opener rebids after interference.
- Advancer actions after partner overcalls.
- Competitive raises: single raise, mixed raise, limit raise, preemptive raise.
- Law-of-total-tricks style raise decisions.
- Game tries after competitive raises.
- Compete-or-defend decisions at the 2, 3, 4, and 5 levels.
- Penalty-pass decisions after partner doubles.

## 9. Notrump Interference

- Decide which defense to use over opposing `1NT` such as natural, Cappelletti, or DONT.
- Add systems-on/systems-off rules after interference over our `1NT`.
- Lebensohl after `1NT` interference.
- Stolen-bid doubles if desired for beginner mode.
- Penalty doubles and competitive runouts after doubled notrump contracts.

## 10. Auction Hand Evaluation

- Refine total points: short-suit points should depend on fit and honor location.
- Add suit quality evaluation: honors, texture, length, rebiddability.
- Add stopper detection for notrump bidding.
- Add loser count for shapely competitive hands.
- Add controls for slam exploration.
- Add fit quality: trump length, side shortness, working honors, wasted values.
- Penalize unsupported honors in opponents' suits.

## 11. AI Improvement Roadmap

- Phase 1: Make heuristic advice dependable for beginner basics before adding stronger feedback.
- Add transparent confidence labels for AI suggestions: basic, uncertain, or advanced.
- Add fixture-based checks for common beginner deals before expanding guidance language.
- Improve opening and response heuristics in uncontested auctions first.
- Improve basic card-play heuristics next: opening leads, following suit, third hand high, second hand low, and returning partner's suit.
- Build on the first notrump long-suit-development and entry-aware simple/double-finesse heuristics with stronger declarer planning.
- Keep card-play behavior aligned with the strongest implemented heuristic set.
- Add post-choice feedback only where the engine can explain the tradeoff honestly.
- Treat advanced competitive bidding and simulation as later phases, not prerequisites for basic learning value.

## 12. Auction Search And Simulation

- Generate possible hidden hands consistent with the auction.
- Estimate contract outcomes by double-dummy or lightweight playout simulation.
- Use simulation for close competitive choices: pass, bid one more, double, sacrifice.
- Cache hand constraints and sampled deals during an auction.
- Keep fast heuristics as the default path until simulation is dependable enough to run by default.

## 13. Card-Play Opening Leads

- Make leads contract-aware: notrump and suit contracts need different priorities.
- Add common lead agreements: top of touching honors, fourth-best from length, low from three small, and singleton leads against suit contracts.
- Use auction information to prefer partner's suit, avoid declarer's strong suit, and attack weakly stopped suits.
- Add passive leads when the auction suggests declarer has side-suit strength.

## 14. Declarer Planning

- Count sure winners in notrump contracts before choosing a line.
- Count losers in suit contracts and decide whether to draw trumps early.
- Expand long-suit establishment beyond the initial notrump touching-honor baseline: entry checks, blocked suits, timing, and cashing established winners.
- Preserve entries to dummy and declarer hand.
- Avoid blocking suits when cashing winners.
- Expand finesse detection beyond the current entry-aware notrump simple/double-finesse baseline: repeated finesses, two-way guesses, richer entry ranking, and timing.
- Add hold-up play in notrump when defenders threaten a long suit.

## 15. Defensive Play

- Add second-hand-low and third-hand-high rules with exceptions.
- Cover honors when it can promote defensive tricks.
- Return partner's opening-lead suit when sensible.
- Avoid helping declarer by leading away from unsupported honors.
- Lead trumps when dummy has ruffing value or declarer appears crossruffing.
- Cash setting tricks when the defense can beat the contract.

## 16. Carding And Signals

- Track defensive carding agreements: attitude, count, and suit preference.
- Let defenders signal from touching low cards when they cannot affect the trick.
- Read partner's signals and update suit preferences.
- Keep beginner mode simple by hiding signal complexity unless hints are enabled.

## 17. Card-Play Memory And Inference

- Track every card played and derive remaining cards by suit.
- Track known voids from failure to follow suit.
- Estimate hidden suit lengths from the auction and play.
- Track likely high-card locations.
- Use dummy visibility once dummy appears.
- Maintain per-seat constraints that can feed both heuristics and simulation.

## 18. Contract-Aware Card Play

- Make declarer optimize for making the contract first, overtricks second.
- Make defenders optimize for beating the contract first, extra undertricks second.
- Use score and vulnerability once scoring is implemented.
- Recognize when a sacrifice contract changes the goal from making to minimizing loss.

## 19. Card-Play Search And Simulation

- Add double-dummy solver integration or a lightweight local search layer.
- Generate possible hidden deals consistent with bidding and play.
- Evaluate candidate cards by expected tricks.
- Use fast heuristics until simulation is strong and fast enough to become the always-on choice layer.
- Cache sampled worlds during a hand so decisions stay consistent.

## 20. Testing

- Expand bridge scoring tests for slam bonuses and redoubled contracts.
- Add unit tests for bid legality and doubles/redoubles once those calls exist.
- Add fixture hands for common Vijfkaart Hoog competitive auctions.
- Add regression tests for artificial bids becoming the wrong final contract.
- Add tests for vulnerability-sensitive preempts and sacrifices.
- Add tests for NT interference and transfer/Stayman continuations.
- Add random deal smoke tests that run full auctions without illegal calls.
- Compare selected auctions against reference NBB Vijfkaart Hoog convention examples.
- Add fixtures for opening leads in notrump and suit contracts.
- Add fixtures for following suit, trumping, overtrumping, and discarding.
- Expand declarer-play fixtures beyond the current first notrump long-suit-development and entry-aware finesse checks: drawing trumps, cashing winners, repeated finesses, entry preservation, and edge cases for blocked suits.
- Add defensive fixtures for second hand low, third hand high, covering honors, and returning partner's suit.
- Add random full-hand smoke tests that complete play without illegal cards.
- Add regression tests for dummy visibility and user-control rules.
- Add browser smoke tests for desktop and mobile layouts.

## 21. Accessibility And UI Polish

- Check keyboard-only play for bidding and card play.
- Add visible focus states for every interactive control.
- Ensure screen reader labels include rank and suit for visible cards and describe hidden cards as hidden.
- Ensure status updates are announced clearly without being too noisy.
- Verify the layout on small phones, tablets, desktop, and short laptop viewports.
- Add reduced-motion support for users who prefer less animation.
- Make the hint button usable on touch devices, not only hover/focus.

## 22. Suggested Implementation Order

1. Finish remaining product readiness gaps: beginner-learning acceptance checklist and lightweight tester feedback template.
2. Improve opening leads using the named card-play rule results and developer-mode explanations to validate choices.
3. Improve declarer and defender play: expand long-suit development and finesses, draw trumps, third hand high, second hand low, return partner's suit.
4. Improve basic uncontested auction AI and add fixture checks for common beginner auctions.
5. Add beginner learning features where the engine is reliable: legal-choice explanations, glossary/help, score explanation, and limited post-choice feedback.
6. Add undo/replay support for learning mode.
7. Add doubles and redoubles now that vulnerability/scoring support exists.
8. Refactor calls into typed auction objects so `Pass`, bids, doubles, and redoubles are explicit.
9. Extend the current Vijfkaart Hoog bidding rules with reusable bid meanings.
10. Add core competitive tools: takeout doubles, negative doubles, simple overcalls, and `1NT` overcalls.
11. Add competitive raises, cue bids, balancing actions, and notrump interference agreements.
12. Add optional convention settings once the core behavior is stable.
13. Add simulation or double-dummy search for close auction and card-play decisions.
