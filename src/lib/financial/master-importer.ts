import * as XLSX from "xlsx";
import type { MasterDataset } from "./types";

function safe(n: number): number {
  return isFinite(n) && !isNaN(n) ? Math.round(n * 10000) / 10000 : 0;
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return 0;
  const s = v
    .trim()
    .replace(/\$/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .replace(/%/g, "");
  const n = Number(s);
  return isFinite(n) ? n : 0;
}

function toStringVal(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  return String(v);
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ");
}

type PartialMaster = Partial<MasterDataset>;

const MASTER_FIELD_KEYS: Array<keyof MasterDataset> = [
  "generatedAt",
  "empresa",
  "periodo",
  "ventas",
  "costoDeVentas",
  "utilidadBruta",
  "gastosOperativos",
  "ebit",
  "gastosFinancieros",
  "impuestos",
  "utilidadNeta",
  "otrosIngresos",
  "otrosGastos",
  "depreciacion",
  "efectivo",
  "cuentasPorCobrar",
  "inventarios",
  "activoCirculante",
  "activoFijo",
  "activosTotales",
  "cuentasPorPagar",
  "deudaCortoPlazo",
  "pasivoCirculante",
  "deudaLargoPlazo",
  "pasivoTotal",
  "capitalSocial",
  "utilidadesRetenidas",
  "capitalContable",
  "banco",
  "cuenta",
  "saldoInicial",
  "saldoFinal",
  "totalCargos",
  "totalAbonos",
  "numTransacciones",
  "margenBruto",
  "margenOperativo",
  "margenNeto",
  "roa",
  "roe",
  "currentRatio",
  "acidTest",
  "rotacionInventarios",
  "rotacionCxC",
  "razonDeuda",
  "deudaCapital",
  "capitalDeTrabajo",
  "monthlyRevenue",
  "monthlyMargins",
  "monthlyLeverage",
  "monthlyLiquidity",
];

const MASTER_FIELD_SET = new Set<string>(MASTER_FIELD_KEYS as unknown as string[]);

const LABEL_TO_FIELD: Record<string, keyof MasterDataset> = {
  // Header-ish
  "Generado": "generatedAt",
  "Empresa": "empresa",
  "Periodo": "periodo",

  // Estado de Resultados
  "Ventas Netas": "ventas",
  "Ventas": "ventas",
  "Costo de Ventas": "costoDeVentas",
  "Utilidad Bruta": "utilidadBruta",
  "Gastos Operativos": "gastosOperativos",
  "EBIT": "ebit",
  "Gastos Financieros": "gastosFinancieros",
  "Impuestos": "impuestos",
  "Utilidad Neta": "utilidadNeta",
  "Otros Ingresos": "otrosIngresos",
  "Otros Gastos": "otrosGastos",
  "Depreciación": "depreciacion",
  "Depreciacion": "depreciacion",

  // Balance General
  "Efectivo": "efectivo",
  "Cuentas por Cobrar": "cuentasPorCobrar",
  "Inventarios": "inventarios",
  "Activo Circulante": "activoCirculante",
  "Activo Fijo": "activoFijo",
  "Activos Totales": "activosTotales",
  "Cuentas por Pagar": "cuentasPorPagar",
  "Deuda Corto Plazo": "deudaCortoPlazo",
  "Pasivo Circulante": "pasivoCirculante",
  "Deuda Largo Plazo": "deudaLargoPlazo",
  "Pasivo Total": "pasivoTotal",
  "Capital Social": "capitalSocial",
  "Utilidades Retenidas": "utilidadesRetenidas",
  "Capital Contable": "capitalContable",

  // Estado de Cuenta
  "Banco": "banco",
  "Cuenta": "cuenta",
  "Saldo Inicial": "saldoInicial",
  "Saldo Final": "saldoFinal",
  "Total Cargos": "totalCargos",
  "Total Abonos": "totalAbonos",
  "Num. Transacciones": "numTransacciones",
  "Num. Transacciones ": "numTransacciones",

  // Métricas derivadas
  "Margen Bruto": "margenBruto",
  "Margen Operativo": "margenOperativo",
  "Margen Neto": "margenNeto",
  "ROA": "roa",
  "ROE": "roe",
  "Current Ratio": "currentRatio",
  "Prueba Ácida": "acidTest",
  "Prueba Acida": "acidTest",
  "Rotación Inventarios": "rotacionInventarios",
  "Rotacion Inventarios": "rotacionInventarios",
  "Rotación CxC": "rotacionCxC",
  "Rotacion CxC": "rotacionCxC",
  "Razón de Deuda": "razonDeuda",
  "Razon de Deuda": "razonDeuda",
  "Deuda / Capital": "deudaCapital",
  "Capital de Trabajo": "capitalDeTrabajo",
};

function normalizeKey(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function computeDerivedIfMissing(base: PartialMaster): PartialMaster {
  const ventas = base.ventas ?? 0;
  const utilidadBruta = base.utilidadBruta ?? 0;
  const ebit = base.ebit ?? 0;
  const utilidadNeta = base.utilidadNeta ?? 0;

  const activosTotales = base.activosTotales ?? 0;
  const capitalContable = base.capitalContable ?? 0;

  const activoCirculante = base.activoCirculante ?? 0;
  const pasivoCirculante = base.pasivoCirculante ?? 0;
  const inventarios = base.inventarios ?? 0;

  const costoDeVentas = base.costoDeVentas ?? 0;
  const cuentasPorCobrar = base.cuentasPorCobrar ?? 0;

  const pasivoTotal = base.pasivoTotal ?? 0;

  const margenBruto = base.margenBruto ?? safe(ventas ? utilidadBruta / ventas : 0);
  const margenOperativo = base.margenOperativo ?? safe(ventas ? ebit / ventas : 0);
  const margenNeto = base.margenNeto ?? safe(ventas ? utilidadNeta / ventas : 0);
  const roa = base.roa ?? safe(activosTotales ? utilidadNeta / activosTotales : 0);
  const roe = base.roe ?? safe(capitalContable ? utilidadNeta / capitalContable : 0);
  const currentRatio = base.currentRatio ?? safe(pasivoCirculante ? activoCirculante / pasivoCirculante : 0);
  const acidTest = base.acidTest ?? safe(pasivoCirculante ? (activoCirculante - inventarios) / pasivoCirculante : 0);
  const rotacionInventarios = base.rotacionInventarios ?? safe(inventarios ? costoDeVentas / inventarios : 0);
  const rotacionCxC = base.rotacionCxC ?? safe(cuentasPorCobrar ? ventas * 0.75 / cuentasPorCobrar : 0);
  const razonDeuda = base.razonDeuda ?? safe(activosTotales ? pasivoTotal / activosTotales : 0);
  const deudaCapital = base.deudaCapital ?? safe(capitalContable ? pasivoTotal / capitalContable : 0);
  const capitalDeTrabajo = base.capitalDeTrabajo ?? (activoCirculante - pasivoCirculante);

  return {
    ...base,
    margenBruto,
    margenOperativo,
    margenNeto,
    roa,
    roe,
    currentRatio,
    acidTest,
    rotacionInventarios,
    rotacionCxC,
    razonDeuda,
    deudaCapital,
    capitalDeTrabajo,
  };
}

function parseMonthlyRevenue(wb: XLSX.WorkBook) {
  const name =
    wb.SheetNames.find((n) => n.toLowerCase().includes("ingresos") && n.toLowerCase().includes("mens")) ||
    wb.SheetNames.find((n) => n.toLowerCase().includes("mensual")) ||
    null;
  if (!name) return [];
  const sheet = wb.Sheets[name];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  // Try common headers: Mes / Ingresos / Gastos
  return rows
    .map((r) => {
      const mes = toStringVal(r["Mes"] ?? r["mes"] ?? r["MES"]);
      const ingresos = toNumber(r["Ingresos"] ?? r["ingresos"] ?? r["INGRESOS"]);
      const gastos = toNumber(r["Gastos"] ?? r["gastos"] ?? r["GASTOS"]);
      return mes ? { mes, ingresos, gastos } : null;
    })
    .filter(Boolean) as { mes: string; ingresos: number; gastos: number }[];
}

function ensureMonthly(master: PartialMaster): PartialMaster {
  let revenue = master.monthlyRevenue ?? [];
  if (revenue.length === 0) {
    // Create a simple 6-month breakdown from annual figures
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
    const ventas = toNumber(master.ventas);
    const gastos = toNumber(master.costoDeVentas) + toNumber(master.gastosOperativos);
    revenue = months.map((mes) => ({
      mes,
      ingresos: Math.round(ventas / 6),
      gastos: Math.round(gastos / 6),
    }));
  }
  const count = Math.max(revenue.length, 0);

  const monthlyMargins =
    master.monthlyMargins ??
    revenue.map((m) => ({
      mes: m.mes,
      bruto: safe(master.margenBruto ?? 0),
      operativo: safe(master.margenOperativo ?? 0),
      neto: safe(master.margenNeto ?? 0),
    }));

  const monthlyLeverage =
    master.monthlyLeverage ??
    (count > 0
      ? revenue.map((m) => ({
          mes: m.mes,
          deuda: safe(master.razonDeuda ?? 0),
          deudaCapital: safe(master.deudaCapital ?? 0),
        }))
      : []);

  const monthlyLiquidity =
    master.monthlyLiquidity ??
    (count > 0
      ? revenue.map((m) => ({
          mes: m.mes,
          current: safe(master.currentRatio ?? 0),
          acid: safe(master.acidTest ?? 0),
        }))
      : []);

  return { ...master, monthlyRevenue: revenue, monthlyMargins, monthlyLeverage, monthlyLiquidity };
}

function extractEfStyleFromSheet(name: string, sheet: XLSX.WorkSheet): { score: number; partial: PartialMaster } {
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" }) as unknown[][];
  const partial: PartialMaster = {};

  // Find a row containing multiple years to pick the latest column index.
  let yearCols: Array<{ year: number; col: number }> = [];
  for (let r = 0; r < Math.min(aoa.length, 60); r++) {
    const row = aoa[r] || [];
    const cols: Array<{ year: number; col: number }> = [];
    for (let c = 0; c < Math.min(row.length, 20); c++) {
      const v = row[c];
      const y = typeof v === "number" ? v : toNumber(v);
      if (y >= 2000 && y <= 2100) cols.push({ year: y, col: c });
    }
    if (cols.length >= 2) {
      yearCols = cols;
      break;
    }
  }
  const latest = yearCols.sort((a, b) => b.year - a.year)[0] ?? null;

  const valueAt = (row: unknown[], preferredCol: number | null) => {
    if (preferredCol != null && preferredCol < row.length) return toNumber(row[preferredCol]);
    // fallback: last numeric
    for (let i = row.length - 1; i >= 0; i--) {
      const n = toNumber(row[i]);
      if (n !== 0) return n;
    }
    return toNumber(row[2]);
  };

  const rowLabel = (row: unknown[]) => norm(toStringVal(row[1] ?? row[0] ?? ""));

  const want: Array<[string, keyof MasterDataset]> = [
    ["activo circulante", "activoCirculante"],
    ["efectivo y equivalentes", "efectivo"],
    ["inventarios", "inventarios"],
    ["clientes", "cuentasPorCobrar"],
    ["activo fijo", "activoFijo"],
    ["activo total", "activosTotales"],
    ["activos totales", "activosTotales"],
    ["pasivo circulante", "pasivoCirculante"],
    ["pasivo total", "pasivoTotal"],
    ["capital social", "capitalSocial"],
    ["capital", "capitalContable"],
    ["utilidad neta", "utilidadNeta"],
    ["utilidad nEta", "utilidadNeta"],
    ["ventas", "ventas"],
    ["ventas netas", "ventas"],
    ["costos de venta", "costoDeVentas"],
    ["costo de ventas", "costoDeVentas"],
    ["ut. bruta", "utilidadBruta"],
    ["utilidad bruta", "utilidadBruta"],
    ["gastos de op.", "gastosOperativos"],
    ["gastos operativos", "gastosOperativos"],
    ["ut. de operacion", "ebit"],
    ["ut. de operación", "ebit"],
    ["ebit", "ebit"],
    ["gastos fin.", "gastosFinancieros"],
    ["gastos financieros", "gastosFinancieros"],
    ["impuestos", "impuestos"],
    ["depreciacion", "depreciacion"],
    ["depreciacion acumulada", "depreciacion"],
  ];

  const found = new Set<keyof MasterDataset>();
  for (let r = 0; r < Math.min(aoa.length, 500); r++) {
    const row = aoa[r] || [];
    const label = rowLabel(row);
    if (!label) continue;
    for (const [k, field] of want) {
      if (label === k) {
        const n = valueAt(row, latest ? latest.col : null);
        (partial[field] as unknown) = n;
        found.add(field);
      }
    }
  }

  // Better metadata
  partial.empresa = name.trim();
  if (latest) partial.periodo = String(latest.year);
  partial.generatedAt = new Date().toISOString();

  // Cuentas por pagar / deuda: best-effort from common labels if present
  // (these sheets often break it down; we’ll keep 0 if not found)
  partial.cuentasPorPagar = partial.cuentasPorPagar ?? 0;
  partial.deudaCortoPlazo = partial.deudaCortoPlazo ?? 0;
  partial.deudaLargoPlazo = partial.deudaLargoPlazo ?? 0;

  // No bank statement info in EF sheets
  partial.banco = partial.banco ?? "";
  partial.cuenta = partial.cuenta ?? "";
  partial.saldoInicial = partial.saldoInicial ?? 0;
  partial.saldoFinal = partial.saldoFinal ?? 0;
  partial.totalCargos = partial.totalCargos ?? 0;
  partial.totalAbonos = partial.totalAbonos ?? 0;
  partial.numTransacciones = partial.numTransacciones ?? 0;

  const score = found.size;
  return { score, partial };
}

function extractEfStyleFromWorkbook(wb: XLSX.WorkBook): PartialMaster | null {
  let best: { score: number; partial: PartialMaster } | null = null;
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const res = extractEfStyleFromSheet(name, sheet);
    if (!best || res.score > best.score) best = res;
  }
  if (!best || best.score < 3) return null;
  return best.partial;
}

function parseKeyValueMasterSheet(sheet: XLSX.WorkSheet): PartialMaster {
  const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" }) as unknown[][];
  const out: PartialMaster = {};

  for (const row of allRows) {
    const label = normalizeKey(toStringVal(row?.[0]));
    if (!label) continue;
    const field = LABEL_TO_FIELD[label];
    if (!field) continue;
    const val = row?.[1];
    if (field === "empresa" || field === "periodo" || field === "banco" || field === "cuenta" || field === "generatedAt") {
      (out[field] as unknown) = toStringVal(val);
    } else {
      (out[field] as unknown) = toNumber(val);
    }
  }

  return out;
}

function parseTabularMasterSheet(sheet: XLSX.WorkSheet): PartialMaster {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (rows.length === 0) return {};

  // Prefer a row that looks like "main" (has ventas + activos, etc.)
  const best = rows.find((r) => Object.keys(r).some((k) => String(k).toLowerCase().includes("venta"))) ?? rows[0];
  const out: PartialMaster = {};

  for (const [kRaw, v] of Object.entries(best)) {
    const k = normalizeKey(String(kRaw));
    // Allow direct field names like "ventas", "activosTotales", etc.
    if (MASTER_FIELD_SET.has(k)) {
      const direct = k as keyof MasterDataset;
      if (direct === "empresa" || direct === "periodo" || direct === "banco" || direct === "cuenta" || direct === "generatedAt") {
        (out[direct] as unknown) = toStringVal(v);
      } else {
        // Numeric fields
        (out[direct] as unknown) = typeof v === "number" ? v : toNumber(v);
      }
      continue;
    }
    // Allow spanish labels as headers
    const mapped = LABEL_TO_FIELD[k];
    if (!mapped) continue;
    if (mapped === "empresa" || mapped === "periodo" || mapped === "banco" || mapped === "cuenta" || mapped === "generatedAt") {
      (out[mapped] as unknown) = toStringVal(v);
    } else {
      (out[mapped] as unknown) = toNumber(v);
    }
  }

  return out;
}

function finalizeMaster(partial: PartialMaster): MasterDataset {
  const base = computeDerivedIfMissing(partial);
  const withMonthly = ensureMonthly(base);

  // Required-ish strings
  const empresa = (withMonthly.empresa ?? "").trim() || "Empresa";
  const periodo = (withMonthly.periodo ?? "").trim() || "";
  const generatedAt = (withMonthly.generatedAt ?? "").trim() || new Date().toISOString();

  const getNum = (k: keyof MasterDataset) => safe(Number((withMonthly as Record<string, unknown>)[k] ?? 0));
  const getStr = (k: keyof MasterDataset) => toStringVal((withMonthly as Record<string, unknown>)[k] ?? "");

  return {
    generatedAt,
    empresa,
    periodo,
    ventas: getNum("ventas"),
    costoDeVentas: getNum("costoDeVentas"),
    utilidadBruta: getNum("utilidadBruta"),
    gastosOperativos: getNum("gastosOperativos"),
    ebit: getNum("ebit"),
    gastosFinancieros: getNum("gastosFinancieros"),
    impuestos: getNum("impuestos"),
    utilidadNeta: getNum("utilidadNeta"),
    otrosIngresos: getNum("otrosIngresos"),
    otrosGastos: getNum("otrosGastos"),
    depreciacion: getNum("depreciacion"),
    efectivo: getNum("efectivo"),
    cuentasPorCobrar: getNum("cuentasPorCobrar"),
    inventarios: getNum("inventarios"),
    activoCirculante: getNum("activoCirculante"),
    activoFijo: getNum("activoFijo"),
    activosTotales: getNum("activosTotales"),
    cuentasPorPagar: getNum("cuentasPorPagar"),
    deudaCortoPlazo: getNum("deudaCortoPlazo"),
    pasivoCirculante: getNum("pasivoCirculante"),
    deudaLargoPlazo: getNum("deudaLargoPlazo"),
    pasivoTotal: getNum("pasivoTotal"),
    capitalSocial: getNum("capitalSocial"),
    utilidadesRetenidas: getNum("utilidadesRetenidas"),
    capitalContable: getNum("capitalContable"),
    banco: getStr("banco"),
    cuenta: getStr("cuenta"),
    saldoInicial: getNum("saldoInicial"),
    saldoFinal: getNum("saldoFinal"),
    totalCargos: getNum("totalCargos"),
    totalAbonos: getNum("totalAbonos"),
    numTransacciones: getNum("numTransacciones"),
    margenBruto: getNum("margenBruto"),
    margenOperativo: getNum("margenOperativo"),
    margenNeto: getNum("margenNeto"),
    roa: getNum("roa"),
    roe: getNum("roe"),
    currentRatio: getNum("currentRatio"),
    acidTest: getNum("acidTest"),
    rotacionInventarios: getNum("rotacionInventarios"),
    rotacionCxC: getNum("rotacionCxC"),
    razonDeuda: getNum("razonDeuda"),
    deudaCapital: getNum("deudaCapital"),
    capitalDeTrabajo: getNum("capitalDeTrabajo"),
    monthlyRevenue: (withMonthly.monthlyRevenue ?? []).map((r) => ({
      mes: toStringVal(r.mes),
      ingresos: safe(toNumber(r.ingresos)),
      gastos: safe(toNumber(r.gastos)),
    })),
    monthlyMargins: (withMonthly.monthlyMargins ?? []).map((r) => ({
      mes: toStringVal(r.mes),
      bruto: safe(toNumber(r.bruto)),
      operativo: safe(toNumber(r.operativo)),
      neto: safe(toNumber(r.neto)),
    })),
    monthlyLeverage: (withMonthly.monthlyLeverage ?? []).map((r) => ({
      mes: toStringVal(r.mes),
      deuda: safe(toNumber(r.deuda)),
      deudaCapital: safe(toNumber(r.deudaCapital)),
    })),
    monthlyLiquidity: (withMonthly.monthlyLiquidity ?? []).map((r) => ({
      mes: toStringVal(r.mes),
      current: safe(toNumber(r.current)),
      acid: safe(toNumber(r.acid)),
    })),
  };
}

export async function importMasterFromXlsx(file: File): Promise<MasterDataset> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array", cellDates: true });

  if (!wb.SheetNames?.length) throw new Error("El archivo no contiene hojas.");

  const monthlyRevenue = parseMonthlyRevenue(wb);

  // Prefer Pontifex-exported MASTER sheet, if present.
  const masterSheetName =
    wb.SheetNames.find((n) => n.trim().toLowerCase() === "master") ??
    wb.SheetNames.find((n) => n.toLowerCase().includes("master")) ??
    null;

  if (masterSheetName) {
    const sheet = wb.Sheets[masterSheetName];
    if (!sheet) throw new Error("No se pudo leer la hoja MASTER.");
    const kv = parseKeyValueMasterSheet(sheet);
    const tab = Object.keys(kv).length > 3 ? {} : parseTabularMasterSheet(sheet);
    const combined: PartialMaster = { ...tab, ...kv, monthlyRevenue };
    const hasCoreNumbers =
      toNumber(combined.ventas) !== 0 ||
      toNumber(combined.activosTotales) !== 0 ||
      toNumber(combined.utilidadNeta) !== 0;
    if (!hasCoreNumbers) {
      throw new Error("No se detectaron campos financieros en el archivo MASTER. Verifica el formato.");
    }
    return finalizeMaster(combined);
  }

  // Fallback: accept EF-style multi-year financial statement templates (e.g. “EF ...” sheets).
  const ef = extractEfStyleFromWorkbook(wb);
  if (ef) return finalizeMaster({ ...ef, monthlyRevenue });

  throw new Error("No se detectaron datos tipo MASTER en el archivo. Asegúrate de subir un MASTER exportado por Pontifex o un template EF compatible.");
}

