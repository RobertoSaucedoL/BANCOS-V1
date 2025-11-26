
import { LoanParams, GlobalSettings, AmortizationRow, LoanResult } from '../types';

export const calculateAmortization = (
  params: LoanParams,
  settings: GlobalSettings
): LoanResult => {
  const { principal, annualRate, years, openingFeePercent, monthlyInsurance, loanType, paymentStrategy, manualMonthlyPayment, moratoriumRate } = params;
  const { ivaRate, isrRate, applyIvaToInterest } = settings;

  // Define loop limits
  const targetMonths = years * 12;
  // If manual strategy, we allow simulation up to 15 years (180 months) or until debt is paid.
  const maxSimulationMonths = paymentStrategy === 'manual' ? 180 : targetMonths;

  const monthlyRate = annualRate / 100 / 12;
  
  // Calculate Standard PMT for Amortized loans (to 0 in targetYears)
  let standardMonthlyPayment = 0;
  if (monthlyRate === 0) {
    standardMonthlyPayment = principal / targetMonths;
  } else {
    standardMonthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, targetMonths)) / (Math.pow(1 + monthlyRate, targetMonths) - 1);
  }

  let balance = principal;
  const table: AmortizationRow[] = [];
  
  let totalInterest = 0;
  let totalIva = 0;
  let totalTaxShield = 0;
  
  // Net Present Value of Interest (for Investor View)
  let totalPVInterest = 0;
  const discountRateMonthly = 0.045 / 12; // 4.5% Annual Inflation proxy for discount

  for (let i = 1; i <= maxSimulationMonths; i++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = 0;
    let monthlyPaymentBase = 0;

    if (paymentStrategy === 'manual' && manualMonthlyPayment) {
        // User defined fixed payment (P+I)
        monthlyPaymentBase = manualMonthlyPayment;
        
        // Logic: Payment first covers Interest, then Principal.
        // If Payment < Interest, principalPayment is negative (Debt grows/Negative Amortization)
        principalPayment = monthlyPaymentBase - interestPayment;

        // If we are close to paying off (Balance < Payment), adjust.
        // Only if principalPayment is positive (we are actually paying down)
        if (principalPayment > 0 && principalPayment > balance) {
            principalPayment = balance;
            monthlyPaymentBase = principalPayment + interestPayment;
        }

    } else if (loanType === 'interest_only') {
        // Revolving/Bullet logic: Pay only interest, principal at end
        if (i === targetMonths) {
            // Balloon payment logic implied for calculation, 
            // but for monthly flow we usually just show interest.
            // Let's assume standard monthly flow is just interest.
             principalPayment = 0; 
        } else {
            principalPayment = 0;
        }
        monthlyPaymentBase = principalPayment + interestPayment;

    } else {
        // Standard Amortized logic (Auto-calculate to hit 0)
        principalPayment = standardMonthlyPayment - interestPayment;
        
        // Adjust for final month rounding
        if (i === targetMonths) {
             // For standard calc, ensure exact zero
             if (Math.abs(balance - principalPayment) < 1) {
                 principalPayment = balance;
             }
        }
        monthlyPaymentBase = principalPayment + interestPayment;
    }
    
    // Mexican Context: IVA on interest
    const ivaOnInterest = applyIvaToInterest ? interestPayment * (ivaRate / 100) : 0;
    
    const totalMonthlyOutflow = monthlyPaymentBase + ivaOnInterest + monthlyInsurance;
    
    // Fiscal Analysis: Tax Shield (Escudo Fiscal)
    // Only deductible if it's real interest paid. 
    // If negative amortization, you generally can't deduct unpaid interest until paid (simplified here).
    const taxShield = interestPayment * (isrRate / 100); 

    const netCostAfterTax = totalMonthlyOutflow - taxShield;

    balance -= principalPayment;
    
    // Floating point correction
    if (Math.abs(balance) < 0.01) balance = 0;

    table.push({
      month: i,
      payment: monthlyPaymentBase,
      principalPayment,
      interestPayment,
      ivaOnInterest,
      insurance: monthlyInsurance,
      totalMonthlyOutflow,
      balance,
      taxShield,
      netCostAfterTax
    });

    totalInterest += interestPayment;
    totalIva += ivaOnInterest;
    totalTaxShield += taxShield;
    
    // PV Calculation for Investor
    totalPVInterest += interestPayment / Math.pow(1 + discountRateMonthly, i);

    // Break conditions
    if (balance <= 0) break; // Paid off
    if (paymentStrategy !== 'manual' && i >= targetMonths) break; // End of fixed term
  }

  const remainingBalance = balance; 
  const totalInsurance = monthlyInsurance * table.length;
  const totalOpeningFee = principal * (openingFeePercent / 100);
  
  // Total Cost Calculation Logic:
  // We need to account for Money Out (Flow) + Debt Remaining (Liability)
  const principalPaid = principal - remainingBalance;
  
  // Grand Total Paid Cash Flow
  const grandTotalPaid = (totalInterest + totalIva + totalInsurance + totalOpeningFee) + principalPaid;
  
  const netCost = grandTotalPaid - totalTaxShield;
  
  // Cost of Default
  const monthlyMoratoriumRate = (moratoriumRate || 0) / 100 / 12;
  const oneMonthDefaultInterest = principal * monthlyMoratoriumRate;
  const oneMonthDefaultIva = applyIvaToInterest ? oneMonthDefaultInterest * (ivaRate / 100) : 0;
  const oneMonthDefaultCost = oneMonthDefaultInterest + oneMonthDefaultIva;

  return {
    params,
    table,
    summary: {
      monthlyPaymentBase: paymentStrategy === 'manual' && manualMonthlyPayment ? manualMonthlyPayment : (loanType === 'interest_only' ? (principal * monthlyRate) : standardMonthlyPayment),
      totalInterest,
      totalIva,
      totalInsurance,
      totalOpeningFee,
      grandTotalPaid, 
      totalTaxShield,
      netCost,
      oneMonthDefaultCost,
      remainingBalance,
      totalPVInterest // Export NPV
    }
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const generateCSV = (result: LoanResult) => {
  const headers = [
    "Mes",
    "Saldo Insoluto",
    "Pago Capital",
    "Pago Interés",
    "IVA Interés",
    "Seguro/Coms",
    "Pago Total Mensual",
    "Escudo Fiscal (ISR)",
    "Costo Neto"
  ];

  const rows = result.table.map(row => [
    row.month,
    row.balance.toFixed(2),
    row.principalPayment.toFixed(2),
    row.interestPayment.toFixed(2),
    row.ivaOnInterest.toFixed(2),
    row.insurance.toFixed(2),
    row.totalMonthlyOutflow.toFixed(2),
    row.taxShield.toFixed(2),
    row.netCostAfterTax.toFixed(2)
  ]);

  const typeLabel = result.params.loanType === 'interest_only' ? "Revolvente / Solo Interés" : "Amortizado / Plazo Fijo";

  const csvContent = [
    `Escenario: ${result.params.name}`,
    `Tipo: ${typeLabel}`,
    `Monto Original: ${result.params.principal}`,
    `Saldo Final (Deuda): ${result.summary.remainingBalance.toFixed(2)}`,
    `Tasa Ordinaria: ${result.params.annualRate}%`,
    `Tasa Moratoria: ${result.params.moratoriumRate}%`,
    "",
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  return csvContent;
};
