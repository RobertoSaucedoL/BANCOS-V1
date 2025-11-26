import React, { useState } from 'react';
import { LoanResult } from '../types';
import { formatCurrency, generateCSV } from '../utils/financials';
import { Download, Copy, Table as TableIcon } from 'lucide-react';

interface Props {
  results: LoanResult[];
}

export const DetailedTable: React.FC<Props> = ({ results }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const activeResult = results[selectedTab];

  const handleDownload = () => {
    const csvContent = generateCSV(activeResult);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BancosPorta_Tabla_${activeResult.params.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = () => {
     const csvContent = generateCSV(activeResult);
     navigator.clipboard.writeText(csvContent.replace(/,/g, '\t')); 
     alert("Tabla copiada al portapapeles.");
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[600px] overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center gap-4">
        <h3 className="font-bold text-[#2E3A47] text-sm uppercase tracking-wide flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-[#D98918]" />
            Amortización Detallada
        </h3>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            {results.map((r, idx) => (
                <button
                    key={r.params.id}
                    onClick={() => setSelectedTab(idx)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                        selectedTab === idx
                        ? 'bg-[#2E3A47] text-white shadow-sm'
                        : 'text-slate-500 hover:text-[#2E3A47]'
                    }`}
                >
                    {r.params.name}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs text-left relative border-collapse">
          <thead className="bg-[#2E3A47] text-white sticky top-0 z-10 shadow-md">
            <tr>
              <th className="p-3 font-bold text-center w-16">Mes</th>
              <th className="p-3 font-bold text-right border-l border-white/10">Saldo Insoluto</th>
              <th className="p-3 font-bold text-right border-l border-white/10 bg-[#D98918] text-[#2E3A47]">Pago Total</th>
              <th className="p-3 font-bold text-right border-l border-white/10">Capital</th>
              <th className="p-3 font-bold text-right border-l border-white/10">Interés</th>
              <th className="p-3 font-bold text-right border-l border-white/10">IVA (16%)</th>
              <th className="p-3 font-bold text-right border-l border-white/10 bg-[#3a4857]">Costo Neto (ISR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeResult.table.map((row) => (
              <tr key={row.month} className="hover:bg-amber-50/50 transition-colors group">
                <td className="p-3 text-center font-bold text-slate-400 group-hover:text-[#2E3A47]">{row.month}</td>
                <td className="p-3 text-right font-mono text-slate-600">{formatCurrency(row.balance + row.principalPayment)}</td>
                <td className="p-3 text-right font-mono font-bold text-[#2E3A47] bg-slate-50/50 group-hover:bg-amber-50">
                    {formatCurrency(row.totalMonthlyOutflow)}
                </td>
                <td className="p-3 text-right font-mono text-emerald-600 font-medium">{formatCurrency(row.principalPayment)}</td>
                <td className="p-3 text-right font-mono text-[#D98918] font-medium">{formatCurrency(row.interestPayment)}</td>
                <td className="p-3 text-right font-mono text-slate-400">{formatCurrency(row.ivaOnInterest + row.insurance)}</td>
                <td className="p-3 text-right font-mono font-bold text-[#2E3A47] bg-slate-50/50">
                    {formatCurrency(row.netCostAfterTax)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
        <button 
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-xs font-bold hover:bg-white hover:border-[#D98918] hover:text-[#D98918] transition-colors"
        >
            <Copy className="w-3.5 h-3.5" />
            Copiar
        </button>
        <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D98918] text-white text-xs font-bold hover:bg-[#b87314] shadow-md transition-colors"
        >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
        </button>
      </div>
    </div>
  );
};