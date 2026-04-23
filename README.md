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

The test harness uses Node's built-in `assert` module and has no package dependencies.

```powershell
npm test
```

You can also run it directly:

```powershell
node tests/run-tests.js
```

## Current Features

- Static HTML/CSS/JavaScript app.
- Random bridge deals.
- Dealer rotation and vulnerability cycle.
- Basic NBB Vijfkaart Hoog auction behavior.
- Simple competitive bidding fallback.
- Bidding-box order for calls: `NT`, spades, hearts, diamonds, clubs.
- Pass, Stop, Alert, Doublet, and Redoublet controls.
- South bidding controls.
- Fixed play control: play Noord/Zuid when N/Z declare, otherwise defend as Zuid.
- Legal card-play enforcement, including following suit.
- Dummy visibility after the opening lead.
- Pause after each completed trick so the player can inspect the cards.
- Replay the same hand without advancing the board.
- Copy or load a hand seed to replay a specific card distribution.
- Trick history and full hand review after completion.
- Bridge score calculation for duplicate/casual modes.
- Settings menu with saved score mode, AI-suggestion mode, play-history mode, and developer mode.
- Optional AI-suggestion mode with heuristic bid/card suggestions and short reasons.
- Named card-play rule results for AI suggestions and developer explanations.
- Strongest available card-play heuristics, including notrump declarer-play rules for developing long touching-honor suits and trying entry-aware simple and double finesses.
- Developer mode with extra bid and play explanations.
- Responsive layout for desktop and smaller screens.

## Known Limitations

- Bidding AI is heuristic and incomplete.
- AI suggestions are simple heuristics, not authoritative teaching advice.
- Vijfkaart Hoog agreements are implemented in a testable rules module, with deeper competitive and slam continuations still heuristic.
- `Actiever bieden` uses normal bridge scoring while nudging some AI bidding thresholds; it is not true matchpoint comparison.
- Card-play AI is simple and only has first shallow notrump declarer-play planning heuristics.
- No curated lesson hands yet.
- No browser smoke tests yet.

## Tester Checklist

- Open the app on desktop.
- Open the app on a phone or tablet.
- Change score mode, AI-suggestion mode, play-history mode, and developer mode, then reload to confirm settings are remembered.
- Turn AI suggestions on and confirm bid/card suggestions appear when you are to act.
- Deal a new hand.
- Complete an auction.
- Play all 13 tricks.
- Confirm each completed trick pauses until the table is clicked or Enter is pressed.
- Confirm clicking settings does not advance a paused trick.
- Inspect the hand review after the hand ends.
- Toggle developer mode and confirm extra explanations appear.

## Deployment

The app can be deployed as a static site. See [DEPLOY.md](./DEPLOY.md) for Netlify Drop and GitHub Pages instructions.

## Roadmap

See [TODO.md](./TODO.md) for the working roadmap.
