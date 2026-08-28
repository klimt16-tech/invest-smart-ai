/**
 * Capa de servicios de IA (simulada).
 * Sustituir `ask` por una llamada al gateway de IA cuando esté disponible.
 */
import { assistants } from "@/data/mock";
import type { Assistant } from "@/data/types";

export const aiService = {
  listAssistants: (): Assistant[] => assistants,

  getAssistant: (id: string): Assistant => assistants.find((a) => a.id === id) ?? assistants[0]!,

  async ask(assistantId: string, prompt: string, turn: number): Promise<string> {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));
    const a = aiService.getAssistant(assistantId);
    const base = a.respuestas[turn % a.respuestas.length]!;
    return `${base}\n\n(Respuesta simulada de ${a.nombre} sobre: “${prompt.slice(0, 80)}”. Modo demo con datos ficticios.)`;
  },
};
