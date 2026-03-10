import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { DuplicateMatch, ProcessedDocument } from "@/lib/financial/types";
import { getDocumentTypeLabel } from "@/lib/financial/document-detector";

interface DuplicateDialogProps {
  open: boolean;
  doc: ProcessedDocument | null;
  matches: DuplicateMatch[];
  onAction: (action: "replace" | "keep" | "skip") => void;
}

export function DuplicateDialog({ open, doc, matches, onAction }: DuplicateDialogProps) {
  if (!doc) return null;

  return (
    <Dialog open={open} onOpenChange={() => onAction("skip")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle size={20} />
            Posible archivo duplicado
          </DialogTitle>
          <DialogDescription>
            Se detectó un archivo similar ya cargado. Revisa los detalles y decide cómo proceder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg bg-secondary p-3 text-sm space-y-1">
            <p className="font-medium text-foreground">Archivo nuevo:</p>
            <p className="text-muted-foreground">{doc.meta.fileName}</p>
            <p className="text-xs text-muted-foreground">
              Tipo: {getDocumentTypeLabel(doc.meta.documentType)}
              {doc.meta.bank && ` · Banco: ${doc.meta.bank}`}
            </p>
          </div>

          {matches.map((m, i) => (
            <div key={i} className="rounded-lg border border-yellow-400/30 bg-yellow-400/5 p-3 text-sm space-y-1">
              <p className="font-medium text-yellow-400">Conflicto con:</p>
              <p className="text-muted-foreground">{m.existingFileName}</p>
              <p className="text-xs text-yellow-400/80">
                Razón: {m.reason} · Confianza: {m.confidence}%
              </p>
            </div>
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onAction("skip")} className="cursor-pointer">
            Cancelar
          </Button>
          <Button variant="outline" onClick={() => onAction("keep")} className="cursor-pointer border-primary/30 text-primary hover:bg-primary/10">
            Conservar ambos
          </Button>
          <Button onClick={() => onAction("replace")} className="cursor-pointer bg-primary text-primary-foreground">
            Reemplazar existente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
