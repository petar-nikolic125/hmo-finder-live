// Shared financial calculations to ensure consistency between PropertyCard and PropertyAnalysis
export interface PropertyFinancials {
  lhaWeekly: number;
  monthlyRent: number;
  yearlyRent: number;
  stampDuty: number;
  refurbCost: number;
  totalInvested: number;
  netYield: number;
  grossYield: number;
  roi: number;
  paybackYears: number;
  monthlyCashflow: number;
  dscr: number;
}

export const LHA_RATES: Record<string, number> = {
  'Liverpool': 122,
  'Birmingham': 110,
  'Manchester': 125,
  'Leeds': 115,
  'Sheffield': 108,
  'Bristol': 140,
  'Newcastle': 105,
  'Nottingham': 112,
  'Leicester': 108,
  'Coventry': 102,
  'Brighton': 165,
  'Cambridge': 180,
  'Oxford': 175,
  'Reading': 155,
  'Portsmouth': 135,
  'Southampton': 130,
  'Plymouth': 110,
  'Derby': 100,
  'Hull': 95,
  'Preston': 90,
  'Blackpool': 85,
  'Salford': 118,
  'Stockport': 112,
  'Wolverhampton': 98
};

export function calculatePropertyFinancials(
  price: number,
  bedrooms: number,
  city: string,
  renovationPerRoom: number = 15000
): PropertyFinancials {
  const lhaWeekly = LHA_RATES[city] || 110;
  const monthlyRent = lhaWeekly * 4.33 * bedrooms; // Weekly to monthly conversion
  const yearlyRent = monthlyRent * 12;
  
  // JARVIS-accurate financial calculations
  const stampDuty = price * 0.03; // 3% stamp duty
  const refurbCost = renovationPerRoom * bedrooms; // Renovation cost per bedroom
  const totalInvested = price + stampDuty + refurbCost;
  
  // Calculate yields consistently
  const netYield = (yearlyRent * 0.75) / totalInvested; // 75% after expenses
  const grossYield = yearlyRent / totalInvested;
  
  // ROI calculation (Return on Investment)
  const deposit = price * 0.25; // 25% deposit
  const investmentRequired = deposit + stampDuty + refurbCost;
  const netRentalIncome = yearlyRent * 0.75; // After 25% expenses
  const roi = netRentalIncome / investmentRequired;
  
  const paybackYears = investmentRequired / netRentalIncome;
  const monthlyCashflow = (monthlyRent * 0.75) - (price * 0.75 * 0.0025); // After mortgage payments (~0.25% monthly)
  const dscr = (monthlyRent * 0.75) / (price * 0.75 * 0.0025); // Debt service coverage ratio
  
  return {
    lhaWeekly,
    monthlyRent,
    yearlyRent,
    stampDuty,
    refurbCost,
    totalInvested,
    netYield,
    grossYield,
    roi,
    paybackYears,
    monthlyCashflow,
    dscr
  };
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatCurrency(value: number): string {
  return `£${value.toLocaleString()}`;
}