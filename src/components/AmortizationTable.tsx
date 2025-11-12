import React from 'react';
import { AmortizationPeriod } from '../types';
import { DownloadIcon } from '../constants';

interface AmortizationTableProps {
  schedule: AmortizationPeriod[];
}

const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        timeZone: 'UTC',
    });
  };
    
  if (schedule.length === 0) {
    return null;
  }

  const handleExportCSV = () => {
    const headers = ['Period', 'Date', 'Principal', 'Interest', 'Extra Payment', 'Total Payment', 'Remaining Balance'];
    const csvRows = [
        headers.join(','),
        ...schedule.map(row => [
            row.period,
            `"${formatDate(row.date)}"`,
            row.principal.toFixed(2),
            row.interest.toFixed(2),
            row.extraPayment.toFixed(2),
            row.totalPayment.toFixed(2),
            row.remainingBalance.toFixed(2)
        ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'amortization_schedule.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="amortization" className="bg-slate-800 p-6 rounded-2xl shadow-2xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Amortization Schedule</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200"
          aria-label="Export Amortization Schedule to CSV"
        >
          <DownloadIcon />
          <span>Export CSV</span>
        </button>
      </div>
      <div className="overflow-x-auto max-h-[600px] rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-700/50 sticky top-0">
            <tr>
              {['Period', 'Date', 'Principal', 'Interest', 'Extra', 'Total Payment', 'Balance'].map((header) => (
                <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-slate-800 divide-y divide-slate-700">
            {schedule.map((row) => (
              <tr key={row.period} className="hover:bg-slate-700/50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{row.period}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{formatDate(row.date)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-400">{formatCurrency(row.principal)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-400">{formatCurrency(row.interest)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-400">{formatCurrency(row.extraPayment)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-white">{formatCurrency(row.totalPayment)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{formatCurrency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmortizationTable;
