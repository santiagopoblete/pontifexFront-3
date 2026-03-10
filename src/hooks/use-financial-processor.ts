import { useCallback, useState } from "react";
import { readFinancialFile, computeFileHash } from "@/lib/financial/file-reader";
import { detectDocumentType, detectBank } from "@/lib/financial/document-detector";
import { parseEstadoCuenta, parseEstadoResultados, parseBalanceGeneral } from "@/lib/financial/parsers";
import { detectDuplicates } from "@/lib/financial/duplicate-detector";
import { validateDateConsistency } from "@/lib/financial/date-validator";
import { canGenerateMaster, generateMaster } from "@/lib/financial/master-generator";
import { useFinancialStore } from "@/stores/financial-store";
import type { ProcessedDocument, DocumentType, DuplicateMatch, ValidationResult } from "@/lib/financial/types";

export interface ProcessingState {
  isProcessing: boolean;
  currentStep: string;
  progress: number;
  lastError: string | null;
}

export function useFinancialProcessor() {
  const store = useFinancialStore();
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: "",
    progress: 0,
    lastError: null,
  });
  const [pendingDuplicates, setPendingDuplicates] = useState<{ doc: ProcessedDocument; matches: DuplicateMatch[] } | null>(null);
  const [dateValidation, setDateValidation] = useState<ValidationResult | null>(null);

  const step = (label: string, progress: number) => {
    setProcessingState(prev => ({ ...prev, currentStep: label, progress }));
  };

  const processFile = useCallback(async (file: File, expectedType?: DocumentType): Promise<ProcessedDocument | null> => {
    setProcessingState({ isProcessing: true, currentStep: "Leyendo archivo...", progress: 10, lastError: null });

    try {
      // 1. Read file
      step("Leyendo estructura del archivo...", 15);
      const parsed = await readFinancialFile(file);
      await delay(300);

      // 2. Detect document type
      step("Detectando tipo de documento...", 30);
      const { type: detectedType, confidence } = detectDocumentType(parsed.headers, parsed.rawContent);
      const docType = expectedType || detectedType;
      await delay(300);

      // 3. Detect bank
      step("Identificando institución bancaria...", 40);
      const bank = detectBank(parsed.headers, parsed.rawContent, file.name);
      await delay(200);

      // 4. Compute hash
      const hash = computeFileHash(parsed.rawContent);

      // 5. Parse based on type
      step("Extrayendo datos financieros...", 55);
      let data: ProcessedDocument["data"] = null;
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!docType) {
        errors.push("No se pudo determinar el tipo de documento. Verifica que el archivo contenga encabezados reconocibles.");
      } else {
        try {
          switch (docType) {
            case "estado_cuenta":
              data = parseEstadoCuenta(parsed.rows, parsed.headers, bank);
              if (data.tipo === "estado_cuenta" && data.transacciones.length === 0) {
                warnings.push("No se encontraron transacciones. Verifica el formato del archivo.");
              }
              break;
            case "estado_resultados":
              data = parseEstadoResultados(parsed.rows, parsed.headers);
              if (data.tipo === "estado_resultados" && data.ventas === 0) {
                warnings.push("Las ventas se detectaron como $0. Verifica que el archivo contenga datos de ingresos.");
              }
              break;
            case "balance_general":
              data = parseBalanceGeneral(parsed.rows, parsed.headers);
              if (data.tipo === "balance_general" && data.activosTotales === 0) {
                warnings.push("Los activos totales se detectaron como $0. Verifica el formato del archivo.");
              }
              break;
          }
        } catch (e) {
          errors.push(`Error al parsear: ${e instanceof Error ? e.message : "Error desconocido"}`);
        }
      }

      if (confidence > 0 && confidence < 50) {
        warnings.push(`Confianza baja en la detección del tipo de documento (${Math.round(confidence)}%). Se recomienda verificar.`);
      }

      await delay(200);

      // Build processed document
      const doc: ProcessedDocument = {
        meta: {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fileName: file.name,
          fileSize: file.size,
          documentType: docType,
          bank,
          periodStart: getPeriodStart(data),
          periodEnd: getPeriodEnd(data),
          status: errors.length > 0 ? "error" : "validated",
          errors,
          warnings,
          hash,
        },
        data,
        rawHeaders: parsed.headers,
        rawRowCount: parsed.rows.length,
      };

      // 6. Duplicate detection
      step("Verificando duplicados...", 75);
      const duplicates = detectDuplicates(doc, store.documents);
      await delay(200);

      if (duplicates.length > 0) {
        doc.meta.status = "duplicate";
        setPendingDuplicates({ doc, matches: duplicates });
        setProcessingState({ isProcessing: false, currentStep: "Duplicado detectado", progress: 100, lastError: null });
        return doc;
      }

      // 7. Add to store
      step("Guardando documento procesado...", 90);
      store.addDocument(doc);
      await delay(200);

      // 8. Date validation
      step("Validando consistencia de fechas...", 95);
      const allDocs = [...store.documents, doc];
      const validation = validateDateConsistency(allDocs);
      setDateValidation(validation);

      setProcessingState({ isProcessing: false, currentStep: "Procesamiento completado", progress: 100, lastError: null });
      return doc;

    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido al procesar el archivo";
      setProcessingState({ isProcessing: false, currentStep: "", progress: 0, lastError: msg });
      return null;
    }
  }, [store]);

  const confirmDuplicate = useCallback((action: "replace" | "keep" | "skip") => {
    if (!pendingDuplicates) return;
    const { doc, matches } = pendingDuplicates;

    if (action === "replace") {
      doc.meta.status = "validated";
      store.replaceDocument(matches[0].existingDocId, doc);
    } else if (action === "keep") {
      doc.meta.status = "validated";
      doc.meta.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      store.addDocument(doc);
    }
    // "skip" = do nothing

    setPendingDuplicates(null);
  }, [pendingDuplicates, store]);

  const generateMasterDataset = useCallback(() => {
    const { ready, missing } = canGenerateMaster(store.documents);
    if (!ready) return { success: false, missing };

    try {
      const master = generateMaster(store.documents);
      store.setMaster(master);
      return { success: true, missing: [] };
    } catch (e) {
      return { success: false, missing: [], error: e instanceof Error ? e.message : "Error" };
    }
  }, [store]);

  return {
    processingState,
    pendingDuplicates,
    dateValidation,
    processFile,
    confirmDuplicate,
    generateMasterDataset,
    canGenerateMaster: () => canGenerateMaster(store.documents),
  };
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function getPeriodStart(data: ProcessedDocument["data"]): string | null {
  if (!data) return null;
  if (data.tipo === "estado_cuenta") return data.periodoInicio || null;
  if (data.tipo === "estado_resultados") return data.periodoInicio || null;
  return null;
}

function getPeriodEnd(data: ProcessedDocument["data"]): string | null {
  if (!data) return null;
  if (data.tipo === "estado_cuenta") return data.periodoFin || null;
  if (data.tipo === "estado_resultados") return data.periodoFin || null;
  if (data.tipo === "balance_general") return data.fecha || null;
  return null;
}
