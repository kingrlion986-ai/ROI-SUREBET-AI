function normalizeLiveOdds(apiResponse) {
  const normalized = [];

  if (!Array.isArray(apiResponse)) {
    return normalized;
  }

  for (const item of apiResponse) {
    if (!item) continue;

    const status = item.status || {};

    // Sécurité : jamais de marché arrêté, bloqué ou terminé.
    if (
      status.stopped === true ||
      status.blocked === true ||
      status.finished === true
    ) {
      continue;
    }

    const fixtureId =
      item.fixture?.id || null;

    /*
     * Structure 1 :
     * item.odds = [
     *   {
     *     name: "Bookmaker",
     *     bets: [...]
     *   }
     * ]
     */

    if (Array.isArray(item.odds)) {
      for (const source of item.odds) {
        if (!source) continue;

        const bookmakerName =
          source.name ||
          source.bookmaker?.name ||
          null;

        // Si aucune identité de bookmaker n'est disponible,
        // on ne fabrique pas de faux bookmaker.
        if (!bookmakerName) {
          continue;
        }

        const bets = Array.isArray(source.bets)
          ? source.bets
          : [];

        for (const bet of bets) {
          if (
            !bet ||
            !Array.isArray(bet.values)
          ) {
            continue;
          }

          const outcomes = [];

          for (const value of bet.values) {
            if (!value) continue;

            if (value.suspended === true) {
              continue;
            }

            const odd = Number(value.odd);

            if (
              !Number.isFinite(odd) ||
              odd <= 1
            ) {
              continue;
            }

            const name = String(
              value.value || ""
            ).trim();

            if (!name) continue;

            outcomes.push({
              name,
              bookmaker: bookmakerName,
              odds: odd,
              handicap:
                value.handicap ?? null
            });
          }

          if (outcomes.length < 2) {
            continue;
          }

          normalized.push({
            fixtureId,
            event:
              `Fixture ${fixtureId || "unknown"}`,
            market:
              String(
                bet.name || "Marché live"
              ),
            live: true,
            updatedAt:
              item.update || null,
            outcomes
          });
        }
      }
    }
  }

  return normalized;
}

module.exports = {
  normalizeLiveOdds
};
