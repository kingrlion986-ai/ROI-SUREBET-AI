const bankrollInput =
  document.getElementById("bankroll");

const scanButton =
  document.getElementById("scan");

const results =
  document.getElementById("results");

const status =
  document.getElementById("status");


function money(value) {
  return Number(value).toLocaleString(
    "fr-FR",
    {
      maximumFractionDigits: 2
    }
  ) + " FCFA";
}


function render(data) {
  results.innerHTML = "";

  if (!data.results.length) {
    results.innerHTML = `
      <div class="empty">
        Aucune surebet détectée.
      </div>
    `;

    return;
  }

  for (const surebet of data.results) {

    const card =
      document.createElement("article");

    card.className = "card";

    card.innerHTML = `

      <h2>
        ${surebet.event}
      </h2>

      <p>
        Marché :
        <strong>
          ${surebet.market}
        </strong>
      </p>

      ${surebet.outcomes
        .map(
          (outcome) => `
            <div class="row">

              <span>
                ${outcome.name}
                —
                ${outcome.bookmaker}
              </span>

              <strong>
                @ ${outcome.odds}
              </strong>

            </div>
          `
        )
        .join("")}

      <p>
        Indice d'arbitrage :
        <strong>
          ${(surebet.inverseSum * 100).toFixed(2)}%
        </strong>
      </p>

      <p class="profit">
        Profit théorique :
        ${surebet.profitPercent.toFixed(2)}%
      </p>

      <p>
        Retour théorique minimum :
        <strong>
          ${money(
            surebet.stakes.guaranteedReturn
          )}
        </strong>
      </p>

      <h3>
        Répartition de la bankroll
      </h3>

      ${surebet.stakes.stakes
        .map(
          (item) => `
            <div class="row">

              <span>
                ${item.outcome}
                <br>

                <small>
                  ${item.bookmaker}
                </small>
              </span>

              <strong>
                ${money(item.stake)}
              </strong>

            </div>
          `
        )
        .join("")}

      <p>
        Bénéfice théorique :
        <strong>
          ${money(
            surebet.stakes.profit
          )}
        </strong>
      </p>
    `;

    results.appendChild(card);
  }
}


async function scanDemo() {

  const bankroll =
    Number(bankrollInput.value);

  if (!Number.isFinite(bankroll) || bankroll <= 0) {

    status.innerHTML = `
      <div class="empty">
        Entre une bankroll supérieure à 0.
      </div>
    `;

    return;
  }

  status.innerHTML = `
    <div class="ok">
      Analyse des cotes en cours...
    </div>
  `;

  results.innerHTML = "";

  try {

    const response =
      await fetch(
        `/api/demo?bankroll=${encodeURIComponent(
          bankroll
        )}`
      );

    if (!response.ok) {
      throw new Error(
        "Erreur lors de l'analyse."
      );
    }

    const data =
      await response.json();

    render(data);

    status.innerHTML = `
      <div class="ok">
        Analyse terminée — simulation uniquement.
      </div>
    `;

  } catch (error) {

    status.innerHTML = `
      <div class="empty">
        ${error.message}
      </div>
    `;
  }
}


scanButton.addEventListener(
  "click",
  scanDemo
);


scanDemo();
