import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { statusMeta } from "@/components/common/StatusSelector";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { NotificationSettings, PortfolioStatus } from "@/data/types";

export const Route = createFileRoute("/configuracion")({
  head: () => ({
    meta: [
      { title: "Configuración | INVEST IA" },
      {
        name: "description",
        content: "Define objetivos de asignación, alertas y el estado global de tu cartera en INVEST IA.",
      },
      { property: "og:title", content: "Configuración | INVEST IA" },
      { property: "og:description", content: "Objetivos de asignación y notificaciones en modo demo." },
    ],
  }),
  component: Configuracion,
});

const notifLabels: { key: keyof NotificationSettings; label: string; desc: string }[] = [
  { key: "cartera", label: "Alertas de cartera", desc: "Desviaciones respecto a tus objetivos" },
  { key: "caidas", label: "Alertas de caídas importantes", desc: "Caídas superiores al 5%" },
  { key: "oportunidades", label: "Alertas de oportunidades", desc: "Detección de oportunidades simuladas" },
  { key: "trading", label: "Alertas de trading", desc: "Nuevas señales del bot en simulación" },
  { key: "email", label: "Email", desc: "Recibir avisos por correo" },
  { key: "push", label: "Push", desc: "Notificaciones en el dispositivo" },
];

function Configuracion() {
  const { targets, setTargetValue, notifications, toggleNotification, status, setStatus } = useAppStore();
  const suma = targets.reduce((a, t) => a + t.objetivo, 0);
  const valido = Math.round(suma) === 100;

  return (
    <AppShell title="Configuración" subtitle="Objetivos, alertas y preferencias">
      <section className="panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Objetivos de asignación</h2>
            <p className="text-xs text-muted-foreground">La suma de los objetivos debe ser 100%.</p>
          </div>
          <span
            className={cn(
              "num flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
              valido ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative",
            )}
          >
            {valido ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
            Total {suma.toFixed(0)}%
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-xs text-muted-foreground uppercase">
              <tr className="border-b border-border">
                <th className="py-2 text-left font-medium">Categoría</th>
                <th className="py-2 text-right font-medium">Objetivo</th>
                <th className="py-2 text-right font-medium">Actual</th>
                <th className="py-2 text-right font-medium">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => {
                const diff = t.actual - t.objetivo;
                return (
                  <tr key={t.categoria} className="border-b border-border/60">
                    <td className="py-3 font-medium">{t.categoria}</td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={t.objetivo}
                          onChange={(e) =>
                            setTargetValue(t.categoria, Math.max(0, Math.min(100, Number(e.target.value))))
                          }
                          className="num h-9 w-24 text-right"
                        />
                      </div>
                    </td>
                    <td className="num py-3 text-right text-muted-foreground">{t.actual}%</td>
                    <td
                      className={cn(
                        "num py-3 text-right font-semibold",
                        diff > 0 ? "text-warning" : diff < 0 ? "text-ai" : "text-muted-foreground",
                      )}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            disabled={!valido}
            onClick={() => toast.success("Objetivos guardados", { description: "Cambios aplicados en la sesión." })}
          >
            Guardar objetivos
          </Button>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <h2 className="text-sm font-semibold">Notificaciones</h2>
          <div className="mt-3 divide-y divide-border/60">
            {notifLabels.map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-[11px] font-semibold",
                      notifications[n.key] ? "text-positive" : "text-muted-foreground",
                    )}
                  >
                    {notifications[n.key] ? "Activado" : "Desactivado"}
                  </span>
                  <Switch checked={notifications[n.key]} onCheckedChange={() => toggleNotification(n.key)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <section className="panel p-4">
            <h2 className="text-sm font-semibold">Estado global de cartera</h2>
            <div className="mt-3 grid gap-2">
              {(Object.keys(statusMeta) as PortfolioStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                    status === s ? "border-primary/50 bg-primary/10" : "border-border hover:bg-accent",
                  )}
                >
                  <span className="text-lg">{statusMeta[s].emoji}</span>
                  <span>
                    <span className={cn("font-semibold", statusMeta[s].className)}>{statusMeta[s].label}</span>
                    <span className="block text-xs text-muted-foreground">{statusMeta[s].text}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Seguridad y privacidad
            </h2>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>· No se solicitan ni almacenan credenciales bancarias ni de MyInvestor.</li>
              <li>· No se almacenan claves privadas ni claves API reales.</li>
              <li>· No se ejecutan operaciones financieras reales.</li>
              <li>· El trading automático permanece desactivado hasta una integración autorizada.</li>
            </ul>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
