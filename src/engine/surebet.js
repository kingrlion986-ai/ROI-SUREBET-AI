function isValidQuote(quote) {
  return (
    quote &&
    typeof quote.name === "string" &&
    quote.name.trim().length > 0 &&
    typeof quote.bookmaker === "string" &&
    quote.bookmaker.trim().length > 0 &&
    Number.isFinite(Number(quote.odds)) &&
    Number(quote.odds) > 1
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

function isFresh(market, maxAgeSeconds = 30) {
  if (!market.updatedAt) return true;

  const timestamp =
    new Date(market.updatedAt).getTime();

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const age =
    (Date.now() - timestamp) / 1000;

  return age >= 0 && age <= maxAgeSeconds;
}

function findBestQuotes(outcomes) {
  const best = new Map();

  for (const outcome of outcomes) {
    if (!isValidQuote(outcome)) continue;

    const name =
      outcome.name.trim().toLowerCase();

    const current = best.get(name);

    if (
      !current ||
      Number(outcome.odds) >
        Number(current.odds)
    ) {
      best.set(name, outcome);
    }
  }

  return Array.from(best.values());
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
      !Array.isArray(market.outcomes) ||
      market.outcomes.length < 2
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

    /*
     * Plusieurs bookmakers peuvent proposer
     * le même résultat.
     *
     * On conserve uniquement la meilleure cote
     * pour chaque résultat.
     */
    const bestQuotes =
      findBestQuotes(
        market.outcomes
      );

    if (bestQuotes.length < 2) {
      continue;
    }

    /*
     * Un véritable arbitrage doit utiliser
     * des bookmakers différents.
     */
    if (
      !hasDifferentBookmakers(
        bestQuotes
      )
    ) {
      continue;
    }

    const inverseSum =
      bestQuotes.reduce(
        (sum, outcome) =>
          sum +
          1 /
            Number(
              outcome.odds
            ),
        0
      );

    /*
     * Condition mathématique du surebet :
     *
     * 1/cote1 + 1/cote2 + ... < 1
     */
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
        market.updatedAt ||
        null,

      live:
        market.live === true,

      outcomes:
        bestQuotes
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
