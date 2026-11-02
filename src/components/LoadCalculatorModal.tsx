import React, { useState } from 'react';
import {
  BLOCK_CATALOG,
  calculateWallMaterials,
  formatBRL,
  formatUnits,
  BlockProduct,
} from '@/src/utils/blockCalculations';
import {
  Calculator,
  Truck,
  Layers,
  Weight,
  CheckCircle2,
  Copy,
  Info,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export function LoadCalculator() {
  const [selectedProductId, setSelectedProductId] = useState<string>(BLOCK_CATALOG[0].id);
  const [calcMode, setCalcMode] = useState<'area' | 'dimensions'>('area');
  const [wallArea, setWallArea] = useState<number>(120);
  const [wallLength, setWallLength] = useState<number>(30);
  const [wallHeight, setWallHeight] = useState<number>(2.8);
  const [wastePercentage, setWastePercentage] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedProduct =
    BLOCK_CATALOG.find((p) => p.id === selectedProductId) || BLOCK_CATALOG[0];

  const effectiveArea =
    calcMode === 'area' ? wallArea : Number((wallLength * wallHeight).toFixed(2));

  const result = calculateWallMaterials(effectiveArea, selectedProduct, wastePercentage);

  const handleCopyBudget = () => {
    const text = `*Orçamento de Blocos - Loja de Materiais*
Produto: ${selectedProduct.name} (${selectedProduct.dimensions})
Área Total: ${effectiveArea} m² (Margem de perda: ${wastePercentage}%)
Quantidade de Blocos: ${formatUnits(result.totalBlocksRequired)}
Paletes Fechados: ${result.totalPallets} paletes (${selectedProduct.unitsPerPallet} un/palete)
Peso Estimado: ${result.totalWeightTons} toneladas (${result.totalWeightKg.toLocaleString('pt-BR')} kg)
Transporte Indicado: ${result.recommendedTruck.type} (${result.recommendedTruck.truckTrips} viagem/viagens)
Valor Estimado: ${formatBRL(result.estimatedCostBRL)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">
                Simulador de Cargas, Paletes & Logística para Obras
              </h3>
              <p className="text-xs text-slate-400">
                Calcule a cubagem exata, número de paletes, peso da carga e o caminhão adequado para entrega
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyBudget}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all self-start md:self-center"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Orçamento Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copiar Resumo da Carga</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Product Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Tipo de Bloco / Produto da Loja
            </label>
            <div className="space-y-2">
              {BLOCK_CATALOG.map((prod) => {
                const isSelected = prod.id === selectedProductId;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedProductId(prod.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <span>{prod.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {prod.code}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {prod.dimensions} • {prod.weightKg} kg/un • {prod.unitsPerPallet} un/palete
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-amber-400">
                        {formatBRL(prod.unitPriceBRL)}
                      </div>
                      <div className="text-[10px] text-slate-400">unitário</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area or Dimension mode */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Medição da Obra</span>
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCalcMode('area')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    calcMode === 'area'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Área Direta (m²)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('dimensions')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                    calcMode === 'dimensions'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Comprimento × Altura
                </button>
              </div>
            </div>

            {calcMode === 'area' ? (
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  Área de Paredes ou Pavimento (m²)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={wallArea}
                    onChange={(e) => setWallArea(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-mono text-slate-500">
                    m²
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Comprimento (metros)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={wallLength}
                    onChange={(e) => setWallLength(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Altura / Pé-Direito (metros)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={wallHeight}
                    onChange={(e) => setWallHeight(Number(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Waste Margin */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">
                Margem para Cortes e Quebras na Obra:
              </label>
              <div className="flex gap-2">
                {[0, 5, 8, 10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setWastePercentage(pct)}
                    className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all ${
                      wastePercentage === pct
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    +{pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Results & Logistics */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Quantity */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                Quantidade de Blocos
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {formatUnits(result.totalBlocksRequired)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {selectedProduct.blocksPerM2} blocos/m² • {effectiveArea} m² totais
              </span>
            </div>

            {/* Pallets */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Paletes Fechados
              </span>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                {result.totalPallets} paletes
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {selectedProduct.unitsPerPallet} peças por palete amarrado
              </span>
            </div>

            {/* Weight */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-emerald-400" />
                Peso Bruto da Carga
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {result.totalWeightTons} Toneladas
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {result.totalWeightKg.toLocaleString('pt-BR')} kg de carga útil
              </span>
            </div>

            {/* Budget */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Valor Estimado
              </span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {formatBRL(result.estimatedCostBRL)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Base R$ {selectedProduct.unitPriceBRL.toFixed(2)} por unidade
              </span>
            </div>
          </div>

          {/* Recommended Truck / Logistics Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Logística Recomendada
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                    {result.recommendedTruck.truckTrips}{' '}
                    {result.recommendedTruck.truckTrips === 1 ? 'viagem' : 'viagens'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {result.recommendedTruck.type}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {result.recommendedTruck.description} Limite técnico de até{' '}
                  {(result.recommendedTruck.maxCapacityKg / 1000).toFixed(1)} toneladas por caminhão.
                </p>
              </div>
            </div>
          </div>

          {/* Practical Tips */}
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Dica de Loja:</strong> Para obras com pavimentação e alvenaria mista, confira o estoque de canaletas e meio-blocos para evitar paralisação na concretagem da viga baldrame.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
