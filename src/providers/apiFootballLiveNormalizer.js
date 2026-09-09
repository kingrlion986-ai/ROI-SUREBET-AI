function normalizeLiveOdds(apiResponse) {
const normalized = [];

if (!Array.isArray(apiResponse)) {
return normalized;
}

for (const item of apiResponse) {
if (!item) continue;

const status = item.status || {};

// Sécurité :
// ne pas utiliser des cotes lorsque le marché
// est arrêté, bloqué ou terminé.
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
  item.teams?.home?.name ||
  item.teams?.home?.nom ||
  "Domicile";

const awayTeam =
  item.teams?.away?.name ||
  item.teams?.away?.nom ||
  "Extérieur";

const event =
  `${homeTeam} vs ${awayTeam}`;

const updatedAt =
  item.update ||
  item.updatedAt ||
  item["mise à jour"] ||
  null;

if (!Array.isArray(item.odds)) {
  continue;
}

/*
 * Selon la réponse API, le bookmaker peut être présent
 * au niveau du flux de cotes ou absent.
 *
 * On utilise uniquement une information réellement fournie.
 * Aucun bookmaker n'est inventé.
 */
const defaultBookmaker =
  String(
    item.bookmaker?.name ||
    item.bookmaker?.nom ||
    item.source?.name ||
    item.source?.nom ||
    item.name ||
    ""
  ).trim();

for (const bet of item.odds) {
  if (!bet) continue;

  if (!Array.isArray(bet.values)) {
    continue;
  }

  const bookmakerName =
    String(
      bet.bookmaker?.name ||
      bet.bookmaker?.nom ||
      bet.source?.name ||
      bet.source?.nom ||
      defaultBookmaker ||
      ""
    ).trim();

  const outcomes = [];

  for (const value of bet.values) {
    if (!value) continue;

    if (
      value.suspended === true ||
      value.suspendu === true
    ) {
      continue;
    }

    const odd =
      Number(
        value.odd ??
        value.odds ??
        value.cote
      );

    if (
      !Number.isFinite(odd) ||
      odd <= 1
    ) {
      continue;
    }

    const name =
      String(
        value.value ??
        value.valeur ??
        value.name ??
        value.nom ??
        ""
      ).trim();

    if (!name) continue;

    outcomes.push({
      name,
      bookmaker:
        bookmakerName || "",
      odds: odd,
      handicap:
        value.handicap ??
        null,
      main:
        value.main ??
        value.principal ??
        null
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
        bet.nom ||
        `Marché live ${bet.id || ""}`
      ).trim(),
    live: true,
    updatedAt,
    bookmakerAvailable:
      bookmakerName.length > 0,
    bookmaker:
      bookmakerName || null,
    outcomes
  });
}

}

return normalized;
}

module.exports = {
normalizeLiveOdds
};
