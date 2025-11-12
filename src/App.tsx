
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Header from './components/Header';
import Footer from './components/Footer';
import CalculatorForm from './components/CalculatorForm';
import Summary from './components/Summary';
import AmortizationTable from './components/AmortizationTable';
import LoanChart from './components/LoanChart';
import { useMortgageCalculator } from './hooks/useMortgageCalculator';
import { CalculatorInput, PaymentFrequency, LoanType, ExtraPaymentType } from './types';
import ComparisonSummary from './components/ComparisonSummary';
import About from './components/About';

const initialValues: CalculatorInput = {
  homePrice: 500000,
  downPayment: 100000,
  downPaymentPercent: 20,
  loanTerm: 30,
  interestRate: 6.5,
  paymentFrequency: PaymentFrequency.Monthly,
  extraPayment: 0,
  extraPaymentType: ExtraPaymentType.Recurring,
  oneTimePaymentDate: '',
  pmi: 0.5,
  propertyTaxes: 6000,
  homeownersInsurance: 1500,
  startDate: new Date().toISOString().split('T')[0],
  loanOriginationFees: [],
  loanType: LoanType.Conventional,
  calculatorMode: 'purchase',
  estimatedHomeValue: 500000,
  currentLoanBalance: 250000,
  cashOutAmount: 0,
  homesteadExemption: 0,
  hoaFees: 0,
  location: '',
};

// IMPORTANT: For production, this key must be handled on a secure backend. See SECURITY.md
// FIX: Switched to process.env.API_KEY to align with coding guidelines and resolve TypeScript errors with import.meta.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const rateSchema = {
    type: Type.OBJECT,
    properties: {
        rate30Year: { type: Type.NUMBER, description: 'The interest rate for a 30-year loan as a percentage.' },
        rate15Year: { type: Type.NUMBER, description: 'The interest rate for a 15-year loan as a percentage.' },
    },
    required: ['rate30Year', 'rate15Year'],
};

interface CachedRates {
  rate30Year: number;
  rate15Year: number;
  timestamp: number;
}

const App: React.FC = () => {
  const [isComparing, setIsComparing] = useState(false);
  const [scenarioAInputs, setScenarioAInputs] = useState<CalculatorInput>(initialValues);
  const [scenarioBInputs, setScenarioBInputs] = useState<CalculatorInput>(initialValues);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [rateError, setRateError] = useState<string | null>(null);
  const [cachedRates, setCachedRates] = useState<CachedRates | null>(null);


  const { schedule: scheduleA, summary: summaryA } = useMortgageCalculator(scenarioAInputs);
  const { schedule: scheduleB, summary: summaryB } = useMortgageCalculator(isComparing ? scenarioBInputs : null);

  const handleCalculateA = useCallback((inputs: CalculatorInput) => {
    setScenarioAInputs(inputs);
  }, []);
  
  const handleCalculateB = useCallback((inputs: CalculatorInput) => {
    setScenarioBInputs(inputs);
  }, []);

  const handleToggleCompare = (enabled: boolean) => {
    if (enabled && !isComparing) { // Only copy on first toggle
      setScenarioBInputs(scenarioAInputs);
    }
    setIsComparing(enabled);
  };
  
  const applyRatesAndSetScenarios = (rates: { rate30Year: number; rate15Year: number; }) => {
    setIsComparing(true);
    // Use the current state of Scenario A as the baseline for both new scenarios to ensure consistency
    setScenarioAInputs(currentA => {
        const newA = { ...currentA, loanTerm: 30, interestRate: rates.rate30Year };
        const newB = { ...currentA, loanTerm: 15, interestRate: rates.rate15Year };
        // Set scenario B based on the same baseline
        setScenarioBInputs(newB);
        // Return the new state for A
        return newA;
    });
  };

  const handleCompareTerms = async () => {
    const now = Date.now();
    const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

    // Check for fresh cached rates to avoid unnecessary API calls
    if (cachedRates && (now - cachedRates.timestamp < TEN_MINUTES_IN_MS)) {
        applyRatesAndSetScenarios(cachedRates);
        return;
    }

    setIsFetchingRates(true);
    setRateError(null);
    try {
        const prompt = `Provide the current average mortgage interest rates for a 30-year fixed and a 15-year fixed conventional loan in the US for a borrower with a good credit score. Respond ONLY with a JSON object containing 'rate30Year' and 'rate15Year' keys, with values as percentages.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: rateSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const rates: { rate30Year: number, rate15Year: number } = JSON.parse(jsonText);

        if (rates && typeof rates.rate30Year === 'number' && typeof rates.rate15Year === 'number') {
            applyRatesAndSetScenarios(rates);
            // Cache the new rates with a timestamp
            setCachedRates({ ...rates, timestamp: Date.now() });
        } else {
            throw new Error("Invalid rate data format received.");
        }

    } catch (e) {
        console.error("Error fetching interest rates:", e);
        if (e instanceof Error && (e.message.includes('429') || e.message.includes('RESOURCE_EXHAUSTED'))) {
            setRateError('Rate limit reached. Please wait a moment and try again.');
        } else {
            setRateError('Could not fetch current rates. Please try again.');
        }
    } finally {
        setIsFetchingRates(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-4 p-4 bg-slate-800 rounded-lg flex items-center justify-center flex-wrap gap-4">
            <div className="flex items-center space-x-4">
                <span className={`font-medium ${!isComparing ? 'text-white' : 'text-slate-400'}`}>Single View</span>
                <label htmlFor="compare-toggle" className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="compare-toggle" className="sr-only peer" checked={isComparing} onChange={(e) => handleToggleCompare(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-teal-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
                <span className={`font-medium ${isComparing ? 'text-white' : 'text-slate-400'}`}>Compare Scenarios</span>
            </div>
            
            <div className="border-l border-slate-600 h-6 mx-2 hidden sm:block"></div>

            <button
                onClick={handleCompareTerms}
                disabled={isFetchingRates}
                className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
                {isFetchingRates ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                )}
                <span>Compare 30 vs 15 Year</span>
            </button>
          </div>
          {rateError && <div className="text-center text-red-400 mb-4 p-3 bg-red-900/50 rounded-lg">{rateError}</div>}


          {!isComparing ? (
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
               <div className="lg:col-span-2">
                 <div className="sticky top-24">
                   <CalculatorForm onCalculate={handleCalculateA} initialValues={initialValues} title="Mortgage Details" />
                 </div>
               </div>
               <div className="lg:col-span-3">
                  {summaryA ? (
                   <>
                     <Summary summary={summaryA} paymentFrequency={scenarioAInputs.paymentFrequency} />
                     <LoanChart schedule={scheduleA} />
                     <AmortizationTable schedule={scheduleA} />
                   </>
                 ) : (
                     <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl">
                         <p className="text-slate-400">Your mortgage results will appear here.</p>
                     </div>
                 )}
               </div>
             </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <CalculatorForm onCalculate={handleCalculateA} initialValues={scenarioAInputs} title="Scenario A"/>
                <CalculatorForm onCalculate={handleCalculateB} initialValues={scenarioBInputs} title="Scenario B"/>
              </div>

              {summaryA && summaryB && (
                <>
                  <ComparisonSummary summaryA={summaryA} summaryB={summaryB} />
                  <LoanChart schedule={scheduleA} scheduleB={scheduleB} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Scenario A Schedule</h3>
                        <AmortizationTable schedule={scheduleA} />
                    </div>
                     <div>
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Scenario B Schedule</h3>
                        <AmortizationTable schedule={scheduleB} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
           <About />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;