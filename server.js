const express = require("express");
const path = require("path");

const { findSurebets } = require("./src/engine/surebet");
const { calculateStakes } = require("./src/engine/stakeCalculator");
const { demoMarkets } = require("./src/data/demoOdds");

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

      stakes:
  calculateStakes(
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
    !Number.isFinite(
      Number(bankroll)
    ) ||
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

      stakes:
  calculateStakes(
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
    `ROI Surebet AI - simulation mode - port ${PORT}`
  );
});
