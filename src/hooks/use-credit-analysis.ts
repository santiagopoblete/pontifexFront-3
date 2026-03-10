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
  flujoEfectivo: 82000,
  cxcPromedio: 48500,
  ventasCredito: 220125,
  inventarioPromedio: 58000,
  antiguedadAnios: 3,
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
    // Simple proxy de flujo de efectivo operativo:
    // utilidadNeta + depreciación (si la hay) como aproximación rápida.
    flujoEfectivo: m.utilidadNeta + (m.depreciacion || 0),
    cxcPromedio: m.cuentasPorCobrar || 48500,
    ventasCredito: m.ventas * 0.5,
    inventarioPromedio: m.inventarios || 58000,
    antiguedadAnios: estimateAntiguedadAnios(m),
  };
}

function estimateAntiguedadAnios(m: MasterDataset): number {
  const periodo = m.periodo || "";
  const match = periodo.match(/(\d{4}).*?(\d{4})/);
  if (match) {
    const y1 = Number(match[1]);
    const y2 = Number(match[2]);
    if (Number.isFinite(y1) && Number.isFinite(y2) && y2 >= y1) {
      return Math.max(1, y2 - y1 + 1);
    }
  }
  return 0;
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
      {
        key: "cashFlow",
        label: "Flujo de Efectivo",
        value: d.flujoEfectivo / d.ventas,
        fmt: "pct" as const,
        tooltip: "Flujo de efectivo operativo aproximado / Ventas",
      },
    ],
    efficiency: [
      { key: "rotInv", label: "Rot. Inventarios", value: d.costoDeVentas / d.inventarioPromedio, fmt: "x" as const, tooltip: "Costo de Ventas / Inventario Promedio" },
      { key: "rotCxC", label: "Rot. CxC", value: d.ventasCredito / d.cxcPromedio, fmt: "x" as const, tooltip: "Ventas a Crédito / CxC Promedio" },
      {
        key: "antiguedad",
        label: "Antigüedad (años)",
        value: d.antiguedadAnios,
        fmt: "x" as const,
        tooltip: "Años estimados de operación de la empresa según el periodo del MASTER",
      },
    ],
    leverage: [
      { key: "debtRatio", label: "Razón de Deuda", value: d.pasivoTotal / d.activosTotales, fmt: "pct" as const, tooltip: "Pasivo Total / Activo Total" },
      { key: "debtEquity", label: "Deuda / Capital", value: d.pasivoTotal / d.capitalContable, fmt: "x" as const, tooltip: "Pasivo Total / Capital Contable" },
    ],
  };
}

type Rating = "RIESGO_BAJO" | "RIESGO_MEDIO" | "RIESGO_ALTO";

interface ScoreBreakdown {
  rentabilidad: number;
  liquidez: number;
  eficiencia: number;
  apalancamiento: number;
  roe: number;
}

function computeScore(
  metrics: ReturnType<typeof computeMetrics>,
): { score: number; rating: Rating; label: string; breakdown: ScoreBreakdown } {
  let score = 0;
  const breakdown: ScoreBreakdown = {
    rentabilidad: 0,
    liquidez: 0,
    eficiencia: 0,
    apalancamiento: 0,
    roe: 0,
  };

  const margenNeto = metrics.profitability[2].value;
  if (margenNeto > 0.25) { score += 30; breakdown.rentabilidad += 30; }
  else if (margenNeto > 0.15) { score += 24; breakdown.rentabilidad += 24; }
  else if (margenNeto > 0.05) { score += 15; breakdown.rentabilidad += 15; }
  else { score += 5; breakdown.rentabilidad += 5; }

  const roe = metrics.profitability[4].value;
  if (roe > 0.2) { score += 15; breakdown.roe += 15; }
  else if (roe > 0.1) { score += 10; breakdown.roe += 10; }
  else { score += 4; breakdown.roe += 4; }

  const cr = metrics.liquidity[0].value;
  if (cr > 2) { score += 20; breakdown.liquidez += 20; }
  else if (cr > 1.5) { score += 16; breakdown.liquidez += 16; }
  else if (cr > 1) { score += 10; breakdown.liquidez += 10; }
  else { score += 3; breakdown.liquidez += 3; }

  // Flujo de efectivo (liquidez dinámica) – peso importante pero menor
  const cashFlowMargin = metrics.liquidity[2]?.value ?? 0;
  if (cashFlowMargin > 0.18) { score += 12; breakdown.liquidez += 12; }
  else if (cashFlowMargin > 0.1) { score += 8; breakdown.liquidez += 8; }
  else if (cashFlowMargin > 0.03) { score += 4; breakdown.liquidez += 4; }
  else { score += 1; breakdown.liquidez += 1; }

  const dr = metrics.leverage[0].value;
  if (dr < 0.3) { score += 16; breakdown.apalancamiento += 16; }
  else if (dr < 0.5) { score += 12; breakdown.apalancamiento += 12; }
  else if (dr < 0.7) { score += 6; breakdown.apalancamiento += 6; }
  else { score += 2; breakdown.apalancamiento += 2; }

  // Deuda / Capital (debtEquity): apalancamiento adicional
  const debtEquity = metrics.leverage[1]?.value ?? 0;
  if (debtEquity < 0.8) { score += 6; breakdown.apalancamiento += 6; }
  else if (debtEquity < 1.5) { score += 4; breakdown.apalancamiento += 4; }
  else if (debtEquity < 2.5) { score += 2; breakdown.apalancamiento += 2; }

  const rotInv = metrics.efficiency[0].value;
  if (rotInv > 4) { score += 15; breakdown.eficiencia += 15; }
  else if (rotInv > 2) { score += 10; breakdown.eficiencia += 10; }
  else { score += 4; breakdown.eficiencia += 4; }

  const antiguedadMetric = metrics.efficiency.find((m) => m.key === "antiguedad");
  const antiguedad = antiguedadMetric?.value ?? 0;
  if (antiguedad >= 5) { score += 8; breakdown.eficiencia += 8; }
  else if (antiguedad >= 2) { score += 5; breakdown.eficiencia += 5; }
  else if (antiguedad > 0) { score += 2; breakdown.eficiencia += 2; }

  let rating: Rating;
  let label: string;
  if (score >= 80) { rating = "RIESGO_BAJO"; label = "RIESGO BAJO"; }
  else if (score >= 50) { rating = "RIESGO_MEDIO"; label = "RIESGO MEDIO"; }
  else { rating = "RIESGO_ALTO"; label = "RIESGO ALTO"; }

  return { score, rating, label, breakdown };
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
  const cashFlowMargin = metrics.liquidity[2]?.value ?? 0;

  if (margenNeto > 0.2) strengths.push("Margen neto sólido que indica alta eficiencia operativa.");
  else if (margenNeto < 0.1) weaknesses.push("Margen neto bajo, lo que limita la capacidad de absorber pérdidas.");

  if (roe > 0.15) strengths.push("Retorno sobre capital atractivo para inversionistas.");
  else if (roe < 0.08) weaknesses.push("ROE bajo sugiere uso ineficiente del capital contable.");

  if (cr > 1.5) strengths.push("Liquidez corriente adecuada para cubrir obligaciones a corto plazo.");
  else if (cr < 1) risks.push("Liquidez insuficiente: el activo circulante no cubre el pasivo circulante.");

  if (cashFlowMargin > 0.15) strengths.push("Flujo de efectivo operativo saludable en relación con las ventas.");
  else if (cashFlowMargin < 0.05) risks.push("Flujo de efectivo operativo limitado frente a las ventas, posible tensión de caja.");

  if (dr < 0.4) strengths.push("Nivel de endeudamiento conservador y manejable.");
  else if (dr > 0.6) risks.push("Alto nivel de apalancamiento aumenta la vulnerabilidad ante variaciones de tasa.");

  if (rotInv > 3) strengths.push("Rotación de inventarios eficiente.");
  else weaknesses.push("Rotación de inventarios lenta, posible acumulación de stock.");

  if (strengths.length === 0) strengths.push("No se identificaron fortalezas destacables con los datos disponibles.");
  if (weaknesses.length === 0) weaknesses.push("No se identificaron debilidades significativas.");
  if (risks.length === 0) risks.push("Riesgos financieros dentro de parámetros aceptables.");

  const recMap: Record<Rating, string> = {
    RIESGO_BAJO: "Se recomienda aprobar la línea de crédito. La empresa presenta indicadores financieros sólidos, con buena rentabilidad, liquidez adecuada y un nivel de endeudamiento controlado.",
    RIESGO_MEDIO: "Se sugiere aprobar con condiciones. La empresa muestra indicadores aceptables pero con áreas de mejora. Se recomienda establecer garantías adicionales y monitoreo periódico.",
    RIESGO_ALTO: "Se recomienda precaución. Los indicadores financieros presentan debilidades que podrían comprometer la capacidad de pago. Considerar aprobación parcial con garantías sólidas o rechazar la operación.",
  };

  return { strengths, weaknesses, risks, recommendation: recMap[rating] };
}

export function useCreditAnalysis() {
  const { master } = useFinancialStore();

  if (!master) {
    return {
      metrics: computeMetrics(FALLBACK_DATA),
      score: 0,
      rating: "RIESGO_ALTO" as Rating,
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
  const { score, rating, label, breakdown } = computeScore(metrics);
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
      {
        name: "Rentabilidad",
        score: Math.round(breakdown.rentabilidad),
        max: 30,
      },
      {
        name: "Liquidez",
        score: Math.round(breakdown.liquidez),
        max: 32, // 20 (CR) + 12 (Flujo de efectivo)
      },
      {
        name: "Eficiencia",
        score: Math.round(breakdown.eficiencia),
        max: 23, // 15 (Rot. Inv) + 8 (Antigüedad)
      },
      {
        name: "Apalancamiento",
        score: Math.round(breakdown.apalancamiento),
        max: 20,
      },
      {
        name: "ROE",
        score: Math.round(breakdown.roe),
        max: 15,
      },
    ],
  };
}
