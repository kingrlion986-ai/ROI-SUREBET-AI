function calculateStakes(outcomes, bankroll) {
  const B = Number(bankroll);

  if (!Array.isArray(outcomes) || outcomes.length < 2) {
    throw new Error(
      "Au moins deux résultats sont nécessaires."
    );
  }

  if (!Number.isFinite(B) || B <= 0) {
    throw new Error(
      "La bankroll doit être supérieure à 0."
    );
  }

  const weights = outcomes.map(
    (outcome) =>
      1 / Number(outcome.odds)
  );

  const total = weights.reduce(
    (a, b) => a + b,
    0
  );

  const stakes = outcomes.map(
    (outcome, index) => ({
      bookmaker: outcome.bookmaker,
      outcome: outcome.name,
      odds: Number(outcome.odds),
      stake:
        B * (weights[index] / total)
    })
  );

  const returns = stakes.map(
    (item) =>
      item.stake * item.odds
  );

  const guaranteedReturn =
    Math.min(...returns);

  const profit =
    guaranteedReturn - B;

  return {
    guaranteedReturn,
    profit,
    profitPercent:
      (profit / B) * 100,
    stakes
  };
}

module.exports = {
  calculateStakes
};
