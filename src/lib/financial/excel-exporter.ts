import * as XLSX from "xlsx";
import type {
  EstadoCuentaData,
  EstadoResultadosData,
  BalanceGeneralData,
  MasterDataset,
} from "./types";

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Export Estado de Cuenta ───
export function exportEstadoCuenta(data: EstadoCuentaData) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summary = [
    ["ESTADO DE CUENTA - FORMATO ESTANDARIZADO"],
    [],
    ["Banco", data.banco],
    ["Cuenta", data.cuenta],
    ["Titular", data.titular],
    ["Periodo Inicio", data.periodoInicio],
    ["Periodo Fin", data.periodoFin],
    ["Saldo Inicial", data.saldoInicial],
    ["Saldo Final", data.saldoFinal],
    ["Total Cargos", data.totalCargos],
    ["Total Abonos", data.totalAbonos],
    ["Num. Transacciones", data.transacciones.length],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Resumen");

  // Transactions sheet
  const txHeaders = ["Fecha", "Concepto", "Referencia", "Cargo", "Abono", "Saldo"];
  const txRows = data.transacciones.map(t => [t.fecha, t.concepto, t.referencia, t.cargo, t.abono, t.saldo]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]), "Transacciones");

  downloadWorkbook(wb, `EC_${data.banco}_${data.periodoInicio || "sin_fecha"}.xlsx`);
}

// ─── Export Estado de Resultados ───
export function exportEstadoResultados(data: EstadoResultadosData) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ["ESTADO DE RESULTADOS - FORMATO ESTANDARIZADO"],
    [],
    ["Empresa", data.empresa],
    ["Periodo Inicio", data.periodoInicio],
    ["Periodo Fin", data.periodoFin],
    [],
    ["Concepto", "Monto"],
    ["Ventas Netas", data.ventas],
    ["(-) Costo de Ventas", data.costoDeVentas],
    ["= Utilidad Bruta", data.utilidadBruta],
    ["(-) Gastos Operativos", data.gastosOperativos],
    ["= EBIT (Utilidad Operativa)", data.ebit],
    ["(-) Gastos Financieros", data.gastosFinancieros],
    ["(+) Otros Ingresos", data.otrosIngresos],
    ["(-) Otros Gastos", data.otrosGastos],
    ["(-) Depreciación", data.depreciacion],
    ["(-) Impuestos", data.impuestos],
    ["= Utilidad Neta", data.utilidadNeta],
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Estado de Resultados");
  downloadWorkbook(wb, `ER_${data.empresa || "empresa"}_${data.periodoInicio || "sin_fecha"}.xlsx`);
}

// ─── Export Balance General ───
export function exportBalanceGeneral(data: BalanceGeneralData) {
  const wb = XLSX.utils.book_new();

  const rows = [
    ["BALANCE GENERAL - FORMATO ESTANDARIZADO"],
    [],
    ["Empresa", data.empresa],
    ["Fecha", data.fecha],
    [],
    ["ACTIVOS", ""],
    ["Concepto", "Monto"],
    ["Efectivo y Equivalentes", data.efectivo],
    ["Cuentas por Cobrar", data.cuentasPorCobrar],
    ["Inventarios", data.inventarios],
    ["Otros Activos Circulantes", data.otrosActivosCirculantes],
    ["ACTIVO CIRCULANTE", data.activoCirculante],
    ["Activo Fijo", data.activoFijo],
    ["Otros Activos No Corrientes", data.otrosActivosNoCorrientes],
    ["ACTIVOS TOTALES", data.activosTotales],
    [],
    ["PASIVOS", ""],
    ["Cuentas por Pagar", data.cuentasPorPagar],
    ["Deuda Corto Plazo", data.deudaCortoPlazo],
    ["Otros Pasivos Circulantes", data.otrosPasivosCirculantes],
    ["PASIVO CIRCULANTE", data.pasivoCirculante],
    ["Deuda Largo Plazo", data.deudaLargoPlazo],
    ["Otros Pasivos No Corrientes", data.otrosPasivosNoCorrientes],
    ["PASIVO TOTAL", data.pasivoTotal],
    [],
    ["CAPITAL", ""],
    ["Capital Social", data.capitalSocial],
    ["Utilidades Retenidas", data.utilidadesRetenidas],
    ["CAPITAL CONTABLE", data.capitalContable],
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Balance General");
  downloadWorkbook(wb, `BG_${data.empresa || "empresa"}_${data.fecha || "sin_fecha"}.xlsx`);
}

// ─── Export MASTER ───
export function exportMaster(master: MasterDataset) {
  const wb = XLSX.utils.book_new();

  // Main sheet
  const mainRows = [
    ["MASTER DATASET - PONTIFEX"],
    ["Generado", master.generatedAt],
    ["Empresa", master.empresa],
    ["Periodo", master.periodo],
    [],
    ["═══ ESTADO DE RESULTADOS ═══", ""],
    ["Ventas Netas", master.ventas],
    ["Costo de Ventas", master.costoDeVentas],
    ["Utilidad Bruta", master.utilidadBruta],
    ["Gastos Operativos", master.gastosOperativos],
    ["EBIT", master.ebit],
    ["Gastos Financieros", master.gastosFinancieros],
    ["Impuestos", master.impuestos],
    ["Utilidad Neta", master.utilidadNeta],
    ["Otros Ingresos", master.otrosIngresos],
    ["Otros Gastos", master.otrosGastos],
    ["Depreciación", master.depreciacion],
    [],
    ["═══ BALANCE GENERAL ═══", ""],
    ["Efectivo", master.efectivo],
    ["Cuentas por Cobrar", master.cuentasPorCobrar],
    ["Inventarios", master.inventarios],
    ["Activo Circulante", master.activoCirculante],
    ["Activo Fijo", master.activoFijo],
    ["Activos Totales", master.activosTotales],
    ["Cuentas por Pagar", master.cuentasPorPagar],
    ["Deuda Corto Plazo", master.deudaCortoPlazo],
    ["Pasivo Circulante", master.pasivoCirculante],
    ["Deuda Largo Plazo", master.deudaLargoPlazo],
    ["Pasivo Total", master.pasivoTotal],
    ["Capital Social", master.capitalSocial],
    ["Utilidades Retenidas", master.utilidadesRetenidas],
    ["Capital Contable", master.capitalContable],
    [],
    ["═══ ESTADO DE CUENTA ═══", ""],
    ["Banco", master.banco],
    ["Cuenta", master.cuenta],
    ["Saldo Inicial", master.saldoInicial],
    ["Saldo Final", master.saldoFinal],
    ["Total Cargos", master.totalCargos],
    ["Total Abonos", master.totalAbonos],
    ["Num. Transacciones", master.numTransacciones],
    [],
    ["═══ MÉTRICAS DERIVADAS ═══", ""],
    ["Margen Bruto", master.margenBruto],
    ["Margen Operativo", master.margenOperativo],
    ["Margen Neto", master.margenNeto],
    ["ROA", master.roa],
    ["ROE", master.roe],
    ["Current Ratio", master.currentRatio],
    ["Prueba Ácida", master.acidTest],
    ["Rotación Inventarios", master.rotacionInventarios],
    ["Rotación CxC", master.rotacionCxC],
    ["Razón de Deuda", master.razonDeuda],
    ["Deuda / Capital", master.deudaCapital],
    ["Capital de Trabajo", master.capitalDeTrabajo],
  ];

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mainRows), "MASTER");

  // Monthly data sheets
  if (master.monthlyRevenue.length > 0) {
    const revHeaders = ["Mes", "Ingresos", "Gastos"];
    const revRows = master.monthlyRevenue.map(r => [r.mes, r.ingresos, r.gastos]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([revHeaders, ...revRows]), "Ingresos Mensuales");
  }

  downloadWorkbook(wb, `MASTER_${master.empresa || "empresa"}_${master.periodo || "sin_fecha"}.xlsx`);
}
