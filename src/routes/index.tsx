import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Coins, Minus, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { EvolutionChart } from "@/components/dashboard/EvolutionChart";
import { statusMeta } from "@/components/common/StatusSelector";
import { Progress } from "@/components/ui/progress";
import { eur, pct, signedEur, toneClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { allocationByType, portfolioSummary, subPortfolios } from "@/services/portfolio.service";
import { usePortfolio, useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | INVEST IA" },
      {
        name: "description",
        content:
          "Panel financiero de INVEST IA: patrimonio, evolución, distribución de activos y estado de cartera con datos simulados.",
      },
      { property: "og:title", content: "Dashboard | INVEST IA" },
      {
        property: "og:description",
        content: "Tu asistente inteligente de inversiones. Panel de control financiero en modo demo.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const rows = usePortfolio();
  const { status } = useAppStore();
  const summary = portfolioSummary(rows);
  const allocation = allocationByType(rows);
  const subs = subPortfolios(rows);
  const meta = statusMeta[status];

  return (
    <AppShell title="Dashboard" subtitle="Resumen general de tu patrimonio">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Patrimonio Total" value={eur(summary.patrimonio)} icon={Wallet} hint="Actualizado hoy" />
        <StatCard
          label="Ganancia / Pérdida"
          value={signedEur(summary.pnl)}
          hint={pct(summary.rentabilidad)}
          icon={TrendingUp}
          tone={summary.pnl >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Beneficios Acumulados"
          value={signedEur(summary.beneficios)}
          icon={Coins}
          tone="positive"
          hint="Desde el inicio"
        />
        <StatCard label="Aportaciones" value={eur(summary.aportaciones)} icon={PiggyBank} hint="Capital aportado" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EvolutionChart />
        </div>

        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Distribución de activos</h2>
          <div className="mt-4 space-y-4">
            {allocation.map((a, i) => (
              <div key={a.tipo}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{a.tipo}</span>
                  <span className="num text-muted-foreground">
                    {eur(a.valor)} · {a.peso.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={a.peso}
                  className="mt-2 h-2 bg-surface-2"
                  style={{ ["--chart" as string]: `var(--chart-${(i % 5) + 1})` }}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-4">
        <h2 className="mb-3 text-sm font-semibold">Subcarteras MyInvestor</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {subs.map((s) => {
            const Icon = s.tendencia === "up" ? ArrowUpRight : s.tendencia === "down" ? ArrowDownRight : Minus;
            return (
              <div key={s.id} className="panel p-4 transition-colors hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{s.nombre}</p>
                  <Icon className={cn("size-4", toneClass(s.rentabilidad))} />
                </div>
                <p className="num mt-3 text-lg font-bold">{eur(s.valor)}</p>
                <p className={cn("num text-xs", toneClass(s.rentabilidad))}>{pct(s.rentabilidad)}</p>
                <p className="num mt-2 text-xs text-muted-foreground">{s.peso.toFixed(1)}% de la cartera</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <p className={cn("text-sm font-bold tracking-wide", meta.className)}>
              ESTADO DE CARTERA: {meta.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{meta.text}</p>
          </div>
        </div>
        <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
          MODO DEMO
        </span>
      </section>
    </AppShell>
  );
}
