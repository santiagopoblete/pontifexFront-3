import { useFinancialStore } from "@/stores/financial-store";
import type { MasterDataset } from "@/lib/financial/types";

// Fallback simulated data when no MASTER is available
const FALLBACK_DATA = {
  ventas: 293500,
  costoDeVentas: 176100,
  utilidadBruta: 117400,
  ebit: 88050,
  utilidadNeta: 108800,
  activosTotales: 620000,
  activoCirculante: 248000,
  inventarios: 62000,
  pasivoTotal: 229400,
  pasivoCirculante: 155000,
  capitalContable: 390600,
  cxcPromedio: 48500,
  ventasCredito: 220125,
  inventarioPromedio: 58000,
};

function fromMaster(m: MasterDataset) {
  return {
    ventas: m.ventas,
    costoDeVentas: m.costoDeVentas,
    utilidadBruta: m.utilidadBruta,
    ebit: m.ebit,
    utilidadNeta: m.utilidadNeta,
    activosTotales: m.activosTotales,
    activoCirculante: m.activoCirculante,
    inventarios: m.inventarios,
    pasivoTotal: m.pasivoTotal,
    pasivoCirculante: m.pasivoCirculante,
    capitalContable: m.capitalContable,
    cxcPromedio: m.cuentasPorCobrar || 48500,
    ventasCredito: m.ventas * 0.75,
    inventarioPromedio: m.inventarios || 58000,
  };
}

function computeMetrics(d: typeof FALLBACK_DATA) {
  return {
    profitability: [
      { key: "margenBruto", label: "Margen Bruto", value: d.utilidadBruta / d.ventas, fmt: "pct" as const, tooltip: "Utilidad Bruta / Ventas" },
      { key: "margenOperativo", label: "Margen Operativo", value: d.ebit / d.ventas, fmt: "pct" as const, tooltip: "EBIT / Ventas" },
      { key: "margenNeto", label: "Margen Neto", value: d.utilidadNeta / d.ventas, fmt: "pct" as const, tooltip: "Utilidad Neta / Ventas" },
      { key: "roa", label: "ROA", value: d.utilidadNeta / d.activosTotales, fmt: "pct" as const, tooltip: "Utilidad Neta / Activos Totales" },
      { key: "roe", label: "ROE", value: d.utilidadNeta / d.capitalContable, fmt: "pct" as const, tooltip: "Utilidad Neta / Capital Contable" },
    ],
    liquidity: [
      { key: "currentRatio", label: "Current Ratio", value: d.activoCirculante / d.pasivoCirculante, fmt: "x" as const, tooltip: "Activo Circulante / Pasivo Circulante" },
      { key: "acidTest", label: "Prueba Ácida", value: (d.activoCirculante - d.inventarios) / d.pasivoCirculante, fmt: "x" as const, tooltip: "(Activo Circulante − Inventarios) / Pasivo Circulante" },
    ],
    efficiency: [
      { key: "rotInv", label: "Rot. Inventarios", value: d.costoDeVentas / d.inventarioPromedio, fmt: "x" as const, tooltip: "Costo de Ventas / Inventario Promedio" },
      { key: "rotCxC", label: "Rot. CxC", value: d.ventasCredito / d.cxcPromedio, fmt: "x" as const, tooltip: "Ventas a Crédito / CxC Promedio" },
    ],
    leverage: [
      { key: "debtRatio", label: "Razón de Deuda", value: d.pasivoTotal / d.activosTotales, fmt: "pct" as const, tooltip: "Pasivo Total / Activo Total" },
      { key: "debtEquity", label: "Deuda / Capital", value: d.pasivoTotal / d.capitalContable, fmt: "x" as const, tooltip: "Pasivo Total / Capital Contable" },
    ],
  };
}

type Rating = "A" | "B" | "C" | "R";

function computeScore(metrics: ReturnType<typeof computeMetrics>): { score: number; rating: Rating; label: string } {
  let score = 0;

  const margenNeto = metrics.profitability[2].value;
  if (margenNeto > 0.25) score += 30;
  else if (margenNeto > 0.15) score += 24;
  else if (margenNeto > 0.05) score += 15;
  else score += 5;

  const roe = metrics.profitability[4].value;
  if (roe > 0.2) score += 15;
  else if (roe > 0.1) score += 10;
  else score += 4;

  const cr = metrics.liquidity[0].value;
  if (cr > 2) score += 20;
  else if (cr > 1.5) score += 16;
  else if (cr > 1) score += 10;
  else score += 3;

  const dr = metrics.leverage[0].value;
  if (dr < 0.3) score += 20;
  else if (dr < 0.5) score += 15;
  else if (dr < 0.7) score += 8;
  else score += 2;

  const rotInv = metrics.efficiency[0].value;
  if (rotInv > 4) score += 15;
  else if (rotInv > 2) score += 10;
  else score += 4;

  let rating: Rating;
  let label: string;
  if (score >= 80) { rating = "A"; label = "APTO PARA CRÉDITO"; }
  else if (score >= 60) { rating = "B"; label = "RIESGO MEDIO"; }
  else if (score >= 40) { rating = "C"; label = "ALTO RIESGO"; }
  else { rating = "R"; label = "NO APTO"; }

  return { score, rating, label };
}

function generateDecision(rating: Rating, metrics: ReturnType<typeof computeMetrics>) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const risks: string[] = [];

  const margenNeto = metrics.profitability[2].value;
  const roe = metrics.profitability[4].value;
  const cr = metrics.liquidity[0].value;
  const dr = metrics.leverage[0].value;
  const rotInv = metrics.efficiency[0].value;

  if (margenNeto > 0.2) strengths.push("Margen neto sólido que indica alta eficiencia operativa.");
  else if (margenNeto < 0.1) weaknesses.push("Margen neto bajo, lo que limita la capacidad de absorber pérdidas.");

  if (roe > 0.15) strengths.push("Retorno sobre capital atractivo para inversionistas.");
  else if (roe < 0.08) weaknesses.push("ROE bajo sugiere uso ineficiente del capital contable.");

  if (cr > 1.5) strengths.push("Liquidez corriente adecuada para cubrir obligaciones a corto plazo.");
  else if (cr < 1) risks.push("Liquidez insuficiente: el activo circulante no cubre el pasivo circulante.");

  if (dr < 0.4) strengths.push("Nivel de endeudamiento conservador y manejable.");
  else if (dr > 0.6) risks.push("Alto nivel de apalancamiento aumenta la vulnerabilidad ante variaciones de tasa.");

  if (rotInv > 3) strengths.push("Rotación de inventarios eficiente.");
  else weaknesses.push("Rotación de inventarios lenta, posible acumulación de stock.");

  if (strengths.length === 0) strengths.push("No se identificaron fortalezas destacables con los datos disponibles.");
  if (weaknesses.length === 0) weaknesses.push("No se identificaron debilidades significativas.");
  if (risks.length === 0) risks.push("Riesgos financieros dentro de parámetros aceptables.");

  const recMap: Record<Rating, string> = {
    A: "Se recomienda aprobar la línea de crédito. La empresa presenta indicadores financieros sólidos, con buena rentabilidad, liquidez adecuada y un nivel de endeudamiento controlado.",
    B: "Se sugiere aprobar con condiciones. La empresa muestra indicadores aceptables pero con áreas de mejora. Se recomienda establecer garantías adicionales y monitoreo periódico.",
    C: "Se recomienda precaución. Los indicadores financieros presentan debilidades que podrían comprometer la capacidad de pago. Considerar aprobación parcial con garantías sólidas.",
    R: "No se recomienda otorgar crédito. Los indicadores financieros muestran un perfil de riesgo que excede los parámetros aceptables de la institución.",
  };

  return { strengths, weaknesses, risks, recommendation: recMap[rating] };
}

export function useCreditAnalysis() {
  const { master } = useFinancialStore();

  if (!master) {
    return {
      metrics: computeMetrics(FALLBACK_DATA),
      score: 0,
      rating: "R" as Rating,
      label: "SIN DATOS",
      strengths: [],
      weaknesses: [],
      risks: [],
      recommendation: "No hay datos disponibles. Genera el MASTER primero.",
      chartData: { revenueTrend: [], margins: [], leverage: [], liquidity: [] },
      usingRealData: false,
      empresa: "",
      categories: [],
    };
  }

  const sourceData = fromMaster(master);
  const usingRealData = true;

  const metrics = computeMetrics(sourceData);
  const { score, rating, label } = computeScore(metrics);
  const { strengths, weaknesses, risks, recommendation } = generateDecision(rating, metrics);

  // Chart data: use MASTER monthly data if available, otherwise fallback
  const chartData = master ? {
    revenueTrend: master.monthlyRevenue,
    margins: master.monthlyMargins,
    leverage: master.monthlyLeverage,
    liquidity: master.monthlyLiquidity,
  } : {
    revenueTrend: [
      { mes: "Ene", ingresos: 42000, gastos: 28000 },
      { mes: "Feb", ingresos: 38500, gastos: 31000 },
      { mes: "Mar", ingresos: 51000, gastos: 27500 },
      { mes: "Abr", ingresos: 47800, gastos: 33000 },
      { mes: "May", ingresos: 53200, gastos: 29800 },
      { mes: "Jun", ingresos: 61000, gastos: 35400 },
    ],
    margins: [
      { mes: "Ene", bruto: 0.40, operativo: 0.28, neto: 0.22 },
      { mes: "Feb", bruto: 0.38, operativo: 0.25, neto: 0.19 },
      { mes: "Mar", bruto: 0.46, operativo: 0.32, neto: 0.27 },
      { mes: "Abr", bruto: 0.41, operativo: 0.29, neto: 0.23 },
      { mes: "May", bruto: 0.44, operativo: 0.31, neto: 0.26 },
      { mes: "Jun", bruto: 0.42, operativo: 0.30, neto: 0.25 },
    ],
    leverage: [
      { mes: "Ene", deuda: 0.40, deudaCapital: 0.67 },
      { mes: "Feb", deuda: 0.39, deudaCapital: 0.64 },
      { mes: "Mar", deuda: 0.37, deudaCapital: 0.59 },
      { mes: "Abr", deuda: 0.38, deudaCapital: 0.61 },
      { mes: "May", deuda: 0.37, deudaCapital: 0.59 },
      { mes: "Jun", deuda: 0.37, deudaCapital: 0.59 },
    ],
    liquidity: [
      { mes: "Ene", current: 1.45, acid: 1.05 },
      { mes: "Feb", current: 1.50, acid: 1.10 },
      { mes: "Mar", current: 1.55, acid: 1.12 },
      { mes: "Abr", current: 1.52, acid: 1.08 },
      { mes: "May", current: 1.58, acid: 1.15 },
      { mes: "Jun", current: 1.60, acid: 1.20 },
    ],
  };

  return {
    metrics,
    score,
    rating,
    label,
    strengths,
    weaknesses,
    risks,
    recommendation,
    chartData,
    usingRealData,
    empresa: master?.empresa || "Empresa (datos demo)",
    categories: [
      { name: "Rentabilidad", score: rating === "A" ? 28 : rating === "B" ? 22 : 14, max: 30 },
      { name: "Liquidez", score: rating === "A" ? 18 : rating === "B" ? 14 : 8, max: 20 },
      { name: "Eficiencia", score: rating === "A" ? 13 : rating === "B" ? 9 : 5, max: 15 },
      { name: "Apalancamiento", score: rating === "A" ? 17 : rating === "B" ? 12 : 6, max: 20 },
      { name: "ROE", score: rating === "A" ? 14 : rating === "B" ? 10 : 5, max: 15 },
    ],
  };
}
