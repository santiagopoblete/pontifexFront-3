import type { ProcessedDocument, DuplicateMatch } from "./types";

export function detectDuplicates(
  newDoc: ProcessedDocument,
  existingDocs: ProcessedDocument[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  for (const existing of existingDocs) {
    if (existing.meta.id === newDoc.meta.id) continue;

    const reasons: string[] = [];
    let confidence = 0;

    // Same filename
    if (existing.meta.fileName === newDoc.meta.fileName) {
      reasons.push("Mismo nombre de archivo");
      confidence += 40;
    }

    // Same document type
    if (
      existing.meta.documentType &&
      newDoc.meta.documentType &&
      existing.meta.documentType === newDoc.meta.documentType
    ) {
      // Same type + same bank
      if (existing.meta.bank && newDoc.meta.bank && existing.meta.bank === newDoc.meta.bank) {
        reasons.push(`Mismo banco (${newDoc.meta.bank})`);
        confidence += 20;
      }

      // Overlapping periods
      if (
        existing.meta.periodStart &&
        newDoc.meta.periodStart &&
        existing.meta.periodEnd &&
        newDoc.meta.periodEnd
      ) {
        if (
          existing.meta.periodStart === newDoc.meta.periodStart &&
          existing.meta.periodEnd === newDoc.meta.periodEnd
        ) {
          reasons.push("Mismo periodo");
          confidence += 30;
        } else if (
          existing.meta.periodStart <= newDoc.meta.periodEnd! &&
          existing.meta.periodEnd >= newDoc.meta.periodStart!
        ) {
          reasons.push("Periodos traslapados");
          confidence += 15;
        }
      }
    }

    // Same file size (likely exact same file)
    if (existing.meta.fileSize === newDoc.meta.fileSize && existing.meta.fileSize > 0) {
      reasons.push("Mismo tamaño de archivo");
      confidence += 15;
    }

    // Same content hash
    if (existing.meta.hash && newDoc.meta.hash && existing.meta.hash === newDoc.meta.hash) {
      reasons.push("Contenido idéntico");
      confidence = 100;
    }

    // Same row count + same headers
    if (
      existing.rawRowCount === newDoc.rawRowCount &&
      existing.rawRowCount > 0 &&
      JSON.stringify(existing.rawHeaders) === JSON.stringify(newDoc.rawHeaders)
    ) {
      reasons.push("Estructura y tamaño de datos idénticos");
      confidence += 25;
    }

    if (confidence >= 50) {
      matches.push({
        existingDocId: existing.meta.id,
        existingFileName: existing.meta.fileName,
        reason: reasons.join(", "),
        confidence: Math.min(confidence, 100),
      });
    }
  }

  return matches;
}
