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
        name: "Over 2.5",
        bookmaker: "Bookmaker C (DEMO)",
        odds: 2.55
      },
      {
        name: "Under 2.5",
        bookmaker: "Bookmaker B (DEMO)",
        odds: 2.60
      },
      {
        name: "Under 2.5",
        bookmaker: "Bookmaker C (DEMO)",
        odds: 2.40
      }
    ]
  },

  {
    event: "Match sans surebet",
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
