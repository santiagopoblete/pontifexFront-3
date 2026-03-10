import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileWarning } from "lucide-react";

interface EmptyMasterStateProps {
  section: string;
}

export function EmptyMasterState({ section }: EmptyMasterStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 animate-fade-in">
      <div className="w-16 h-16 rounded-full flex items-center justify-center bg-muted/50 border border-border mb-6">
        <FileWarning className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">
        Datos no disponibles
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
        Para ver el <span className="font-medium text-foreground">{section}</span>, primero
        genera el archivo MASTER en el{" "}
        <span className="font-medium text-primary">Procesador Financiero</span>.
      </p>
      <Alert className="max-w-md bg-muted/30 border-border">
        <FileWarning className="!w-4 !h-4 text-muted-foreground" />
        <AlertDescription className="text-muted-foreground text-xs">
          El MASTER se genera al cargar los 3 documentos financieros: Estado de Cuenta,
          Estado de Resultados y Balance General.
        </AlertDescription>
      </Alert>
    </div>
  );
}
