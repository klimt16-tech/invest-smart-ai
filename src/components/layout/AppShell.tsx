import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  Bot,
  LineChart,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { StatusSelector } from "@/components/common/StatusSelector";
import { ModeSelector } from "@/components/common/ModeSelector";
import { useAppStore } from "@/store/app-store";


interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/cartera", label: "Mi Cartera", icon: Wallet },
  { to: "/asistentes", label: "Asistentes IA", icon: Bot },
  { to: "/trading", label: "Trading Bot", icon: LineChart },
  { to: "/configuracion", label: "Configuración", icon: Settings },
];

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
        <Sparkles className="size-5" />
      </div>
      <div className="leading-tight">
        <p className="text-base font-bold tracking-tight">INVEST IA</p>
        <p className="text-[11px] text-muted-foreground">Tu asistente inteligente de inversiones</p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { mode } = useAppStore();


  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-border bg-surface-2 p-3 text-xs text-muted-foreground">
          <p className={cn("font-semibold", mode === "DEMO" ? "text-warning" : "text-positive")}>
            MODO {mode}
          </p>
          <p className="mt-1">
            {mode === "DEMO"
              ? "Datos ficticios. Sin cuentas bancarias, brokers ni operaciones reales."
              : "Tu cartera real guardada en este dispositivo. Nunca se piden credenciales ni se ejecutan órdenes."}
          </p>
        </div>

      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="lg:hidden">
              <Brand />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
              <StatusSelector />
              <Link
                to="/configuracion"
                aria-label="Configuración"
                className="grid size-9 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-primary ring-1 ring-border transition-colors hover:bg-accent"
              >
                RN
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pt-4 pb-28 sm:px-6 lg:pb-10">
          <div className="mb-4 lg:hidden">
            <h1 className="text-lg font-bold">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden">
        <ul className="grid grid-cols-5">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("size-5", active && "drop-shadow")} />
                  <span className="truncate px-1">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
