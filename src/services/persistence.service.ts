/**
 * Capa de persistencia de la cartera REAL.
 *
 * Hoy usa almacenamiento local del navegador. La interfaz `PortfolioRepository`
 * está preparada para sustituirse por Lovable Cloud (Supabase) sin tocar la UI:
 * basta con implementar `SupabaseRepository` y devolverlo en `getRepository()`.
 *
 * Estructura de tablas prevista (pendiente de activar la integración):
 *
 *   positions      (id, user_id, nombre, ticker, tipo, cantidad, precio_medio,
 *                   precio_actual, subcartera, created_at)
 *   contributions  (id, user_id, fecha, importe, nota)          -- aportaciones
 *   operations     (id, user_id, fecha, tipo, activo, cantidad,
 *                   precio, importe)                            -- operaciones
 *   allocation_targets (id, user_id, categoria, objetivo)        -- objetivos
 *
 * NUNCA se almacenan credenciales de MyInvestor ni de ningún banco o bróker.
 */
import type { AllocationTarget, Movimiento, Position } from "@/data/types";

export interface RealPortfolioData {
  positions: Position[];
  movimientos: Movimiento[];
  targets: AllocationTarget[] | null;
}

export interface PortfolioRepository {
  readonly kind: "local" | "supabase";
  load(): Promise<RealPortfolioData>;
  save(data: RealPortfolioData): Promise<void>;
  clear(): Promise<void>;
}

const STORAGE_KEY = "invest-ia:real-portfolio:v1";

const EMPTY: RealPortfolioData = { positions: [], movimientos: [], targets: null };

const localRepository: PortfolioRepository = {
  kind: "local",
  async load() {
    if (typeof window === "undefined") return EMPTY;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return EMPTY;
      const parsed = JSON.parse(raw) as Partial<RealPortfolioData>;
      return {
        positions: parsed.positions ?? [],
        movimientos: parsed.movimientos ?? [],
        targets: parsed.targets ?? null,
      };
    } catch {
      return EMPTY;
    }
  },
  async save(data) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  async clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};

/** Devuelve el repositorio activo. Cuando exista Lovable Cloud, se cambia aquí. */
export function getRepository(): PortfolioRepository {
  return localRepository;
}

export const persistenceService = {
  repository: getRepository(),
  isCloudEnabled: false,
  load: () => getRepository().load(),
  save: (data: RealPortfolioData) => getRepository().save(data),
  clear: () => getRepository().clear(),
  emptyData: (): RealPortfolioData => ({ ...EMPTY, positions: [], movimientos: [] }),
};
