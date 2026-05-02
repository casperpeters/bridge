# Bridgetafel

A small static bridge app for learning and practice. The current app lets a player sit South, bid with a basic NBB Vijfkaart Hoog AI partner/opponents, play the hand, review the auction and tricks, and inspect extra explanations in developer mode.

## Project Goal

The main goal is to create a functioning bridge app that can be used for learning purposes. The app should make it clear whose turn it is, which cards can be played, who won each trick, what the final contract was, and how the hand ended.

## Run Locally

No build step, server, or package install is required.

Open [index.html](./index.html) directly in a browser.

If a browser blocks local assets, run any simple static file server from this folder, for example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Run Tests

Install the dev dependencies once before running the full test suite:

```powershell
npm install
npx playwright install chromium
```

The unit test harness uses Node's built-in `assert` module. The browser smoke tests use Playwright against a local static server.

```powershell
npm test
```

You can also run the suites separately:

```powershell
npm run test:unit
npm run test:browser
```

## Code Structure

The app stays build-free: `index.html` loads plain browser scripts in dependency order.

- `bridge-rules.js`: browser-facing aggregator that exposes the rule modules in dependency order.
- `practice-hands/`: curated fixed beginner deals and scenario metadata for lessons, debugging, and regression tests.
- `rules/`: testable bridge rules, scoring, bidding heuristics, card-play heuristics, and play-plan data.
- `rules/bidding/common/`: shared bidding context, valuation, legality, and result helpers for system profiles.
- `rules/bidding/index.js`: bidding-system dispatcher that selects the active convention profile.
- `rules/bidding/systems/five-card-high/`: current NBB/Barry's Vijfkaart Hoog profile, split into opening, responses, rebids, competitive bidding, conventions, explanations, and the profile entrypoint.
- `scripts/app.js`: app bootstrap, shared state, DOM references, shared formatting/status helpers, and top-level orchestration.
- `scripts/text-nl.js`: Dutch UI copy and labels.
- `scripts/settings.js`: saved settings.
- `scripts/seed.js`: hand seed loading/copying and seed UI state.
- `scripts/bid-explanations.js`: bid explanation orchestration for guidance and developer mode.
- `scripts/play-plan.js`: visible play-plan rendering and play-plan explanation text.
- `scripts/render-hands.js`: card and hand rendering.
- `scripts/render-auction.js`: auction log and bidding controls.
- `scripts/render-review.js`: trick history, play explanations, and final hand review.
- `scripts/auction-flow.js`: auction flow and bidding decisions.
- `scripts/play-flow.js`: card-play flow, automatic play, legal play handling, and trick advancement.
- `rules/bidding/systems/five-card-high/explanations-nl.js`: Dutch explanation text for the current Vijfkaart Hoog system profile.

## Current Features

- Static HTML/CSS/JavaScript app.
- Random bridge deals.
- Dealer rotation and vulnerability cycle.
- Basic NBB Vijfkaart Hoog auction behavior.
- Simple competitive bidding fallback, including natural overcalls, vulnerability-aware simple overcall thresholds, weak jump overcalls, 1NT overcalls, basic takeout doubles, responses and simple rebids after partner's takeout double, negative doubles, and selected advancer actions after partner's overcall.
- Bidding-box order for calls: `NT`, spades, hearts, diamonds, clubs.
- Pass, Stop, Alert, Doublet, and Redoublet controls.
- South bidding controls.
- Fixed play control: play Noord/Zuid when N/Z declare, otherwise defend as Zuid.
- Legal card-play enforcement, including following suit.
- Dummy visibility after the opening lead.
- First declarer play-plan panel after dummy appears, with basic winner/loser counts and priorities.
- Declarer-side AI card suggestions follow the visible play-plan priorities when a plan action is currently playable.
- Pause after each completed trick so the player can inspect the cards.
- Replay the same hand without advancing the board.
- Copy or load a hand seed to replay a specific card distribution.
- Curated beginner practice hands, including basic bidding and defense/lead situations, can be loaded by id through the repeat-code field or `startPracticeHand(id)`.
- Trick history and full hand review after completion.
- Always-available tester feedback report that can be copied or opened as an email to the maintainer, including seed, auction, tricks, score, settings, current phase, and optional tester notes.
- Browser smoke tests for desktop and mobile Chromium covering load, bidding, dummy visibility, the play-plan panel, hand completion, review, and feedback copy.
- Ordinary bridge score calculation with vulnerability and contract bonuses.
- Settings menu with saved AI-suggestion mode, play-history mode, and developer mode.
- Optional AI-suggestion mode with heuristic bid/card suggestions and short reasons.
- Named bid and card-play rule results for AI suggestions and developer explanations, including explicit play-plan references where applicable.
- Defensive card-play explanations for beginner rules such as second hand low, conservative honor covering from visible dummy threats, third hand high with visible played-card information, returning partner's opening lead suit, avoiding unsupported-honor underleads against suit contracts when a safer side suit is available, and conservative trump switches against visible dummy ruffing value.
- Strongest available card-play heuristics, including notrump declarer-play rules for developing long touching-honor suits and trying entry-aware simple and double finesses.
- Developer mode with extra bid and play explanations.
- Responsive layout for desktop and smaller screens.

## Known Limitations

- Bidding AI is heuristic and incomplete.
- AI suggestions are simple heuristics, not authoritative teaching advice.
- Vijfkaart Hoog agreements are implemented in a testable rules module, with deeper competitive and slam continuations still heuristic.
- Cue-bid and penalty-pass continuations after partner's takeout double are not implemented yet.
- Card-play AI is simple and only has first shallow notrump declarer-play planning heuristics.
- No dedicated lesson-mode UI yet for selecting curated practice hands.

## Beginners Acceptance Checklist

Use this checklist with someone who does not already know the app. Let the player complete one full board, preferably without extra explanation, and note where the app leaves questions open. For a repeatable follow-up round, replay the beginner-test-2 flow by checking a normal deal from auction through review: bidding legality, opening lead status, dummy reveal, trick winners, score explanation, `Nieuwe hand`, `Zelfde hand`, and feedback copy.

- The player can see clearly whose turn it is.
- The player understands which bids or calls are currently available.
- Illegal bids or cards cannot be chosen by accident.
- After the opening lead, the player understands why dummy appears.
- During play, it is clear which hand or player is to act.
- After each trick, it is clear who won the trick.
- At the end, the player can identify the final contract.
- At the end, the player can see how many tricks were made.
- The score explanation makes it understandable why NS or EW receives points.
- The player knows what to do next: deal a new hand, replay the same hand, or inspect the hand review.

## Tester Checklist

- Open the app on desktop.
- Open the app on a phone or tablet.
- Change AI-suggestion mode, play-history mode, and developer mode, then reload to confirm settings are remembered.
- Turn AI suggestions on and confirm bid/card suggestions appear when you are to act.
- Deal a new hand.
- Complete an auction.
- Play all 13 tricks.
- Confirm each completed trick pauses until the table is clicked or Enter is pressed.
- Confirm clicking settings does not advance a paused trick.
- Inspect the hand review after the hand ends.
- Open feedback during bidding or play and confirm the copied report includes the current phase, seed, auction, tricks, score, and tester message.
- Toggle developer mode and confirm extra explanations appear.

## Deployment

The app can be deployed as a static site. See [DEPLOY.md](./DEPLOY.md) for GitHub Pages and generic static hosting instructions.

## Roadmap

See [TODO.md](./TODO.md) for the working roadmap.
