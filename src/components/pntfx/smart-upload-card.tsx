import { useRef, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUploadIcon } from "@/components/icons/lucide-cloud-upload";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText, X, Zap, CheckCircle2, AlertTriangle, XCircle,
  Building2, Calendar, Hash, Download
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getDocumentTypeLabel } from "@/lib/financial/document-detector";
import type { DocumentType, ProcessedDocument } from "@/lib/financial/types";
import type { ProcessingState } from "@/hooks/use-financial-processor";

interface SmartUploadCardProps {
  title: string;
  expectedType: DocumentType;
  description?: string;
  accept?: string;
  documents: ProcessedDocument[];
  processingState: ProcessingState;
  onFileUpload: (file: File, expectedType: DocumentType) => void;
  onRemoveDocument: (id: string) => void;
  onExportDocument: (doc: ProcessedDocument) => void;
}

export function SmartUploadCard({
  title,
  expectedType,
  description = "Selecciona los archivos a cargar.",
  accept = ".xlsx,.xls,.csv,.pdf",
  documents,
  processingState,
  onFileUpload,
  onRemoveDocument,
  onExportDocument,
}: SmartUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const myDocs = documents.filter(d => d.meta.documentType === expectedType);
  const isProcessing = processingState.isProcessing;

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => onFileUpload(f, expectedType));
  }, [onFileUpload, expectedType]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!isProcessing) handleFiles(e.dataTransfer.files);
  };

  return (
    <Card
      className={`card-premium w-full flex flex-col overflow-hidden transition-all duration-300 ${
        dragOver ? "border-primary/50 bg-primary/5" : ""
      }`}
      style={{ minHeight: "380px" }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            {title}
          </CardTitle>
          {myDocs.length > 0 && (
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {myDocs.length} archivo{myDocs.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <CardDescription className="text-muted-foreground text-sm">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-3 py-4 flex-1 overflow-hidden">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Upload button */}
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="w-16 h-16 shrink-0 rounded-full p-0 transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 disabled:opacity-50"
        >
          <CloudUploadIcon className="!w-8 !h-8 text-primary" />
        </Button>

        <p className="text-xs text-muted-foreground">
          {dragOver ? "Suelta el archivo aquí" : "Arrastra o haz clic para cargar"}
        </p>

        {/* Processing indicator for this card */}
        {isProcessing && (
          <div className="w-full space-y-2 animate-fade-in">
            <Progress value={processingState.progress} className="h-1.5" />
            <p className="text-xs text-center text-muted-foreground animate-pulse">
              {processingState.currentStep}
            </p>
          </div>
        )}

        {/* Processed documents list */}
        {myDocs.length > 0 && (
          <ul className="w-full overflow-y-auto space-y-2 flex-1" style={{ maxHeight: "180px" }}>
            {myDocs.map((doc) => (
              <li
                key={doc.meta.id}
                className="flex flex-col rounded-lg px-3 py-2 text-sm bg-secondary border border-border animate-fade-in gap-1.5"
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <StatusIcon status={doc.meta.status} />
                    <span className="truncate text-foreground text-xs" title={doc.meta.fileName}>
                      {doc.meta.fileName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onExportDocument(doc)}
                          className="rounded-full p-1 transition-colors hover:bg-primary/20 cursor-pointer"
                          aria-label="Exportar"
                        >
                          <Download size={12} className="text-primary" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Exportar Excel estandarizado</TooltipContent>
                    </Tooltip>
                    <button
                      onClick={() => onRemoveDocument(doc.meta.id)}
                      className="rounded-full p-1 transition-colors hover:bg-destructive/20 cursor-pointer"
                      aria-label="Eliminar"
                    >
                      <X size={12} className="text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                  {doc.meta.bank && (
                    <span className="flex items-center gap-1">
                      <Building2 size={10} /> {doc.meta.bank}
                    </span>
                  )}
                  {doc.meta.periodStart && (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {doc.meta.periodStart}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Hash size={10} /> {doc.rawRowCount} filas
                  </span>
                </div>

                {/* Warnings/Errors */}
                {doc.meta.warnings.length > 0 && (
                  <div className="flex items-start gap-1 text-[10px] text-yellow-400">
                    <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                    <span>{doc.meta.warnings[0]}</span>
                  </div>
                )}
                {doc.meta.errors.length > 0 && (
                  <div className="flex items-start gap-1 text-[10px] text-destructive">
                    <XCircle size={10} className="shrink-0 mt-0.5" />
                    <span>{doc.meta.errors[0]}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "validated":
      return <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />;
    case "error":
      return <XCircle size={14} className="shrink-0 text-destructive" />;
    case "duplicate":
      return <AlertTriangle size={14} className="shrink-0 text-yellow-400" />;
    default:
      return <FileText size={14} className="shrink-0 text-primary" />;
  }
}
