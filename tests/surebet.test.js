const test = require("node:test");
const assert = require("node:assert/strict");

const {
  findSurebets
} = require("../src/engine/surebet");

const {
  calculateStakes
} = require("../src/engine/stakeCalculator");


test("détecte une surebet", () => {

  const markets = [
    {
      event: "Match de test",
      market: "Over/Under 2.5",

      outcomes: [
        {
          name: "Over 2.5",
          bookmaker: "Bookmaker A",
          odds: 2.70
        },

        {
          name: "Under 2.5",
          bookmaker: "Bookmaker B",
          odds: 2.50
        }
      ]
    }
  ];

  const results =
    findSurebets(markets);

  assert.equal(
    results.length,
    1
  );

  assert.ok(
    results[0].profitPercent > 0
  );
});


test("ne détecte pas une fausse surebet", () => {

  const markets = [
    {
      event: "Match sans arbitrage",
      market: "Over/Under 2.5",

      outcomes: [
        {
          name: "Over 2.5",
          bookmaker: "Bookmaker A",
          odds: 1.70
        },

        {
          name: "Under 2.5",
          bookmaker: "Bookmaker B",
          odds: 2.10
        }
      ]
    }
  ];

  const results =
    findSurebets(markets);

  assert.equal(
    results.length,
    0
  );
});


test("calcule les mises", () => {

  const outcomes = [

    {
      name: "Over 2.5",
      bookmaker: "Bookmaker A",
      odds: 2.70
    },

    {
      name: "Under 2.5",
      bookmaker: "Bookmaker B",
      odds: 2.50
    }

  ];

  const result =
    calculateStakes(
      outcomes,
      2000
    );

  assert.ok(
    result.guaranteedReturn > 2000
  );

  assert.ok(
    result.profit > 0
  );

  assert.equal(
    result.stakes.length,
    2
  );
});
