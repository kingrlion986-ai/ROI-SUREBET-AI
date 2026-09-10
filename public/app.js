const bankrollInput =
  document.getElementById("bankroll");

const scanButton =
  document.getElementById("scanButton");

const resultsContainer =
  document.getElementById("results");

function formatNumber(value) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits: 2
    }
  ).format(value);
}

function formatPercent(value) {
  return (
    formatNumber(value) + " %"
  );
}

function renderQuoteComparison(
  outcomes
) {
  if (
    !Array.isArray(outcomes) ||
    outcomes.length === 0
  ) {
    return "";
  }

  /*
   * Regrouper les cotes par résultat.
   */
  const groups = {};

  for (const outcome of outcomes) {
    const name = outcome.name;

    if (!groups[name]) {
      groups[name] = [];
    }

    groups[name].push(outcome);
  }

  return `
    <div class="quote-comparison">
      <h4>
        Comparaison des cotes
      </h4>

      ${Object.entries(groups)
        .map(
          ([name, quotes]) => `
            <div class="quote-group">
              <strong>
                ${name}
              </strong>

              ${quotes
                .map(
                  (quote) => `
                    <div class="quote-row">
                      <span>
                        ${quote.bookmaker}
                      </span>

                      <span>
                        @ ${formatNumber(
                          quote.odds
                        )}
                      </span>
                    </div>
                  `
                )
                .join("")}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderSurebet(
  surebet
) {
  const stakes =
    surebet.stakes;

  const outcomes =
    surebet.outcomes;

  return `
    <article class="surebet-card">

      <h2>
        ${surebet.event}
      </h2>

      <p>
        <strong>
          Marché :
        </strong>
        ${surebet.market}
      </p>

      <div class="best-quotes">

        ${outcomes
          .map(
            (outcome) => `
              <div class="outcome">
                <div>
                  <strong>
                    ${outcome.name}
                  </strong>

                  <small>
                    ${outcome.bookmaker}
                  </small>
                </div>

                <strong>
                  @ ${formatNumber(
                    outcome.odds
                  )}
                </strong>
              </div>
            `
          )
          .join("")}

      </div>

      ${renderQuoteComparison(
        outcomes
      )}

      <div class="arbitrage">

        <div>
          <span>
            Indice d'arbitrage
          </span>

          <strong>
            ${formatPercent(
              surebet.inverseSum *
                100
            )}
          </strong>
        </div>

        <div>
          <span>
            Profit théorique
          </span>

          <strong>
            ${formatPercent(
              surebet.profitPercent
            )}
          </strong>
        </div>

      </div>

      <div class="stakes">

        <h3>
          Répartition de la bankroll
        </h3>

        ${stakes.stakes
          .map(
            (item) => `
              <div class="stake-row">

                <div>
                  <strong>
                    ${item.outcome}
                  </strong>

                  <small>
                    ${item.bookmaker}
                  </small>
                </div>

                <strong>
                  ${formatNumber(
                    item.stake
                  )}
                  FCFA
                </strong>

              </div>
            `
          )
          .join("")}

      </div>

      <div class="summary">

        <div>
          Retour théorique minimum :
          <strong>
            ${formatNumber(
              stakes.guaranteedReturn
            )}
            FCFA
          </strong>
        </div>

        <div>
          Bénéfice théorique :
          <strong>
            ${formatNumber(
              stakes.profit
            )}
            FCFA
          </strong>
        </div>

        <div>
          Bankroll restante :
          <strong>
            ${formatNumber(
              stakes.remainingBankroll
            )}
            FCFA
          </strong>
        </div>

      </div>

      <div class="simulation-warning">
        Simulation uniquement.
        Aucun pari réel n'est placé.
      </div>

    </article>
  `;
}

async function scanSurebets() {
  const bankroll =
    Number(
      bankrollInput.value
    );

  if (
    !Number.isFinite(bankroll) ||
    bankroll <= 0
  ) {
    resultsContainer.innerHTML =
      "<p>Veuillez entrer une bankroll valide.</p>";

    return;
  }

  scanButton.disabled = true;

  scanButton.textContent =
    "Analyse en cours...";

  resultsContainer.innerHTML =
    "<p>Analyse des opportunités...</p>";

  try {
    /*
     * Pour le moment, nous utilisons
     * les marchés DEMO comme source.
     *
     * L'API-Football pourra être branchée
     * ici plus tard lorsque le compte sera
     * réactivé.
     */
    const demoResponse =
      await fetch(
        `/api/demo?bankroll=${encodeURIComponent(
          bankroll
        )}`
      );

    const demoData =
      await demoResponse.json();

    if (!demoResponse.ok) {
      throw new Error(
        demoData.error ||
        "Impossible de récupérer les données DEMO."
      );
    }

    /*
     * Envoyer les marchés DEMO au nouveau
     * scanner /api/scan.
     */
    const response =
      await fetch(
        "/api/scan",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            markets:
              demoData.results
                .length > 0
                ? demoData.results.map(
                    (result) => ({
                      event:
                        result.event,

                      market:
                        result.market,

                      outcomes:
                        result.outcomes,

                      updatedAt:
                        result.updatedAt,

                      live:
                        result.live
                    })
                  )
                : []
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "Erreur pendant l'analyse."
      );
    }

    if (
      !Array.isArray(
        data.results
      ) ||
      data.results.length === 0
    ) {
      resultsContainer.innerHTML = `
        <div class="no-surebet">

          <strong>
            Aucun surebet détecté.
          </strong>

          <p>
            Le système recommande
            de ne rien faire.
          </p>

        </div>
      `;

      return;
    }

    resultsContainer.innerHTML =
      data.results
        .map(
          renderSurebet
        )
        .join("");

  } catch (error) {

    console.error(error);

    resultsContainer.innerHTML = `
      <div class="error">
        ${error.message}
      </div>
    `;

  } finally {

    scanButton.disabled =
      false;

    scanButton.textContent =
      "Scanner les cotes";
  }
}
      
  "click",
  scanSurebets
);
