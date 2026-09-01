import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Download, Plus, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eur, pct, signedEur, toneClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import { mockImportPreview } from "@/data/mock";
import { parseMyInvestorFile, type ImportResult } from "@/lib/import-myinvestor";

import type { AssetType, PositionComputed } from "@/data/types";
import { usePortfolio, useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/cartera")({
  head: () => ({
    meta: [
      { title: "Mi Cartera | INVEST IA" },
      {
        name: "description",
        content:
          "Tabla interactiva de posiciones: fondos, ETF, acciones, oro y efectivo con rentabilidad, peso e importación de datos.",
      },
      { property: "og:title", content: "Mi Cartera | INVEST IA" },
      { property: "og:description", content: "Gestiona y analiza tus posiciones con datos simulados." },
    ],
  }),
  component: Cartera,
});

const TIPOS: AssetType[] = ["Fondo", "ETF", "Acción", "Oro", "Efectivo"];
const SUBCARTERAS = ["Cartera Ahorro", "Cartera Indie", "Dividendos", "Oro", "Otros"];

type FormErrors = Partial<Record<"nombre" | "ticker" | "cantidad" | "precioMedio" | "precioActual", string>>;

type SortKey = keyof Pick<
  PositionComputed,
  "nombre" | "tipo" | "cantidad" | "precioMedio" | "precioActual" | "valorActual" | "pnl" | "rentabilidad" | "peso"
>;

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
  { key: "nombre", label: "Activo", align: "left" },
  { key: "tipo", label: "Tipo", align: "left" },
  { key: "cantidad", label: "Cantidad", align: "right" },
  { key: "precioMedio", label: "Precio medio", align: "right" },
  { key: "precioActual", label: "Precio actual", align: "right" },
  { key: "valorActual", label: "Valor actual", align: "right" },
  { key: "pnl", label: "G/P €", align: "right" },
  { key: "rentabilidad", label: "Rent. %", align: "right" },
  { key: "peso", label: "Peso %", align: "right" },
];

function Cartera() {
  const rows = usePortfolio();
  const { addPosition, importPositions, mode, clearReal } = useAppStore();
  const isReal = mode === "REAL";
  const [query, setQuery] = useState("");
  const [tipo, setTipo] = useState<string>("todos");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "valorActual",
    dir: "desc",
  });
  const [open, setOpen] = useState(false);
  const [imported, setImported] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ImportResult | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");


  const [form, setForm] = useState({
    nombre: "",
    ticker: "",
    tipo: "Fondo" as AssetType,
    cantidad: "",
    precioMedio: "",
    precioActual: "",
    subcartera: "Otros",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = rows.filter(
      (r) =>
        (tipo === "todos" || r.tipo === tipo) &&
        (!q || r.nombre.toLowerCase().includes(q) || r.ticker.toLowerCase().includes(q)),
    );
    return out.sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      const cmp = typeof va === "string" ? va.localeCompare(String(vb)) : Number(va) - Number(vb);
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, query, tipo, sort]);

  const totalValor = filtered.reduce((a, r) => a + r.valorActual, 0);
  const totalPnl = filtered.reduce((a, r) => a + r.pnl, 0);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }

  function validate() {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.ticker.trim()) e.ticker = "Indica el ISIN o ticker";
    if (!form.cantidad || Number(form.cantidad) <= 0) e.cantidad = "Cantidad mayor que 0";
    if (!form.precioMedio || Number(form.precioMedio) <= 0) e.precioMedio = "Precio medio inválido";
    if (!form.precioActual || Number(form.precioActual) <= 0) e.precioActual = "Precio actual inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    addPosition({
      nombre: form.nombre.trim(),
      ticker: form.ticker.trim().toUpperCase(),
      tipo: form.tipo,
      cantidad: Number(form.cantidad),
      precioMedio: Number(form.precioMedio),
      precioActual: Number(form.precioActual),
      subcartera: form.subcartera,
    });
    toast.success("Posición añadida", { description: form.nombre });
    setForm({ nombre: "", ticker: "", tipo: "Fondo", cantidad: "", precioMedio: "", precioActual: "", subcartera: "Otros" });
    setOpen(false);
  }

  function confirmImport() {
    importPositions(
      mockImportPreview.map((p) => ({
        nombre: `${p.nombre} (importado)`,
        ticker: "IMPORT",
        tipo: p.tipo as AssetType,
        cantidad: p.cantidad,
        precioMedio: p.precio * 0.95,
        precioActual: p.precio,
        subcartera: "Otros",
      })),
    );
    toast.success("Importación simulada completada", { description: `${mockImportPreview.length} posiciones añadidas` });
    setImported(false);
    setFileName("");
    setOpen(false);
  }

  return (
    <AppShell title="Mi Cartera" subtitle="Posiciones, rentabilidad y peso por activo">
      <section className="panel p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar activo o ISIN/ticker…"
                className="pl-9"
              />
            </div>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Upload className="size-4" /> Importar / Actualizar Datos
          </Button>
        </div>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground uppercase">
                {COLUMNS.map((c) => (
                  <th key={c.key} className={cn("py-2 font-medium", c.align === "right" ? "text-right" : "text-left")}>
                    <button
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        sort.key === c.key && "text-primary",
                      )}
                    >
                      {c.label}
                      <ArrowUpDown className="size-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border/50 transition-colors hover:bg-accent/40">
                  <td className="py-3">
                    <p className="font-medium">{r.nombre}</p>
                    <p className="text-xs text-muted-foreground">{r.ticker} · {r.subcartera}</p>
                  </td>
                  <td className="py-3">
                    <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs">{r.tipo}</span>
                  </td>
                  <td className="num py-3 text-right">{r.cantidad.toLocaleString("es-ES", { maximumFractionDigits: 3 })}</td>
                  <td className="num py-3 text-right">{eur(r.precioMedio)}</td>
                  <td className="num py-3 text-right">{eur(r.precioActual)}</td>
                  <td className="num py-3 text-right font-medium">{eur(r.valorActual)}</td>
                  <td className={cn("num py-3 text-right", toneClass(r.pnl))}>{signedEur(r.pnl)}</td>
                  <td className={cn("num py-3 text-right", toneClass(r.rentabilidad))}>{pct(r.rentabilidad)}</td>
                  <td className="num py-3 text-right text-muted-foreground">{r.peso.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="text-sm font-semibold">
                  <td className="py-3" colSpan={5}>
                    Total ({filtered.length} posiciones)
                  </td>
                  <td className="num py-3 text-right">{eur(totalValor)}</td>
                  <td className={cn("num py-3 text-right", toneClass(totalPnl))}>{signedEur(totalPnl)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {filtered.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-surface-2 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{r.nombre}</p>
                  <p className="text-xs text-muted-foreground">{r.tipo} · {r.subcartera}</p>
                </div>
                <p className="num text-sm font-semibold">{eur(r.valorActual)}</p>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <span className="num text-muted-foreground">{r.cantidad.toLocaleString("es-ES")} ud.</span>
                <span className={cn("num text-right", toneClass(r.pnl))}>{signedEur(r.pnl)}</span>
                <span className={cn("num text-right", toneClass(r.rentabilidad))}>{pct(r.rentabilidad)}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <p className="text-sm font-medium">Sin resultados</p>
            <p className="mt-1 text-xs text-muted-foreground">Prueba con otro término o cambia el filtro de tipo.</p>
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar / Actualizar Datos</DialogTitle>
            <DialogDescription>
              Importación simulada en modo demo. No se conecta con ningún banco ni broker.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="archivo">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="archivo">Importar archivo</TabsTrigger>
              <TabsTrigger value="manual">Añadir posición</TabsTrigger>
            </TabsList>

            <TabsContent value="archivo" className="space-y-3 pt-3">
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border p-6 text-center transition-colors hover:border-primary/50">
                <Download className="size-5 text-primary" />
                <span className="text-sm font-medium">Selecciona un archivo CSV, XLSX o Excel</span>
                <span className="text-xs text-muted-foreground">Se mostrará una previsualización antes de aplicar</span>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setFileName(f.name);
                    setImported(true);
                  }}
                />
              </label>

              {imported && (
                <div className="rounded-lg border border-border">
                  <p className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
                    Previsualización de <span className="text-foreground">{fileName}</span>
                  </p>
                  <table className="w-full text-xs">
                    <tbody>
                      {mockImportPreview.map((p) => (
                        <tr key={p.nombre} className="border-b border-border/50 last:border-0">
                          <td className="px-3 py-2">{p.nombre}</td>
                          <td className="px-3 py-2 text-muted-foreground">{p.tipo}</td>
                          <td className="num px-3 py-2 text-right">{p.cantidad}</td>
                          <td className="num px-3 py-2 text-right">{eur(p.precio)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button disabled={!imported} onClick={confirmImport}>
                  Confirmar importación
                </Button>
              </DialogFooter>
            </TabsContent>

            <TabsContent value="manual" className="space-y-3 pt-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre" error={errors.nombre}>
                  <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                </Field>
                <Field label="ISIN / Ticker" error={errors.ticker}>
                  <Input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} />
                </Field>
                <Field label="Tipo">
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as AssetType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Subcartera">
                  <Select value={form.subcartera} onValueChange={(v) => setForm({ ...form, subcartera: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUBCARTERAS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Cantidad" error={errors.cantidad}>
                  <Input type="number" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
                </Field>
                <Field label="Precio medio (€)" error={errors.precioMedio}>
                  <Input type="number" value={form.precioMedio} onChange={(e) => setForm({ ...form, precioMedio: e.target.value })} />
                </Field>
                <Field label="Precio actual (€)" error={errors.precioActual}>
                  <Input type="number" value={form.precioActual} onChange={(e) => setForm({ ...form, precioActual: e.target.value })} />
                </Field>
              </div>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={submit} className="gap-2">
                  <Plus className="size-4" /> Guardar posición
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
      {error && <p className="text-xs text-negative">{error}</p>}
    </div>
  );
}
