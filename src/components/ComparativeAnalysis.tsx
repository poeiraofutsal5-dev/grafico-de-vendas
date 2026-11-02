import React from 'react';
import { BLOCK_CATALOG, formatUnits, formatBRL } from '@/src/utils/blockCalculations';
import { BarChart3, Sun, CloudRain, Flame, Check, AlertCircle } from 'lucide-react';

interface ComparativeAnalysisProps {
  data: number[];
}

export function ComparativeAnalysis({ data }: ComparativeAnalysisProps) {
  // Approximate years:
  // Last 12 months = 2025/2026
  // Previous 12 months = 2024/2025
  // Previous 12 months = 2023/2024
  const recent12 = data.slice(-12);
  const prev12 = data.slice(-24, -12);
  const older12 = data.slice(-36, -24);

  const sumRecent = recent12.reduce((a, b) => a + b, 0);
  const sumPrev = prev12.reduce((a, b) => a + b, 0);
  const sumOlder = older12.reduce((a, b) => a + b, 0);

  const growthVsPrev = sumPrev > 0 ? Number((((sumRecent - sumPrev) / sumPrev) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-6">
      {/* Product Share Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              Mix de Produtos e Participação nas Vendas da Loja
            </h3>
            <p className="text-xs text-slate-400">
              Distribuição por família de produto na saída da fábrica e estoque
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            5 Categorias Ativas
          </span>
        </div>

        {/* Progress Bar composite */}
        <div className="w-full h-4 rounded-full overflow-hidden bg-slate-800 flex shadow-inner mb-4">
          {BLOCK_CATALOG.map((item) => (
            <div
              key={item.id}
              style={{
                width: `${item.shareOfSales}%`,
                backgroundColor: item.color,
              }}
              title={`${item.name}: ${item.shareOfSales}%`}
              className="h-full transition-all hover:opacity-90"
            />
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {BLOCK_CATALOG.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-bold font-mono text-white">
                  {item.shareOfSales}%
                </span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                {item.name}
              </h4>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Preço: {formatBRL(item.unitPriceBRL)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                {item.dimensions}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Comparison & Seasonality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Volume Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Comparativo de Desempenho por Ciclo Anual
          </h3>
          <p className="text-xs text-slate-400">
            Volume de blocos faturados nos últimos 3 períodos de 12 meses
          </p>

          <div className="space-y-3 mt-4">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Ciclo Atual (Últimos 12 Meses)</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {growthVsPrev >= 0 ? `+${growthVsPrev}%` : `${growthVsPrev}%`} vs anterior
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                {formatUnits(sumRecent)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Faturamento aprox.: {formatBRL(sumRecent * 4.30)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Ciclo Anterior (12 a 24 Meses atrás)</span>
                <span className="text-slate-400 font-mono">12 meses</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                {formatUnits(sumPrev)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Faturamento aprox.: {formatBRL(sumPrev * 4.30)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-300">Ciclo Retrasado (24 a 36 Meses atrás)</span>
                <span className="text-slate-400 font-mono">12 meses</span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                {formatUnits(sumOlder)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Faturamento aprox.: {formatBRL(sumOlder * 4.30)}
              </div>
            </div>
          </div>
        </div>

        {/* Construction Seasonality & Operational Insights */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            Sazonalidade e Dicas de Gestão de Fábrica de Blocos
          </h3>
          <p className="text-xs text-slate-400">
            Comportamento típico do mercado de blocos de concreto e cerâmica
          </p>

          <div className="space-y-3 mt-2">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Alta Temporada (Agosto a Novembro)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Período seco e aceleração de cronograma de obras civis. Historicamente registra os picos mensais (como o recorde de 115.758 blocos). Mantenha agregados e cimento estocados com antecedência.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                <CloudRain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Período Chuvoso & Início de Ano (Janeiro a Março)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Chuva reduz o ritmo de fundações e alvenarias. Período recomendado para manutenção preventiva de esteiras, prensas hidráulicas, moldes de blocos e calibração de balanças de dosagem.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Controle de Cura e Resistência Fck
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Blocos estruturais requerem cura úmida mínima de 7 dias e ensaio com 28 dias para laudo técnico de 4.5 a 6.0 MPa, garantindo aceitação em construtoras e engenharia pública.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
