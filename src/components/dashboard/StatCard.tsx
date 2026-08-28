import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "negative" | "ai";
}) {
  const toneClass = {
    neutral: "text-foreground",
    positive: "text-positive",
    negative: "text-negative",
    ai: "text-ai",
  }[tone];

  return (
    <div className="panel p-4 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <Icon className={cn("size-4", toneClass)} />
      </div>
      <p className={cn("num mt-3 text-2xl font-bold", toneClass)}>{value}</p>
      {hint && <p className="num mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
