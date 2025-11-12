export enum PaymentFrequency {
  Monthly = 'monthly',
  BiWeekly = 'bi-weekly',
}

export enum LoanType {
  Conventional = 'conventional',
  FHA = 'fha',
  VA = 'va',
  Jumbo = 'jumbo',
}

export enum ExtraPaymentType {
  Recurring = 'recurring',
  OneTime = 'one-time',
  Annual = 'annual',
}

export interface Fee {
  name: string;
  amount: number;
}

export interface InputFee {
  name:string;
  value: number;
  type: 'fixed' | 'percentage';
}

export interface CalculatorInput {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanTerm: number;
  interestRate: number;
  pmi: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  paymentFrequency: PaymentFrequency;
  extraPayment: number;
  extraPaymentType: ExtraPaymentType;
  oneTimePaymentDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
  loanOriginationFees: InputFee[];
  loanType: LoanType;
  calculatorMode: 'purchase' | 'refinance';
  estimatedHomeValue: number;
  currentLoanBalance: number;
  cashOutAmount: number;
  homesteadExemption: number;
  hoaFees: number;
  location: string;
}

export interface AmortizationPeriod {
  period: number;
  date: string;
  interest: number;
  principal: number;
  extraPayment: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface LoanSummary {
  monthlyPayment: number;
  biWeeklyPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  totalPmi: number;
  monthlyPmi: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoaFees: number;
  loanOriginationFees: Fee[];
  totalLoanOriginationFees: number;
  totalCost: number;
  totalPayments: number;
  payoffDate: string;
  originalPayoffDate: string;
  yearsSaved: number;
  monthsSaved: number;
  interestSaved: number;
  firstPaymentPrincipal: number;
  firstPaymentInterest: number;
  loanToValue: number;
}
