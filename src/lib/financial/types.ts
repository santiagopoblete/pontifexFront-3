// ─── Document Types ───
export type DocumentType = "estado_cuenta" | "estado_resultados" | "balance_general";

export type ProcessingStatus = "pending" | "detecting" | "parsing" | "validated" | "error" | "duplicate";

export interface DocumentMeta {
  id: string;
  fileName: string;
  fileSize: number;
  documentType: DocumentType | null;
  bank: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  status: ProcessingStatus;
  errors: string[];
  warnings: string[];
  hash: string;
}

// ─── Estado de Cuenta (Bank Statement) ───
export interface BankTransaction {
  fecha: string;
  concepto: string;
  referencia: string;
  cargo: number;
  abono: number;
  saldo: number;
}

export interface EstadoCuentaData {
  tipo: "estado_cuenta";
  banco: string;
  cuenta: string;
  titular: string;
  periodoInicio: string;
  periodoFin: string;
  saldoInicial: number;
  saldoFinal: number;
  totalCargos: number;
  totalAbonos: number;
  transacciones: BankTransaction[];
}

// ─── Estado de Resultados (Income Statement) ───
export interface EstadoResultadosData {
  tipo: "estado_resultados";
  empresa: string;
  periodoInicio: string;
  periodoFin: string;
  ventas: number;
  costoDeVentas: number;
  utilidadBruta: number;
  gastosOperativos: number;
  ebit: number;
  gastosFinancieros: number;
  impuestos: number;
  utilidadNeta: number;
  otrosIngresos: number;
  otrosGastos: number;
  depreciacion: number;
}

// ─── Balance General (Balance Sheet) ───
export interface BalanceGeneralData {
  tipo: "balance_general";
  empresa: string;
  fecha: string;
  // Activos
  efectivo: number;
  cuentasPorCobrar: number;
  inventarios: number;
  otrosActivosCirculantes: number;
  activoCirculante: number;
  activoFijo: number;
  otrosActivosNoCorrientes: number;
  activosTotales: number;
  // Pasivos
  cuentasPorPagar: number;
  deudaCortoPlazo: number;
  otrosPasivosCirculantes: number;
  pasivoCirculante: number;
  deudaLargoPlazo: number;
  otrosPasivosNoCorrientes: number;
  pasivoTotal: number;
  // Capital
  capitalSocial: number;
  utilidadesRetenidas: number;
  capitalContable: number;
}

// ─── Processed Document ───
export interface ProcessedDocument {
  meta: DocumentMeta;
  data: EstadoCuentaData | EstadoResultadosData | BalanceGeneralData | null;
  rawHeaders: string[];
  rawRowCount: number;
}

// ─── MASTER Dataset ───
export interface MasterDataset {
  generatedAt: string;
  empresa: string;
  periodo: string;
  // Income Statement fields
  ventas: number;
  costoDeVentas: number;
  utilidadBruta: number;
  gastosOperativos: number;
  ebit: number;
  gastosFinancieros: number;
  impuestos: number;
  utilidadNeta: number;
  otrosIngresos: number;
  otrosGastos: number;
  depreciacion: number;
  // Balance Sheet fields
  efectivo: number;
  cuentasPorCobrar: number;
  inventarios: number;
  activoCirculante: number;
  activoFijo: number;
  activosTotales: number;
  cuentasPorPagar: number;
  deudaCortoPlazo: number;
  pasivoCirculante: number;
  deudaLargoPlazo: number;
  pasivoTotal: number;
  capitalSocial: number;
  utilidadesRetenidas: number;
  capitalContable: number;
  // Bank Statement fields
  banco: string;
  cuenta: string;
  saldoInicial: number;
  saldoFinal: number;
  totalCargos: number;
  totalAbonos: number;
  numTransacciones: number;
  // Derived Metrics
  margenBruto: number;
  margenOperativo: number;
  margenNeto: number;
  roa: number;
  roe: number;
  currentRatio: number;
  acidTest: number;
  rotacionInventarios: number;
  rotacionCxC: number;
  razonDeuda: number;
  deudaCapital: number;
  capitalDeTrabajo: number;
  // Monthly breakdowns for charts
  monthlyRevenue: { mes: string; ingresos: number; gastos: number }[];
  monthlyMargins: { mes: string; bruto: number; operativo: number; neto: number }[];
  monthlyLeverage: { mes: string; deuda: number; deudaCapital: number }[];
  monthlyLiquidity: { mes: string; current: number; acid: number }[];
}

// ─── Duplicate Info ───
export interface DuplicateMatch {
  existingDocId: string;
  existingFileName: string;
  reason: string;
  confidence: number;
}

// ─── Validation Result ───
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
