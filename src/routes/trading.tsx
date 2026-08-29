import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Activity, Ban, Bot, PlayCircle, ShieldAlert, Target } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dateTimeEs, eur, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import { tradingService, type SimulationResult } from "@/services/trading.service";

export const Route = createFileRoute("/trading")({
  head: () => ({
    meta: [
      { title: "Trading Bot | INVEST IA" },
      {
        name: "description",
        content:
          "Paper trading simulado: modos de operación, métricas, señales y simulador de estrategias. Sin operaciones reales.",
      },
      { property: "og:title", content: "Trading Bot | INVEST IA" },
      { property: "og:description", content: "Señales y paper trading en modo simulación." },
    ],
  }),
  component: Trading,
});

const MODES = [
  {
    id: 1,
    emoji: "🟢",
    titulo: "MODO 1 — SIMULACIÓN",
    estado: "ACTIVO",
    desc: "Paper Trading con dinero ficticio.",
    color: "border-positive/40 bg-positive/10 text-positive",
  },
  {
    id: 2,
    emoji: "🟡",
    titulo: "MODO 2 — COPILOTO",
    estado: "DISPONIBLE",
    desc: "Genera señales y el usuario decide.",
    color: "border-warning/40 bg-warning/10 text-warning",
  },
  {
    id: 3,
    emoji: "🔴",
    titulo: "MODO 3 — AUTOMÁTICO",
    estado: "DESACTIVADO",
    desc: "Requiere conexión con un broker/API compatible.",
    color: "border-negative/40 bg-negative/10 text-negative",
  },
];

function Trading() {
  const metrics = tradingService.getMetrics();
  const last = tradingService.getLastSignal();
  const signals = tradingService.getSignals();

  const [mode, setMode] = useState(1);
  const [filtro, setFiltro] = useState("todas");
  const [capital, setCapital] = useState("10000");
  const [riesgo, setRiesgo] = useState([1]);
  const [activo, setActivo] = useState("S&P 500");
  const [estrategia, setEstrategia] = useState("Tendencia");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const filtered = useMemo(
    () => signals.filter((s) => filtro === "todas" || s.senal === filtro || s.estado === filtro),
    [signals, filtro],
  );

  async function run() {
    setRunning(true);
    setResult(null);
    const r = await tradingService.runSimulation({
      capital: Number(capital) || 1000,
      riesgo: riesgo[0] ?? 1,
      activo,
      estrategia,
    });
    setResult(r);
    setRunning(false);
  }

  return (
    <AppShell title="Trading Bot" subtitle="Paper trading y señales en modo simulación">
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p>Modo demo: no se ejecuta ninguna operación con dinero real ni existe conexión con brokers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            disabled={m.id === 3}
            onClick={() => setMode(m.id)}
            className={cn(
              "panel p-4 text-left transition-all",
              mode === m.id && m.id !== 3 ? "ring-2 ring-primary/40" : "",
              m.id === 3 ? "cursor-not-allowed opacity-60" : "hover:border-primary/40",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg">{m.emoji}</span>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", m.color)}>{m.estado}</span>
            </div>
            <p className="mt-3 text-sm font-semibold">{m.titulo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
          </button>
        ))}
      </div>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Capital simulado" value={eur(metrics.capital)} />
        <Metric label="Rendimiento" value={pct(metrics.rendimiento)} tone="positive" />
        <Metric label="Win Rate" value={`${metrics.winRate}%`} />
        <Metric label="Drawdown máx." value={`${metrics.drawdown}%`} tone="negative" />
        <Metric label="Operaciones" value={String(metrics.operaciones)} />
        <Metric label="Beneficio / Pérdida" value={eur(metrics.pnl)} tone="positive" />
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="panel p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Última señal</h2>
            <span className="rounded-full bg-positive/15 px-2.5 py-0.5 text-xs font-bold text-positive">
              🟢 {last.senal}
            </span>
          </div>
          <p className="mt-3 text-lg font-bold">{last.activo}</p>
          <p className="text-xs text-muted-foreground">{dateTimeEs(last.fecha)}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Confianza" value={`${last.confianza}%`} />
            <Row label="Precio de entrada" value={last.entrada.toLocaleString("es-ES")} />
            <Row label="Stop-Loss" value={last.stopLoss.toLocaleString("es-ES")} tone="negative" />
            <Row label="Take-Profit" value={last.takeProfit.toLocaleString("es-ES")} tone="positive" />
            <Row label="Ratio riesgo/beneficio" value={last.ratio} />
          </dl>
        </section>

        <section className="panel p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Historial de señales</h2>
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="h-9 w-44 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="COMPRA">Compra</SelectItem>
                <SelectItem value="VENTA">Venta</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
                <SelectItem value="Abierta">Abiertas</SelectItem>
                <SelectItem value="Cerrada">Cerradas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                  <th className="py-2 text-left font-medium">Fecha</th>
                  <th className="py-2 text-left font-medium">Activo</th>
                  <th className="py-2 text-left font-medium">Señal</th>
                  <th className="py-2 text-right font-medium">Confianza</th>
                  <th className="py-2 text-right font-medium">Resultado</th>
                  <th className="py-2 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border/50">
                    <td className="num py-3 text-xs text-muted-foreground">{dateTimeEs(s.fecha)}</td>
                    <td className="py-3 font-medium">{s.activo}</td>
                    <td className="py-3">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-xs font-semibold",
                          s.senal === "COMPRA"
                            ? "bg-positive/15 text-positive"
                            : s.senal === "VENTA"
                              ? "bg-negative/15 text-negative"
                              : "bg-surface-2 text-muted-foreground",
                        )}
                      >
                        {s.senal}
                      </span>
                    </td>
                    <td className="num py-3 text-right">{s.confianza}%</td>
                    <td
                      className={cn(
                        "num py-3 text-right",
                        s.resultado === null
                          ? "text-muted-foreground"
                          : s.resultado >= 0
                            ? "text-positive"
                            : "text-negative",
                      )}
                    >
                      {s.resultado === null ? "—" : pct(s.resultado)}
                    </td>
                    <td className="py-3 text-right text-xs text-muted-foreground">{s.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">No hay señales con este filtro.</p>
            )}
          </div>
        </section>
      </div>

      <section className="panel mt-4 p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="size-4 text-ai" /> Simulador de estrategia
        </h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Capital inicial (€)</Label>
              <Input type="number" value={capital} onChange={(e) => setCapital(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Riesgo por operación: {riesgo[0]}%</Label>
              <Slider min={0.5} max={5} step={0.5} value={riesgo} onValueChange={setRiesgo} className="pt-4" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Activo</Label>
              <Select value={activo} onValueChange={setActivo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["S&P 500", "Nasdaq 100", "Oro", "Bonos EU"].map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estrategia</Label>
              <Select value={estrategia} onValueChange={setEstrategia}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Tendencia", "Reversión a la media", "Momentum", "Breakout"].map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button onClick={run} disabled={running} className="w-full gap-2">
                <PlayCircle className="size-4" />
                {running ? "Ejecutando simulación…" : "Ejecutar simulación"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4">
            {running ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : result ? (
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-positive">
                  <Target className="size-4" /> Resultado simulado
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <Metric small label="Capital final" value={eur(result.capitalFinal)} />
                  <Metric small label="Rendimiento" value={pct(result.rendimiento)} tone={result.rendimiento >= 0 ? "positive" : "negative"} />
                  <Metric small label="Operaciones" value={String(result.operaciones)} />
                  <Metric small label="Win rate" value={`${result.winRate}%`} />
                  <Metric small label="Drawdown" value={`${result.drawdown}%`} tone="negative" />
                  <Metric small label="Mejor / Peor" value={`${result.mejor}% / ${result.peor}%`} />
                </div>
              </div>
            ) : (
              <div className="grid h-full min-h-40 place-items-center text-center text-xs text-muted-foreground">
                <div>
                  <Activity className="mx-auto mb-2 size-6 opacity-60" />
                  Configura los parámetros y ejecuta la simulación para ver los resultados.
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Ban className="size-3" /> Resultados ficticios. No constituyen recomendación de inversión.
        </p>
      </section>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  tone = "neutral",
  small,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  small?: boolean;
}) {
  const cls = tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground";
  return (
    <div className={cn(!small && "panel p-4")}>
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className={cn("num mt-1 font-bold", small ? "text-base" : "text-xl", cls)}>{value}</p>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "positive" | "negative" }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "num text-sm font-medium",
          tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
