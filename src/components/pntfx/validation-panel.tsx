import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ValidationResult } from "@/lib/financial/types";

interface ValidationPanelProps {
  validation: ValidationResult | null;
  masterReady: boolean;
  missingTypes: string[];
}

export function ValidationPanel({ validation, masterReady, missingTypes }: ValidationPanelProps) {
  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* Master readiness */}
      {masterReady ? (
        <Alert className="bg-emerald-500/10 border-emerald-500/30">
          <CheckCircle2 className="!w-4 !h-4 text-emerald-400" />
          <AlertTitle className="text-emerald-400 text-sm">Listo para generar MASTER</AlertTitle>
          <AlertDescription className="text-emerald-400/80 text-xs">
            Los tres tipos de documento están cargados y procesados. Puedes generar el dataset MASTER.
          </AlertDescription>
        </Alert>
      ) : missingTypes.length > 0 ? (
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="!w-4 !h-4 text-primary" />
          <AlertTitle className="text-foreground text-sm">Documentos faltantes para MASTER</AlertTitle>
          <AlertDescription className="text-muted-foreground text-xs">
            Faltan: {missingTypes.join(", ")}
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Date validation warnings */}
      {validation?.warnings.map((w, i) => (
        <Alert key={`w-${i}`} className="bg-yellow-400/5 border-yellow-400/20">
          <AlertTriangle className="!w-4 !h-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400/80 text-xs">{w}</AlertDescription>
        </Alert>
      ))}

      {/* Date validation errors */}
      {validation?.errors.map((e, i) => (
        <Alert key={`e-${i}`} className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="!w-4 !h-4 text-destructive" />
          <AlertDescription className="text-destructive text-xs">{e}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
