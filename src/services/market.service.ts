/**
 * Precios de mercado reales mediante API configurable.
 * Configura las variables de entorno VITE_MARKET_API_URL y VITE_MARKET_API_KEY.
 * Sin configuración NO se inventan datos: se devuelve `null` y la UI muestra
 * "Precio de mercado no disponible".
 */
const BASE = import.meta.env['VITE_MARKET_API_URL'] as string | undefined;
const KEY = import.meta.env['VITE_MARKET_API_KEY'] as string | undefined;

export const marketService = {
  isConfigured: Boolean(BASE),
  unavailableLabel: "Precio de mercado no disponible",

  async getQuote(symbol: string): Promise<number | null> {
    if (!BASE || !symbol || symbol === "—") return null;
    try {
      const url = new URL(BASE);
      url.searchParams.set("symbol", symbol);
      if (KEY) url.searchParams.set("apikey", KEY);
      const res = await fetch(url.toString());
      if (!res.ok) return null;
      const json = (await res.json()) as Record<string, unknown>;
      const raw = json['price'] ?? json['close'] ?? json['last'];
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  },

  async getQuotes(symbols: string[]): Promise<Record<string, number>> {
    if (!BASE) return {};
    const out: Record<string, number> = {};
    await Promise.all(
      symbols.map(async (s) => {
        const p = await marketService.getQuote(s);
        if (p !== null) out[s] = p;
      }),
    );
    return out;
  },
};
