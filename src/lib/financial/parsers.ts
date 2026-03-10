import type {
  EstadoCuentaData,
  EstadoResultadosData,
  BalanceGeneralData,
  BankTransaction,
} from "./types";

type Row = Record<string, unknown>;

function num(val: unknown): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  // Handle formatted numbers: $1,234.56 or (1,234.56) for negatives
  let s = String(val).trim();
  const isNeg = s.startsWith("(") && s.endsWith(")") || s.startsWith("-");
  s = s.replace(/[$,\s()]/g, "");
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  return isNeg && n > 0 ? -n : n;
}

function str(val: unknown): string {
  return val == null ? "" : String(val).trim();
}

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
}

function findCol(headers: string[], ...candidates: string[]): string | null {
  for (const c of candidates) {
    const cn = norm(c);
    const found = headers.find(h => norm(h).includes(cn));
    if (found) return found;
  }
  return null;
}

/**
 * Scans all rows looking for a concept-value pattern.
 * Many financial docs have concept names in one column and values in adjacent columns.
 * This function scans ALL columns in ALL rows for known financial terms.
 */
function scanForConceptValuePairs(rows: Row[], headers: string[]): Record<string, number> {
  const data: Record<string, number> = {};

  for (const row of rows) {
    const values = headers.map(h => row[h]);

    // Strategy 1: Check each cell for a known financial term, then grab the numeric value from adjacent cells
    for (let i = 0; i < values.length; i++) {
      const cellStr = str(values[i]);
      if (!cellStr || cellStr.length > 100) continue;

      const cellNorm = norm(cellStr);
      // Skip if it's purely a number
      if (cellNorm && isNaN(Number(cellStr.replace(/[$,\s()%-]/g, "")))) {
        // This cell contains text - look for numeric values in other cells of same row
        for (let j = 0; j < values.length; j++) {
          if (j === i) continue;
          const v = num(values[j]);
          if (v !== 0) {
            // Store with normalized concept as key
            // If we already have this key with a value, prefer the one closest to the text column
            const existing = data[cellNorm];
            if (existing === undefined || Math.abs(j - i) < 3) {
              data[cellNorm] = v;
            }
            break; // take first numeric value found
          }
        }
        // Also store zero-value entries so we at least register the concept
        if (data[cellNorm] === undefined) {
          // Try harder - check for any non-zero numeric in remaining columns
          for (let j = values.length - 1; j >= 0; j--) {
            if (j === i) continue;
            const v = num(values[j]);
            if (v !== 0) {
              data[cellNorm] = v;
              break;
            }
          }
        }
      }
    }
  }

  return data;
}

/**
 * Enhanced finder that searches with fuzzy matching across all scanned concepts
 */
function createFinder(data: Record<string, number>) {
  return (...keys: string[]): number => {
    for (const k of keys) {
      const kn = norm(k);
      // Exact include match
      for (const [dk, dv] of Object.entries(data)) {
        if (dk.includes(kn) || kn.includes(dk)) return dv;
      }
      // Word-based match
      const kWords = kn.split(/\s+/).filter(w => w.length > 2);
      if (kWords.length > 0) {
        for (const [dk, dv] of Object.entries(data)) {
          const matchCount = kWords.filter(w => dk.includes(w)).length;
          if (matchCount >= Math.ceil(kWords.length * 0.6)) return dv;
        }
      }
    }
    return 0;
  };
}

function extractDates(rows: Row[], headers: string[]): { start: string; end: string } {
  const dateCol = findCol(headers, "fecha", "date", "periodo", "fecha valor", "fecha operacion");
  if (!dateCol) return { start: "", end: "" };

  const dates = rows
    .map(r => str(r[dateCol]))
    .filter(d => d.length > 0)
    .sort();

  return { start: dates[0] || "", end: dates[dates.length - 1] || "" };
}

// ─── Estado de Cuenta Parser ───
export function parseEstadoCuenta(rows: Row[], headers: string[], bank: string | null): EstadoCuentaData {
  const fechaCol = findCol(headers, "fecha", "date", "fecha valor", "fecha operacion", "fecha mov", "dia");
  const conceptoCol = findCol(headers, "concepto", "descripcion", "detalle", "movimiento", "referencia numerica");
  const refCol = findCol(headers, "referencia", "ref", "numero", "folio", "clave rastreo");
  const cargoCol = findCol(headers, "cargo", "retiro", "debito", "debe", "cargos", "salida");
  const abonoCol = findCol(headers, "abono", "deposito", "credito", "haber", "abonos", "entrada");
  const saldoCol = findCol(headers, "saldo", "balance", "saldo final", "saldo resultante");

  // If we can't find separate cargo/abono columns, look for a single "monto"/"importe" column
  const montoCol = !cargoCol && !abonoCol ? findCol(headers, "monto", "importe", "cantidad", "amount") : null;

  const transacciones: BankTransaction[] = rows.map(r => {
    const fecha = str(r[fechaCol || ""]);
    const concepto = str(r[conceptoCol || ""]);
    const referencia = str(r[refCol || ""]);
    let cargo = num(r[cargoCol || ""]);
    let abono = num(r[abonoCol || ""]);
    const saldo = num(r[saldoCol || ""]);

    // If using a single monto column, classify by sign
    if (montoCol) {
      const monto = num(r[montoCol]);
      if (monto < 0) cargo = Math.abs(monto);
      else abono = monto;
    }

    return { fecha, concepto, referencia, cargo, abono, saldo };
  }).filter(t => {
    // Keep row if it has at least some meaningful data
    return (t.fecha.length > 0 || t.concepto.length > 0) && (t.cargo !== 0 || t.abono !== 0 || t.saldo !== 0);
  });

  const totalCargos = transacciones.reduce((s, t) => s + t.cargo, 0);
  const totalAbonos = transacciones.reduce((s, t) => s + t.abono, 0);
  const saldos = transacciones.filter(t => t.saldo !== 0);
  const saldoInicial = saldos.length > 0 ? saldos[0].saldo : 0;
  const saldoFinal = saldos.length > 0 ? saldos[saldos.length - 1].saldo : 0;

  const { start, end } = extractDates(rows, headers);

  const cuentaCol = findCol(headers, "cuenta", "account", "no cuenta", "numero de cuenta");
  const titularCol = findCol(headers, "titular", "nombre", "cliente", "razon social");

  return {
    tipo: "estado_cuenta",
    banco: bank || "Desconocido",
    cuenta: cuentaCol ? str(rows[0]?.[cuentaCol]) : "",
    titular: titularCol ? str(rows[0]?.[titularCol]) : "",
    periodoInicio: start,
    periodoFin: end,
    saldoInicial,
    saldoFinal,
    totalCargos,
    totalAbonos,
    transacciones,
  };
}

// ─── Estado de Resultados Parser ───
export function parseEstadoResultados(rows: Row[], headers: string[]): EstadoResultadosData {
  // Strategy 1: Try concept-value column pairing
  const conceptCol = findCol(headers, "concepto", "cuenta", "rubro", "partida", "descripcion", "nombre");
  const valueCol = findCol(headers, "monto", "valor", "importe", "total", "saldo", "cantidad", "parcial", "acumulado");

  let data: Record<string, number> = {};

  if (conceptCol && valueCol) {
    for (const r of rows) {
      const concept = norm(str(r[conceptCol]));
      if (!concept) continue;
      const value = num(r[valueCol]);
      data[concept] = value;
    }
  }

  // Strategy 2: Scan all cells for concept-value pairs (works with unstructured layouts)
  const scanned = scanForConceptValuePairs(rows, headers);
  // Merge - scanned data fills gaps
  for (const [k, v] of Object.entries(scanned)) {
    if (data[k] === undefined || data[k] === 0) {
      data[k] = v;
    }
  }

  // Strategy 3: Try flat key-value from headers (single row with header names as concepts)
  if (Object.keys(data).length === 0) {
    for (const h of headers) {
      const hn = norm(h);
      if (rows[0]) data[hn] = num(rows[0][h]);
    }
  }

  const find = createFinder(data);

  const ventas = find("ventas", "ingresos", "revenue", "ventas netas", "ingresos netos", "ingresos totales", "ventas totales");
  const costoDeVentas = find("costo de ventas", "costo ventas", "cost of goods", "cogs", "costo de lo vendido");
  const utilidadBruta = find("utilidad bruta", "gross profit") || (ventas - costoDeVentas);
  const gastosOperativos = find("gastos operativos", "gastos de operacion", "operating expenses", "gastos administracion", "gastos generales", "gastos de administracion");
  const ebit = find("ebit", "utilidad operativa", "utilidad de operacion", "operating income", "resultado operativo") || (utilidadBruta - gastosOperativos);
  const gastosFinancieros = find("gastos financieros", "intereses", "interest expense", "costo integral de financiamiento", "resultado integral financiamiento");
  const impuestos = find("impuestos", "isr", "income tax", "provision impuestos", "impuesto sobre la renta", "isr y ptu");
  const utilidadNeta = find("utilidad neta", "net income", "resultado neto", "resultado del ejercicio", "utilidad del ejercicio") || (ebit - gastosFinancieros - impuestos);
  const otrosIngresos = find("otros ingresos", "other income", "productos financieros");
  const otrosGastos = find("otros gastos", "other expenses");
  const depreciacion = find("depreciacion", "amortizacion", "depreciation", "depreciacion y amortizacion");

  const { start, end } = extractDates(rows, headers);
  const empresaCol = findCol(headers, "empresa", "razon social", "compania", "company");

  return {
    tipo: "estado_resultados",
    empresa: empresaCol ? str(rows[0]?.[empresaCol]) : "",
    periodoInicio: start || "",
    periodoFin: end || "",
    ventas,
    costoDeVentas,
    utilidadBruta,
    gastosOperativos,
    ebit,
    gastosFinancieros,
    impuestos,
    utilidadNeta,
    otrosIngresos,
    otrosGastos,
    depreciacion,
  };
}

// ─── Balance General Parser ───
export function parseBalanceGeneral(rows: Row[], headers: string[]): BalanceGeneralData {
  const conceptCol = findCol(headers, "concepto", "cuenta", "rubro", "partida", "descripcion", "nombre");
  const valueCol = findCol(headers, "monto", "valor", "importe", "total", "saldo", "cantidad", "parcial", "acumulado");

  let data: Record<string, number> = {};

  if (conceptCol && valueCol) {
    for (const r of rows) {
      const concept = norm(str(r[conceptCol]));
      if (!concept) continue;
      const value = num(r[valueCol]);
      data[concept] = value;
    }
  }

  // Strategy 2: Scan all cells
  const scanned = scanForConceptValuePairs(rows, headers);
  for (const [k, v] of Object.entries(scanned)) {
    if (data[k] === undefined || data[k] === 0) {
      data[k] = v;
    }
  }

  // Strategy 3: Flat headers
  if (Object.keys(data).length === 0) {
    for (const h of headers) {
      const hn = norm(h);
      if (rows[0]) data[hn] = num(rows[0][h]);
    }
  }

  const find = createFinder(data);

  const efectivo = find("efectivo", "caja", "bancos", "cash", "efectivo y equivalentes", "efectivo e inversiones");
  const cuentasPorCobrar = find("cuentas por cobrar", "clientes", "accounts receivable", "deudores");
  const inventarios = find("inventarios", "inventario", "inventory", "almacen");
  const otrosActivosCirculantes = find("otros activos circulantes", "other current assets", "pagos anticipados");
  const activoCirculante = find("activo circulante", "current assets", "activos corrientes", "total activo circulante") || (efectivo + cuentasPorCobrar + inventarios + otrosActivosCirculantes);
  const activoFijo = find("activo fijo", "propiedad planta", "fixed assets", "inmuebles maquinaria", "activo no circulante", "propiedades", "activo fijo neto");
  const otrosActivosNoCorrientes = find("otros activos no corrientes", "intangibles", "other non-current", "activos intangibles", "activos diferidos");
  const activosTotales = find("activo total", "activos totales", "total assets", "total de activos", "total activo", "suma del activo") || (activoCirculante + activoFijo + otrosActivosNoCorrientes);

  const cuentasPorPagar = find("cuentas por pagar", "proveedores", "accounts payable", "acreedores");
  const deudaCortoPlazo = find("deuda corto plazo", "prestamos corto plazo", "short term debt", "porcion circulante", "creditos bancarios corto");
  const otrosPasivosCirculantes = find("otros pasivos circulantes", "other current liabilities", "impuestos por pagar");
  const pasivoCirculante = find("pasivo circulante", "current liabilities", "pasivos corrientes", "total pasivo circulante") || (cuentasPorPagar + deudaCortoPlazo + otrosPasivosCirculantes);
  const deudaLargoPlazo = find("deuda largo plazo", "prestamos largo plazo", "long term debt", "creditos bancarios largo");
  const otrosPasivosNoCorrientes = find("otros pasivos no corrientes", "other non-current liabilities");
  const pasivoTotal = find("pasivo total", "pasivos totales", "total liabilities", "total de pasivos", "total pasivo", "suma del pasivo") || (pasivoCirculante + deudaLargoPlazo + otrosPasivosNoCorrientes);

  const capitalSocial = find("capital social", "share capital", "capital pagado", "capital contribuido");
  const utilidadesRetenidas = find("utilidades retenidas", "retained earnings", "resultados acumulados", "resultado de ejercicios anteriores", "utilidades acumuladas");
  const capitalContable = find("capital contable", "patrimonio", "stockholders equity", "total equity", "capital total", "total capital contable", "suma del capital") || (capitalSocial + utilidadesRetenidas);

  const fechaCol = findCol(headers, "fecha", "date", "periodo", "al");
  const empresaCol = findCol(headers, "empresa", "razon social", "compania");

  return {
    tipo: "balance_general",
    empresa: empresaCol ? str(rows[0]?.[empresaCol]) : "",
    fecha: fechaCol ? str(rows[0]?.[fechaCol]) : "",
    efectivo,
    cuentasPorCobrar,
    inventarios,
    otrosActivosCirculantes,
    activoCirculante,
    activoFijo,
    otrosActivosNoCorrientes,
    activosTotales,
    cuentasPorPagar,
    deudaCortoPlazo,
    otrosPasivosCirculantes,
    pasivoCirculante,
    deudaLargoPlazo,
    otrosPasivosNoCorrientes,
    pasivoTotal,
    capitalSocial,
    utilidadesRetenidas,
    capitalContable,
  };
}
