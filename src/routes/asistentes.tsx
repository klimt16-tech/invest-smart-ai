import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { aiService } from "@/services/ai.service";
import { portfolioSummary } from "@/services/portfolio.service";
import { usePortfolio, useAppStore } from "@/store/app-store";
import type { ChatMessage } from "@/data/types";


export const Route = createFileRoute("/asistentes")({
  head: () => ({
    meta: [
      { title: "Asistentes IA | INVEST IA" },
      {
        name: "description",
        content:
          "Habla con Rafa IA, Analista, Vigilante, Optimizador y Trader: cinco asistentes simulados para analizar tu cartera.",
      },
      { property: "og:title", content: "Asistentes IA | INVEST IA" },
      { property: "og:description", content: "Cinco asistentes de inversión con respuestas simuladas." },
    ],
  }),
  component: Asistentes,
});

const assistants = aiService.listAssistants();

function initialHistory() {
  const map: Record<string, ChatMessage[]> = {};
  for (const a of assistants) {
    map[a.id] = [
      { id: `${a.id}-intro`, role: "assistant", content: a.intro, ts: new Date().toISOString() },
    ];
  }
  return map;
}

function Asistentes() {
  const [activeId, setActiveId] = useState(assistants[0]!.id);
  const [history, setHistory] = useState<Record<string, ChatMessage[]>>(initialHistory);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rows = usePortfolio();
  const { mode, movimientos } = useAppStore();
  const summary = portfolioSummary(rows, mode === "REAL" ? movimientos : undefined);
  const aiContext = {
    mode,
    patrimonio: summary.patrimonio,
    pnl: summary.pnl,
    rentabilidad: summary.rentabilidad,
    posiciones: [...rows]
      .sort((a, b) => b.valorActual - a.valorActual)
      .map((r) => ({ nombre: r.nombre, tipo: r.tipo, valor: r.valorActual, peso: r.peso })),
  };

  const active = aiService.getAssistant(activeId);
  const messages = history[activeId] ?? [];


  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, thinking]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    const userMsg: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      content: text,
      ts: new Date().toISOString(),
    };
    const turn = messages.filter((m) => m.role === "user").length;
    setHistory((h) => ({ ...h, [activeId]: [...(h[activeId] ?? []), userMsg] }));
    setInput("");
    setThinking(true);
    const reply = await aiService.ask(activeId, text, turn);
    setHistory((h) => ({
      ...h,
      [activeId]: [
        ...(h[activeId] ?? []),
        { id: `a${Date.now()}`, role: "assistant", content: reply, ts: new Date().toISOString() },
      ],
    }));
    setThinking(false);
  }

  return (
    <AppShell title="Asistentes IA" subtitle="Análisis conversacional simulado de tu cartera">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {assistants.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveId(a.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
              a.id === activeId
                ? "border-ai/50 bg-ai/15 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            <span>{a.emoji}</span>
            <span className="font-medium">{a.nombre}</span>
          </button>
        ))}
      </div>

      <section className="panel mt-3 flex h-[calc(100vh-16rem)] min-h-[26rem] flex-col">
        <header className="flex items-center gap-3 border-b border-border p-4">
          <div className="grid size-10 place-items-center rounded-full bg-ai/15 text-lg ring-1 ring-ai/30">
            {active.emoji}
          </div>
          <div>
            <p className="text-sm font-semibold">{active.nombre}</p>
            <p className="text-xs text-muted-foreground">{active.descripcion}</p>
          </div>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-ai/10 px-2.5 py-1 text-[11px] font-medium text-ai">
            <Sparkles className="size-3" /> Simulado
          </span>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
            >
              {m.role === "assistant" && (
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-sm">
                  {active.emoji}
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary/20 text-foreground"
                    : "rounded-bl-sm bg-surface-2 text-foreground",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {thinking && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="grid size-8 place-items-center rounded-full bg-surface-2 text-sm">{active.emoji}</div>
              <span className="flex items-center gap-1">
                analizando
                <span className="flex gap-0.5">
                  <i className="size-1.5 animate-bounce rounded-full bg-ai [animation-delay:0ms]" />
                  <i className="size-1.5 animate-bounce rounded-full bg-ai [animation-delay:150ms]" />
                  <i className="size-1.5 animate-bounce rounded-full bg-ai [animation-delay:300ms]" />
                </span>
              </span>
            </div>
          )}
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Escribe a ${active.nombre}…`}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || thinking} className="gap-2">
            <Send className="size-4" />
            <span className="hidden sm:inline">Enviar</span>
          </Button>
        </form>
      </section>
    </AppShell>
  );
}
