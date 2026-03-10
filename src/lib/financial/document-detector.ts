import type { DocumentType } from "./types";

// ─── Column header patterns for document type detection ───
const EC_KEYWORDS = [
  "cargo", "abono", "saldo", "deposito", "retiro", "referencia",
  "movimiento", "transaccion", "cheque", "transferencia", "spei",
  "fecha valor", "concepto", "descripcion"
];

const ER_KEYWORDS = [
  "ventas", "ingresos", "costo de ventas", "utilidad bruta",
  "gastos operativos", "ebit", "utilidad operativa", "utilidad neta",
  "gastos financieros", "impuestos", "depreciacion", "amortizacion",
  "resultado", "margen", "isr", "ptu"
];

const BG_KEYWORDS = [
  "activo", "pasivo", "capital", "patrimonio", "activo circulante",
  "activo fijo", "pasivo circulante", "inventario", "cuentas por cobrar",
  "cuentas por pagar", "deuda", "capital social", "utilidades retenidas",
  "capital contable", "activo total", "pasivo total"
];

// ─── Bank detection patterns ───
const BANK_PATTERNS: Record<string, string[]> = {
  "BBVA": ["bbva", "bancomer"],
  "Santander": ["santander"],
  "Banorte": ["banorte", "ixe"],
  "HSBC": ["hsbc"],
  "Citibanamex": ["citibanamex", "banamex", "citi"],
  "Scotiabank": ["scotiabank", "scotia"],
  "Banco Azteca": ["azteca"],
  "Inbursa": ["inbursa"],
  "BanCoppel": ["coppel", "bancoppel"],
  "Afirme": ["afirme"],
  "Multiva": ["multiva"],
  "Banregio": ["banregio"],
  "Bajío": ["bajio", "bajío", "banbajio"],
};

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function scoreKeywords(headers: string[], allContent: string, keywords: string[]): number {
  const combined = normalize([...headers, allContent].join(" "));
  let score = 0;
  for (const kw of keywords) {
    if (combined.includes(normalize(kw))) score++;
  }
  return score;
}

export function detectDocumentType(headers: string[], sampleContent: string): { type: DocumentType | null; confidence: number } {
  const ecScore = scoreKeywords(headers, sampleContent, EC_KEYWORDS);
  const erScore = scoreKeywords(headers, sampleContent, ER_KEYWORDS);
  const bgScore = scoreKeywords(headers, sampleContent, BG_KEYWORDS);

  const maxScore = Math.max(ecScore, erScore, bgScore);
  if (maxScore === 0) return { type: null, confidence: 0 };

  const totalPossible = Math.max(EC_KEYWORDS.length, ER_KEYWORDS.length, BG_KEYWORDS.length);
  const confidence = Math.min((maxScore / Math.max(totalPossible * 0.3, 1)) * 100, 100);

  if (ecScore === maxScore && ecScore > erScore && ecScore > bgScore) {
    return { type: "estado_cuenta", confidence };
  }
  if (erScore === maxScore && erScore > ecScore && erScore > bgScore) {
    return { type: "estado_resultados", confidence };
  }
  if (bgScore === maxScore) {
    return { type: "balance_general", confidence };
  }

  return { type: null, confidence: 0 };
}

export function detectBank(headers: string[], sampleContent: string, fileName: string): string | null {
  const combined = normalize([...headers, sampleContent, fileName].join(" "));
  for (const [bank, patterns] of Object.entries(BANK_PATTERNS)) {
    for (const pattern of patterns) {
      if (combined.includes(pattern)) return bank;
    }
  }
  return null;
}

export function getDocumentTypeLabel(type: DocumentType | null): string {
  switch (type) {
    case "estado_cuenta": return "Estado de Cuenta";
    case "estado_resultados": return "Estado de Resultados";
    case "balance_general": return "Balance General";
    default: return "Desconocido";
  }
}
