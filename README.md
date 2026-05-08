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

To verify the live tester-feedback pipeline against the configured Google Apps Script endpoint:

```powershell
npm run test:feedback-live
```

This posts a canary row to the feedback spreadsheet, removes canary rows after a successful run, and fails if the Apps Script endpoint returns an error.
After deploying Apps Script changes that affect triage columns, also run:

```powershell
npm run test:feedback-triage-live
```

This posts a canary row, verifies that `Oorzaak`, `Fixvoorstel`, and `Fix geimplementeerd` are written correctly, and removes canary rows after a successful run.

## Code Structure

The app stays build-free: `index.html` loads plain browser scripts in dependency order.

See [docs/architecture.md](./docs/architecture.md) for the technical architecture, script order, module structure, explanation paths, and important code locations.

## Current Features

- Static HTML/CSS/JavaScript app.
- Random bridge deals.
- Dealer rotation and vulnerability cycle.
- Basic NBB Vijfkaart Hoog auction behavior.
- Simple competitive bidding fallback, including natural overcalls, vulnerability-aware simple overcall thresholds, weak jump overcalls, 1NT overcalls, basic takeout doubles, responses and simple rebids after partner's takeout double, and selected advancer actions after partner's overcall.
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
- Developer mode exposes a repeat-code field that copies a situation code by default, restoring the board, auction, played cards, and current turn where available.
- Curated beginner practice hands, including basic bidding and defense/lead situations, can be loaded by id through the developer repeat-code field or `startPracticeHand(id)`.
- Dedicated lesson page with chapter-based lesson content that launches curated practice hands and shows lesson guidance or review points where available.
- Trick history and full hand review after completion.
- Always-available tester feedback report that can be submitted to a configured feedback endpoint or copied manually, including the tester message and repeat code.
- Browser smoke tests for desktop and mobile Chromium covering load, bidding, dummy visibility, the play-plan panel, hand completion, review, and feedback copy/submit.
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
- Negative doubles are not currently implemented; the previous simplified version was removed until the NBB-style conditions and opener continuations can be modeled reliably.
- Cue-bid and penalty-pass continuations after partner's takeout double are not implemented yet.
- Card-play AI remains heuristic and lacks deep contract-aware planning, but includes basic declarer plan priorities, notrump development rules, and beginner defense heuristics.
- Lesson mode has a separate reading page, but richer choice feedback, undo/retry flows, and broader lesson coverage are not implemented yet.

## Beginners Acceptance Checklist

Use this checklist with someone who does not already know the app. Let the player complete one full board, preferably without extra explanation, and note where the app leaves questions open. For repeatable follow-up rounds, turn on developer mode and load fixed practice hands through the repeat-code field, for example `response-new-suit-after-1h-001` for bidding, `draw-trumps-001` for dummy/play-plan/review flow, and `game-bonus-vulnerable-001` for score explanation. In each round, check bidding legality, opening lead status, dummy reveal, trick winners, score explanation, `Nieuwe hand`, `Zelfde hand`, and feedback copy.

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
- Open feedback during bidding or play and confirm the feedback can be submitted, or copied as fallback, with the repeat code and tester message.
- Toggle developer mode and confirm extra explanations appear.

## Deployment

The app can be deployed as a static site. See [DEPLOY.md](./DEPLOY.md) for GitHub Pages and generic static hosting instructions.

For direct tester feedback, deploy the Google Apps Script in [integrations/google-apps-script/feedback.gs](./integrations/google-apps-script/feedback.gs) as a Web app and paste its `/exec` URL into [scripts/feedback-config.js](./scripts/feedback-config.js). The copy button remains available as a fallback when no endpoint is configured.

The feedback sheet includes triage columns for `Oorzaak`, `Fixvoorstel`, and `Fix geimplementeerd`. After updating the Apps Script, deploy a new version and open the `/exec` URL once to migrate existing sheets.

## Roadmap

See [TODO.md](./TODO.md) for the working roadmap.
