const API_BASE_URL =
  "https://v3.football.api-sports.io";

async function apiFootballRequest(
  endpoint,
  params = {}
) {
  const apiKey =
    process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new Error(
      "La variable API_FOOTBALL_KEY est absente."
    );
  }

  const searchParams =
    new URLSearchParams();

  for (const [key, value] of Object.entries(
    params
  )) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(
        key,
        String(value)
      );
    }
  }

  const query =
    searchParams.toString();

  const url =
    `${API_BASE_URL}${endpoint}` +
    (query ? `?${query}` : "");

  const response =
    await fetch(url, {
      method: "GET",
      headers: {
        "x-apisports-key":
          apiKey
      }
    });

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      `API-Football HTTP ${response.status}`
    );
  }

  if (
    data.errors &&
    Object.keys(data.errors).length > 0
  ) {
    throw new Error(
      `API-Football: ${JSON.stringify(
        data.errors
      )}`
    );
  }

  return {
    data,
    remaining:
      response.headers.get(
        "x-ratelimit-requests-remaining"
      )
  };
}

async function getCountries() {
  return apiFootballRequest(
    "/countries"
  );
}

module.exports = {
  apiFootballRequest,
  getCountries
};
