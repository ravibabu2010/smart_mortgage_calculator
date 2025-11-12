import { useMemo } from 'react';
import { CalculatorInput, AmortizationPeriod, LoanSummary, PaymentFrequency, Fee, ExtraPaymentType } from '../types';

export const useMortgageCalculator = (inputs: CalculatorInput | null) => {
  return useMemo(() => {
    if (!inputs) {
      return { schedule: [], summary: null, monthlyPayment: 0 };
    }

    const { 
        homePrice, downPayment, loanTerm, interestRate, paymentFrequency, 
        extraPayment, extraPaymentType, oneTimePaymentDate, startDate, 
        loanOriginationFees, pmi, propertyTaxes, homeownersInsurance,
        calculatorMode, estimatedHomeValue, currentLoanBalance, cashOutAmount,
        homesteadExemption, hoaFees
    } = inputs;

    const principal = calculatorMode === 'refinance'
        ? currentLoanBalance + (cashOutAmount || 0)
        : homePrice - downPayment;
        
    if (principal <= 0 || interestRate < 0 || loanTerm <= 0) {
      return { schedule: [], summary: null, monthlyPayment: 0 };
    }

    const calculatedFees: Fee[] = (loanOriginationFees || []).map(fee => {
        const amount = fee.type === 'percentage'
            ? principal * (fee.value / 100)
            : fee.value;
        return { name: fee.name, amount: parseFloat(amount.toFixed(2)) };
    });
    
    const totalLoanOriginationFees = calculatedFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfMonths = loanTerm * 12;

    const pAndIPayment = monthlyInterestRate > 0
      ? principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths)) / (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1)
      : principal / numberOfMonths;
      
    const taxBaseValue = calculatorMode === 'refinance' ? estimatedHomeValue : homePrice;
    const taxableValue = Math.max(0, taxBaseValue - (homesteadExemption || 0));
    const effectiveTaxRate = taxBaseValue > 0 ? (propertyTaxes || 0) / taxBaseValue : 0;
    const actualAnnualTaxes = taxableValue * effectiveTaxRate;
    const monthlyTaxes = (actualAnnualTaxes || 0) / 12;

    const monthlyInsurance = (homeownersInsurance || 0) / 12;
    const monthlyHoa = hoaFees || 0;

    const appraisedValue = calculatorMode === 'refinance' ? estimatedHomeValue : homePrice;
    const ltv = appraisedValue > 0 ? (principal / appraisedValue) * 100 : 0;
    const isPmiApplicable = ltv > 80 && pmi > 0;
    const monthlyPmi = isPmiApplicable ? (principal * (pmi / 100)) / 12 : 0;
    const pmiStopThreshold = appraisedValue * 0.80;

    const schedule: AmortizationPeriod[] = [];
    let remainingBalance = principal;
    let totalInterest = 0;
    let totalPmiPaid = 0;
    
    const periodsPerYear = paymentFrequency === PaymentFrequency.BiWeekly ? 26 : 12;
    const periodicInterestRate = interestRate / 100 / periodsPerYear;
    const basePeriodicPayment = paymentFrequency === PaymentFrequency.BiWeekly ? pAndIPayment / 2 : pAndIPayment;
    const periodicPmi = paymentFrequency === PaymentFrequency.BiWeekly ? monthlyPmi / 2 : monthlyPmi;

    let period = 0;
    const start = new Date(startDate);
    
    while (remainingBalance > 0) {
      period++;
      
      const paymentDate = new Date(start);
      if (paymentFrequency === PaymentFrequency.Monthly) {
        paymentDate.setMonth(start.getMonth() + period);
      } else {
        paymentDate.setDate(start.getDate() + period * 14);
      }

      const interestForPeriod = remainingBalance * periodicInterestRate;
      let principalForPeriod = basePeriodicPayment - interestForPeriod;
      
      const pmiForPeriod = (isPmiApplicable && remainingBalance > pmiStopThreshold) ? periodicPmi : 0;
      
      if (principalForPeriod < 0) principalForPeriod = 0;

      let currentExtraPayment = 0;
      switch(extraPaymentType) {
        case ExtraPaymentType.Recurring:
            currentExtraPayment = extraPayment || 0;
            break;
        case ExtraPaymentType.Annual:
            // Check if it's an anniversary payment
            const isAnniversary = paymentDate.getMonth() === start.getMonth() && paymentDate.getDate() >= start.getDate() && period > 1;
             if (isAnniversary && (period % periodsPerYear === 1 || periodsPerYear === 12)) { // Approximation for anniversary
                currentExtraPayment = extraPayment || 0;
            }
            break;
        case ExtraPaymentType.OneTime:
            const oneTimeDate = oneTimePaymentDate ? new Date(oneTimePaymentDate) : null;
            if (oneTimeDate && paymentDate.getFullYear() === oneTimeDate.getFullYear() && paymentDate.getMonth() === oneTimeDate.getMonth() && paymentDate.getDate() >= oneTimeDate.getDate()) {
                 const timeDiff = Math.abs(paymentDate.getTime() - oneTimeDate.getTime());
                 const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                 if(diffDays < (paymentFrequency === PaymentFrequency.Monthly ? 31 : 15)) {
                    currentExtraPayment = extraPayment || 0;
                 }
            }
            break;
      }
      
      let effectiveExtraPayment = Math.min(remainingBalance - principalForPeriod, currentExtraPayment);
      if (effectiveExtraPayment < 0) effectiveExtraPayment = 0;
      
      let totalPrincipalPaid = principalForPeriod + effectiveExtraPayment;
      let currentPayment = basePeriodicPayment + effectiveExtraPayment + pmiForPeriod;

      if (remainingBalance <= totalPrincipalPaid) {
          totalPrincipalPaid = remainingBalance;
          currentPayment = remainingBalance + interestForPeriod + pmiForPeriod;
          effectiveExtraPayment = Math.max(0, remainingBalance - principalForPeriod);
          remainingBalance = 0;
      } else {
          remainingBalance -= totalPrincipalPaid;
      }
      
      totalInterest += interestForPeriod;
      totalPmiPaid += pmiForPeriod;

      schedule.push({
        period,
        date: paymentDate.toISOString().split('T')[0],
        interest: interestForPeriod,
        principal: principalForPeriod,
        extraPayment: effectiveExtraPayment,
        totalPayment: currentPayment,
        remainingBalance: remainingBalance,
      });

      if (period > loanTerm * periodsPerYear * 2) { // Safety break
        break;
      }
    }
    
    const payoffDateObj = schedule.length > 0 ? new Date(schedule[schedule.length - 1].date) : new Date(startDate);
    const originalPayoffDate = new Date(start);
    originalPayoffDate.setFullYear(start.getFullYear() + loanTerm);

    const timeDiff = originalPayoffDate.getTime() - payoffDateObj.getTime();
    const monthsSaved = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 30.44));
    const yearsSaved = Math.floor(monthsSaved / 12);
    const remainingMonthsSaved = monthsSaved % 12;

    const standardTotalInterest = (pAndIPayment * numberOfMonths) - principal;
    const interestSaved = standardTotalInterest - totalInterest;
    
    const firstPaymentPrincipal = schedule.length > 0 ? schedule[0].principal : 0;
    const firstPaymentInterest = schedule.length > 0 ? schedule[0].interest : 0;
    
    const payoffDate = payoffDateObj.toLocaleDateString(undefined, { timeZone: 'UTC' });

    const monthsInLoan = schedule.length / (periodsPerYear / 12);
    const totalTaxesPaid = monthlyTaxes * monthsInLoan;
    const totalInsurancePaid = monthlyInsurance * monthsInLoan;
    const totalHoaPaid = monthlyHoa * monthsInLoan;
    
    const totalPayments = principal + totalInterest + totalPmiPaid + totalTaxesPaid + totalInsurancePaid + totalHoaPaid;

    const summary: LoanSummary = {
      monthlyPayment: pAndIPayment + monthlyPmi + monthlyTaxes + monthlyInsurance + monthlyHoa,
      biWeeklyPayment: (pAndIPayment / 2) + periodicPmi + (monthlyTaxes / 2) + (monthlyInsurance / 2) + (monthlyHoa / 2),
      totalPrincipal: principal,
      totalInterest: totalInterest,
      totalPmi: totalPmiPaid,
      monthlyPmi: monthlyPmi,
      monthlyTaxes,
      monthlyInsurance,
      monthlyHoaFees: monthlyHoa,
      loanOriginationFees: calculatedFees,
      totalLoanOriginationFees,
      totalCost: principal + totalInterest + totalLoanOriginationFees + totalPmiPaid, // Upfront + interest costs
      totalPayments: totalPayments, // Total of all payments made
      payoffDate: payoffDate,
      originalPayoffDate: originalPayoffDate.toLocaleDateString(undefined, { timeZone: 'UTC' }),
      yearsSaved,
      monthsSaved: remainingMonthsSaved,
      interestSaved,
      firstPaymentPrincipal,
      firstPaymentInterest,
      loanToValue: ltv
    };

    return { schedule, summary, monthlyPayment: pAndIPayment + monthlyPmi + monthlyTaxes + monthlyInsurance + monthlyHoa };

  }, [inputs]);
};
