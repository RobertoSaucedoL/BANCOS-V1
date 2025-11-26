
import React, { useState, useMemo } from 'react';
import { LoanParams, GlobalSettings } from './types';
import { calculateAmortization } from './utils/financials';
import { InputSection } from './components/InputSection';
import { ResultsSummary } from './components/ResultsSummary';
import { DetailedTable } from './components/DetailedTable';
import { ComparisonChart } from './components/ComparisonChart';
import { Building2, TrendingUp, ShieldCheck, Briefcase, Lightbulb, ArrowRightCircle, BarChart3, HelpCircle } from 'lucide-react';

// Configuration for BANCOS PORTA defaults
const INITIAL_LOANS: LoanParams[] = [
  { 
    id: '1', 
    name: 'Crédito Pyme Citibanamex', 
    principal: 6800000, 
    annualRate: 16.0, 
    years: 3, 
    openingFeePercent: 2.0, 
    monthlyInsurance: 0, 
    loanType: 'amortized',
    paymentStrategy: 'calculated',
    moratoriumRate: 48.0 
  },
  { 
    id: '2', 
    name: 'REVOLVENTE BANAMEX', 
    principal: 6527242, 
    annualRate: 13.87, 
    years: 3, 
    openingFeePercent: 0, 
    monthlyInsurance: 0, 
    loanType: 'amortized', 
    paymentStrategy: 'manual', 
    manualMonthlyPayment: 254971, 
    moratoriumRate: 48.0 
  },
  { 
    id: '3', 
    name: 'Financiamiento Dueño', 
    principal: 6800000, 
    annualRate: 12.0, 
    years: 3, 
    openingFeePercent: 0, 
    monthlyInsurance: 0, 
    loanType: 'amortized',
    paymentStrategy: 'calculated',
    moratoriumRate: 0 
  },
];

const INITIAL_SETTINGS: GlobalSettings = {
  ivaRate: 16,
  isrRate: 30,
  applyIvaToInterest: true
};

export default function App() {
  const [loans, setLoans] = useState<LoanParams[]>(INITIAL_LOANS);
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);

  const handleUpdateLoan = (index: number, field: keyof LoanParams, value: number | string) => {
    const newLoans = [...loans];
    // @ts-ignore
    newLoans[index][field] = value;
    setLoans(newLoans);
  };

  const handleUpdateSettings = (field: keyof GlobalSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const results = useMemo(() => {
    return loans.map(loan => calculateAmortization(loan, settings));
  }, [loans, settings]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 pb-12">
      {/* Premium Header */}
      <header className="bg-[#2E3A47] border-b border-[#D98918] sticky top-0 z-50 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-[#D98918] p-2 rounded text-[#2E3A47] shadow-inner">
                <Building2 className="w-7 h-7" />
            </div>
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white leading-none">
                  BANCOS <span className="text-[#D98918]">PORTA</span>
                </h1>
                <p className="text-[10px] text-slate-300 font-medium tracking-widest uppercase mt-0.5">
                  PLANEACION FINANCIERA
                </p>
            </div>
          </div>
          
          {/* Detailed Rate Explanation Section */}
          <div className="group relative cursor-help">
             <div className="flex flex-col items-end text-right">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-wider font-bold mb-1">
                   <BarChart3 className="w-3 h-3 text-[#D98918]" /> 
                   Estructura de Tasa
                </span>
                
                <div className="flex items-center bg-slate-800/80 border border-slate-600 rounded-lg p-1 pr-3 pl-2 shadow-inner hover:border-[#D98918] transition-colors">
                    <div className="flex flex-col items-center px-2 border-r border-slate-600 mr-2">
                         <span className="text-[9px] text-slate-400 font-bold">BASE</span>
                         <span className="text-xs font-bold text-[#D98918]">TIIE 11.50%</span>
                    </div>
                    <span className="text-slate-500 font-bold text-lg mr-2">+</span>
                    <div className="flex flex-col items-start">
                         <span className="text-[9px] text-slate-400 font-bold">MARGEN</span>
                         <span className="text-xs font-bold text-white">SPREAD</span>
                    </div>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500 ml-2" />
                </div>
             </div>

             {/* Hover Tooltip */}
             <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                <div className="absolute -top-2 right-8 w-4 h-4 bg-white transform rotate-45 border-t border-l border-slate-200"></div>
                <h4 className="font-bold text-[#2E3A47] text-xs uppercase mb-2 border-b border-slate-100 pb-1">Desglose de Costo Financiero</h4>
                <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                        <span className="font-bold text-[#D98918]">1. TIIE (11.50%)</span>
                        <span className="text-right w-2/3">Tasa de Interés Interbancaria de Equilibrio. El costo base del dinero (Banxico).</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-bold text-[#2E3A47]">2. SPREAD</span>
                        <span className="text-right w-2/3">Sobretasa que cobra el banco según el perfil de riesgo y negocio.</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 font-mono font-bold text-center bg-slate-50 rounded py-1 text-[#2E3A47]">
                        TASA FINAL = TIIE + SPREAD
                    </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* KPI Cards Section */}
        <ResultsSummary results={results} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Input Panel (Compact & Dense) */}
            <div className="xl:col-span-4 flex flex-col gap-6">
                <InputSection 
                    loans={loans} 
                    settings={settings} 
                    onUpdateLoan={handleUpdateLoan} 
                    onUpdateSettings={handleUpdateSettings} 
                />
                
                {/* Financial Context Card - Adjusted for Height */}
                <div className="bg-gradient-to-br from-[#2E3A47] to-[#1e293b] rounded-xl p-6 text-white shadow-lg border-l-4 border-[#D98918] h-auto">
                    <h3 className="flex items-center gap-2 font-bold text-[#D98918] mb-4 text-sm uppercase tracking-wide border-b border-white/10 pb-2">
                        <Lightbulb className="w-4 h-4" />
                        Estrategia & Racional Financiero
                    </h3>
                    
                    <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                        
                        <div className="group">
                            <strong className="text-white block mb-1 text-[11px] uppercase tracking-wider group-hover:text-[#D98918] transition-colors">
                                1. El Factor Límite ($8M vs $6.5M)
                            </strong>
                            <p className="text-justify">
                                Tienes una línea autorizada de <strong>$8 Millones</strong> pero usas solo $6.5M. Esa diferencia ($1.5M) es dinero virtual disponible.
                                <br/>
                                <span className="text-emerald-400 italic">Estrategia:</span> Al refinanciar por el total del límite ($8M) a Tasa Fija, conviertes ese "aire" en <strong>Capital de Trabajo Real (Efectivo)</strong> para operación inmediata.
                            </p>
                        </div>

                        <div className="group">
                            <strong className="text-white block mb-1 text-[11px] uppercase tracking-wider group-hover:text-[#D98918] transition-colors">
                                2. Matar Deuda (Fijo) vs. Rentar Dinero (Variable)
                            </strong>
                            <p className="text-justify">
                                En la <strong>Revolvente</strong>, "rentas" el dinero a <strong>Tasa Variable</strong> (Riesgo de subida) sin bajar necesariamente el capital.
                                En el crédito <strong>Amortizado</strong>, <strong>congelas la tasa</strong> (Certeza) y cada pago reduce obligatoriamente la deuda hasta cero.
                            </p>
                        </div>

                        <div className="group">
                            <strong className="text-white block mb-1 text-[11px] uppercase tracking-wider group-hover:text-[#D98918] transition-colors">
                                3. El Escudo Fiscal (ISR 30%)
                            </strong>
                            <p className="text-justify">
                                No evalúes solo la tasa nominal. El SAT subsidia el costo financiero: por cada $1.00 de interés real pagado, reduces tu base gravable y <strong>ahorras $0.30 de impuestos</strong>. El Costo Neto mostrado ya incluye este beneficio.
                            </p>
                        </div>

                    </div>

                    <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                            <ArrowRightCircle className="w-3 h-3 text-[#D98918]" />
                            Inflación Ref: 4.5%
                        </span>
                        <span>
                           Análisis Bancos Porta ©
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Column: Visual Analytics (Expansive) */}
            <div className="xl:col-span-8 flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-[#2E3A47] flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-[#D98918]" />
                        Proyección de Escenarios
                    </h3>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded font-mono">
                        Proyección a {Math.max(...results.map(r=>r.table.length))} Meses
                    </span>
                </div>
                <div className="flex-1 p-2 min-h-[500px]">
                    <ComparisonChart results={results} />
                </div>
            </div>
        </div>

        {/* Detailed Data Table */}
        <div className="w-full pt-4">
            <DetailedTable results={results} />
        </div>
      </main>
    </div>
  );
}
