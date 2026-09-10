function calculateStakes(
  outcomes,
  bankroll,
  options = {}
) {
  const B = Number(bankroll);

  if (
    !Array.isArray(outcomes) ||
    outcomes.length < 2
  ) {
    throw new Error(
      "Au moins deux résultats sont nécessaires."
    );
  }

  if (
    !Number.isFinite(B) ||
    B <= 0
  ) {
    throw new Error(
      "La bankroll doit être supérieure à 0."
    );
  }

  const minStake =
    Number(options.minStake ?? 0);

  const maxStake =
    Number.isFinite(
      Number(options.maxStake)
    )
      ? Number(options.maxStake)
      : B;

  const rounding =
    Number(options.rounding ?? 1);

  if (
    minStake < 0 ||
    maxStake <= 0 ||
    minStake > maxStake ||
    rounding <= 0
  ) {
    throw new Error(
      "Paramètres de mise invalides."
    );
  }

  const valid =
    outcomes.every(
      (outcome) =>
        outcome &&
        Number.isFinite(
          Number(outcome.odds)
        ) &&
        Number(outcome.odds) > 1
    );

  if (!valid) {
    throw new Error(
      "Une ou plusieurs cotes sont invalides."
    );
  }

  const weights =
    outcomes.map(
      (outcome) =>
        1 /
        Number(
          outcome.odds
        )
    );

  const inverseSum =
    weights.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  if (inverseSum <= 0) {
    throw new Error(
      "Impossible de calculer la répartition."
    );
  }

  /*
   * Répartition théorique :
   *
   * mise =
   * bankroll ×
   * (1 / cote) /
   * somme(1 / cote)
   */
  const rawStakes =
    outcomes.map(
      (_outcome, index) =>
        B *
        (
          weights[index] /
          inverseSum
        )
    );

  const roundedStakes =
    rawStakes.map(
      (stake) =>
        Math.round(
          stake / rounding
        ) * rounding
    );

  const totalStake =
    roundedStakes.reduce(
      (sum, stake) =>
        sum + stake,
      0
    );

  /*
   * Sécurité :
   * les arrondis ne doivent jamais
   * faire dépasser la bankroll.
   */
  if (totalStake > B) {
    throw new Error(
      "Les arrondis dépassent la bankroll."
    );
  }

  const stakes =
    outcomes.map(
      (outcome, index) => ({
        bookmaker:
          outcome.bookmaker,

        outcome:
          outcome.name,

        odds:
          Number(
            outcome.odds
          ),

        rawStake:
          rawStakes[index],

        stake:
          roundedStakes[index]
      })
    );

  const limitsOk =
    stakes.every(
      (item) =>
        item.stake >=
          minStake &&
        item.stake <=
          maxStake
    );

  const returns =
    stakes.map(
      (item) =>
        item.stake *
        item.odds
    );

  const guaranteedReturn =
    Math.min(...returns);

  const profit =
    guaranteedReturn -
    totalStake;

  const profitPercent =
    totalStake > 0
      ? (profit /
          totalStake) *
        100
      : 0;

  return {
    bankroll: B,

    inverseSum,

    totalStake,

    remainingBankroll:
      B - totalStake,

    guaranteedReturn,

    profit,

    profitPercent,

    limitsOk,

    stakes
  };
}

module.exports = {
  calculateStakes
};
