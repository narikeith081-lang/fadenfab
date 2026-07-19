const DEFAULT_STOCKS = {
  "oversized-tshirts": {
    1: 3, // Classic Never Dies
    2: 10, // Find Your Canvas
    3: 4, // Timeless & Resilient
    4: 12, // Journeys of Endurance
    5: 2, // Raw Power & Endurance
    6: 15  // Precision & Steadfast
  },
  "hoodies": {
    1: 4, // Future Vision
    2: 10, // Elevate
    3: 1, // Discipline
    4: 15, // Shadow Ronin
    5: 25, // Midnight Rally
    6: 3  // Atlas Explorer
  }
};

export const getStocks = (): Record<string, Record<number, number>> => {
  if (typeof window === "undefined") return DEFAULT_STOCKS;
  const stored = localStorage.getItem("fadenfab_stocks");
  if (!stored) {
    localStorage.setItem("fadenfab_stocks", JSON.stringify(DEFAULT_STOCKS));
    return DEFAULT_STOCKS;
  }
  return JSON.parse(stored);
};

export const saveStocks = (stocks: Record<string, Record<number, number>>) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("fadenfab_stocks", JSON.stringify(stocks));
    window.dispatchEvent(new Event("stocks-updated"));
  }
};
