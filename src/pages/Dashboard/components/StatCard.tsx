import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  data: { v: number }[];
  color: string;
  icon?: ReactNode;
  iconBg?: string;
}

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  const W = 120;
  const H = 36;
  const min = Math.min(...data.map((d) => d.v));
  const max = Math.max(...data.map((d) => d.v));
  const range = max - min || 1;
  const n = data.length;

  const points = data
    .map((d, i) => {
      const x = (i / (n - 1)) * W;
      const y = H - ((d.v - min) / range) * H;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPath = points ? `M0,${H} ${points.split(" ").map((p) => `L${p}`).join(" ")} L${W},${H} Z` : `M0,${H} L${W},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 36 }}>
      <path d={areaPath} fill={color} fillOpacity={0.1} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

export function StatCard({ title, value, data, color, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 flex-1 min-w-0 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        {icon && (
          <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <Sparkline data={data} color={color} />
      </div>
    </div>
  );
}
