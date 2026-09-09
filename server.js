const express = require("express");
const path = require("path");

const { findSurebets } = require("./src/engine/surebet");
const { calculateStakes } = require("./src/engine/stakeCalculator");
const { demoMarkets } = require("./src/data/demoOdds");
const {
getCountries,
getFixtures,
getLiveFixtures,
getLiveOdds
} = require("./src/providers/apiFootball");
const {
normalizeLiveOdds
} = require("./src/providers/apiFootballLiveNormalizer");

const app = express();

const PORT = process.env.PORT || 3000;

const MIN_PROFIT_PERCENT =
Number(process.env.MIN_PROFIT_PERCENT || 0.5);

app.use(express.json());

app.use(
express.static(
path.join(__dirname, "public")
)
);

app.get("/api/health", (_req, res) => {
res.json({
ok: true,
mode: "simulation"
});
});

app.get("/api/demo", (req, res) => {
const bankroll =
Number(req.query.bankroll || 2000);

const results =
findSurebets(
demoMarkets,
MIN_PROFIT_PERCENT
).map((surebet) => ({
...surebet,
stakes: calculateStakes(
surebet.outcomes,
bankroll,
{
minStake: 1,
maxStake: bankroll,
rounding: 1
}
)
}));

res.json({
bankroll,
results
});
});

app.post("/api/surebets", (req, res) => {
const {
markets,
bankroll
} = req.body;

if (
!Array.isArray(markets) ||
!Number.isFinite(Number(bankroll)) ||
Number(bankroll) <= 0
) {
return res.status(400).json({
error:
"markets doit être un tableau et bankroll doit être supérieure à 0."
});
}

const results =
findSurebets(
markets,
MIN_PROFIT_PERCENT
).map((surebet) => ({
...surebet,
stakes: calculateStakes(
surebet.outcomes,
Number(bankroll),
{
minStake: 1,
maxStake: Number(bankroll),
rounding: 1
}
)
}));

res.json({
bankroll: Number(bankroll),
results
});
});

app.get(
"/api/football/test",
async (_req, res) => {
try {
const result =
await getCountries();

  res.json({
    ok: true,
    provider: "API-Football",
    apiConnected: true,
    remainingRequests:
      result.remaining,
    countries:
      result.data.response
        ? result.data.response.length
        : 0
  });
} catch (error) {
  console.error(
    "API-Football error:",
    error.message
  );

  res.status(500).json({
    ok: false,
    provider: "API-Football",
    apiConnected: false,
    error: error.message
  });
}

}
);

app.get(
"/api/football/fixtures",
async (_req, res) => {
try {
const result =
await getFixtures({
date: new Date()
.toISOString()
.slice(0, 10),
timezone: "Africa/Brazzaville"
});

  res.json({
    ok: true,
    provider: "API-Football",
    remainingRequests:
      result.remaining,
    fixtures:
      result.data.response || []
  });
} catch (error) {
  console.error(
    "API-Football fixtures error:",
    error.message
  );

  res.status(500).json({
    ok: false,
    provider: "API-Football",
    error: error.message
  });
}

}
);

app.get(
"/api/football/live",
async (_req, res) => {
try {
const result =
await getLiveFixtures();

  res.json({
    ok: true,
    provider: "API-Football",
    remainingRequests:
      result.remaining,
    liveFixtures:
      result.data.response || []
  });
} catch (error) {
  console.error(
    "API-Football live error:",
    error.message
  );

  res.status(500).json({
    ok: false,
    provider: "API-Football",
    error: error.message
  });
}

}
);

app.get(
"/api/football/live-odds/:fixture",
async (req, res) => {
try {
const fixture =
Number(req.params.fixture);

  if (!Number.isInteger(fixture)) {
    return res.status(400).json({
      ok: false,
      error: "fixture invalide."
    });
  }

  const result =
    await getLiveOdds({
      fixture
    });

  res.json({
    ok: true,
    provider: "API-Football",
    fixture,
    remainingRequests:
      result.remaining,
    odds:
      result.data.response || []
  });
} catch (error) {
  console.error(
    "API-Football live odds error:",
    error.message
  );

  res.status(500).json({
    ok: false,
    provider: "API-Football",
    error: error.message
  });
}

}
);

app.get(
"/api/football/live-markets/:fixture",
async (req, res) => {
try {
const fixture =
Number(req.params.fixture);

  if (!Number.isInteger(fixture)) {
    return res.status(400).json({
      ok: false,
      error: "fixture invalide."
    });
  }

  const result =
    await getLiveOdds({
      fixture
    });

  const markets =
    normalizeLiveOdds(
      result.data.response || []
    );

  res.json({
    ok: true,
    provider: "API-Football",
    fixture,
    remainingRequests:
      result.remaining,
    markets
  });
} catch (error) {
  console.error(
    "Live markets error:",
    error.message
  );

  res.status(500).json({
    ok: false,
    error: error.message
  });
}

}
);

app.get(
"/api/football/live-surebets/:fixture",
async (req, res) => {
try {
const fixture =
Number(req.params.fixture);

  const bankroll =
    Number(
      req.query.bankroll || 2000
    );

  if (!Number.isInteger(fixture)) {
    return res.status(400).json({
      ok: false,
      error: "fixture invalide."
    });
  }

  if (
    !Number.isFinite(bankroll) ||
    bankroll <= 0
  ) {
    return res.status(400).json({
      ok: false,
      error: "bankroll invalide."
    });
  }

  const result =
    await getLiveOdds({
      fixture
    });

  const markets =
    normalizeLiveOdds(
      result.data.response || []
    );

  const surebets =
    findSurebets(
      markets,
      MIN_PROFIT_PERCENT,
      {
        maxAgeSeconds: 90
      }
    );

  const results =
    surebets.map((surebet) => ({
      ...surebet,
      stakes:
        calculateStakes(
          surebet.outcomes,
          bankroll
        )
    }));

  res.json({
    ok: true,
    mode: "simulation",
    provider: "API-Football",
    fixture,
    bankroll,
    remainingRequests:
      result.remaining,
    marketsChecked:
      markets.length,
    surebetsFound:
      results.length,
    surebets: results
  });
} catch (error) {
  console.error(
    "Live surebet error:",
    error.message
  );

  res.status(500).json({
    ok: false,
    error: error.message
  });
}

}
);

app.get("*", (_req, res) => {
res.sendFile(
path.join(
__dirname,
"public",
"index.html"
)
);
});

app.listen(PORT, () => {
console.log(
"ROI Surebet AI - simulation mode - port ${PORT}"
);
});
