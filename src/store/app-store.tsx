import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockAllocationTargets, mockNotifications, mockPositions } from "@/data/mock";
import type {
  AllocationTarget,
  DataMode,
  Movimiento,
  NotificationSettings,
  PortfolioStatus,
  Position,
} from "@/data/types";
import { computePositions } from "@/services/portfolio.service";
import { persistenceService } from "@/services/persistence.service";

const MODE_KEY = "invest-ia:mode:v1";

interface AppState {
  mode: DataMode;
  setMode: (m: DataMode) => void;
  loadingReal: boolean;
  /** Posiciones del modo activo. */
  positions: Position[];
  movimientos: Movimiento[];
  addPosition: (p: Omit<Position, "id">) => void;
  importPositions: (p: Omit<Position, "id">[], m?: Omit<Movimiento, "id">[]) => void;
  clearReal: () => void;
  status: PortfolioStatus;
  setStatus: (s: PortfolioStatus) => void;
  targets: AllocationTarget[];
  setTargetValue: (categoria: string, objetivo: number) => void;
  notifications: NotificationSettings;
  toggleNotification: (key: keyof NotificationSettings) => void;
}

// Se guarda en globalThis para evitar que el code-splitting cree dos
// instancias distintas del contexto (provider en un chunk, consumidor en otro).
const globalKey = "__invest_ia_app_store_ctx__";
const globalRef = globalThis as unknown as Record<string, unknown>;
const Ctx = (globalRef[globalKey] as React.Context<AppState | null>) ??
  (globalRef[globalKey] = createContext<AppState | null>(null));

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DataMode>("DEMO");
  const [loadingReal, setLoadingReal] = useState(false);
  const [demoPositions, setDemoPositions] = useState<Position[]>(mockPositions);
  const [realPositions, setRealPositions] = useState<Position[]>([]);
  const [realMovimientos, setRealMovimientos] = useState<Movimiento[]>([]);
  const [status, setStatus] = useState<PortfolioStatus>("normal");
  const [targets, setTargets] = useState<AllocationTarget[]>(mockAllocationTargets);
  const [notifications, setNotifications] = useState<NotificationSettings>(mockNotifications);

  // Carga inicial del modo y de la cartera real persistida.
  useEffect(() => {
    const saved = window.localStorage.getItem(MODE_KEY);
    if (saved === "REAL" || saved === "DEMO") setModeState(saved);
    setLoadingReal(true);
    persistenceService
      .load()
      .then((d) => {
        setRealPositions(d.positions);
        setRealMovimientos(d.movimientos);
      })
      .finally(() => setLoadingReal(false));
  }, []);

  const persistReal = useCallback((positions: Position[], movimientos: Movimiento[]) => {
    void persistenceService.save({ positions, movimientos, targets: null });
  }, []);

  const setMode = useCallback((m: DataMode) => {
    setModeState(m);
    window.localStorage.setItem(MODE_KEY, m);
  }, []);

  const addPosition = useCallback(
    (p: Omit<Position, "id">) => {
      const item: Position = { ...p, id: `p${Date.now()}` };
      if (mode === "REAL") {
        setRealPositions((prev) => {
          const next = [...prev, item];
          persistReal(next, realMovimientos);
          return next;
        });
      } else {
        setDemoPositions((prev) => [...prev, item]);
      }
    },
    [mode, persistReal, realMovimientos],
  );

  const importPositions = useCallback(
    (items: Omit<Position, "id">[], movs: Omit<Movimiento, "id">[] = []) => {
      const stamp = Date.now();
      const newPositions = items.map((p, i) => ({ ...p, id: `imp${stamp}${i}` }));
      if (mode === "REAL") {
        const newMovs = movs.map((m, i) => ({ ...m, id: `mov${stamp}${i}` }));
        setRealPositions((prev) => {
          const next = [...prev, ...newPositions];
          setRealMovimientos((prevM) => {
            const nextM = [...prevM, ...newMovs];
            persistReal(next, nextM);
            return nextM;
          });
          return next;
        });
      } else {
        setDemoPositions((prev) => [...prev, ...newPositions]);
      }
    },
    [mode, persistReal],
  );

  const clearReal = useCallback(() => {
    setRealPositions([]);
    setRealMovimientos([]);
    void persistenceService.clear();
  }, []);

  const setTargetValue = useCallback((categoria: string, objetivo: number) => {
    setTargets((prev) => prev.map((t) => (t.categoria === categoria ? { ...t, objetivo } : t)));
  }, []);

  const toggleNotification = useCallback((key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const positions = mode === "REAL" ? realPositions : demoPositions;
  const movimientos = mode === "REAL" ? realMovimientos : [];

  const value = useMemo(
    () => ({
      mode,
      setMode,
      loadingReal,
      positions,
      movimientos,
      addPosition,
      importPositions,
      clearReal,
      status,
      setStatus,
      targets,
      setTargetValue,
      notifications,
      toggleNotification,
    }),
    [
      mode,
      setMode,
      loadingReal,
      positions,
      movimientos,
      addPosition,
      importPositions,
      clearReal,
      status,
      targets,
      setTargetValue,
      notifications,
      toggleNotification,
    ],
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
