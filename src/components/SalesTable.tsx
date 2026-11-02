import React, { useState, useMemo } from 'react';
import { MonthlyRecord } from '@/src/data/salesData';
import { formatBRL, formatUnits } from '@/src/utils/blockCalculations';
import {
  Search,
  Download,
  Calendar,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface SalesTableProps {
  records: MonthlyRecord[];
  onAddNewClick?: () => void;
}

export function SalesTable({ records, onAddNewClick }: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'index' | 'units' | 'variationPct'>('index');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default newest first
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Extract available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    records.forEach((r) => {
      const match = r.label.match(/'(\d{2})$/);
      if (match) {
        years.add(`20${match[1]}`);
      }
    });
    return Array.from(years).sort().reverse();
  }, [records]);

  // Filter & sort
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesSearch =
          r.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.fullDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.topProduct.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesYear =
          selectedYear === 'ALL' || r.label.includes(`'${selectedYear.slice(-2)}`);

        return matchesSearch && matchesYear;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'index') {
          diff = a.index - b.index;
        } else if (sortField === 'units') {
          diff = a.units - b.units;
        } else if (sortField === 'variationPct') {
          diff = a.variationPct - b.variationPct;
        }
        return sortAsc ? diff : -diff;
      });
  }, [records, searchTerm, selectedYear, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pageRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: 'index' | 'units' | 'variationPct') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Mês/Ano', 'Data Completa', 'Blocos Vendidos (un)', 'Faturamento Estimado (R$)', 'Variação (%)', 'Paletes', 'Peso (Toneladas)', 'Destaque'];
    const rows = filteredRecords.map((r) => [
      `"${r.label}"`,
      `"${r.fullDate}"`,
      r.units,
      r.revenueBRL,
      `${r.variationPct}%`,
      r.palletsCount,
      r.weightTons,
      `"${r.topProduct}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historico_vendas_blocos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            Histórico Mensal de Vendas e Expedição
          </h3>
          <p className="text-xs text-slate-400">
            {records.length} registros computados desde 2016 até o presente momento
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            aria-label="Exportar planilha CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          {onAddNewClick && (
            <button
              type="button"
              onClick={onAddNewClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20"
            >
              + Lançar Novo Mês
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por mês ou produto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 mr-1 shrink-0">Ano:</span>
          <button
            type="button"
            onClick={() => {
              setSelectedYear('ALL');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all shrink-0 ${
              selectedYear === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos
          </button>
          {availableYears.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => {
                setSelectedYear(yr);
                setCurrentPage(1);
              }}
              className={`px-2 py-1 text-xs rounded-lg transition-all shrink-0 font-mono ${
                selectedYear === yr
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('index')}
              >
                <div className="flex items-center gap-1">
                  <span>Período</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('units')}
              >
                <div className="flex items-center gap-1">
                  <span>Blocos Faturados</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Faturamento Estimado</th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('variationPct')}
              >
                <div className="flex items-center gap-1">
                  <span>Variação Mensal</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Paletes Aprox.</th>
              <th className="py-3 px-4">Peso (Ton)</th>
              <th className="py-3 px-4">Produto Destaque</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pageRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  Nenhum registro encontrado para a busca.
                </td>
              </tr>
            ) : (
              pageRecords.map((r) => {
                const isRecord = r.units > 100000;
                return (
                  <tr
                    key={r.index}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isRecord ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{r.label}</span>
                        {isRecord && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-sans">
                            Recorde
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                      {formatUnits(r.units)}
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400">
                      {formatBRL(r.revenueBRL)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                          r.variationPct >= 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {r.variationPct >= 0 ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5" />
                        )}
                        {r.variationPct >= 0 ? `+${r.variationPct}%` : `${r.variationPct}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {r.palletsCount} paletes
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {r.weightTons} T
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {r.topProduct}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-400">
        <div>
          Exibindo {pageRecords.length} de {filteredRecords.length} meses filtrados
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Anterior
          </button>
          <span className="font-mono px-2">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
