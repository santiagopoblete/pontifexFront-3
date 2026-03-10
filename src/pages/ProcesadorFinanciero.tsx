import { useCallback } from "react";
import { NavBar } from "@/components/pntfx/navbar";
import { SmartUploadCard } from "@/components/pntfx/smart-upload-card";
import { DuplicateDialog } from "@/components/pntfx/duplicate-dialog";
import { ValidationPanel } from "@/components/pntfx/validation-panel";
import { Button } from "@/components/ui/button";
import { Download, Zap, Trash2, FileSpreadsheet } from "lucide-react";
import { useFinancialStore } from "@/stores/financial-store";
import { useFinancialProcessor } from "@/hooks/use-financial-processor";
import { exportEstadoCuenta, exportEstadoResultados, exportBalanceGeneral, exportMaster } from "@/lib/financial/excel-exporter";
import type { DocumentType, ProcessedDocument } from "@/lib/financial/types";
import { useToast } from "@/hooks/use-toast";

export default function ProcesadorFinanciero() {
  const store = useFinancialStore();
  const processor = useFinancialProcessor();
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File, expectedType: DocumentType) => {
    const result = await processor.processFile(file, expectedType);
    if (result && result.meta.status === "validated") {
      toast({
        title: "Archivo procesado",
        description: `${file.name} se procesó correctamente.`,
      });
    } else if (result && result.meta.status === "error") {
      toast({
        title: "Error en el archivo",
        description: result.meta.errors[0] || "No se pudo procesar el archivo.",
        variant: "destructive",
      });
    }
  }, [processor, toast]);

  const handleRemoveDocument = useCallback((id: string) => {
    store.removeDocument(id);
    store.setMaster(null); // Invalidate master when documents change
  }, [store]);

  const handleExportDocument = useCallback((doc: ProcessedDocument) => {
    if (!doc.data) return;
    switch (doc.data.tipo) {
      case "estado_cuenta":
        exportEstadoCuenta(doc.data);
        break;
      case "estado_resultados":
        exportEstadoResultados(doc.data);
        break;
      case "balance_general":
        exportBalanceGeneral(doc.data);
        break;
    }
    toast({ title: "Exportado", description: "El archivo Excel estandarizado se descargó." });
  }, [toast]);

  const handleGenerateMaster = useCallback(() => {
    const result = processor.generateMasterDataset();
    if (result.success) {
      toast({ title: "MASTER generado", description: "El dataset MASTER está listo para descargar." });
    } else if (result.missing.length > 0) {
      toast({
        title: "Faltan documentos",
        description: `Falta: ${result.missing.join(", ")}`,
        variant: "destructive",
      });
    }
  }, [processor, toast]);

  const handleDownloadMaster = useCallback(() => {
    if (store.master) {
      exportMaster(store.master);
      toast({ title: "Descargado", description: "El archivo MASTER se descargó exitosamente." });
    }
  }, [store.master, toast]);

  const { ready: masterReady, missing: missingTypes } = processor.canGenerateMaster();

  return (
    <div className="flex min-h-screen w-full flex-col bg-page-gradient">
      <NavBar />

      <main className="w-full max-w-6xl mx-auto py-8 px-6 md:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Procesador Financiero
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Carga los Estados Financieros del cliente para obtener análisis profundos.
              </p>
            </div>
            {store.documents.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { store.clearDocuments(); toast({ title: "Limpiado", description: "Todos los documentos fueron eliminados." }); }}
                className="cursor-pointer text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="!w-4 !h-4 mr-1" />
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        {/* Upload Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="animate-fade-in-up animation-delay-100">
            <SmartUploadCard
              title="Estados de Cuenta"
              expectedType="estado_cuenta"
              description="Movimientos bancarios del cliente."
              documents={store.documents}
              processingState={processor.processingState}
              onFileUpload={handleFileUpload}
              onRemoveDocument={handleRemoveDocument}
              onExportDocument={handleExportDocument}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-200">
            <SmartUploadCard
              title="Estados de Resultados"
              expectedType="estado_resultados"
              description="Ingresos, costos y utilidades."
              documents={store.documents}
              processingState={processor.processingState}
              onFileUpload={handleFileUpload}
              onRemoveDocument={handleRemoveDocument}
              onExportDocument={handleExportDocument}
            />
          </div>
          <div className="animate-fade-in-up animation-delay-300">
            <SmartUploadCard
              title="Balance General"
              expectedType="balance_general"
              description="Activos, pasivos y capital."
              documents={store.documents}
              processingState={processor.processingState}
              onFileUpload={handleFileUpload}
              onRemoveDocument={handleRemoveDocument}
              onExportDocument={handleExportDocument}
            />
          </div>
        </div>

        {/* Validation Panel */}
        {store.documents.length > 0 && (
          <div className="mb-8 animate-fade-in-up animation-delay-400">
            <ValidationPanel
              validation={processor.dateValidation}
              masterReady={masterReady}
              missingTypes={missingTypes}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
          {/* Generate Master */}
          <Button
            onClick={handleGenerateMaster}
            disabled={!masterReady || processor.processingState.isProcessing}
            className="flex items-center gap-2 transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 cursor-pointer"
          >
            <Zap className="!w-4 !h-4" />
            Generar MASTER
          </Button>

          {/* Download Master */}
          {store.master && (
            <Button
              onClick={handleDownloadMaster}
              variant="outline"
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/50 cursor-pointer"
            >
              <Download className="!w-4 !h-4 text-primary" />
              Descargar MASTER
            </Button>
          )}

          {/* Export individual */}
          {store.documents.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                store.documents.forEach(d => { if (d.data) handleExportDocument(d); });
              }}
              className="flex items-center gap-2 transition-all duration-300 hover:scale-105 border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <FileSpreadsheet className="!w-4 !h-4" />
              Exportar individuales
            </Button>
          )}
        </div>

        {/* Summary stats */}
        {store.documents.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up animation-delay-500">
            <StatCard label="Documentos" value={store.documents.length.toString()} />
            <StatCard label="Procesados" value={store.documents.filter(d => d.meta.status === "validated").length.toString()} />
            <StatCard label="Con errores" value={store.documents.filter(d => d.meta.status === "error").length.toString()} />
            <StatCard label="MASTER" value={store.master ? "Listo" : "Pendiente"} />
          </div>
        )}
      </main>

      {/* Duplicate Dialog */}
      <DuplicateDialog
        open={!!processor.pendingDuplicates}
        doc={processor.pendingDuplicates?.doc || null}
        matches={processor.pendingDuplicates?.matches || []}
        onAction={processor.confirmDuplicate}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-premium rounded-lg p-4 text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
