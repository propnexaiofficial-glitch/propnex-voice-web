"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import * as xlsx from "xlsx";

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


export type ExtractedLead = {
  name: string;
  phone: string;
  called?: boolean;
};

type UploadCsvModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (fileName: string, leads: ExtractedLead[]) => void;
  title?: string;
  description?: string;
};

export function UploadCsvModal({
  open,
  onOpenChange,
  onUpload,
  title = "Upload Contacts",
  description = "Upload a list of customer numbers (.csv or .xlsx) to start an outbound calling campaign. We will automatically extract names and format numbers to the Indian standard.",
}: UploadCsvModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedLeads, setExtractedLeads] = useState<ExtractedLead[]>([]);
  const [error, setError] = useState<string | null>(null);

  const formatIndianNumber = (numStr: string): string => {
    let cleaned = numStr.toString().replace(/\D/g, "");
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith("0")) return `+91${cleaned.substring(1)}`;
    if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
    return "";
  };

  const processData = (data: any[]) => {
    const leads: ExtractedLead[] = [];
    
    if (data.length === 0) {
      setError("The file is empty.");
      return;
    }

    const headers = Object.keys(data[0]).map(k => k.toLowerCase());
    const phoneKey = Object.keys(data[0]).find(k => k.toLowerCase().includes("phone") || k.toLowerCase().includes("number") || k.toLowerCase().includes("mobile"));
    const nameKey = Object.keys(data[0]).find(k => k.toLowerCase().includes("name"));

    if (!phoneKey) {
      setError("Could not find a 'phone' or 'number' column in the file.");
      return;
    }

    let invalidCount = 0;

    data.forEach(row => {
      const phoneVal = row[phoneKey];
      const nameVal = nameKey ? row[nameKey] : "Unknown";
      
      if (phoneVal) {
        const formatted = formatIndianNumber(phoneVal.toString());
        if (formatted) {
          leads.push({ name: nameVal ? nameVal.toString().trim() : "Unknown", phone: formatted });
        } else {
          invalidCount++;
          leads.push({ name: nameVal ? nameVal.toString().trim() : "Unknown", phone: phoneVal.toString(), isInvalid: true });
        }
      }
    });

    if (leads.length === 0) {
      setError("No numbers were found in the file.");
      return;
    }

    setExtractedLeads(leads);
    setError(invalidCount > 0 ? `Found ${leads.length - invalidCount} valid numbers. ${invalidCount} invalid numbers need correction.` : null);
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    setError(null);
    setExtractedLeads([]);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      setError("Please upload a .csv or .xlsx file.");
      return;
    }

    setSelectedFile(file);

    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data);
        },
        error: () => {
          setError("Failed to parse CSV file.");
        }
      });
    } else if (ext === "xlsx") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = xlsx.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet);
          processData(jsonData);
        } catch (err) {
          setError("Failed to parse Excel file.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile || extractedLeads.length === 0) return;
    onUpload(selectedFile.name, extractedLeads);
    setSelectedFile(null);
    setExtractedLeads([]);
    setError(null);
    onOpenChange(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedFile(null);
      setExtractedLeads([]);
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
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
            Drag & drop your file here
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · .csv or .xlsx
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && (
          <div className={cn("mt-4 flex items-start gap-3 rounded-lg border p-4 text-sm", extractedLeads.length > 0 ? "border-border text-foreground" : "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive")}>
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {selectedFile && extractedLeads.length > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-white/5 px-4 py-3 mt-2">
            <FileSpreadsheet className="size-5 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                Ready to dial {extractedLeads.length} leads
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button disabled={!selectedFile || extractedLeads.length === 0} onClick={handleConfirm}>
            Upload & Extract Leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
