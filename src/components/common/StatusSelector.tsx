import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import type { PortfolioStatus } from "@/data/types";

export const statusMeta: Record<
  PortfolioStatus,
  { emoji: string; label: string; text: string; className: string }
> = {
  normal: {
    emoji: "🟢",
    label: "NORMAL",
    text: "Tu cartera se encuentra dentro de los parámetros establecidos.",
    className: "text-positive",
  },
  atencion: {
    emoji: "🟡",
    label: "ATENCIÓN",
    text: "Se han detectado desviaciones respecto a tus objetivos de asignación.",
    className: "text-warning",
  },
  alerta: {
    emoji: "🔴",
    label: "ALERTA",
    text: "Riesgo elevado: volatilidad y concentración por encima de tus límites.",
    className: "text-negative",
  },
};

export function StatusSelector() {
  const { status, setStatus } = useAppStore();
  return (
    <Select value={status} onValueChange={(v) => setStatus(v as PortfolioStatus)}>
      <SelectTrigger className="h-9 w-[9.5rem] bg-surface-2 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="normal">🟢 Normal</SelectItem>
        <SelectItem value="atencion">🟡 Atención</SelectItem>
        <SelectItem value="alerta">🔴 Alerta</SelectItem>
      </SelectContent>
    </Select>
  );
}
