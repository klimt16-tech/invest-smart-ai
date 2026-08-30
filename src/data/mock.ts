import type {
  Assistant,
  AllocationTarget,
  NotificationSettings,
  Period,
  Position,
  SeriesPoint,
  Signal,
} from "./types";

export const mockPositions: Position[] = [
  {
    id: "p1",
    nombre: "Cartera Ahorro",
    ticker: "MYI-AHO",
    tipo: "Fondo",
    cantidad: 120.919,
    precioMedio: 11.42,
    precioActual: 12.31,
    subcartera: "Cartera Ahorro",
  },
  {
    id: "p2",
    nombre: "Cartera Indie",
    ticker: "MYI-IND",
    tipo: "Fondo",
    cantidad: 149.188,
    precioMedio: 10.86,
    precioActual: 11.94,
    subcartera: "Cartera Indie",
  },
  {
    id: "p3",
    nombre: "Fondo Dividendos Global",
    ticker: "IE00B0M62Q58",
    tipo: "Fondo",
    cantidad: 33.796,
    precioMedio: 17.9,
    precioActual: 18.42,
    subcartera: "Dividendos",
  },
  {
    id: "p4",
    nombre: "ETF Oro Físico",
    ticker: "IE00B4ND3602",
    tipo: "Oro",
    cantidad: 2.697,
    precioMedio: 198.4,
    precioActual: 214.75,
    subcartera: "Oro",
  },
  {
    id: "p5",
    nombre: "ETF S&P 500",
    ticker: "IE00B5BMR087",
    tipo: "ETF",
    cantidad: 7.299,
    precioMedio: 82.15,
    precioActual: 88.6,
    subcartera: "Otros",
  },
  {
    id: "p6",
    nombre: "ETF Nasdaq 100",
    ticker: "IE00B53SZB19",
    tipo: "ETF",
    cantidad: 3.292,
    precioMedio: 118.4,
    precioActual: 121.05,
    subcartera: "Otros",
  },
  {
    id: "p7",
    nombre: "Efectivo remunerado",
    ticker: "CASH-EUR",
    tipo: "Efectivo",
    cantidad: 333.599,
    precioMedio: 1,
    precioActual: 1,
    subcartera: "Otros",
  },
];

export const mockAportaciones = 5468.25;
export const mockBeneficiosAcumulados = 512.8;

function build(points: number, start: number, drift: number, vol: number, fmt: (i: number) => string): SeriesPoint[] {
  const out: SeriesPoint[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    const wave = Math.sin(i / 3.1) * vol + Math.cos(i / 1.7) * (vol / 2);
    v = v + drift + wave;
    const prev = out[i - 1]?.patrimonio ?? start;
    out.push({
      fecha: fmt(i),
      label: fmt(i),
      patrimonio: Number(v.toFixed(2)),
      variacion: Number((((v - prev) / prev) * 100).toFixed(2)),
    });
  }
  return out;
}

export const mockSeries: Record<Period, SeriesPoint[]> = {
  "1D": build(24, 5832, 0.8, 4.2, (i) => `${String(i).padStart(2, "0")}:00`),
  "1M": build(30, 5610, 8, 22, (i) => `${i + 1} sep`),
  "1A": build(
    12,
    4980,
    72,
    60,
    (i) =>
      ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][i] ?? "",
  ),
  Histórico: build(20, 1200, 235, 130, (i) => `T${(i % 4) + 1} ${2021 + Math.floor(i / 4)}`),
};

export const mockAllocationTargets: AllocationTarget[] = [
  { categoria: "Cartera Ahorro", objetivo: 30, actual: 32 },
  { categoria: "Cartera Indie", objetivo: 40, actual: 38 },
  { categoria: "Oro", objetivo: 10, actual: 12 },
  { categoria: "Efectivo", objetivo: 20, actual: 18 },
];

export const mockNotifications: NotificationSettings = {
  cartera: true,
  caidas: true,
  oportunidades: false,
  trading: true,
  email: true,
  push: false,
};

export const assistants: Assistant[] = [
  {
    id: "rafa",
    nombre: "Rafa IA",
    emoji: "🤖",
    descripcion: "Asistente general de cartera",
    intro:
      "Tu cartera presenta actualmente una rentabilidad positiva del 7%. La mayor exposición corresponde a Cartera Indie. El principal punto a vigilar es la exposición al oro.",
    respuestas: [
      "He revisado tus posiciones: el patrimonio total es de 5.850,42 € con una plusvalía latente de +382,17 €. La diversificación es razonable, aunque la parte de fondos concentra más del 60%.",
      "Con tus aportaciones actuales (5.468,25 €), mantener una periodicidad mensual estable es lo que más impacto tiene en el resultado a largo plazo.",
      "No detecto ninguna acción urgente. Si quieres, el Optimizador puede proponerte un rebalanceo concreto.",
    ],
  },
  {
    id: "analista",
    nombre: "Analista",
    emoji: "📊",
    descripcion: "S&P 500, Nasdaq, Oro, Bonos, ETF, Fondos, Acciones",
    intro:
      "El oro presenta volatilidad elevada en el periodo analizado, mientras que el S&P 500 mantiene una tendencia alcista moderada y el Nasdaq muestra mayor dispersión.",
    respuestas: [
      "S&P 500: tendencia alcista con soporte simulado en 5.180 y resistencia en 5.460. Momentum positivo pero moderado.",
      "Nasdaq 100: mayor beta que el índice general; la corrección simulada de -3,2% se ha recuperado en 9 sesiones.",
      "Oro: volatilidad anualizada simulada del 14,8%. Actúa bien como cobertura, pero su peso del 12% supera tu objetivo del 10%.",
    ],
  },
  {
    id: "vigilante",
    nombre: "Vigilante",
    emoji: "🛡️",
    descripcion: "Volatilidad, caídas, riesgos y concentración",
    intro:
      "No se detectan actualmente desviaciones críticas. La volatilidad de la cartera se mantiene dentro del rango objetivo.",
    respuestas: [
      "Concentración: la mayor posición individual representa el 38% de la cartera. Por encima del 40% activaría un aviso 🟡.",
      "Drawdown simulado máximo en 12 meses: -6,4%. Dentro de tu tolerancia declarada.",
      "Sin caídas superiores al 5% en las últimas 20 sesiones simuladas.",
    ],
  },
  {
    id: "optimizador",
    nombre: "Optimizador",
    emoji: "💰",
    descripcion: "Rebalanceo, distribución y aportaciones",
    intro:
      "Tu asignación actual presenta una desviación del 3% respecto a tus objetivos. Puede corregirse con la próxima aportación sin necesidad de vender.",
    respuestas: [
      "Propuesta: destinar la próxima aportación de 250 € íntegramente a Cartera Indie para reducir la desviación a menos del 1%.",
      "Reducir oro del 12% al 10% liberaría aproximadamente 146 € reasignables a renta variable global.",
      "Rebalanceo por aportación es preferible al rebalanceo por venta: evita peaje fiscal.",
    ],
  },
  {
    id: "trader",
    nombre: "Trader",
    emoji: "🤖",
    descripcion: "Señales de mercado en modo simulación",
    intro:
      "Se ha detectado una señal simulada sobre el S&P 500: COMPRA con una confianza del 74% y un ratio riesgo/beneficio de 1:2.",
    respuestas: [
      "Señal simulada activa: entrada 5.284, stop-loss 5.196, take-profit 5.460. Riesgo por operación: 1% del capital simulado.",
      "Win rate simulado de las últimas 42 operaciones: 61,9%. Drawdown máximo: -8,2%.",
      "Recuerda: modo simulación. No se ejecuta ninguna operación con dinero real.",
    ],
  },
];

export const mockSignals: Signal[] = [
  { id: "s1", fecha: "2026-08-27T15:30:00Z", activo: "S&P 500", senal: "COMPRA", confianza: 74, resultado: null, estado: "Abierta" },
  { id: "s2", fecha: "2026-08-25T09:10:00Z", activo: "Nasdaq 100", senal: "COMPRA", confianza: 68, resultado: 2.4, estado: "Cerrada" },
  { id: "s3", fecha: "2026-08-21T11:45:00Z", activo: "Oro", senal: "VENTA", confianza: 57, resultado: -1.1, estado: "Cerrada" },
  { id: "s4", fecha: "2026-08-18T14:05:00Z", activo: "S&P 500", senal: "NEUTRAL", confianza: 41, resultado: 0, estado: "Cancelada" },
  { id: "s5", fecha: "2026-08-12T16:20:00Z", activo: "Bonos EU", senal: "COMPRA", confianza: 63, resultado: 1.3, estado: "Cerrada" },
  { id: "s6", fecha: "2026-08-05T10:00:00Z", activo: "Nasdaq 100", senal: "VENTA", confianza: 71, resultado: 3.1, estado: "Cerrada" },
];

export const mockImportPreview = [
  { nombre: "Cartera Ahorro", tipo: "Fondo", cantidad: 152.418, precio: 12.31 },
  { nombre: "Cartera Indie", tipo: "Fondo", cantidad: 188.05, precio: 11.94 },
  { nombre: "ETF Oro Físico", tipo: "Oro", cantidad: 3.4, precio: 214.75 },
  { nombre: "ETF S&P 500", tipo: "ETF", cantidad: 9.2, precio: 88.6 },
];
