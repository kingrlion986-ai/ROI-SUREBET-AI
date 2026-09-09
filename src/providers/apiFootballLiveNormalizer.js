function normalizeLiveOdds(apiResponse) {
  const normalized = [];

  if (!Array.isArray(apiResponse)) {
    return normalized;
  }

  for (const item of apiResponse) {
    if (!item) continue;

    const status = item.status || {};

    // Un marché arrêté, bloqué ou terminé
    // ne doit jamais être utilisé pour un pari.
    if (
      status.stopped === true ||
      status.blocked === true ||
      status.finished === true
    ) {
      continue;
    }

    const bookmakers = Array.isArray(item.odds)
      ? item.odds
      : [];

    for (const bookmaker of bookmakers) {
      const bookmakerName =
        bookmaker.name ||
        `Bookmaker ${bookmaker.id || "unknown"}`;

      const bets = Array.isArray(bookmaker.bets)
        ? bookmaker.bets
        : [];

      for (const bet of bets) {
        if (!bet || !Array.isArray(bet.values)) {
          continue;
        }

        const values = [];

        for (const value of bet.values) {
          if (!value) continue;

          if (value.suspended === true) {
            continue;
          }

          const odd = Number(value.odd);

          if (!Number.isFinite(odd) || odd <= 1) {
            continue;
          }

          const name = String(
            value.value || ""
          ).trim();

          if (!name) continue;

          values.push({
            name,
            bookmaker: bookmakerName,
            odds: odd,
            handicap: value.handicap ?? null
          });
        }

        if (values.length < 2) {
          continue;
        }

        normalized.push({
          event: `Fixture ${item.fixture?.id || "unknown"}`,
          market: String(
            bet.name || "Marché live"
          ),
          live: true,
          updatedAt: item.update || null,
          outcomes: values
        });
      }
    }
  }

  return normalized;
}

module.exports = {
  normalizeLiveOdds
};
