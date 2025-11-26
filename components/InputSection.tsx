
import React from 'react';
import { LoanParams, GlobalSettings } from '../types';
import { Settings, RefreshCcw, AlertCircle, Calculator, Edit3, DollarSign, Percent, Calendar, Lock } from 'lucide-react';

interface Props {
  loans: LoanParams[];
  settings: GlobalSettings;
  onUpdateLoan: (index: number, field: keyof LoanParams, value: number | string) => void;
  onUpdateSettings: (field: keyof GlobalSettings, value: number | boolean) => void;
}

export const InputSection: React.FC<Props> = ({ loans, settings, onUpdateLoan, onUpdateSettings }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-auto">
      {/* Global Config Header */}
      <div className="bg-[#2E3A47] p-4 flex items-center justify-between border-b border-[#D98918]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#D98918]" />
          Parámetros Globales
        </h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-3 h-3 rounded-sm border ${settings.applyIvaToInterest ? 'bg-[#D98918] border-[#D98918]' : 'border-slate-400 group-hover:border-white'}`}>
                {settings.applyIvaToInterest && <div className="w-full h-full transform scale-50 bg-white" />}
            </div>
            <input 
              type="checkbox" 
              checked={settings.applyIvaToInterest}
              onChange={(e) => onUpdateSettings('applyIvaToInterest', e.target.checked)}
              className="hidden"
            />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">+IVA</span>
          </label>
           <label className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">ISR CORP:</span>
            <input 
              type="number" 
              value={settings.isrRate}
              onChange={(e) => onUpdateSettings('isrRate', Number(e.target.value))}
              className="w-10 bg-slate-700 text-white text-center text-xs font-mono rounded border border-slate-600 focus:border-[#D98918] outline-none"
            />
             <span className="text-[10px] text-slate-400">%</span>
          </label>
        </div>
      </div>

      {/* Main Inputs Content - Scrollbar REMOVED and Height AUTO to push content down */}
      <div className="p-4 space-y-4 bg-slate-50">
        {loans.map((loan, index) => {
             const isRevolving = loan.name.toLowerCase().includes('revolvente');
             const isOwner = loan.name.toLowerCase().includes('dueño') || loan.name.toLowerCase().includes('socio');

             let borderColor = 'border-slate-200';
             let headerColor = 'bg-slate-400';

             if (index === 0) {
                 headerColor = 'bg-[#2E3A47]'; // Citibanamex / Bank A
             } else if (index === 1) {
                 headerColor = 'bg-[#D98918]'; // Revolvente / Bank B
                 borderColor = 'border-amber-200';
             } else if (isOwner) {
                 headerColor = 'bg-emerald-600'; // Owner
                 borderColor = 'border-emerald-200';
             }

             // Calculate Implicit Spread (Rate - TIIE 11.50)
             const tiie = 11.50;
             const spread = loan.annualRate - tiie;

             return (
                <div key={loan.id} className={`relative rounded-lg border transition-all duration-200 group hover:shadow-md bg-white ${borderColor}`}>
                    <div className={`h-1 w-full rounded-t-lg ${headerColor}`} />
                    
                    {isRevolving && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-amber-700">
                            <Lock className="w-2.5 h-2.5" />
                            Límite: $8.0M
                        </div>
                    )}

                    <div className="p-3">
                        <div className="flex justify-between items-start mb-3">
                            <input 
                                type="text" 
                                value={loan.name}
                                onChange={(e) => onUpdateLoan(index, 'name', e.target.value)}
                                className="font-bold text-xs uppercase tracking-wider text-[#2E3A47] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#D98918] outline-none w-2/3"
                            />
                            
                            {/* Strategy Selector */}
                            <div className="flex bg-slate-100 rounded p-0.5 ml-2">
                                <button
                                    title="Pago Calculado (Amortización)"
                                    onClick={() => onUpdateLoan(index, 'paymentStrategy', 'calculated')}
                                    className={`p-1 rounded ${loan.paymentStrategy !== 'manual' ? 'bg-white text-[#2E3A47] shadow-sm' : 'text-slate-400 hover:text-[#2E3A47]'}`}
                                >
                                    <Calculator className="w-3 h-3" />
                                </button>
                                <button
                                    title="Pago Manual (Fijo)"
                                    onClick={() => onUpdateLoan(index, 'paymentStrategy', 'manual')}
                                    className={`p-1 rounded ${loan.paymentStrategy === 'manual' ? 'bg-[#D98918] text-white shadow-sm' : 'text-slate-400 hover:text-[#D98918]'}`}
                                >
                                    <Edit3 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-2">
                            <div className="relative">
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 block">Capital ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-1.5 top-1.5 w-3 h-3 text-slate-400" />
                                    <input
                                        type="number"
                                        value={loan.principal}
                                        onChange={(e) => onUpdateLoan(index, 'principal', Number(e.target.value))}
                                        className="w-full pl-5 pr-2 py-1 text-xs font-mono font-medium border border-slate-200 rounded focus:ring-1 focus:ring-[#D98918] outline-none"
                                    />
                                </div>
                            </div>
                            <div className="relative">
                                <label className="text-[9px] uppercase font-bold text-slate-400 mb-0.5 block">Tasa Anual (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-1.5 top-1.5 w-3 h-3 text-slate-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={loan.annualRate}
                                        onChange={(e) => onUpdateLoan(index, 'annualRate', Number(e.target.value))}
                                        className="w-full pl-5 pr-2 py-1 text-xs font-mono font-medium border border-slate-200 rounded focus:ring-1 focus:ring-[#D98918] outline-none"
                                    />
                                </div>
                                {/* Spread Display */}
                                <div className="text-[9px] text-right mt-0.5 font-mono text-slate-400">
                                    (TIIE 11.50% + <span className={spread > 5 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>{spread.toFixed(2)}%</span>)
                                </div>
                            </div>
                        </div>

                        {/* Conditional Input based on Strategy */}
                        {loan.paymentStrategy === 'manual' ? (
                            <div className="bg-amber-50 p-2 rounded border border-amber-100 animate-in fade-in slide-in-from-top-1">
                                <label className="block text-[9px] uppercase font-bold text-amber-700 mb-1">Pago Mensual Fijo</label>
                                <input
                                    type="number"
                                    value={loan.manualMonthlyPayment || 0}
                                    onChange={(e) => onUpdateLoan(index, 'manualMonthlyPayment', Number(e.target.value))}
                                    className="w-full p-1.5 text-xs font-mono font-bold text-[#2E3A47] border border-amber-200 rounded focus:ring-1 focus:ring-[#D98918] outline-none bg-white"
                                />
                                <div className="flex items-center gap-1 mt-1">
                                    <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                                    <p className="text-[9px] text-amber-700 leading-tight">
                                        Si Pago &lt; Interés, la deuda crecerá.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div>
                                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Plazo (Años)</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-1.5 top-1.5 w-3 h-3 text-slate-400" />
                                        <input
                                            type="number"
                                            value={loan.years}
                                            onChange={(e) => onUpdateLoan(index, 'years', Number(e.target.value))}
                                            className="w-full pl-5 pr-2 py-1 text-xs font-mono font-medium border border-slate-200 rounded focus:ring-1 focus:ring-[#D98918] outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Tipo</label>
                                    <select
                                        value={loan.loanType}
                                        onChange={(e) => onUpdateLoan(index, 'loanType', e.target.value)}
                                        className="w-full p-1 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded outline-none cursor-pointer bg-white"
                                    >
                                        <option value="amortized">Amortizado</option>
                                        <option value="interest_only">Solo Int.</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Extra Fees */}
                         <div className="grid grid-cols-2 gap-3 mt-3 pt-2 border-t border-slate-100">
                            <div>
                                <label className="text-[9px] uppercase font-bold text-slate-400">Comisión %</label>
                                <input
                                    type="number"
                                    value={loan.openingFeePercent}
                                    onChange={(e) => onUpdateLoan(index, 'openingFeePercent', Number(e.target.value))}
                                    className="w-full mt-0.5 p-1 text-xs border border-slate-200 rounded text-center text-slate-500"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] uppercase font-bold text-red-400">Moratoria %</label>
                                <input
                                    type="number"
                                    value={loan.moratoriumRate}
                                    onChange={(e) => onUpdateLoan(index, 'moratoriumRate', Number(e.target.value))}
                                    className="w-full mt-0.5 p-1 text-xs border border-red-100 bg-red-50 rounded text-center text-red-600 font-bold"
                                />
                            </div>
                         </div>
                    </div>
                </div>
             )
        })}
      </div>
    </div>
  );
};
