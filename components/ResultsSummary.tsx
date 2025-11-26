
import React from 'react';
import { LoanResult } from '../types';
import { formatCurrency } from '../utils/financials';
import { Wallet, AlertOctagon, TrendingUp, Award, LockOpen, LineChart } from 'lucide-react';

interface Props {
  results: LoanResult[];
}

export const ResultsSummary: React.FC<Props> = ({ results }) => {
  const minPrincipal = Math.min(...results.map(r => r.params.principal));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {results.map((r, i) => {
            const isLowestCost = results.every(other => other.summary.netCost >= r.summary.netCost);
            const hasRemainingDebt = r.summary.remainingBalance > 1000;
            const leverageAmount = r.params.principal - minPrincipal;
            const hasLeverage = leverageAmount > 1000;
            
            // Logic specific for Revolvente Banamex Limit of 8M
            const isRevolving = r.params.name.toUpperCase().includes('REVOLVENTE');
            const revolvingLimit = 8000000;
            const availableRevolving = isRevolving ? (revolvingLimit - r.params.principal) : 0;
            const hasAvailableRevolving = availableRevolving > 1000;
            
            // Logic specific for Owner Financing (Inversionista view)
            const isOwner = r.params.name.toUpperCase().includes('DUEÑO') || r.params.name.toUpperCase().includes('SOCIO');

            let cardBorder = 'border-slate-200';

            if (isOwner) {
                cardBorder = 'border-emerald-500';
            } else if (isLowestCost && !hasRemainingDebt) {
                cardBorder = 'border-emerald-400';
            } else if (hasRemainingDebt) {
                cardBorder = 'border-red-300';
            }

            return (
                <div key={i} className={`relative bg-white rounded-xl shadow-lg border-t-4 p-5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 ${cardBorder}`}>
                    
                    {/* Header Section */}
                    <div className="mb-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg leading-tight text-[#2E3A47] w-3/4">
                                {r.params.name}
                            </h3>
                             {isOwner ? (
                                 <LineChart className="w-6 h-6 text-emerald-600" />
                             ) : isLowestCost && !hasRemainingDebt && !hasLeverage && !hasAvailableRevolving ? (
                                <Award className="w-6 h-6 text-emerald-500" />
                            ) : hasRemainingDebt && (
                                <AlertOctagon className="w-6 h-6 text-red-500" />
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-1">Capital Base: {formatCurrency(r.params.principal)}</p>
                    </div>

                    {/* Main Numbers */}
                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                                <Wallet className="w-3 h-3" /> {isOwner ? 'Pago Mensual a Recibir' : 'Pago Mensual'}
                            </p>
                            <p className="text-2xl font-mono font-bold text-[#2E3A47] tracking-tight">
                                {formatCurrency(r.table[0].totalMonthlyOutflow)}
                            </p>
                             <p className="text-[10px] text-slate-400 mt-1">
                                {r.params.paymentStrategy === 'manual' ? 'Pago Fijo Definido' : 'Amortización Calculada'}
                            </p>
                        </div>

                        {/* Special Block: Investor View for Owner */}
                        {isOwner ? (
                            <div className="bg-[#2E3A47] rounded-lg p-3 border border-slate-600 shadow-inner">
                                <div className="flex justify-between items-center mb-2 border-b border-slate-600 pb-1">
                                    <span className="text-[10px] uppercase font-bold text-[#D98918] flex items-center gap-1">
                                        <Award className="w-3 h-3" /> Visión Inversionista
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-300">Utilidad Nominal</span>
                                        <span className="text-sm font-bold text-white font-mono">{formatCurrency(r.summary.totalInterest)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-slate-300">Valor Real Hoy (VPN)</span>
                                        <span className="text-sm font-bold text-[#D98918] font-mono">{formatCurrency(r.summary.totalPVInterest || 0)}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 text-right italic">
                                        Desc. Inflación 4.5%
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Standard Leverage / Debt Status for Banks */
                            <>
                                {hasLeverage ? (
                                    <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" /> Cash Flow Libre
                                            </span>
                                            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 rounded">
                                                +LIQUIDEZ
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold text-emerald-700 font-mono">
                                            +{formatCurrency(leverageAmount)}
                                        </p>
                                    </div>
                                ) : hasAvailableRevolving ? (
                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
                                                <LockOpen className="w-3 h-3" /> Línea Disponible
                                            </span>
                                            <span className="text-[10px] font-bold bg-amber-200 text-amber-800 px-1.5 rounded">
                                                DISPONIBLE
                                            </span>
                                        </div>
                                        <p className="text-lg font-bold text-amber-700 font-mono">
                                            {formatCurrency(availableRevolving)}
                                        </p>
                                        <p className="text-[9px] text-amber-600 mt-0.5 leading-tight">
                                            Excedente del límite de $8.0M
                                        </p>
                                    </div>
                                ) : (
                                    <div className="h-[68px] flex items-center justify-center border border-dashed border-slate-200 rounded-lg">
                                        <span className="text-[10px] text-slate-400">Sin excedente de caja</span>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Cost / Debt Result - Now visible for Owner too for comparison */}
                        <div className="pt-3 border-t border-slate-100">
                                {hasRemainingDebt ? (
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-red-500">Deuda Remanente</p>
                                        <p className="text-sm font-bold text-red-600 font-mono">{formatCurrency(r.summary.remainingBalance)}</p>
                                    </div>
                                    <div className="text-right">
                                            <p className="text-[10px] text-slate-400">Interés Pagado</p>
                                            <p className="text-xs font-bold text-[#D98918]">{formatCurrency(r.summary.totalInterest)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-[#2E3A47]">Costo Neto Total</p>
                                        <p className="text-sm font-bold text-[#2E3A47] font-mono">{formatCurrency(r.summary.netCost)}</p>
                                        {isOwner && <p className="text-[9px] text-slate-400 leading-none mt-0.5">(Costo Empresa)</p>}
                                    </div>
                                    <div className="text-right">
                                            <p className="text-[10px] text-slate-400">Intereses Totales</p>
                                            <p className="text-xs font-bold text-[#D98918]">{formatCurrency(r.summary.totalInterest)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
  );
};
