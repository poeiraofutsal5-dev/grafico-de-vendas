import React from 'react';
import {
  Boxes,
  DollarSign,
  Trophy,
  Truck,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { formatBRL, formatUnits } from '@/src/utils/blockCalculations';

interface KPICardsProps {
  latestUnits: number;
  latestRevenue: number;
  deltaPct: number;
  recordUnits: number;
  recordDate: string;
  totalHistoricalUnits: number;
  totalHistoricalRevenue: number;
  avgMonthlyUnits: number;
  activeMetric: 'units' | 'revenue';
  onMetricToggle: (metric: 'units' | 'revenue') => void;
}

export function KPICards({
  latestUnits,
  latestRevenue,
  deltaPct,
  recordUnits,
  recordDate,
  totalHistoricalUnits,
  totalHistoricalRevenue,
  avgMonthlyUnits,
  activeMetric,
  onMetricToggle,
}: KPICardsProps) {
  return (
    <div className="space-y-4">
      {/* Metric Mode Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Modo de Exibição:
          </span>
          <span className="text-xs text-slate-400">
            Alternar indicadores entre quantidade física de blocos e faturamento financeiro
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => onMetricToggle('units')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeMetric === 'units'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Unidades (Blocos)
          </button>
          <button
            type="button"
            onClick={() => onMetricToggle('revenue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeMetric === 'revenue'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Faturamento (R$)
          </button>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Último Mês */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Boxes className="w-16 h-16 text-amber-500" />
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Vendas Último Mês (Abr/26)</span>
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                deltaPct >= 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              {deltaPct >= 0 ? `+${deltaPct}%` : `${deltaPct}%`}
            </span>
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {activeMetric === 'units'
              ? formatUnits(latestUnits)
              : formatBRL(latestRevenue)}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>
              {activeMetric === 'units'
                ? `Faturamento: ${formatBRL(latestRevenue)}`
                : `Qtd: ${formatUnits(latestUnits)}`}
            </span>
            <span className="text-slate-400">~{Math.round(latestUnits / 108)} paletes</span>
          </div>
        </div>

        {/* Card 2: Recorde Histórico */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-16 h-16 text-amber-400" />
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Recorde Histórico Mensal</span>
            <span className="text-[11px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
              {recordDate}
            </span>
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {activeMetric === 'units'
              ? formatUnits(recordUnits)
              : formatBRL(recordUnits * 4.30)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Pico de expedição da fábrica durante o aquecimento da construção civil.
          </div>
        </div>

        {/* Card 3: Total Acumulado */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Total Acumulado (10 Anos)</span>
            <span className="text-[11px] text-slate-400">125 meses</span>
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {activeMetric === 'units'
              ? formatUnits(totalHistoricalUnits)
              : formatBRL(totalHistoricalRevenue)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {activeMetric === 'units'
              ? `Equivale a ${formatBRL(totalHistoricalRevenue)} faturados`
              : `Total de ${formatUnits(totalHistoricalUnits)} blocos`}
          </div>
        </div>

        {/* Card 4: Média Mensal */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Truck className="w-16 h-16 text-blue-400" />
          </div>
          <span className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Média Mensal de Expedição</span>
            <span className="text-[11px] text-blue-400 font-mono">Consistência</span>
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-400">
            {activeMetric === 'units'
              ? formatUnits(avgMonthlyUnits)
              : formatBRL(avgMonthlyUnits * 4.30)}
          </div>
          <div className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>Demanda média da loja</span>
            <span>~{Math.round((avgMonthlyUnits * 11.5) / 14000)} trucks/mês</span>
          </div>
        </div>
      </div>
    </div>
  );
}
