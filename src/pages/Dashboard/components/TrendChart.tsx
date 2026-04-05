import { useState, useMemo } from "react";
import { Filter, ChevronDown } from "lucide-react";

export interface TrendPoint {
  date: string;
  count: number;
}

interface TrendChartProps {
  data?: TrendPoint[];
  loading?: boolean;
}

const W = 680;
const H = 200;
const PAD_L = 40;
const PAD_R = 10;
const PAD_T = 10;
const PAD_B = 30;

function toPoints(data: number[], min: number, max: number): string {
  const n = data.length;
  if (n < 2) return "";
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R);
      const y = PAD_T + (1 - (v - min) / range) * (H - PAD_T - PAD_B);
      return `${x},${y}`;
    })
    .join(" ");
}

function toAreaPath(data: number[], min: number, max: number): string {
  const n = data.length;
  if (n < 2) return "";
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = PAD_L + (i / (n - 1)) * (W - PAD_L - PAD_R);
    const y = PAD_T + (1 - (v - min) / range) * (H - PAD_T - PAD_B);
    return `${x},${y}`;
  });
  const base = H - PAD_B;
  const startX = PAD_L;
  const endX = PAD_L + (W - PAD_L - PAD_R);
  return `M${startX},${base} L${pts.join(" L")} L${endX},${base} Z`;
}

function formatY(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return `${v}`;
}

export function TrendChart({ data = [], loading = false }: TrendChartProps) {
  const [activeFilters, setActiveFilters] = useState({
    luotXem: true,
  });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; idx: number } | null>(null);

  const displayData = useMemo(() => {
    if (data.length === 0) return Array.from({ length: 30 }, (_, i) => ({ date: `D${i}`, count: 0 }));
    return data;
  }, [data]);

  const allValues = useMemo(() => {
    const vals = displayData.map((d) => d.count);
    const maxVal = Math.max(...vals, 10);
    return { min: 0, max: Math.ceil(maxVal * 1.1) };
  }, [displayData]);

  const { min, max } = allValues;
  const counts = displayData.map((d) => d.count);
  const yTicks = [0, Math.floor(max / 2), max];

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse h-[300px] flex items-center justify-center">
        <span className="text-gray-400">Đang tải dữ liệu biểu đồ...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Biểu Đồ Xu Hướng Lượt Xem (30 Ngày)</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Lọc
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 220 }}
          onMouseLeave={() => setTooltip(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * W;
            const chartW = W - PAD_L - PAD_R;
            const idx = Math.round(((relX - PAD_L) / chartW) * (displayData.length - 1));
            if (idx >= 0 && idx < displayData.length) {
              setTooltip({ x: relX, y: e.clientY - rect.top, idx });
            }
          }}
        >
          {/* Y grid lines */}
          {yTicks.map((tick) => {
            const y = PAD_T + (1 - (tick - min) / (max - min)) * (H - PAD_T - PAD_B);
            return (
              <g key={`ytick-${tick}`}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#f0f0f0" strokeWidth={1} />
                <text x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">
                  {formatY(tick)}
                </text>
              </g>
            );
          })}

          {/* X labels (Show only some to avoid clutter) */}
          {displayData.map((d, i) => {
            if (i % 5 !== 0 && i !== displayData.length - 1) return null;
            const x = PAD_L + (i / (displayData.length - 1)) * (W - PAD_L - PAD_R);
            const dateParts = d.date.split("-");
            const label = dateParts.length > 2 ? `${dateParts[2]}/${dateParts[1]}` : d.date;
            return (
              <text key={`xlabel-${i}`} x={x} y={H - 8} textAnchor="middle" fontSize={9} fill="#9ca3af">
                {label}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={toAreaPath(counts, min, max)} fill="#22c55e" fillOpacity={0.08} />

          {/* Line */}
          <polyline points={toPoints(counts, min, max)} fill="none" stroke="#22c55e" strokeWidth={2} strokeLinejoin="round" />

          {/* Hover line */}
          {tooltip && (() => {
            const x = PAD_L + (tooltip.idx / (displayData.length - 1)) * (W - PAD_L - PAD_R);
            return <line x1={x} y1={PAD_T} x2={x} y2={H - PAD_B} stroke="#d1d5db" strokeWidth={1} strokeDasharray="3 3" />;
          })()}
        </svg>

        {/* Tooltip */}
        {tooltip && (() => {
          const d = displayData[tooltip.idx];
          const xPct = (tooltip.idx / (displayData.length - 1)) * 100;
          return (
            <div
              className="absolute pointer-events-none bg-white rounded-lg shadow-lg border border-gray-100 p-3 z-10 text-xs"
              style={{
                left: `${Math.min(Math.max(xPct, 10), 90)}%`,
                top: 10,
                transform: "translateX(-50%)",
              }}
            >
              <p className="font-semibold text-gray-600 mb-1">{d.date}</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-500">Lượt Xem:</span>
                <span className="font-semibold">{d.count}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">Lượt Xem Hệ Thống</span>
        </div>
      </div>
    </div>
  );
}
