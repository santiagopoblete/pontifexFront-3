import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

interface UploadAlertProps {
  show: boolean;
}

export function UploadAlert({ show }: UploadAlertProps) {
  if (!show) return null;

  return (
    <Alert className="w-full bg-primary/10 border-primary/30 animate-fade-in">
      <CheckCircle2 className="!w-4 !h-4 text-primary" />
      <AlertDescription className="text-primary">
        Archivos cargados exitosamente.
      </AlertDescription>
    </Alert>
  );
}
