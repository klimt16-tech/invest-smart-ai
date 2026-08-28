/**
 * Capa de servicios de cartera.
 * Hoy devuelve mock data; mañana bastará con sustituir el cuerpo de estas
 * funciones por llamadas a Supabase / API de mercado / broker.
 */
import { mockAportaciones, mockBeneficiosAcumulados, mockPositions, mockSeries } from "@/data/mock";
import type { Period, Position, PositionComputed, SeriesPoint, SubPortfolio } from "@/data/types";

export const portfolioService = {
  async getPositions(): Promise<Position[]> {
    return mockPositions;
  },
  async getSeries(period: Period): Promise<SeriesPoint[]> {
    return mockSeries[period];
  },
  getAportaciones: () => mockAportaciones,
  getBeneficiosAcumulados: () => mockBeneficiosAcumulados,
};

export function computePositions(positions: Position[]): PositionComputed[] {
  const total = positions.reduce((a, p) => a + p.cantidad * p.precioActual, 0) || 1;
  return positions.map((p) => {
    const valorActual = p.cantidad * p.precioActual;
    const coste = p.cantidad * p.precioMedio;
    const pnl = valorActual - coste;
    return {
      ...p,
      valorActual,
      coste,
      pnl,
      rentabilidad: coste ? (pnl / coste) * 100 : 0,
      peso: (valorActual / total) * 100,
    };
  });
}

export function portfolioSummary(rows: PositionComputed[]) {
  const patrimonio = rows.reduce((a, r) => a + r.valorActual, 0);
  const coste = rows.reduce((a, r) => a + r.coste, 0);
  const pnl = patrimonio - coste;
  return {
    patrimonio,
    coste,
    pnl,
    rentabilidad: coste ? (pnl / coste) * 100 : 0,
    aportaciones: portfolioService.getAportaciones(),
    beneficios: portfolioService.getBeneficiosAcumulados(),
  };
}

export function allocationByType(rows: PositionComputed[]) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.tipo, (map.get(r.tipo) ?? 0) + r.valorActual);
  const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
  return [...map.entries()]
    .map(([tipo, valor]) => ({ tipo, valor, peso: (valor / total) * 100 }))
    .sort((a, b) => b.valor - a.valor);
}

export function subPortfolios(rows: PositionComputed[]): SubPortfolio[] {
  const orden = ["Cartera Ahorro", "Cartera Indie", "Dividendos", "Oro", "Otros"];
  const total = rows.reduce((a, r) => a + r.valorActual, 0) || 1;
  const grupos = new Map<string, PositionComputed[]>();
  for (const r of rows) grupos.set(r.subcartera, [...(grupos.get(r.subcartera) ?? []), r]);
  return [...grupos.entries()]
    .map(([nombre, items]) => {
      const valor = items.reduce((a, r) => a + r.valorActual, 0);
      const coste = items.reduce((a, r) => a + r.coste, 0);
      const rentabilidad = coste ? ((valor - coste) / coste) * 100 : 0;
      return {
        id: nombre,
        nombre,
        valor,
        rentabilidad,
        peso: (valor / total) * 100,
        tendencia: rentabilidad > 0.5 ? "up" : rentabilidad < -0.5 ? "down" : "flat",
      } as SubPortfolio;
    })
    .sort((a, b) => orden.indexOf(a.nombre) - orden.indexOf(b.nombre));
}
