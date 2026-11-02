import React, { useState, useEffect, useMemo } from 'react';
import { MultiChart, ChartSeries } from '@/src/registry/spell-ui/chart';
import {
  ProductType,
  PRODUCTS,
  SaleEntry,
  MULTI_STORAGE_KEY,
  addMultiSaleEntry,
  removeSaleEntry,
  aggregateTimeline,
} from '@/src/utils/salesStorage';
import {
  Plus,
  Trash2,
  CheckCircle,
  Boxes,
  Calendar,
  Layers,
  Inbox,
} from 'lucide-react';

export default function App() {
  // Purge any old cache keys so the site is 100% completely zeroed out
  const [salesList, setSalesList] = useState<SaleEntry[]>(() => {
    try {
      localStorage.removeItem('bloco_multi_sales_v2');
      localStorage.removeItem('bloco_sales_data_v1');
      localStorage.removeItem('bloco_sales_live_v3');
      const saved = localStorage.getItem(MULTI_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar vendas:', e);
    }
    // Starts completely zeroed out
    return [];
  });

  // Form states
  const [selectedProduct, setSelectedProduct] = useState<ProductType>('bloco14');
  const todayStr = new Date().toISOString().slice(0, 10);
  const [inputUnits, setInputUnits] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>(todayStr);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MULTI_STORAGE_KEY, JSON.stringify(salesList));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }, [salesList]);

  // Aggregate into timeline points
  const timelinePoints = useMemo(() => aggregateTimeline(salesList), [salesList]);
  const timelineLabels = useMemo(() => timelinePoints.map((p) => p.label), [timelinePoints]);

  // Build the 5 colored lines
  const chartSeries: ChartSeries[] = useMemo(() => {
    return PRODUCTS.map((prod) => {
      const data = timelinePoints.map((p) => p.values[prod.id] || 0);
      return {
        id: prod.id,
        name: prod.name,
        color: prod.color,
        data,
      };
    });
  }, [timelinePoints]);

  // Totals by product
  const productTotals = useMemo(() => {
    const totals: Record<ProductType, number> = {
      bloco14: 0,
      canaleta14: 0,
      bloco9: 0,
      pingadeira: 0,
      pavers: 0,
    };
    for (const s of salesList) {
      totals[s.product] = (totals[s.product] || 0) + s.units;
    }
    return totals;
  }, [salesList]);

  const grandTotal = useMemo(() => {
    return Object.values(productTotals).reduce((a, b) => a + b, 0);
  }, [productTotals]);

  // Register sale
  const handleRegisterSale = (e: React.FormEvent) => {
    e.preventDefault();
    const units = parseInt(inputUnits.replace(/\D/g, ''), 10);
    if (!units || units <= 0) return;

    const updated = addMultiSaleEntry(salesList, selectedProduct, units, inputDate || todayStr);
    setSalesList(updated);
    setInputUnits('');

    const prodInfo = PRODUCTS.find((p) => p.id === selectedProduct);
    setFeedbackMsg(
      `Venda de ${units.toLocaleString('pt-BR')} un de ${prodInfo?.name} registrada e salva!`
    );
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Delete sale
  const handleDeleteSale = (id: string) => {
    const updated = removeSaleEntry(salesList, id);
    setSalesList(updated);
  };

  const activeProductConfig = PRODUCTS.find((p) => p.id === selectedProduct)!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Vendas de Blocos & Artefatos</span>
                <span className="text-[11px] font-medium font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Salvo no Navegador
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Registre suas vendas de blocos conforme for vendendo. O gráfico atualiza e salva na hora.
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total Geral Faturado</span>
            <span className="text-lg font-bold font-mono text-amber-400">
              {grandTotal.toLocaleString('pt-BR')} un
            </span>
          </div>
        </header>

        {/* 5 Product Summary Cards with specified colors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PRODUCTS.map((prod) => {
            const isSelected = selectedProduct === prod.id;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => setSelectedProduct(prod.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-900 shadow-md ring-2 ring-offset-2 ring-offset-slate-950'
                    : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800'
                }`}
                style={{
                  borderColor: prod.color,
                  // @ts-ignore
                  '--tw-ring-color': prod.color,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: prod.color }}
                  />
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold"
                    style={{
                      color: prod.color,
                      backgroundColor: `${prod.color}20`,
                    }}
                  >
                    Linha
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {prod.name}
                </div>
                <div
                  className="text-lg font-bold font-mono mt-0.5"
                  style={{ color: prod.color }}
                >
                  {productTotals[prod.id].toLocaleString('pt-BR')} un
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Registration Form with Item Selector in Header */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <form onSubmit={handleRegisterSale} className="space-y-4">
            {/* Item selector button bar */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Selecione o Item Vendido:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {PRODUCTS.map((prod) => {
                  const isSelected = selectedProduct === prod.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      data-testid={`select-product-${prod.id}`}
                      onClick={() => setSelectedProduct(prod.id)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isSelected ? `${prod.color}25` : undefined,
                        borderColor: isSelected ? prod.color : undefined,
                        color: isSelected ? prod.color : undefined,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: prod.color }}
                      />
                      <span>{prod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs & Submit */}
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 pt-1">
              <div className="flex-1">
                <label
                  htmlFor="sale-units"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Quantidade Vendida ({activeProductConfig.name})
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    id="sale-units"
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder={`Ex: 500, 1000 ${activeProductConfig.name}...`}
                    value={inputUnits}
                    onChange={(e) => setInputUnits(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-14 py-2.5 text-white font-mono text-base focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <span className="absolute right-3 top-3 text-xs font-mono text-slate-500">
                    peças
                  </span>
                </div>
              </div>

              <div className="w-full md:w-52">
                <label
                  htmlFor="sale-date"
                  className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
                >
                  Data da Venda
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    id="sale-date"
                    type="date"
                    required
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                data-testid="submit-sale"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold rounded-xl transition-all shadow-md active:scale-98 shrink-0 text-sm h-[44px]"
                style={{
                  backgroundColor: activeProductConfig.color,
                  color: activeProductConfig.id === 'pavers' ? '#0f172a' : '#020617',
                }}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Registrar Venda</span>
              </button>
            </div>
          </form>

          {feedbackMsg && (
            <div className="mt-3 py-2 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-medium text-emerald-400 flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}
        </div>

        {/* The Multi-Line Chart with all 5 colors */}
        <section aria-label="Gráfico de Vendas das 5 Linhas de Blocos">
          <MultiChart
            series={chartSeries}
            labels={timelineLabels}
            height={420}
          />
        </section>

        {/* Recent Entries */}
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">
              Vendas Registradas ({salesList.length} lançamentos)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Salvas automaticamente
            </span>
          </div>

          {salesList.length === 0 ? (
            <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center">
              <Inbox className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs text-slate-400">Nenhuma venda registrada ainda.</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Utilize o formulário acima para registrar sua primeira venda de blocos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto pr-1">
              {salesList
                .slice()
                .reverse()
                .slice(0, 15)
                .map((item) => {
                  const prod = PRODUCTS.find((p) => p.id === item.product) || PRODUCTS[0];
                  return (
                    <div
                      key={item.id}
                      className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: prod.color }}
                        />
                        <span
                          className="font-semibold text-xs px-2 py-0.5 rounded border"
                          style={{
                            color: prod.color,
                            backgroundColor: `${prod.color}15`,
                            borderColor: `${prod.color}35`,
                          }}
                        >
                          {prod.name}
                        </span>
                        <span className="font-mono text-slate-400">{item.date}</span>
                        <span className="font-bold font-mono text-white text-sm">
                          {item.units.toLocaleString('pt-BR')} un
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSale(item.id)}
                        title={`Excluir venda de ${item.units} ${prod.name}`}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        aria-label={`Excluir venda de ${item.units} ${prod.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
