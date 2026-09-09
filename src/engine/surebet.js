function findSurebets(markets, minProfitPercent = 0) {
  const found = [];

  for (const market of markets) {
    if (
      !market ||
      !Array.isArray(market.outcomes) ||
      market.outcomes.length < 2
    ) {
      continue;
    }

    const valid = market.outcomes.every(
      (outcome) =>
        outcome &&
        Number.isFinite(Number(outcome.odds)) &&
        Number(outcome.odds) > 1 &&
        outcome.bookmaker &&
        outcome.name
    );

    if (!valid) {
      continue;
    }

    const inverseSum =
      market.outcomes.reduce(
        (sum, outcome) =>
          sum + 1 / Number(outcome.odds),
        0
      );

    const profitPercent =
      (1 / inverseSum - 1) * 100;

    if (
      inverseSum < 1 &&
      profitPercent >= Number(minProfitPercent)
    ) {
      found.push({
        event: market.event,
        market: market.market,
        inverseSum,
        profitPercent,
        outcomes: market.outcomes
      });
    }
  }

  return found.sort(
    (a, b) =>
      b.profitPercent - a.profitPercent
  );
}

module.exports = {
  findSurebets
};
