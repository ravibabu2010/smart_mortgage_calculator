import React from 'react';
import { LoanSummary } from '../types';

interface ComparisonSummaryProps {
  summaryA: LoanSummary;
  summaryB: LoanSummary;
}

const ComparisonRow: React.FC<{ label: string; valueA: string | number; valueB: string | number; highlight?: boolean }> = ({ label, valueA, valueB, highlight }) => (
    <div className="grid grid-cols-3 items-center py-3 border-b border-slate-700 last:border-b-0">
        <p className="text-sm text-slate-400 col-span-1">{label}</p>
        <p className={`text-md font-semibold ${highlight ? 'text-teal-400' : 'text-white'} col-span-1 text-center`}>{valueA}</p>
        <p className={`text-md font-semibold ${highlight ? 'text-emerald-400' : 'text-white'} col-span-1 text-center`}>{valueB}</p>
    </div>
);


const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ summaryA, summaryB }) => {
    const costDifference = Math.abs(summaryA.totalCost - summaryB.totalCost);
    const savingsHighlight = summaryA.totalCost > summaryB.totalCost 
        ? 'Scenario B saves you' 
        : 'Scenario A saves you';

    return (
        <div id="comparison-summary" className="bg-slate-800 p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Comparison Summary</h2>

            <div className="grid grid-cols-3 items-center py-2 mb-4">
                 <div className="col-span-1"></div>
                 <h3 className="text-lg font-bold text-teal-400 col-span-1 text-center">Scenario A</h3>
                 <h3 className="text-lg font-bold text-emerald-400 col-span-1 text-center">Scenario B</h3>
            </div>
            
            <div className="space-y-2">
                <ComparisonRow 
                    label="Monthly Payment" 
                    valueA={`$${summaryA.monthlyPayment.toFixed(2)}`} 
                    valueB={`$${summaryB.monthlyPayment.toFixed(2)}`}
                />
                 <ComparisonRow 
                    label="Bi-Weekly Payment" 
                    valueA={`$${summaryA.biWeeklyPayment.toFixed(2)}`} 
                    valueB={`$${summaryB.biWeeklyPayment.toFixed(2)}`}
                />
                <ComparisonRow 
                    label="Origination Fees" 
                    valueA={`$${summaryA.totalLoanOriginationFees.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                    valueB={`$${summaryB.totalLoanOriginationFees.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                />
                 <ComparisonRow 
                    label="Total Interest" 
                    valueA={`$${summaryA.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                    valueB={`$${summaryB.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                />
                 <ComparisonRow 
                    label="Total Cost" 
                    valueA={`$${summaryA.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                    valueB={`$${summaryB.totalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                    highlight
                />
                <ComparisonRow 
                    label="Interest Saved" 
                    valueA={`$${summaryA.interestSaved.toLocaleString(undefined, {maximumFractionDigits: 0})}`} 
                    valueB={`$${summaryB.interestSaved.toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                />
                 <ComparisonRow 
                    label="Payoff Date" 
                    valueA={summaryA.payoffDate} 
                    valueB={summaryB.payoffDate}
                />
                 <ComparisonRow 
                    label="Time Saved" 
                    valueA={`${summaryA.yearsSaved}y ${summaryA.monthsSaved}m`}
                    valueB={`${summaryB.yearsSaved}y ${summaryB.monthsSaved}m`}
                />
            </div>
            
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg text-center">
                <p className="text-lg font-bold text-white">{savingsHighlight} <span className="text-green-400">${costDifference.toLocaleString(undefined, {maximumFractionDigits: 0})}</span> in total cost!</p>
            </div>
        </div>
    );
};

export default ComparisonSummary;
