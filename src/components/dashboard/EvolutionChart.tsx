import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { eur, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { portfolioService } from "@/services/portfolio.service";
import { useAppStore } from "@/store/app-store";
import type { Period, SeriesPoint } from "@/data/types";


const PERIODS: Period[] = ["1D", "1M", "1A", "Histórico"];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as SeriesPoint;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold">{p.fecha}</p>
      <p className="num mt-1 text-foreground">Patrimonio: {eur(p.patrimonio)}</p>
      <p className={cn("num", p.variacion >= 0 ? "text-positive" : "text-negative")}>
        Variación: {pct(p.variacion)}
      </p>
    </div>
  );
}

export function EvolutionChart() {
  const [period, setPeriod] = useState<Period>("1M");
  const [data, setData] = useState<SeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { mode } = useAppStore();

  useEffect(() => {
    if (mode === "REAL") {
      setData([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    portfolioService.getSeries(period).then((d) => {
      if (!alive) return;
      setData(d);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [period, mode]);

  return (
    <section className="panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Evolución del patrimonio</h2>
          <p className="text-xs text-muted-foreground">
            {mode === "REAL" ? "Datos reales · sin histórico todavía" : `Datos simulados · periodo ${period}`}
          </p>
        </div>

        <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === p
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--positive)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--positive)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                minTickGap={16}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => `${Math.round(Number(v) / 100) / 10}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="patrimonio"
                stroke="var(--positive)"
                strokeWidth={2}
                fill="url(#patGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
