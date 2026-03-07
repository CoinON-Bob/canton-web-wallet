import React, { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';

// ==================== Hero Chart - Web3 Trading UI ====================
// Period switcher 1D/7D/1M/1Y | Mock data | Smooth Bezier | Green gradient | Glow | Tooltip | Line drawing animation

export type ChartPeriod = '1D' | '7D' | '1M' | '1Y';

interface AssetTrendChartProps {
  currentValue: number;
  changePercent: number;
  period?: ChartPeriod;
  onPeriodChange?: (period: ChartPeriod) => void;
  height?: number;
  className?: string;
}

// Mock series: 20 points, slight uptrend (reference from spec)
const MOCK_SERIES = [
  12000, 12200, 12150, 12400, 12800,
  13000, 12900, 13100, 13400, 13800,
  14200, 14000, 14500, 14900, 15200,
  15800, 16200, 16700, 17000, 17500,
];

function generateMockChartData(
  currentValue: number,
  period: ChartPeriod
): { value: number; label: string }[] {
  const now = new Date();
  const len = period === '1D' ? 24 : period === '7D' ? 28 : period === '1M' ? 30 : 24;
  const minVal = Math.min(...MOCK_SERIES);
  const maxVal = Math.max(...MOCK_SERIES);
  const range = maxVal - minVal;

  // Scale mock series to end at currentValue, slight uptrend
  const startVal = (minVal / maxVal) * currentValue * 0.92;

  const points: { value: number; label: string }[] = [];
  for (let i = 0; i <= len; i++) {
    const t = i / len;
    const idx = t * (MOCK_SERIES.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, MOCK_SERIES.length - 1);
    const localT = idx - i0;
    const raw = MOCK_SERIES[i0] * (1 - localT) + MOCK_SERIES[i1] * localT;
    const normalized = (raw - minVal) / range;
    const value = startVal + (currentValue - startVal) * normalized;

    const date = new Date(now);
    if (period === '1D') date.setHours(date.getHours() - (len - i));
    else if (period === '7D') date.setDate(date.getDate() - (len - i));
    else if (period === '1M') date.setDate(date.getDate() - (len - i));
    else date.setMonth(date.getMonth() - (len - i));

    const label =
      period === '1Y'
        ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(period === '1D' ? { hour: '2-digit' } : {}) });

    points.push({ value: Math.max(value, currentValue * 0.85), label });
  }
  return points;
}

// Catmull-Rom to Bezier control points
const catmullRomToBezier = (p0: number, p1: number, p2: number, p3: number, t = 0.5) => {
  const v0 = (p2 - p0) * t;
  const v1 = (p3 - p1) * t;
  return { cp1: p1 + v0 / 3, cp2: p2 - v1 / 3 };
};

const PERIODS: ChartPeriod[] = ['1D', '7D', '1M', '1Y'];

export const AssetTrendChart: React.FC<AssetTrendChartProps> = ({
  currentValue,
  changePercent,
  period = '7D',
  onPeriodChange,
  height = 220,
  className = '',
}) => {
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; value: number; label: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const data = useMemo(
    () => generateMockChartData(currentValue, period),
    [currentValue, period]
  );

  const { pathD, areaPathD, points } = useMemo(() => {
    const padding = { top: 12, right: 8, bottom: 24, left: 8 };
    const w = 400;
    const h = height - padding.top - padding.bottom;
    const values = data.map((d) => d.value);
    const minY = Math.min(...values);
    const maxY = Math.max(...values);
    const rangeY = maxY - minY || 1;
    const scaleY = (v: number) => padding.top + h - ((v - minY) / rangeY) * h;
    const scaleX = (v: number) => padding.left + v * (w - padding.left - padding.right);

    const pts = data.map((d, i) => ({
      x: scaleX(i / (data.length - 1 || 1)),
      y: scaleY(d.value),
      value: d.value,
      label: d.label,
    }));

    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[Math.max(0, i - 2)];
      const p1 = pts[i - 1];
      const p2 = pts[i];
      const p3 = pts[Math.min(pts.length - 1, i + 1)];
      const cx = catmullRomToBezier(p0.x, p1.x, p2.x, p3.x);
      const cy = catmullRomToBezier(p0.y, p1.y, p2.y, p3.y);
      pathD += ` C ${p1.x + (p2.x - p1.x) / 3} ${cy.cp1}, ${p2.x - (p2.x - p1.x) / 3} ${cy.cp2}, ${p2.x} ${p2.y}`;
    }

    const areaPathD = `${pathD} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;

    return { pathD, areaPathD, points: pts };
  }, [data, height]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(x * (points.length - 1));
    const clamped = Math.max(0, Math.min(idx, points.length - 1));
    const p = points[clamped];
    setHoverPoint({ x: p.x, y: p.y, value: p.value, label: p.label });
  };

  const handleMouseLeave = () => setHoverPoint(null);

  return (
    <motion.div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Period switcher - top right */}
      <div className="absolute top-0 right-0 z-10 flex rounded-lg bg-black/20 p-0.5 border border-white/[0.06]">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPeriodChange?.(p)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              p === period
                ? 'bg-[#00E676]/20 text-[#00E676]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.06]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 400 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="chartLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E676" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#00FF88" stopOpacity="1" />
            <stop offset="100%" stopColor="#00E676" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="chartAreaGrad" x1="0%" y1="1" x2="0%" y2="0">
            <stop offset="0%" stopColor="#00E676" stopOpacity="0" />
            <stop offset="40%" stopColor="#00E676" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00E676" stopOpacity="0.2" />
          </linearGradient>
          <filter id="chartGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={areaPathD}
          fill="url(#chartAreaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        <motion.path
          key={period}
          d={pathD}
          fill="none"
          stroke="url(#chartLineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#chartGlow)"
          initial={{ pathLength: 0, opacity: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ strokeDasharray: 1 }}
        />

        {hoverPoint && (
          <g>
            <line
              x1={hoverPoint.x}
              y1={hoverPoint.y}
              x2={hoverPoint.x}
              y2={height}
              stroke="rgba(0, 230, 118, 0.25)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle
              cx={hoverPoint.x}
              cy={hoverPoint.y}
              r="5"
              fill="#00E676"
              opacity="0.9"
              filter="url(#chartGlow)"
            />
          </g>
        )}
      </svg>

      {hoverPoint && (
        <motion.div
          className="absolute pointer-events-none z-10 px-3 py-2 rounded-lg bg-[#0f172a]/95 border border-white/10 shadow-xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            left: `${(hoverPoint.x / 400) * 100}%`,
            top: '8px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-xs text-slate-400 font-medium">{hoverPoint.label}</p>
          <p className="text-sm font-bold text-[#00E676]">
            ${hoverPoint.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AssetTrendChart;
