const { run } = require("./unit/harness.js");

require("./unit/core.test.js");
require("./unit/api.test.js");
require("./unit/scoring.test.js");
require("./unit/score-table.test.js");
require("./unit/auction.test.js");
require("./unit/script-order.test.js");
require("./unit/bidding-dispatcher.test.js");
require("./unit/vijfkaart-hoog-openings.test.js");
require("./unit/vijfkaart-hoog-responses.test.js");
require("./unit/vijfkaart-hoog-rebids.test.js");
require("./unit/vijfkaart-hoog-competitive.test.js");
require("./unit/practice-hands.test.js");
require("./unit/dutch-play-copy.test.js");
require("./unit/play-mechanics.test.js");
require("./unit/play-plan.test.js");
require("./unit/card-play-plan-priority.test.js");
require("./unit/card-play-defense.test.js");
require("./unit/card-play-leads-and-finesses.test.js");

run();
