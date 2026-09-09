function normalizeLiveOdds(apiResponse) {
  const normalized = [];

  if (!Array.isArray(apiResponse)) {
    return normalized;
  }

  for (const item of apiResponse) {
    if (!item) continue;

    const status = item.status || {};

    // Ne pas utiliser un marché arrêté, bloqué ou terminé.
    if (
      status.stopped === true ||
      status.blocked === true ||
      status.finished === true
    ) {
      continue;
    }

    const homeGoals = item.teams?.home?.goals;
    const awayGoals = item.teams?.away?.goals;

    const homeTeam = item.teams?.home?.name || "Domicile";
    const awayTeam = item.teams?.away?.name || "Extérieur";

    const bookmakers = Array.isArray(item.odds)
      ? item.odds
      : [];

    for (const bookmaker of bookmakers) {
      const bookmakerName =
        bookmaker.name || `Bookmaker ${bookmaker.id || ""}`.trim();

      const bets = Array.isArray(bookmaker.bets)
        ? bookmaker.bets
        : [];

      for (const bet of bets) {
        if (!bet || !Array.isArray(bet.values)) {
          continue;
        }

        const marketName = bet.name || "";

        // Première version :
        // on garde uniquement les marchés clairement
        // exploitables et à deux issues.
        const values = bet.values
          .map((value) => {
            const odd = Number(value?.odd);

            if (!Number.isFinite(odd) || odd <= 1) {
              return null;
            }

            if (value?.suspended === true) {
              return null;
            }

            return {
              name: String(value?.value || ""),
              bookmaker: bookmakerName,
              odds: odd,
              handicap: value?.handicap ?? null
            };
          })
          .filter(Boolean);

        if (values.length < 2) {
          continue;
        }

        normalized.push({
          event: `${homeTeam} vs ${awayTeam}`,
          market: marketName,
          live: true,
          score: {
            home: homeGoals ?? null,
            away: awayGoals ?? null
          },
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
