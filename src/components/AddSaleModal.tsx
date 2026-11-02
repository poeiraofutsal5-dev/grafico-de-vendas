import React, { useState } from 'react';
import { X, Plus, Calendar, DollarSign, Layers } from 'lucide-react';
import { formatBRL, formatUnits } from '@/src/utils/blockCalculations';

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSale: (units: number, monthLabel: string) => void;
  lastLabel: string;
}

export function AddSaleModal({
  isOpen,
  onClose,
  onAddSale,
  lastLabel,
}: AddSaleModalProps) {
  const [units, setUnits] = useState<number>(78000);
  const [monthLabel, setMonthLabel] = useState<string>('Mai \'26');
  const [pricePerUnit, setPricePerUnit] = useState<number>(4.30);

  if (!isOpen) return null;

  const estimatedTotal = units * pricePerUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (units <= 0 || !monthLabel.trim()) return;
    onAddSale(units, monthLabel.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Fechar janela"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 id="modal-title" className="text-base font-bold text-white">
              Lançar Novo Fechamento Mensal
            </h3>
            <p className="text-xs text-slate-400">
              Último mês registrado: <span className="font-mono text-amber-400">{lastLabel}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Identificação do Mês / Ano
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={monthLabel}
                onChange={(e) => setMonthLabel(e.target.value)}
                placeholder="Ex: Mai '26"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Formato recomendado: Mês 'Ano (ex: Mai '26, Jun '26)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Total de Blocos Vendidos no Mês (unidades)
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="number"
                required
                min="1"
                step="1"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Preço Médio Praticado por Bloco (R$)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="number"
                min="0.1"
                step="0.05"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value) || 4.30)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Summary Preview */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Volume Digitado:</span>
              <span className="font-mono text-white font-bold">{formatUnits(units)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Estimativa Faturamento:</span>
              <span className="font-mono text-amber-400 font-bold">{formatBRL(estimatedTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Paletes de Carga:</span>
              <span className="font-mono text-blue-400">~{Math.round(units / 108)} paletes</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
            >
              Adicionar ao Gráfico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
