export type AssetType = "Fondo" | "ETF" | "Acción" | "Oro" | "Efectivo";
export type PortfolioStatus = "normal" | "atencion" | "alerta";
export type Period = "1D" | "1M" | "1A" | "Histórico";

export interface Position {
  id: string;
  nombre: string;
  ticker: string;
  tipo: AssetType;
  cantidad: number;
  precioMedio: number;
  precioActual: number;
  subcartera: string;
}

export interface PositionComputed extends Position {
  valorActual: number;
  coste: number;
  pnl: number;
  rentabilidad: number;
  peso: number;
}

export interface SubPortfolio {
  id: string;
  nombre: string;
  valor: number;
  rentabilidad: number;
  peso: number;
  tendencia: "up" | "down" | "flat";
}

export interface SeriesPoint {
  fecha: string;
  label: string;
  patrimonio: number;
  variacion: number;
}

export interface AllocationTarget {
  categoria: string;
  objetivo: number;
  actual: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
}

export interface Assistant {
  id: string;
  nombre: string;
  emoji: string;
  descripcion: string;
  intro: string;
  respuestas: string[];
}

export interface Signal {
  id: string;
  fecha: string;
  activo: string;
  senal: "COMPRA" | "VENTA" | "NEUTRAL";
  confianza: number;
  resultado: number | null;
  estado: "Abierta" | "Cerrada" | "Cancelada";
}

export interface NotificationSettings {
  cartera: boolean;
  caidas: boolean;
  oportunidades: boolean;
  trading: boolean;
  email: boolean;
  push: boolean;
}
