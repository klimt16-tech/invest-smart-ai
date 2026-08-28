import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { mockAllocationTargets, mockNotifications, mockPositions } from "@/data/mock";
import type {
  AllocationTarget,
  NotificationSettings,
  PortfolioStatus,
  Position,
} from "@/data/types";
import { computePositions } from "@/services/portfolio.service";

interface AppState {
  positions: Position[];
  addPosition: (p: Omit<Position, "id">) => void;
  importPositions: (p: Omit<Position, "id">[]) => void;
  status: PortfolioStatus;
  setStatus: (s: PortfolioStatus) => void;
  targets: AllocationTarget[];
  setTargetValue: (categoria: string, objetivo: number) => void;
  notifications: NotificationSettings;
  toggleNotification: (key: keyof NotificationSettings) => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [status, setStatus] = useState<PortfolioStatus>("normal");
  const [targets, setTargets] = useState<AllocationTarget[]>(mockAllocationTargets);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications);

  const addPosition = useCallback((p: Omit<Position, "id">) => {
    setPositions((prev) => [...prev, { ...p, id: `p${Date.now()}` }]);
  }, []);

  const importPositions = useCallback((items: Omit<Position, "id">[]) => {
    setPositions((prev) => [
      ...prev,
      ...items.map((p, i) => ({ ...p, id: `imp${Date.now()}${i}` })),
    ]);
  }, []);

  const setTargetValue = useCallback((categoria: string, objetivo: number) => {
    setTargets((prev) => prev.map((t) => (t.categoria === categoria ? { ...t, objetivo } : t)));
  }, []);

  const toggleNotification = useCallback((key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value = useMemo(
    () => ({
      positions,
      addPosition,
      importPositions,
      status,
      setStatus,
      targets,
      setTargetValue,
      notifications,
      toggleNotification,
    }),
    [positions, addPosition, importPositions, status, targets, setTargetValue, notifications, toggleNotification],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppStore debe usarse dentro de AppStoreProvider");
  return ctx;
}

export function usePortfolio() {
  const { positions } = useAppStore();
  return useMemo(() => computePositions(positions), [positions]);
}
