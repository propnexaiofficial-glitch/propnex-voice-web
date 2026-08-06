"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type UploadCsvModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (fileName: string) => void;
};

export function UploadCsvModal({
  open,
  onOpenChange,
  onUpload,
}: UploadCsvModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) return;
    setSelectedFile(file);
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    onUpload(selectedFile.name);
    setSelectedFile(null);
    onOpenChange(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setSelectedFile(null);
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload CSV</DialogTitle>
          <DialogDescription>
            Upload a list of customer numbers to start an outbound calling
            campaign. CSV should include a phone number column.
          </DialogDescription>
        </DialogHeader>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0] ?? null);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors",
            dragOver
              ? "border-foreground/30 bg-muted"
              : "border-border hover:border-border hover:bg-muted/50"
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <Upload className="size-6 text-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium">
            Drag & drop your CSV file here
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · .csv only
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-white/5 px-4 py-3">
            <FileSpreadsheet className="size-5 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedFile} onClick={handleConfirm}>
            Upload & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
