import { FileText, X } from "lucide-react";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <>
      <ul className="w-full overflow-y-auto space-y-2" style={{ maxHeight: "120px" }}>
        {files.map((file, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm min-w-0 overflow-hidden bg-secondary border border-border animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1">
              <FileText size={14} className="shrink-0 text-primary" />
              <span className="truncate text-foreground" title={file.name}>
                {file.name}
              </span>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="ml-2 shrink-0 rounded-full p-0.5 transition-colors hover:bg-destructive/20 cursor-pointer"
              aria-label={`Eliminar ${file.name}`}
            >
              <X size={14} className="text-muted-foreground hover:text-destructive" />
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs shrink-0 text-muted-foreground">
        {files.length} archivo{files.length !== 1 ? "s" : ""} seleccionado{files.length !== 1 ? "s" : ""}
      </p>
    </>
  );
}
