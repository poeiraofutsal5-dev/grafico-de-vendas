import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  generateSmoothPath,
  generateAreaPath,
  filterDataByRange,
  Point,
} from '@/src/utils/chartMath';
import { Calendar, Eye, EyeOff, BarChart2 } from 'lucide-react';

export type TimeRange = '1M' | '6M' | '1Y' | '2Y' | '5Y' | 'ALL';

export interface ChartSeries {
  id: string;
  name: string;
  color: string;
  data: number[];
}

export interface MultiChartProps {
  series: ChartSeries[];
  labels: string[];
  height?: number;
  className?: string;
  defaultRange?: TimeRange;
  formatValue?: (v: number) => string;
}

export function MultiChart({
  series,
  labels,
  height = 420,
  className = '',
  defaultRange = 'ALL',
  formatValue = (v: number) => `${v.toLocaleString('pt-BR')} un`,
}: MultiChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [selectedRange, setSelectedRange] = useState<TimeRange>(defaultRange);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeSeriesIds, setActiveSeriesIds] = useState<string[]>(() =>
    series.map((s) => s.id)
  );
  const [focusedSeriesId, setFocusedSeriesId] = useState<string | null>(null);

  useEffect(() => {
    setActiveSeriesIds((prev) => {
      const existing = new Set(prev);
      const allIds = series.map((s) => s.id);
      return allIds.filter((id) => existing.size === 0 || existing.has(id));
    });
  }, [series]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.round(entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const hasData = labels.length > 0 && series.some((s) => s.data.some((v) => v > 0));

  const { filteredSeries, filteredLabels } = useMemo(() => {
    if (series.length === 0 || labels.length === 0) {
      return { filteredSeries: series, filteredLabels: [] };
    }

    const firstSeries = series[0];
    const rangeResult = filterDataByRange(firstSeries.data, selectedRange);
    const startIndex = rangeResult.startIndex;

    const slicedSeries = series.map((s) => ({
      ...s,
      data: s.data.slice(startIndex),
    }));

    return {
      filteredSeries: slicedSeries,
      filteredLabels: labels.slice(startIndex),
    };
  }, [series, labels, selectedRange]);

  const visibleSeries = useMemo(() => {
    return filteredSeries.filter((s) => activeSeriesIds.includes(s.id));
  }, [filteredSeries, activeSeriesIds]);

  const { globalMax, globalMin } = useMemo(() => {
    let max = 10;
    let min = 0;
    for (const s of visibleSeries) {
      for (const v of s.data) {
        if (v > max) max = v;
      }
    }
    return { globalMax: max, globalMin: min };
  }, [visibleSeries]);

  const padding = { top: 35, right: 30, bottom: 45, left: 30 };
  const usableWidth = Math.max(10, containerWidth - padding.left - padding.right);
  const usableHeight = Math.max(10, height - padding.top - padding.bottom);
  const rangeY = Math.max(1, globalMax - globalMin);

  const computedSeriesData = useMemo(() => {
    const dataLen = filteredLabels.length;
    if (dataLen === 0) return [];

    return visibleSeries.map((s) => {
      const points: Point[] = s.data.map((val, i) => {
        const x =
          dataLen === 1
            ? padding.left + usableWidth / 2
            : padding.left + (i / Math.max(1, dataLen - 1)) * usableWidth;
        const normalizedY = (val - globalMin) / rangeY;
        const y = padding.top + usableHeight * (1 - normalizedY);
        return { x, y };
      });

      return {
        ...s,
        points,
        linePath: generateSmoothPath(points),
        areaPath: generateAreaPath(points, height - padding.bottom),
      };
    });
  }, [
    visibleSeries,
    filteredLabels.length,
    padding.left,
    padding.top,
    padding.bottom,
    usableWidth,
    usableHeight,
    globalMin,
    rangeY,
    height,
  ]);

  const activeIdx =
    hoverIndex !== null && hoverIndex >= 0 && hoverIndex < filteredLabels.length
      ? hoverIndex
      : Math.max(0, filteredLabels.length - 1);

  const activeLabel = filteredLabels[activeIdx] || '';

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!containerRef.current || filteredLabels.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const dataLen = filteredLabels.length;
    if (dataLen <= 1) {
      setHoverIndex(0);
      return;
    }

    const relX = Math.max(0, Math.min(usableWidth, x - padding.left));
    const closestIdx = Math.round((relX / usableWidth) * (dataLen - 1));
    setHoverIndex(Math.max(0, Math.min(dataLen - 1, closestIdx)));
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
  };

  const toggleSeries = (id: string) => {
    setActiveSeriesIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  const xAxisTicks = useMemo(() => {
    const dataLen = filteredLabels.length;
    if (dataLen === 0) return [];
    if (dataLen <= 6) {
      return filteredLabels.map((lbl, idx) => ({
        label: lbl,
        x:
          dataLen === 1
            ? padding.left + usableWidth / 2
            : padding.left + (idx / Math.max(1, dataLen - 1)) * usableWidth,
      }));
    }
    const count = 6;
    const step = (dataLen - 1) / (count - 1);
    const ticks: { label: string; x: number }[] = [];

    for (let i = 0; i < count; i++) {
      const idx = Math.round(i * step);
      if (filteredLabels[idx]) {
        ticks.push({
          label: filteredLabels[idx],
          x: padding.left + (idx / (dataLen - 1)) * usableWidth,
        });
      }
    }
    return ticks;
  }, [filteredLabels, padding.left, usableWidth]);

  const gridLines = useMemo(() => {
    return [
      { y: padding.top, value: globalMax },
      { y: padding.top + usableHeight * 0.5, value: Math.round(globalMax * 0.5) },
      { y: padding.top + usableHeight, value: globalMin },
    ];
  }, [padding.top, usableHeight, globalMax, globalMin]);

  const activeX =
    filteredLabels.length > 1
      ? padding.left + (activeIdx / (filteredLabels.length - 1)) * usableWidth
      : padding.left + usableWidth / 2;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950 border border-slate-800 shadow-2xl p-5 md:p-6 text-slate-100 select-none ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {activeLabel || 'Sem vendas registradas'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Gráfico Multi-Linhas
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-wide">
            Evolução de Vendas por Tipo de Bloco
          </h3>
          <p className="text-xs text-slate-400">
            {hasData
              ? 'Passe o mouse no gráfico para ver as vendas de cada linha no período'
              : 'Registre sua primeira venda no formulário acima para iniciar o traçado'}
          </p>
        </div>

        {hasData && (
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            {(['1M', '6M', '1Y', '2Y', '5Y', 'ALL'] as TimeRange[]).map((range) => {
              const isActive = selectedRange === range;
              const labelsMap: Record<TimeRange, string> = {
                '1M': '1M',
                '6M': '6M',
                '1Y': '1 Ano',
                '2Y': '2 Anos',
                '5Y': '5 Anos',
                ALL: 'Tudo',
              };
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => {
                    setSelectedRange(range);
                    setHoverIndex(null);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {labelsMap[range]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend with colored buttons */}
      <div className="flex items-center gap-2 flex-wrap pb-3 mb-2 border-b border-slate-800/70">
        <span className="text-xs font-semibold text-slate-400 mr-1">Linhas:</span>
        {series.map((s) => {
          const isVisible = activeSeriesIds.includes(s.id);
          const isFocused = focusedSeriesId === s.id;
          const currentValue = hasData ? s.data[activeIdx] || 0 : 0;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSeries(s.id)}
              onMouseEnter={() => setFocusedSeriesId(s.id)}
              onMouseLeave={() => setFocusedSeriesId(null)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isVisible
                  ? isFocused
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-950/80 text-slate-200 border-slate-700'
                  : 'bg-slate-950/30 text-slate-600 border-slate-800/60 line-through opacity-50'
              }`}
              style={{
                borderColor: isVisible ? s.color : undefined,
              }}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: s.color }}
              />
              <span className="font-semibold">{s.name}</span>
              <span className="font-mono text-[11px] font-bold" style={{ color: s.color }}>
                {formatValue(currentValue)}
              </span>
              {isVisible ? (
                <Eye className="w-3 h-3 text-slate-500 ml-0.5" />
              ) : (
                <EyeOff className="w-3 h-3 text-slate-700 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Canvas or Empty State */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/40">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-3 border border-amber-500/20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">Site Zerado • Pronto para Novos Registros</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Todas as vendas foram zeradas. Utilize o seletor acima para escolher o produto, digite a quantidade e clique em <strong>Registrar Venda</strong> para começar seu gráfico.
            </p>
          </div>
        ) : (
          <>
            <svg
              width="100%"
              height={height}
              viewBox={`0 0 ${containerWidth} ${height}`}
              className="overflow-visible cursor-crosshair touch-none"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              {gridLines.map((gl, i) => (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={gl.y}
                    x2={containerWidth - padding.right}
                    y2={gl.y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                    strokeOpacity="0.35"
                  />
                  <text
                    x={containerWidth - padding.right}
                    y={gl.y - 6}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono select-none"
                  >
                    {formatValue(gl.value)}
                  </text>
                </g>
              ))}

              {computedSeriesData.map((s) => (
                <path
                  key={`area-${s.id}`}
                  d={s.areaPath}
                  fill={s.color}
                  fillOpacity={focusedSeriesId === s.id ? 0.18 : 0.04}
                  className="transition-all duration-200"
                />
              ))}

              {computedSeriesData.map((s) => {
                const isFaded = focusedSeriesId && focusedSeriesId !== s.id;
                return (
                  <path
                    key={`line-${s.id}`}
                    d={s.linePath}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={focusedSeriesId === s.id ? 3.5 : 2.5}
                    strokeOpacity={isFaded ? 0.25 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-200 drop-shadow-md"
                  />
                );
              })}

              {activeX && (
                <g>
                  <line
                    x1={activeX}
                    y1={padding.top}
                    x2={activeX}
                    y2={height - padding.bottom}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    strokeOpacity="0.75"
                  />

                  {computedSeriesData.map((s) => {
                    const pt = s.points[activeIdx];
                    if (!pt) return null;
                    return (
                      <g key={`pt-${s.id}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="6"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="2"
                          strokeOpacity="0.8"
                        />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3.5"
                          fill={s.color}
                        />
                      </g>
                    );
                  })}
                </g>
              )}

              <line
                x1={padding.left}
                y1={height - padding.bottom}
                x2={containerWidth - padding.right}
                y2={height - padding.bottom}
                stroke="#334155"
                strokeWidth="1"
                strokeOpacity="0.6"
              />

              {xAxisTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={tick.x}
                    y1={height - padding.bottom}
                    x2={tick.x}
                    y2={height - padding.bottom + 4}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <text
                    x={tick.x}
                    y={height - padding.bottom + 18}
                    textAnchor="middle"
                    className="text-[11px] fill-slate-400 font-mono font-medium select-none"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}
            </svg>

            {hoverIndex !== null && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 bg-slate-900/95 text-white border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md z-10 whitespace-nowrap text-xs transition-all duration-75 min-w-[200px]"
                style={{
                  left: Math.max(110, Math.min(containerWidth - 110, activeX)),
                  top: 15,
                }}
              >
                <div className="font-mono font-bold text-slate-200 border-b border-slate-800 pb-1 mb-2 flex items-center justify-between">
                  <span>{activeLabel}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Total: {formatValue(
                      series.reduce((sum, s) => sum + (s.data[activeIdx] || 0), 0)
                    )}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {series.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-slate-300">{s.name}:</span>
                      </div>
                      <span className="font-mono font-bold" style={{ color: s.color }}>
                        {formatValue(s.data[activeIdx] || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
        <span>
          {hasData
            ? 'Arraste o cursor para inspecionar todas as 5 linhas simultaneamente'
            : '0 lançamentos ativos'}
        </span>
        <span className="font-mono">{filteredLabels.length} períodos</span>
      </div>
    </div>
  );
}

export interface SingleChartProps {
  data: number[];
  labels: string[];
  name?: string;
  formatValue?: (v: number) => string;
  accentColor?: string;
}

export function Chart({
  data,
  labels,
  name = 'Vendas',
  formatValue,
  accentColor = '#eab308',
}: SingleChartProps) {
  const series: ChartSeries[] = [
    {
      id: 'default',
      name,
      color: accentColor,
      data,
    },
  ];

  return (
    <MultiChart
      series={series}
      labels={labels}
      formatValue={formatValue}
    />
  );
}

export default MultiChart;
