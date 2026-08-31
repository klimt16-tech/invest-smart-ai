import { Database, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import type { DataMode } from "@/data/types";

const OPTIONS: { value: DataMode; label: string; icon: typeof Database }[] = [
  { value: "DEMO", label: "DEMO", icon: FlaskConical },
  { value: "REAL", label: "REAL", icon: Database },
];

export function ModeSelector() {
  const { mode, setMode } = useAppStore();

  return (
    <div
      role="group"
      aria-label="Modo de datos"
      className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setMode(o.value)}
          aria-pressed={mode === o.value}
          title={
            o.value === "DEMO"
              ? "Datos ficticios de demostración"
              : "Tu cartera real guardada en este dispositivo"
          }
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
            mode === o.value
              ? o.value === "DEMO"
                ? "bg-warning/15 text-warning"
                : "bg-positive/15 text-positive"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <o.icon className="size-3.5" />
          {o.label}
        </button>
      ))}
    </div>
  );
}
