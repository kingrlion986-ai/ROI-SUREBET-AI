function isValidOutcome(outcome) {
  return (
    outcome &&
    typeof outcome.name === "string" &&
    outcome.name.trim().length > 0 &&
    typeof outcome.bookmaker === "string" &&
    outcome.bookmaker.trim().length > 0 &&
    Number.isFinite(Number(outcome.odds)) &&
    Number(outcome.odds) > 1
  );
}


function isSameMarket(market) {
  return (
    market &&
    typeof market.event === "string" &&
    market.event.trim().length > 0 &&
    typeof market.market === "string" &&
    market.market.trim().length > 0
  );
}


function hasDifferentBookmakers(outcomes) {
  const bookmakers =
    outcomes.map(
      (outcome) =>
        outcome.bookmaker
          .trim()
          .toLowerCase()
    );

  return (
    new Set(bookmakers).size ===
    bookmakers.length
  );
}


function isFresh(market, maxAgeSeconds = 30) {
  if (!market.updatedAt) {
    return true;
  }

  const timestamp =
    new Date(
      market.updatedAt
    ).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const age =
    (Date.now() - timestamp) /
    1000;

  return (
    age >= 0 &&
    age <= maxAgeSeconds
  );
}


function findSurebets(
  markets,
  minProfitPercent = 0.5,
  options = {}
) {
  const found = [];

  const maxAgeSeconds =
    Number(
      options.maxAgeSeconds || 30
    );

  if (!Array.isArray(markets)) {
    return found;
  }

  for (const market of markets) {

    if (!isSameMarket(market)) {
      continue;
    }

    if (
      !Array.isArray(
        market.outcomes
      ) ||
      market.outcomes.length < 2
    ) {
      continue;
    }

    const valid =
      market.outcomes.every(
        isValidOutcome
      );

    if (!valid) {
      continue;
    }

    if (
      !hasDifferentBookmakers(
        market.outcomes
      )
    ) {
      continue;
    }

    if (
      !isFresh(
        market,
        maxAgeSeconds
      )
    ) {
      continue;
    }

    const inverseSum =
      market.outcomes.reduce(
        (sum, outcome) =>
          sum +
          1 /
            Number(
              outcome.odds
            ),
        0
      );

    if (inverseSum >= 1) {
      continue;
    }

    const profitPercent =
      (1 / inverseSum - 1) *
      100;

    if (
      profitPercent <
      Number(minProfitPercent)
    ) {
      continue;
    }

    found.push({
      event: market.event,
      market: market.market,
      inverseSum,
      profitPercent,
      updatedAt:
        market.updatedAt || null,
      outcomes:
        market.outcomes
    });
  }

  return found.sort(
    (a, b) =>
      b.profitPercent -
      a.profitPercent
  );
}


module.exports = {
  findSurebets
};
