"use client";

import { useRef, useState } from "react";
import { CloudUploadIcon } from "@/components/icons/lucide-cloud-upload";

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ onFileDrop, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileDrop(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileDrop(file);
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`w-full rounded-xl flex flex-col items-center justify-center gap-4 transition-all duration-300 border-2 border-dashed animate-fade-in-up ${
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40 bg-card/50"
      } ${disabled ? "opacity-50 cursor-default" : "cursor-pointer"}`}
      style={{ minHeight: "240px" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border-2 border-dashed ${
          dragging
            ? "border-primary bg-primary/10 scale-110"
            : "border-border bg-secondary"
        }`}
      >
        <CloudUploadIcon className="!w-8 !h-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {dragging ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
        </p>
        <p className="text-xs mt-1 text-muted-foreground">
          Solo archivos PDF y Excel (.xlsx, .xls, .csv)
        </p>
      </div>
    </div>
  );
}
