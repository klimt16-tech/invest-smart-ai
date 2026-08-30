/**
 * Importador de archivos exportados por MyInvestor (CSV / XLSX).
 * Normaliza posiciones y movimientos. No requiere credenciales de ningún tipo:
 * el usuario descarga su archivo desde su banco y lo sube aquí.
 */
import * as XLSX from "xlsx";
import type { AssetType, Movimiento, MovimientoTipo, Position } from "@/data/types";

export interface ImportResult {
  positions: Omit<Position, "id">[];
  movimientos: Omit<Movimiento, "id">[];
  filas: number;
  ignoradas: number;
  avisos: string[];
}

const norm = (s: string) =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function pick(row: Record<string, unknown>, candidates: string[]): unknown {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const hit = keys.find((k) => norm(k) === c || norm(k).includes(c));
    if (hit !== undefined && row[hit] !== undefined && row[hit] !== "") return row[hit];
  }
  return undefined;
}

/** Convierte "1.234,56 €" / "1,234.56" / 1234.56 a número. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let s = String(value).replace(/[€$%\s\u00a0]/g, "").trim();
  if (!s) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function toDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value ?? "").trim();
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const year = y!.length === 2 ? `20${y}` : y!;
    return `${year}-${mo!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().slice(0, 10) : parsed.toISOString().slice(0, 10);
}

function detectTipo(nombre: string, raw: unknown): AssetType {
  const t = norm(String(raw ?? "") + " " + nombre);
  if (t.includes("etf")) return "ETF";
  if (t.includes("fondo") || t.includes("fund")) return "Fondo";
  if (t.includes("oro") || t.includes("gold")) return "Oro";
  if (t.includes("efectivo") || t.includes("cash") || t.includes("cuenta")) return "Efectivo";
  if (t.includes("accion") || t.includes("stock") || t.includes("equity")) return "Acción";
  return "Fondo";
}

function detectMovimiento(raw: unknown): MovimientoTipo {
  const t = norm(String(raw ?? ""));
  if (t.includes("aporta") || t.includes("suscrip") || t.includes("ingreso")) return "Aportación";
  if (t.includes("retira") || t.includes("reembols") || t.includes("traspaso salida")) return "Retirada";
  if (t.includes("compra")) return "Compra";
  if (t.includes("venta")) return "Venta";
  if (t.includes("dividendo") || t.includes("cupon")) return "Dividendo";
  if (t.includes("comision") || t.includes("gasto")) return "Comisión";
  return "Otro";
}

const NOMBRE = ["nombre", "descripcion", "activo", "producto", "instrumento", "valor", "fondo"];
const TICKER = ["isin", "ticker", "simbolo", "codigo"];
const CANTIDAD = ["cantidad", "participaciones", "titulos", "unidades", "num participaciones"];
const P_MEDIO = ["precio medio", "coste medio", "valor liquidativo medio", "precio compra"];
const P_ACTUAL = ["precio actual", "valor liquidativo", "ultimo precio", "cotizacion", "precio"];
const VALOR = ["valor actual", "valor mercado", "importe total", "valoracion", "efectivo"];
const SUBCARTERA = ["cartera", "subcartera", "portfolio", "grupo"];
const TIPO = ["tipo", "categoria", "clase"];
const FECHA = ["fecha", "date", "fecha operacion", "fecha valor"];
const IMPORTE = ["importe", "efectivo", "importe bruto", "importe neto", "total"];
const OPERACION = ["operacion", "movimiento", "concepto", "tipo operacion", "descripcion"];

function rowsFromSheet(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });
}

function isMovementSheet(rows: Record<string, unknown>[]): boolean {
  const first = rows[0];
  if (!first) return false;
  const keys = Object.keys(first).map(norm).join(" ");
  const hasFecha = FECHA.some((f) => keys.includes(f));
  const hasCantidad = CANTIDAD.some((c) => keys.includes(c));
  return hasFecha && !hasCantidad;
}

export async function parseMyInvestorFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true, raw: false });

  const positions: Omit<Position, "id">[] = [];
  const movimientos: Omit<Movimiento, "id">[] = [];
  const avisos: string[] = [];
  let filas = 0;
  let ignoradas = 0;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rows = rowsFromSheet(sheet);
    if (!rows.length) continue;
    const asMovements = isMovementSheet(rows);

    for (const row of rows) {
      filas++;
      const nombre = String(pick(row, NOMBRE) ?? "").trim();

      if (asMovements) {
        const importe = toNumber(pick(row, IMPORTE));
        if (importe === null) {
          ignoradas++;
          continue;
        }
        movimientos.push({
          fecha: toDate(pick(row, FECHA)),
          tipo: detectMovimiento(pick(row, OPERACION) ?? nombre),
          activo: nombre || "—",
          cantidad: toNumber(pick(row, CANTIDAD)),
          precio: toNumber(pick(row, P_ACTUAL)),
          importe,
        });
        continue;
      }

      const cantidad = toNumber(pick(row, CANTIDAD));
      const valor = toNumber(pick(row, VALOR));
      let precioActual = toNumber(pick(row, P_ACTUAL));
      const precioMedio = toNumber(pick(row, P_MEDIO));

      if (!nombre || (cantidad === null && valor === null)) {
        ignoradas++;
        continue;
      }
      const uds = cantidad ?? 1;
      if (precioActual === null && valor !== null && uds) precioActual = valor / uds;
      if (precioActual === null) {
        ignoradas++;
        continue;
      }

      positions.push({
        nombre,
        ticker: String(pick(row, TICKER) ?? "").trim() || "—",
        tipo: detectTipo(nombre, pick(row, TIPO)),
        cantidad: uds,
        precioMedio: precioMedio ?? precioActual,
        precioActual,
        subcartera: String(pick(row, SUBCARTERA) ?? "").trim() || "Otros",
      });
      if (precioMedio === null) avisos.push(`Sin precio medio en «${nombre}»: se usa el precio actual.`);
    }
  }

  if (!positions.length && !movimientos.length) {
    throw new Error(
      "No se han reconocido posiciones ni movimientos en el archivo. Comprueba que sea el export de MyInvestor en CSV o XLSX.",
    );
  }

  return { positions, movimientos, filas, ignoradas, avisos: [...new Set(avisos)].slice(0, 3) };
}
