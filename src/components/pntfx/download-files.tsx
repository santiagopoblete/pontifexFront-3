import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadFilesButton() {
  return (
    <a href="/extracted_bank_data.csv" download>
      <Button
        variant="outline"
        className="flex items-center gap-2 transition-all duration-300 hover:scale-105 border-primary/30 bg-primary/5 text-foreground hover:bg-primary/10 hover:border-primary/50"
      >
        <Download className="!w-4 !h-4 text-primary" />
        Descargar Máster
      </Button>
    </a>
  );
}
