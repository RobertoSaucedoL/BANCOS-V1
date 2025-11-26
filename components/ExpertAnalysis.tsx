
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LoanResult, GlobalSettings } from '../types';
import { BrainCircuit, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
  results: LoanResult[];
  settings: GlobalSettings;
}

export const ExpertAnalysis: React.FC<Props> = ({ results, settings }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const minPrincipal = Math.min(...results.map(r => r.params.principal));

      const prompt = `
        Actúa como un Director Financiero (CFO) experto en Banca Pyme México (Citibanamex/Banamex). 
        
        SITUACIÓN DEL USUARIO:
        Tiene una deuda actual de aprox $${minPrincipal} (visible en la opción de menor monto).
        Está considerando tomar un crédito mayor (visible en las opciones de mayor monto) para:
        1. Liquidar la deuda actual.
        2. Quedarse con la diferencia como Capital de Trabajo (Apalancamiento/Flujo).

        Contexto Fiscal:
        - Tasa ISR: ${settings.isrRate}% (Escudo fiscal)
        - IVA en intereses: ${settings.applyIvaToInterest ? 'SÍ (16%)' : 'NO'}
        
        DATOS DE LAS OPCIONES:
        ${results.map((r, i) => {
            const extraCash = r.params.principal - minPrincipal;
            const actualDuration = r.table.length;
            const years = (actualDuration / 12).toFixed(1);
            return `
          OPCIÓN ${i + 1}: ${r.params.name}
          - Monto Crédito: $${r.params.principal}
          - **Dinero Libre (Apalancamiento)**: $${extraCash > 1000 ? extraCash.toFixed(2) : '0 (Solo Refinancia)'}
          - Pago Mensual: $${r.table[0].totalMonthlyOutflow.toFixed(2)}
          - Estrategia Pago: ${r.params.paymentStrategy === 'manual' ? `Fijo Manual de Usuario` : 'Calculado Estándar'}
          - **TIEMPO REAL PARA LIQUIDAR**: ${actualDuration} Meses (${years} Años)
          - Saldo al Final: $${r.summary.remainingBalance.toFixed(2)}
          - Intereses Totales Pagados: $${r.summary.totalInterest.toFixed(2)}
            `;
        }).join('\n')}

        INSTRUCCIONES DE ANÁLISIS:
        1. **Comparativa de Tiempos**: Resalta drásticamente si una opción tarda mucho más en pagarse que la otra (Ej: 36 meses vs X meses).
        2. **Análisis de Apalancamiento**: ¿Vale la pena pagar intereses sobre el monto total para tener ese dinero extra en caja? 
        3. **Riesgo "Deuda Viva"**: Si alguna opción deja deuda al final o tarda más de 5 años, márcalo como riesgo alto.
        4. **Recomendación Directa**: Si la empresa necesita flujo, ¿qué opción recomiendas? Si la empresa quiere salir de deudas, ¿cuál?
        
        Usa formato Markdown. Sé conciso, numérico y estratégico.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAnalysis(response.text || "No se pudo generar el análisis.");
    } catch (err) {
      setError("Error conectando con el experto IA. Verifica tu API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-[#D98918]/20 overflow-hidden mt-6">
      <div className="bg-[#2E3A47] p-4 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-[#D98918]" />
          CFO Virtual: Análisis de Apalancamiento & Tiempos
        </h3>
        {!analysis && !loading && (
          <button
            onClick={generateAnalysis}
            className="flex items-center gap-2 bg-[#D98918] hover:bg-[#b87314] text-white text-xs font-bold py-2 px-4 rounded-full transition-all shadow-lg animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            EVALUAR ESTRATEGIA
          </button>
        )}
      </div>

      <div className="p-6 min-h-[120px]">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#D98918] mb-2" />
            <p>Proyectando tiempos de pago y costo de apalancamiento...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!analysis && !loading && !error && (
            <div className="text-center text-slate-500 py-4">
                <p>Haz clic para que la IA evalúe si te conviene tomar el dinero extra o quedarte como estás.</p>
            </div>
        )}

        {analysis && (
          <div className="prose prose-sm max-w-none text-slate-700">
            <div dangerouslySetInnerHTML={{ 
                __html: analysis
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#2E3A47]">$1</strong>')
                    .replace(/### (.*?)\n/g, '<h3 class="text-[#D98918] font-bold text-lg mt-4 mb-2">$1</h3>')
                    .replace(/- (.*?)\n/g, '<li class="ml-4">$1</li>')
                    .replace(/\n/g, '<br />')
            }} />
             <button
                onClick={generateAnalysis}
                className="mt-6 text-xs text-slate-400 underline hover:text-[#D98918]"
              >
                Regenerar análisis con nuevos datos
              </button>
          </div>
        )}
      </div>
    </div>
  );
};
