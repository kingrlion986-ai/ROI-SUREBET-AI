function normalizeLiveOdds(apiResponse) {
  const normalized = [];

  if (!Array.isArray(apiResponse)) {
    return normalized;
  }

  for (const item of apiResponse) {
    if (!item) continue;

    const status = item.status || {};

    // Sécurité :
    // on ne travaille jamais avec un marché arrêté,
    // bloqué ou terminé.
    if (
      status.stopped === true ||
      status.blocked === true ||
      status.finished === true
    ) {
      continue;
    }

    const fixtureId =
      item.fixture?.id ?? null;

    const homeTeam =
      item.teams?.home?.name || "Domicile";

    const awayTeam =
      item.teams?.away?.name || "Extérieur";

    const event =
      `${homeTeam} vs ${awayTeam}`;

    const updatedAt =
      item.update || null;

    /*
     * API-Football peut présenter les données
     * live sous différentes structures.
     *
     * Nous essayons d'abord la structure :
     *
     * item.odds = [
     *   {
     *     name: "...",
     *     bets: [...]
     *   }
     * ]
     */

    if (Array.isArray(item.odds)) {
      for (const source of item.odds) {
        if (!source) continue;

        /*
         * IMPORTANT :
         * on ne considère source.name comme bookmaker
         * que si cette structure contient réellement
         * des "bets".
         */

        if (
          !Array.isArray(source.bets)
        ) {
          continue;
        }

        const bookmakerName =
          String(
            source.name ||
            source.bookmaker?.name ||
            ""
          ).trim();

        if (!bookmakerName) {
          continue;
        }

        for (const bet of source.bets) {
          if (
            !bet ||
            !Array.isArray(bet.values)
          ) {
            continue;
          }

          const outcomes = [];

          for (const value of bet.values) {
            if (!value) continue;

            if (
              value.suspended === true
            ) {
              continue;
            }

            const odd =
              Number(value.odd);

            if (
              !Number.isFinite(odd) ||
              odd <= 1
            ) {
              continue;
            }

            const name =
              String(
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
            event,
            market:
              String(
                bet.name ||
                `Marché live ${bet.id || ""}`
              ).trim(),
            live: true,
            updatedAt,
            outcomes
          });
        }
      }
    }

    /*
     * Structure 2 :
     *
     * item.odds = [
     *   {
     *     id: 16,
     *     name: "...",
     *     values: [...]
     *   }
     * ]
     *
     * Dans cette structure, API-Football nous donne
     * le marché et les valeurs, mais PAS forcément
     * le bookmaker.
     *
     * On les expose donc comme marchés informatifs,
     * mais on NE les utilise PAS pour fabriquer
     * un faux surebet.
     */

    if (Array.isArray(item.odds)) {
      for (const bet of item.odds) {
        if (!bet) continue;

        if (
          !Array.isArray(bet.values)
        ) {
          continue;
        }

        const values = [];

        for (const value of bet.values) {
          if (!value) continue;

          if (
            value.suspended === true
          ) {
            continue;
          }

          const odd =
            Number(value.odd);

          if (
            !Number.isFinite(odd) ||
            odd <= 1
          ) {
            continue;
          }

          const name =
            String(
              value.value || ""
            ).trim();

          if (!name) continue;

          values.push({
            name,
            odds: odd,
            handicap:
              value.handicap ?? null
          });
        }

        if (values.length === 0) {
          continue;
        }

        normalized.push({
          fixtureId,
          event,
          market:
            String(
              bet.name ||
              `Marché live ${bet.id || ""}`
            ).trim(),
          live: true,
          updatedAt,
          bookmakerAvailable: false,
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
