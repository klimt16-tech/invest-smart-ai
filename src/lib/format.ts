export const eur = (n: number, digits = 2) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);

export const pct = (n: number, digits = 2) =>
  `${n > 0 ? "+" : ""}${n.toFixed(digits).replace(".", ",")}%`;

export const signedEur = (n: number) => `${n > 0 ? "+" : ""}${eur(n)}`;

export const dateEs = (iso: string) =>
  new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

export const dateTimeEs = (iso: string) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export const toneClass = (n: number) => (n >= 0 ? "text-positive" : "text-negative");
