/**
 * Capa de servicios de IA (simulada).
 * Sustituir `ask` por una llamada al gateway de IA cuando esté disponible.
 * `context` ya viaja con los datos reales de la cartera cuando el modo es REAL.
 */
import { assistants } from "@/data/mock";
import type { Assistant } from "@/data/types";

export interface AiPortfolioContext {
  mode: "DEMO" | "REAL";
  patrimonio: number;
  pnl: number;
  rentabilidad: number;
  posiciones: { nombre: string; tipo: string; valor: number; peso: number }[];
}

function resumen(ctx?: AiPortfolioContext): string {
  if (!ctx) return "";
  const eur = (n: number) =>
    n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  if (ctx.mode === "REAL" && ctx.posiciones.length === 0) {
    return "\n\nContexto: modo REAL sin posiciones cargadas. Importa tu archivo para poder analizar datos reales.";
  }
  const top = ctx.posiciones
    .slice(0, 3)
    .map((p) => `${p.nombre} (${p.peso.toFixed(1)}%)`)
    .join(", ");
  return `\n\nContexto ${ctx.mode}: patrimonio ${eur(ctx.patrimonio)}, P/L ${eur(ctx.pnl)} (${ctx.rentabilidad.toFixed(2)}%). Mayores posiciones: ${top}.`;
}

export const aiService = {
  listAssistants: (): Assistant[] => assistants,

  getAssistant: (id: string): Assistant => assistants.find((a) => a.id === id) ?? assistants[0]!,

  async ask(assistantId: string, prompt: string, turn: number, context?: AiPortfolioContext): Promise<string> {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
    const a = aiService.getAssistant(assistantId);
    const base = a.respuestas[turn % a.respuestas.length]!;
    const nota =
      context?.mode === "REAL"
        ? `(Análisis heurístico de ${a.nombre} sobre: “${prompt.slice(0, 80)}”. Sin IA externa conectada todavía.)`
        : `(Respuesta simulada de ${a.nombre} sobre: “${prompt.slice(0, 80)}”. Modo demo con datos ficticios.)`;
    return `${base}${resumen(context)}\n\n${nota}`;
  },
};

