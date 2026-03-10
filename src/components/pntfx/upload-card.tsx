import { useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUploadIcon } from "@/components/icons/lucide-cloud-upload";
import { FileList } from "@/components/pntfx/file-list";
import { UploadAlert } from "@/components/pntfx/upload-alert";
import { Zap } from "lucide-react";

interface UploadCardProps {
  title: string;
  description?: string;
  accept?: string;
  onFilesChange?: (files: File[]) => void;
  onProcess?: (files: File[]) => void;
}

export function UploadCard({
  title,
  description = "Selecciona los archivos a cargar.",
  accept,
  onFilesChange,
  onProcess,
}: UploadCardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerAlert = () => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setShowAlert(true);
    alertTimerRef.current = setTimeout(() => setShowAlert(false), 3000);
  };

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const merged = [...files];
    let added = 0;
    Array.from(incoming).forEach((f) => {
      if (!merged.find((e) => e.name === f.name && e.size === f.size)) {
        merged.push(f);
        added++;
      }
    });
    if (added > 0) {
      setFiles(merged);
      onFilesChange?.(merged);
      triggerAlert();
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange?.(updated);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleProcess = () => {
    onProcess?.(files);
  };

  return (
    <Card className="card-premium w-full flex flex-col overflow-hidden" style={{ minHeight: "320px" }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 py-6 flex-1 overflow-hidden">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 shrink-0 rounded-full p-0 transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60"
        >
          <CloudUploadIcon className="!w-10 !h-10 text-primary" />
        </Button>

        <UploadAlert show={showAlert} />
        <FileList files={files} onRemove={removeFile} />

        {files.length > 0 && (
          <a href="/extracted_bank_data.csv" download className="w-full mt-2">
            <Button
              className="w-full font-semibold transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleProcess}
            >
              <Zap className="w-4 h-4 mr-2" />
              Procesar {files.length} {files.length === 1 ? "archivo" : "archivos"}
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}
