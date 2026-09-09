const demoMarkets = [
  {
    event: "Barcelona vs Real Madrid",
    market: "Over/Under 2.5",

    outcomes: [
      {
        name: "Over 2.5",
        bookmaker: "Bookmaker A (DEMO)",
        odds: 2.70
      },
      {
        name: "Under 2.5",
        bookmaker: "Bookmaker B (DEMO)",
        odds: 2.50
      }
    ]
  },

  {
    event: "Match de test sans surebet",
    market: "Over/Under 2.5",

    outcomes: [
      {
        name: "Over 2.5",
        bookmaker: "Bookmaker A (DEMO)",
        odds: 1.70
      },
      {
        name: "Under 2.5",
        bookmaker: "Bookmaker B (DEMO)",
        odds: 2.10
      }
    ]
  }
];

module.exports = {
  demoMarkets
};
