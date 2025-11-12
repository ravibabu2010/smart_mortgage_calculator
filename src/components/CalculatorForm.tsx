import React, { useState, useEffect } from 'react';
import { CalculatorInput, PaymentFrequency, InputFee, LoanType, ExtraPaymentType } from '../types';
import ZipcodeSearch, { LocationData } from './ZipcodeSearch';

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full left-1/2 z-20 w-64 px-3 py-2 mb-2 text-sm font-normal text-white bg-slate-600 rounded-lg shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 transform -translate-x-1/2">
            {text}
        </div>
    </div>
);


const InputField: React.FC<{ label: string; id: string; children: React.ReactNode; tooltipText?: string; }> = ({ label, id, children, tooltipText }) => (
    <div>
        <div className="flex items-center space-x-1.5">
            <label htmlFor={id} className="block text-sm font-medium text-slate-300">{label}</label>
            {tooltipText && <Tooltip text={tooltipText} />}
        </div>
        <div className="mt-1 relative rounded-md shadow-sm">
            {children}
        </div>
    </div>
);

interface CalculatorFormProps {
  onCalculate: (inputs: CalculatorInput) => void;
  initialValues: CalculatorInput;
  title: string;
}

const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, initialValues, title }) => {
  const [inputs, setInputs] = useState<CalculatorInput>(initialValues);
  const [isTaxAuto, setIsTaxAuto] = useState(false);
  const [taxRate, setTaxRate] = useState<number | null>(null);

  useEffect(() => {
    setInputs(initialValues);
  }, [initialValues]);

  // Debounced calculation
  useEffect(() => {
    const handler = setTimeout(() => {
        onCalculate(inputs);
    }, 300); // 300ms delay
    return () => {
        clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  
  const handleModeChange = (mode: 'purchase' | 'refinance') => {
    setInputs(prev => ({...prev, calculatorMode: mode}));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericValue = parseFloat(value);
    
    setInputs(prev => {
        let newInputs = { ...prev, [name]: isNaN(numericValue) && e.target.type === 'number' ? 0 : (e.target.type === 'number' ? numericValue : value) };

        if (name === "homePrice" || name === "downPaymentPercent") {
            const dpAmount = newInputs.homePrice * (newInputs.downPaymentPercent / 100);
            newInputs.downPayment = Math.round(dpAmount * 100) / 100;
        } else if (name === "downPayment") {
            const dpPercent = newInputs.homePrice > 0 ? (numericValue / newInputs.homePrice) * 100 : 0;
            newInputs.downPaymentPercent = Math.round(dpPercent * 100) / 100;
        }

        if (name === 'homePrice' && isTaxAuto && taxRate) {
            newInputs.propertyTaxes = Math.round(newInputs.homePrice * taxRate);
        }

        if (name === 'propertyTaxes') {
            setIsTaxAuto(false);
        }

        return newInputs;
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(prev => ({...prev, [e.target.name]: e.target.value}));
  };
  
  const handleExtraPaymentTypeChange = (type: ExtraPaymentType) => {
    setInputs(prev => ({...prev, extraPaymentType: type}));
  };

  const handleFrequencyChange = (frequency: PaymentFrequency) => {
    setInputs(prev => ({...prev, paymentFrequency: frequency}));
  };
  
  const handleLoanTypeChange = (loanType: LoanType) => {
    setInputs(prev => {
        const newInputs = {...prev, loanType};
        let newFees = [...prev.loanOriginationFees].filter(
            fee => fee.name !== 'FHA Upfront MIP' && fee.name !== 'VA Funding Fee'
        );

        switch (loanType) {
            case LoanType.FHA:
                newFees.push({ name: 'FHA Upfront MIP', value: 1.75, type: 'percentage' });
                if (newInputs.calculatorMode === 'purchase' && newInputs.downPaymentPercent < 3.5) {
                    newInputs.downPaymentPercent = 3.5;
                    newInputs.downPayment = Math.round((newInputs.homePrice * 0.035) * 100) / 100;
                }
                break;
            case LoanType.VA:
                newFees.push({ name: 'VA Funding Fee', value: 2.3, type: 'percentage' });
                if (newInputs.calculatorMode === 'purchase') {
                    newInputs.downPayment = 0;
                    newInputs.downPaymentPercent = 0;
                }
                break;
            case LoanType.Conventional:
            case LoanType.Jumbo:
                break;
        }
        
        return {...newInputs, loanOriginationFees: newFees};
    });
  };

  const handleFeeChange = (index: number, field: keyof InputFee, value: string | number) => {
    setInputs(prev => {
        const newFees = [...prev.loanOriginationFees];
        const feeValue = field === 'value' ? parseFloat(value as string) : value;
        newFees[index] = { ...newFees[index], [field]: field === 'value' ? (isNaN(feeValue as number) ? 0 : feeValue) : value };
        return { ...prev, loanOriginationFees: newFees };
    });
  };

  const handleAddFee = () => {
    setInputs(prev => ({
        ...prev,
        loanOriginationFees: [...prev.loanOriginationFees, { name: '', value: 0, type: 'fixed' }]
    }));
  };

  const handleRemoveFee = (index: number) => {
     setInputs(prev => ({
        ...prev,
        loanOriginationFees: prev.loanOriginationFees.filter((_, i) => i !== index)
    }));
  };

  const handleLocationSelect = (locationData: LocationData | null) => {
    if (locationData) {
        setTaxRate(locationData.taxRate);
        setInputs(prev => {
            const newTaxes = prev.homePrice * locationData.taxRate;
            return {
                ...prev, 
                location: `${locationData.city}, ${locationData.state}`, 
                propertyTaxes: Math.round(newTaxes) 
            };
        });
        setIsTaxAuto(true);
    } else {
        setInputs(prev => ({ ...prev, location: '' }));
        setIsTaxAuto(false);
        setTaxRate(null);
    }
  };
  
  const extraPaymentLabels = {
    [ExtraPaymentType.Recurring]: "Recurring Extra Payment",
    [ExtraPaymentType.OneTime]: "One-Time Payment Amount",
    [ExtraPaymentType.Annual]: "Annual Extra Payment"
  };

  return (
    <div id="calculator" className="bg-slate-800 p-6 rounded-2xl shadow-2xl space-y-6 h-full">
      <h2 className="text-2xl font-bold text-white text-center">{title}</h2>
      
        <div className="flex rounded-md shadow-sm">
          <button type="button" onClick={() => handleModeChange('purchase')} className={`flex-1 px-4 py-2 text-sm font-medium border border-slate-600 rounded-l-md ${inputs.calculatorMode === 'purchase' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            New Purchase
          </button>
          <button type="button" onClick={() => handleModeChange('refinance')} className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-r border-slate-600 rounded-r-md ${inputs.calculatorMode === 'refinance' ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            Refinance
          </button>
        </div>

      {inputs.calculatorMode === 'purchase' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Home Price" id="homePrice" tooltipText="The total purchase price of the property.">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                  <input type="number" name="homePrice" id="homePrice" value={inputs.homePrice} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 pr-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
              </InputField>
              
              <div className="grid grid-cols-2 gap-2">
                <InputField label="Down Payment" id="downPayment" tooltipText="The initial amount you pay upfront. This is automatically calculated if you enter a percentage.">
                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                    <input type="number" name="downPayment" id="downPayment" value={inputs.downPayment} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
                </InputField>
                <InputField label="Percentage" id="downPaymentPercent" tooltipText="The percentage of the home price you're paying upfront. This is automatically calculated if you enter a dollar amount.">
                     <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">%</span>
                    <input type="number" name="downPaymentPercent" id="downPaymentPercent" value={inputs.downPaymentPercent} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md py-2 pr-7 text-white focus:ring-teal-500 focus:border-teal-500" />
                </InputField>
              </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Estimated Home Value" id="estimatedHomeValue" tooltipText="The current market value of your property.">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                  <input type="number" name="estimatedHomeValue" id="estimatedHomeValue" value={inputs.estimatedHomeValue} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 pr-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
              </InputField>
              <InputField label="Current Loan Balance" id="currentLoanBalance" tooltipText="The remaining amount you owe on your current mortgage.">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                  <input type="number" name="currentLoanBalance" id="currentLoanBalance" value={inputs.currentLoanBalance} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 pr-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
              </InputField>
              <InputField label="Cash Out Amount" id="cashOutAmount" tooltipText="The amount of extra money you want to borrow against your home's equity.">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                  <input type="number" name="cashOutAmount" id="cashOutAmount" value={inputs.cashOutAmount} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 pr-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
              </InputField>
          </div>
      )}
       
       <div>
            <div className="flex items-center space-x-1.5 mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Loan Type</label>
                <Tooltip text="Select your loan type to apply program-specific fees and rules, like FHA's upfront MIP or VA's funding fee."/>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 rounded-md shadow-sm mt-1 gap-px">
              <button type="button" onClick={() => handleLoanTypeChange(LoanType.Conventional)} className={`flex-1 px-4 py-2 text-sm font-medium border border-slate-600 rounded-l-md ${inputs.loanType === LoanType.Conventional ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Conventional</button>
              <button type="button" onClick={() => handleLoanTypeChange(LoanType.Jumbo)} className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-slate-600 ${inputs.loanType === LoanType.Jumbo ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Jumbo</button>
              <button type="button" onClick={() => handleLoanTypeChange(LoanType.FHA)} className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-slate-600 ${inputs.loanType === LoanType.FHA ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>FHA</button>
              <button type="button" onClick={() => handleLoanTypeChange(LoanType.VA)} className={`flex-1 px-4 py-2 text-sm font-medium border border-slate-600 rounded-r-md ${inputs.loanType === LoanType.VA ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>VA</button>
            </div>
      </div>

       <div>
        <div className="flex items-center space-x-1.5">
            <label className="block text-sm font-medium text-slate-300">Loan Term: {inputs.loanTerm} years</label>
            <Tooltip text="The number of years over which you will repay the loan."/>
        </div>
        <input type="range" name="loanTerm" min="1" max="40" value={inputs.loanTerm} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb mt-1" />
      </div>

       <div>
         <div className="flex items-center space-x-1.5">
            <label className="block text-sm font-medium text-slate-300">Interest Rate: {inputs.interestRate}%</label>
            <Tooltip text="The annual interest rate for the loan. Does not include fees like PMI or property taxes."/>
         </div>
        <input type="range" name="interestRate" min="0" max="15" step="0.01" value={inputs.interestRate} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb mt-1" />
      </div>

      <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-white text-center">Taxes, Insurance & Fees</h3>
        
        <div>
            <div className="flex items-center space-x-1.5 mb-2">
                <label className="block text-sm font-medium text-slate-300">Property Location</label>
                <Tooltip text="Enter a 5-digit zip code to automatically estimate your annual property tax rate." />
            </div>
            <ZipcodeSearch onSelect={handleLocationSelect} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <InputField label="Homestead Exemption" id="homesteadExemption" tooltipText="The dollar amount of your property's value that is exempt from taxes.">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                <input type="number" name="homesteadExemption" id="homesteadExemption" value={inputs.homesteadExemption} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
            </InputField>
             <div>
                <div className="flex items-center space-x-1.5">
                    <label htmlFor="propertyTaxes" className="block text-sm font-medium text-slate-300">Annual Property Tax</label>
                    <Tooltip text="The estimated annual property tax. Auto-filled by selecting a location, or can be entered manually." />
                    {isTaxAuto && <span className="text-xs text-teal-400">(Auto)</span>}
                </div>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                    <input type="number" name="propertyTaxes" id="propertyTaxes" value={inputs.propertyTaxes} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 pr-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
                </div>
            </div>
            <InputField label="Annual Homeowner's Insurance" id="homeownersInsurance" tooltipText="The estimated annual premium for homeowner's insurance.">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                <input type="number" name="homeownersInsurance" id="homeownersInsurance" value={inputs.homeownersInsurance} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 pr-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
            </InputField>
            <InputField label="Annual PMI" id="pmi" tooltipText="Private Mortgage Insurance, often required if your loan-to-value ratio is over 80%. Enter it as an annual percentage of the loan amount.">
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">%</span>
                <input type="number" name="pmi" id="pmi" value={inputs.pmi} step="0.01" onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pr-7 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
            </InputField>
             <InputField label="Monthly HOA Fees" id="hoaFees" tooltipText="Your monthly Homeowners Association fees, if applicable.">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                <input type="number" name="hoaFees" id="hoaFees" value={inputs.hoaFees} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
            </InputField>
        </div>
      </div>
      
      <div className="space-y-3">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                  <label className="block text-sm font-medium text-slate-300">Loan Origination Fees</label>
                  <Tooltip text="Fees charged by the lender to process your loan. Can be a fixed amount ($) or a percentage (%) of the loan." />
              </div>
              <button type="button" onClick={handleAddFee} className="px-3 py-1 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500">
                  Add Fee
              </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {inputs.loanOriginationFees.map((fee, index) => (
                  <div key={index} className="grid grid-cols-[1fr,auto,auto] items-center gap-2">
                      <input
                          type="text"
                          placeholder="Fee Name (e.g., Application)"
                          value={fee.name}
                          onChange={(e) => handleFeeChange(index, 'name', e.target.value)}
                          className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white text-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                      
                      <div className="flex items-center">
                        <div className="relative">
                           <span className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm`}>
                             {fee.type === 'fixed' ? '$' : '%'}
                           </span>
                          <input
                              type="number"
                              placeholder="Value"
                              value={fee.value}
                              onChange={(e) => handleFeeChange(index, 'value', e.target.value)}
                              className="w-28 bg-slate-700 border-slate-600 rounded-l-md pl-7 pr-2 py-2 text-white text-sm focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                        <div className="flex">
                            <button type="button" onClick={() => handleFeeChange(index, 'type', 'fixed')} className={`px-2 py-2 text-xs font-bold border-slate-600 border-t border-b ${fee.type === 'fixed' ? 'bg-teal-600 text-white' : 'bg-slate-600 text-slate-300'}`}>$</button>
                             <button type="button" onClick={() => handleFeeChange(index, 'type', 'percentage')} className={`px-2 py-2 text-xs font-bold border-slate-600 border-t border-b border-r rounded-r-md ${fee.type === 'percentage' ? 'bg-teal-600 text-white' : 'bg-slate-600 text-slate-300'}`}>%</button>
                        </div>
                      </div>

                      <button type="button" onClick={() => handleRemoveFee(index)} className="flex-shrink-0 text-slate-400 hover:text-red-400 p-1 rounded-full" aria-label="Remove fee">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                      </button>
                  </div>
              ))}
              {inputs.loanOriginationFees.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No fees added.</p>}
          </div>
      </div>
      
      <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
        <h3 className="font-semibold text-white text-center">Accelerate Your Payoff</h3>
         <div>
            <div className="flex items-center space-x-1.5 mb-2">
                <label className="block text-sm font-medium text-slate-300">Extra Payment Type</label>
                <Tooltip text="Choose how you want to make extra payments: recurring with each payment, as a one-time lump sum, or annually."/>
            </div>
            <div className="grid grid-cols-3 rounded-md shadow-sm mt-1 gap-px">
              <button type="button" onClick={() => handleExtraPaymentTypeChange(ExtraPaymentType.Recurring)} className={`px-2 py-2 text-xs md:text-sm font-medium border border-slate-600 rounded-l-md ${inputs.extraPaymentType === ExtraPaymentType.Recurring ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Recurring</button>
              <button type="button" onClick={() => handleExtraPaymentTypeChange(ExtraPaymentType.OneTime)} className={`px-2 py-2 text-xs md:text-sm font-medium border-t border-b border-slate-600 ${inputs.extraPaymentType === ExtraPaymentType.OneTime ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>One-Time</button>
              <button type="button" onClick={() => handleExtraPaymentTypeChange(ExtraPaymentType.Annual)} className={`px-2 py-2 text-xs md:text-sm font-medium border border-slate-600 rounded-r-md ${inputs.extraPaymentType === ExtraPaymentType.Annual ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Annual</button>
            </div>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label={extraPaymentLabels[inputs.extraPaymentType]} id="extraPayment">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">$</span>
                <input type="number" name="extraPayment" id="extraPayment" value={inputs.extraPayment} onChange={handleInputChange} className="w-full bg-slate-700 border-slate-600 rounded-md pl-7 pr-4 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
            </InputField>
            {inputs.extraPaymentType === ExtraPaymentType.OneTime && (
                <InputField label="One-Time Payment Date" id="oneTimePaymentDate">
                    <input type="date" name="oneTimePaymentDate" id="oneTimePaymentDate" value={inputs.oneTimePaymentDate} onChange={handleDateChange} className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
                </InputField>
            )}
        </div>
      </div>


      <InputField label="First Payment Start Date" id="startDate" tooltipText="The date of your first mortgage payment. This affects the payoff date calculation.">
        <input type="date" name="startDate" id="startDate" value={inputs.startDate} onChange={handleDateChange} className="w-full bg-slate-700 border-slate-600 rounded-md px-3 py-2 text-white focus:ring-teal-500 focus:border-teal-500" />
      </InputField>

       <div>
            <div className="flex items-center space-x-1.5 mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Payment Frequency</label>
                <Tooltip text="Choose to pay monthly or every two weeks. Bi-weekly payments can help pay off the loan faster by making the equivalent of one extra monthly payment per year."/>
            </div>
            <div className="flex rounded-md shadow-sm mt-1">
              <button type="button" onClick={() => handleFrequencyChange(PaymentFrequency.Monthly)} className={`flex-1 px-4 py-2 text-sm font-medium border border-slate-600 rounded-l-md ${inputs.paymentFrequency === PaymentFrequency.Monthly ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                Monthly
              </button>
              <button type="button" onClick={() => handleFrequencyChange(PaymentFrequency.BiWeekly)} className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-r border-slate-600 rounded-r-md ${inputs.paymentFrequency === PaymentFrequency.BiWeekly ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                Bi-Weekly
              </button>
            </div>
          </div>
    </div>
  );
};

export default CalculatorForm;
