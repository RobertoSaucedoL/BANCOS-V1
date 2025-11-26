
export interface LoanParams {
  id: string;
  name: string;
  principal: number;
  annualRate: number; // Percentage (e.g., 12 for 12%)
  years: number;
  openingFeePercent: number; // Comisión por apertura
  monthlyInsurance: number; // Seguros mensuales
  loanType: 'amortized' | 'interest_only'; // Defines the base behavior
  paymentStrategy: 'calculated' | 'manual'; // New: Standard calc vs User defined fixed payment
  manualMonthlyPayment?: number; // The fixed amount user wants to pay (Principal + Interest)
  moratoriumRate: number; // Annual Moratorium Interest Rate (Tasa Moratoria)
}

export interface GlobalSettings {
  ivaRate: number; // Typically 16% in Mexico
  isrRate: number; // Corporate tax rate, e.g., 30%
  applyIvaToInterest: boolean; // Commercial vs Residential logic
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  ivaOnInterest: number;
  insurance: number;
  totalMonthlyOutflow: number;
  balance: number;
  taxShield: number; // Fiscal benefit from interest deduction
  netCostAfterTax: number;
}

export interface LoanResult {
  params: LoanParams;
  table: AmortizationRow[];
  summary: {
    monthlyPaymentBase: number; // Without insurance/IVA (Initial or Average)
    totalInterest: number;
    totalIva: number;
    totalInsurance: number;
    totalOpeningFee: number;
    grandTotalPaid: number;
    totalTaxShield: number;
    netCost: number;
    oneMonthDefaultCost: number; // Cost of 1 month default based on moratorium rate
    remainingBalance: number; // Balloon payment / Debt left at end of term
    totalPVInterest?: number; // Present Value of Interest (for Investor view)
  };
}
