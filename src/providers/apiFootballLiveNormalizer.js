function normalizeLiveOdds(apiResponse) {
  const normalized = [];

  if (!Array.isArray(apiResponse)) {
    return normalized;
  }

  for (const item of apiResponse) {
    if (!item) continue;

    const status = item.status || {};

    // Sécurité : on ignore les marchés lorsque les paris
    // sont suspendus, bloqués ou terminés.
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

    // Structure réelle de l'API-Football :
    // item.odds = liste des marchés
    if (!Array.isArray(item.odds)) {
      continue;
    }

    for (const bet of item.odds) {
      if (!bet) continue;

      if (!Array.isArray(bet.values)) {
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

        const name =
          String(value.value || "").trim();

        if (!name) continue;

        outcomes.push({
          name,
          odds: odd,
          handicap:
            value.handicap ?? null,
          main:
            value.main ?? null
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
        bookmakerAvailable: false,
        outcomes
      });
    }
  }

  return normalized;
}

module.exports = {
  normalizeLiveOdds
};
