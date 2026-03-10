import type { ProcessedDocument, ValidationResult } from "./types";

export function validateDateConsistency(docs: ProcessedDocument[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const byType = {
    estado_cuenta: docs.filter(d => d.meta.documentType === "estado_cuenta"),
    estado_resultados: docs.filter(d => d.meta.documentType === "estado_resultados"),
    balance_general: docs.filter(d => d.meta.documentType === "balance_general"),
  };

  // Check for overlapping periods within the same document type
  for (const [type, typeDocs] of Object.entries(byType)) {
    if (typeDocs.length <= 1) continue;

    for (let i = 0; i < typeDocs.length; i++) {
      for (let j = i + 1; j < typeDocs.length; j++) {
        const a = typeDocs[i];
        const b = typeDocs[j];

        if (a.meta.periodStart && a.meta.periodEnd && b.meta.periodStart && b.meta.periodEnd) {
          if (a.meta.periodStart <= b.meta.periodEnd && a.meta.periodEnd >= b.meta.periodStart) {
            warnings.push(
              `Periodos traslapados en ${getTypeLabel(type)}: "${a.meta.fileName}" y "${b.meta.fileName}" cubren rangos que se superponen.`
            );
          }
        }
      }
    }
  }

  // Cross-validate: Income Statement period should align with Balance Sheet date
  if (byType.estado_resultados.length > 0 && byType.balance_general.length > 0) {
    const er = byType.estado_resultados[0];
    const bg = byType.balance_general[0];

    if (er.meta.periodEnd && bg.meta.periodEnd) {
      // Balance sheet date should be close to income statement end date
      const erEnd = er.meta.periodEnd;
      const bgDate = bg.meta.periodEnd;

      if (erEnd && bgDate && Math.abs(compareDateStrings(erEnd, bgDate)) > 90) {
        warnings.push(
          `La fecha del Balance General ("${bg.meta.fileName}") no coincide con el periodo del Estado de Resultados ("${er.meta.fileName}"). Verifica que correspondan al mismo periodo de análisis.`
        );
      }
    }
  }

  // Check for missing dates
  for (const doc of docs) {
    if (!doc.meta.periodStart && !doc.meta.periodEnd) {
      warnings.push(
        `No se detectaron fechas en "${doc.meta.fileName}". El archivo se procesará pero no se puede validar su periodo.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "estado_cuenta": return "Estados de Cuenta";
    case "estado_resultados": return "Estados de Resultados";
    case "balance_general": return "Balances Generales";
    default: return type;
  }
}

function compareDateStrings(a: string, b: string): number {
  try {
    const da = new Date(a).getTime();
    const db = new Date(b).getTime();
    if (isNaN(da) || isNaN(db)) return 0;
    return (da - db) / (1000 * 60 * 60 * 24);
  } catch {
    return 0;
  }
}
