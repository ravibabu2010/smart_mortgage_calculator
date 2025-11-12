import React, { useRef, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoanSummary, PaymentFrequency } from '../types';
import { DownloadIcon } from '../constants';

interface SummaryProps {
  summary: LoanSummary | null;
  paymentFrequency: PaymentFrequency;
}

const StatCard: React.FC<{ title: string; value: string; className?: string; subtext?: string; valueClassName?: string; }> = ({ title, value, className, subtext, valueClassName }) => (
    <div className={`bg-slate-700/50 p-4 rounded-lg text-center ${className}`}>
        <p className="text-sm text-slate-400">{title}</p>
        <p className={`text-xl lg:text-2xl font-bold ${valueClassName || 'text-white'}`}>{value}</p>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
);

const Summary: React.FC<SummaryProps> = ({ summary, paymentFrequency }) => {
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!summary) {
    return (
      <div id="summary" className="bg-slate-800 p-6 rounded-2xl shadow-2xl text-center">
        <p className="text-slate-400">Enter your loan details to see the summary.</p>
      </div>
    );
  }

  const { monthlyPayment, biWeeklyPayment, totalPrincipal, totalInterest, totalLoanOriginationFees, loanOriginationFees, payoffDate, yearsSaved, monthsSaved, interestSaved, totalPmi, monthlyPmi, monthlyTaxes, monthlyInsurance, monthlyHoaFees, loanToValue, totalPayments } = summary;

  const paymentAmount = paymentFrequency === PaymentFrequency.BiWeekly ? biWeeklyPayment : monthlyPayment;
  const paymentLabel = paymentFrequency === PaymentFrequency.BiWeekly ? "Bi-Weekly Payment" : "Total Monthly Payment";

  const totalCostPieData = [
    { name: 'Principal', value: totalPrincipal },
    { name: 'Interest', value: totalInterest },
    { name: 'Fees', value: totalLoanOriginationFees },
    { name: 'PMI', value: totalPmi },
  ].filter(d => d.value > 0);
  
  const pAndI = monthlyPayment - monthlyTaxes - monthlyInsurance - monthlyPmi - monthlyHoaFees;
  const monthlyBreakdownPieData = [
    { name: 'P & I', value: pAndI },
    { name: 'Taxes', value: monthlyTaxes },
    { name: 'Insurance', value: monthlyInsurance },
    { name: 'PMI', value: monthlyPmi },
    { name: 'HOA', value: monthlyHoaFees },
  ].filter(d => d.value > 0.01);


  const COLORS_TOTAL = ['#14b8a6', '#f43f5e', '#f59e0b', '#a855f7'];
  const COLORS_MONTHLY = ['#0ea5e9', '#eab308', '#8b5cf6', '#ec4899', '#6366f1'];
  
  const handleExportPDF = async () => {
    if (!summaryContentRef.current) return;
    setIsExporting(true);
    try {
        const canvas = await html2canvas(summaryContentRef.current, {
            backgroundColor: '#1e293b',
            scale: 2
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save('loan_summary.pdf');
    } catch (error) {
        console.error("Error exporting PDF:", error);
    } finally {
        setIsExporting(false);
    }
  };


  return (
    <div id="summary" className="bg-slate-800 p-6 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Loan Summary</h2>
            <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 disabled:bg-teal-400 disabled:cursor-not-allowed"
            >
                <DownloadIcon />
                <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
        </div>
        
        <div ref={summaryContentRef} className="p-4 space-y-8">
            <div className="space-y-4">
                <StatCard title={paymentLabel} value={`$${paymentAmount.toFixed(2)}`} className="col-span-2 lg:col-span-4 bg-teal-600/50" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard title="Payoff Date" value={payoffDate} valueClassName="text-amber-400" />
                    <StatCard title="Time Saved" value={`${yearsSaved}y ${monthsSaved}m`} valueClassName="text-emerald-400" />
                    <StatCard title="Interest Saved" value={`$${interestSaved.toLocaleString(undefined, {maximumFractionDigits: 0})}`} valueClassName="text-green-400" subtext="vs. standard loan"/>
                    <StatCard title="LTV" value={`${loanToValue.toFixed(2)}%`} valueClassName="text-sky-400" subtext="Loan-to-Value"/>
                    <StatCard title="Total Payments" value={`$${totalPayments.toLocaleString(undefined, {maximumFractionDigits: 0})}`} valueClassName="text-teal-300" className="sm:col-span-2" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center bg-slate-700/50 p-4 rounded-lg">
                <div className="md:col-span-2 h-48 w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={monthlyBreakdownPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" paddingAngle={5}>
                                {monthlyBreakdownPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_MONTHLY[index % COLORS_MONTHLY.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="md:col-span-3">
                    <h3 className="text-md font-semibold text-white mb-3 text-center">Monthly Payment Breakdown</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center"><span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS_MONTHLY[0]}}></div>Principal & Interest</span><span className="font-medium text-white">${pAndI.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>
                        {monthlyTaxes > 0 && <div className="flex justify-between items-center"><span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS_MONTHLY[1]}}></div>Property Taxes</span><span className="font-medium text-white">${monthlyTaxes.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>}
                        {monthlyInsurance > 0 && <div className="flex justify-between items-center"><span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS_MONTHLY[2]}}></div>Insurance</span><span className="font-medium text-white">${monthlyInsurance.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>}
                        {monthlyPmi > 0 && <div className="flex justify-between items-center"><span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS_MONTHLY[3]}}></div>PMI</span><span className="font-medium text-white">${monthlyPmi.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>}
                        {monthlyHoaFees > 0 && <div className="flex justify-between items-center"><span className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS_MONTHLY[4]}}></div>HOA Fees</span><span className="font-medium text-white">${monthlyHoaFees.toLocaleString(undefined, {maximumFractionDigits: 2})}</span></div>}
                    </div>
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-semibold text-white mb-3 text-center">Total Cost Breakdown Over Life of Loan</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={totalCostPieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {totalCostPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS_TOTAL[index % COLORS_TOTAL.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {loanOriginationFees.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3 text-center">Origination Fee Breakdown</h3>
                    <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                        {loanOriginationFees.map((fee, index) => (
                            <div key={index} className="flex justify-between items-center text-sm border-b border-slate-600/50 pb-2 last:border-b-0 last:pb-0">
                                <span className="text-slate-300">{fee.name || 'Unnamed Fee'}</span>
                                <span className="font-medium text-white">${fee.amount.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                            </div>
                        ))}
                    </div>
                </div>
              )}
        </div>
    </div>
  );
};

export default Summary;