/**
 * Capa de servicios de trading (paper trading simulado).
 * Nunca ejecuta operaciones reales. Preparado para conectar un broker con API.
 */
import { mockSignals } from "@/data/mock";
import type { Signal } from "@/data/types";

export interface BotMetrics {
  capital: number;
  rendimiento: number;
  winRate: number;
  drawdown: number;
  operaciones: number;
  pnl: number;
}

export interface LastSignal {
  activo: string;
  senal: "COMPRA" | "VENTA";
  confianza: number;
  entrada: number;
  stopLoss: number;
  takeProfit: number;
  ratio: string;
  fecha: string;
}

export interface SimulationInput {
  capital: number;
  riesgo: number;
  activo: string;
  estrategia: string;
}

export interface SimulationResult {
  capitalFinal: number;
  rendimiento: number;
  operaciones: number;
  winRate: number;
  drawdown: number;
  mejor: number;
  peor: number;
}

export const tradingService = {
  getMetrics: (): BotMetrics => ({
    capital: 10000,
    rendimiento: 12.4,
    winRate: 61.9,
    drawdown: -8.2,
    operaciones: 42,
    pnl: 1240.35,
  }),

  getLastSignal: (): LastSignal => ({
    activo: "S&P 500",
    senal: "COMPRA",
    confianza: 74,
    entrada: 5284,
    stopLoss: 5196,
    takeProfit: 5460,
    ratio: "1:2",
    fecha: "2026-08-27T15:30:00Z",
  }),

  getSignals: (): Signal[] => mockSignals,

  async runSimulation(input: SimulationInput): Promise<SimulationResult> {
    await new Promise((r) => setTimeout(r, 1100));
    const seed = input.activo.length + input.estrategia.length + input.riesgo;
    const operaciones = 30 + (seed % 25);
    const winRate = 52 + ((seed * 7) % 18);
    const rendimiento = Number((((winRate - 50) / 4) * (input.riesgo / 1.5)).toFixed(2));
    const capitalFinal = Number((input.capital * (1 + rendimiento / 100)).toFixed(2));
    return {
      capitalFinal,
      rendimiento,
      operaciones,
      winRate: Number(winRate.toFixed(1)),
      drawdown: Number((-(3 + input.riesgo * 1.8)).toFixed(1)),
      mejor: Number((input.riesgo * 3.4).toFixed(2)),
      peor: Number((-input.riesgo * 2.1).toFixed(2)),
    };
  },
};
