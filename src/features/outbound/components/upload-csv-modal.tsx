"use client";

import { useRef, useState, useEffect } from "react";
import { FileSpreadsheet, Upload, AlertCircle, Zap } from "lucide-react";
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
  isInvalid?: boolean;
};

type DidNumber = {
  id: string;
  number: string;
  direction?: string;
  /** Admin-allocated concurrent channel count for this DID */
  channels?: number;
  agentUrl?: string | null;
};

type UploadCsvModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (fileName: string, leads: ExtractedLead[], selectedDid?: string, channels?: number) => void;
  title?: string;
  description?: string;
  didNumbers?: DidNumber[];
};

export function UploadCsvModal({
  open,
  onOpenChange,
  onUpload,
  title = "Upload Contacts",
  description = "Upload a list of customer numbers (.csv or .xlsx) to start an outbound calling campaign. We will automatically extract names and format numbers to the Indian standard.",
  didNumbers = [],
}: UploadCsvModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedLeads, setExtractedLeads] = useState<ExtractedLead[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const outboundNumbers = (didNumbers || []).filter(n => {
    const dir = (n.direction || "").toUpperCase();
    return !n.direction || dir === "OUTBOUND" || dir === "BOTH" || dir === "GENERAL";
  });
  const [selectedDid, setSelectedDid] = useState<string>("");

  // Auto-select first DID whenever outboundNumbers changes (handles async load)
  useEffect(() => {
    if (outboundNumbers.length > 0 && (!selectedDid || !outboundNumbers.some(n => n.number === selectedDid))) {
      setSelectedDid(outboundNumbers[0].number);
    }
  }, [outboundNumbers]);

  // Normalize a phone number to digits-only for comparison
  const normalizePhone = (num: string) => (num || "").replace(/\D/g, "");

  // Derive channel count and agentUrl from selected DID — compare normalized numbers to handle format mismatches
  const selectedDidInfo = outboundNumbers.find(n => {
    if (n.number === selectedDid) return true;
    // Normalize both to last 10 digits for comparison
    return normalizePhone(n.number).slice(-10) === normalizePhone(selectedDid).slice(-10);
  });
  const derivedChannels = selectedDidInfo?.channels ?? 1;

  const formatPhoneNumber = (numStr: string): string => {
    const raw = numStr.toString().trim();
    const noSpaces = raw.replace(/\s+/g, "");
    // If it's already an international format, ensure it's digits only after +
    if (noSpaces.startsWith("+")) {
      const digits = noSpaces.substring(1).replace(/\D/g, "");
      if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
    }
    
    // Fallback to Indian logic
    let cleaned = raw.replace(/\D/g, "");
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith("0")) return `+91${cleaned.substring(1)}`;
    if (cleaned.length === 12 && cleaned.startsWith("91")) return `+${cleaned}`;
    return "";
  };

  const processData = (rows: any[][]) => {
    const leads: ExtractedLead[] = [];
    if (rows.length === 0) {
      setError("The file is empty.");
      return;
    }

    let phoneColIdx = -1;
    let nameColIdx = -1;
    let startRowIdx = 0;

    const firstRow = rows[0] || [];
    // 1. Try to find headers by name
    for (let i = 0; i < firstRow.length; i++) {
      const val = String(firstRow[i] || "").toLowerCase();
      if (val.includes("phone") || val.includes("number") || val.includes("mobile")) {
        phoneColIdx = i;
      } else if (val.includes("name")) {
        nameColIdx = i;
      }
    }

    if (phoneColIdx !== -1) {
      startRowIdx = 1; // Found header, start from next row
    } else {
      // 2. Guess column by looking for a phone number in the first row
      for (let i = 0; i < firstRow.length; i++) {
        const val = String(firstRow[i] || "");
        const cleaned = val.replace(/\D/g, "");
        if (cleaned.length >= 8 && cleaned.length <= 15) {
          phoneColIdx = i;
          break;
        }
      }
      
      // If still not found, try the second row (in case first row was a weird header)
      if (phoneColIdx === -1 && rows.length > 1) {
        const secondRow = rows[1] || [];
        for (let i = 0; i < secondRow.length; i++) {
          const val = String(secondRow[i] || "");
          const cleaned = val.replace(/\D/g, "");
          if (cleaned.length >= 8 && cleaned.length <= 15) {
            phoneColIdx = i;
            startRowIdx = 1; // Assuming first row was header
            break;
          }
        }
      }

      // Guess name column as the first column that isn't the phone column and has mostly letters
      if (nameColIdx === -1 && phoneColIdx !== -1) {
        const targetRow = startRowIdx === 0 ? firstRow : (rows[1] || []);
        for (let i = 0; i < targetRow.length; i++) {
          if (i !== phoneColIdx && /[a-zA-Z]/.test(String(targetRow[i] || ""))) {
            nameColIdx = i;
            break;
          }
        }
      }
    }

    if (phoneColIdx === -1) {
      setError("Could not detect a phone number column in the file.");
      return;
    }

    let invalidCount = 0;

    for (let i = startRowIdx; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const phoneVal = row[phoneColIdx];
      const nameVal = nameColIdx !== -1 ? row[nameColIdx] : "Unknown";
      
      if (phoneVal) {
        const formatted = formatPhoneNumber(String(phoneVal));
        if (formatted) {
          leads.push({ name: nameVal ? String(nameVal).trim() : "Unknown", phone: formatted });
        } else {
          invalidCount++;
          leads.push({ name: nameVal ? String(nameVal).trim() : "Unknown", phone: String(phoneVal).trim(), isInvalid: true });
        }
      }
    }

    if (leads.length === 0) {
      setError("No numbers were found in the file.");
      return;
    }

    setExtractedLeads(leads);

    const validCount = leads.length - invalidCount;
    if (invalidCount > 0) {
      setError(`Found ${validCount} valid number${validCount !== 1 ? "s" : ""}. ${invalidCount} invalid number${invalidCount !== 1 ? "s" : ""} will be skipped.`);
    } else {
      setError(null);
    }
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
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          processData(results.data as any[][]);
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
          const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
          processData(jsonData as any[][]);
        } catch (err) {
          setError("Failed to parse Excel file.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile || extractedLeads.length === 0) return;
    if (outboundNumbers.length > 0 && !selectedDid) {
      setError("Please select an outbound number to use.");
      return;
    }
    // Pass all leads (including invalid ones) so user can edit them in the UI before starting
    onUpload(selectedFile.name, extractedLeads, selectedDid, derivedChannels);
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

  const validLeadsCount = extractedLeads.filter(l => !l.isInvalid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* DID Number selector */}
        {outboundNumbers.length > 0 && (
          <div className="mb-2 space-y-2">
            <label className="text-sm font-medium">Outbound Number (DID)</label>
            {outboundNumbers.length === 1 ? (
              // Single number — show as info badge with channel count
              <div className="flex items-center justify-between rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm">
                <span className="font-mono font-semibold text-blue-400">{outboundNumbers[0].number.startsWith('+') ? outboundNumbers[0].number : `+91${outboundNumbers[0].number.replace(/^[0]+/, '')}`}</span>
                <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                  <Zap className="size-3" />
                  {derivedChannels} {derivedChannels === 1 ? "channel" : "parallel channels"}
                </span>
              </div>
            ) : (
              // Multiple numbers — show dropdown
              <select
                value={selectedDid}
                onChange={(e) => setSelectedDid(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {outboundNumbers.map((n) => (
                  <option key={n.id} value={n.number}>
                    {n.number.startsWith('+') ? n.number : `+91${n.number.replace(/^[0]+/, '')}`} ({n.channels ?? 1} ch)
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-muted-foreground">
              {derivedChannels === 1
                ? "Calls will be made sequentially (1 at a time)."
                : `Up to ${derivedChannels} calls will be made in parallel, as allocated by your admin.`}
            </p>
            {(!selectedDidInfo?.agentUrl) && (
              <p className="text-xs font-medium text-red-500 animate-in fade-in mt-1 flex items-center gap-1">
                <AlertCircle className="size-3" />
                Agent URL is not assigned for this number. Please tell the admin to assign it before starting.
              </p>
            )}
          </div>
        )}

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
            Drag &amp; drop your file here
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

        {/* Info / error notice — no editable invalid-number section */}
        {error && (
          <div className={cn(
            "mt-4 flex items-start gap-3 rounded-lg border p-4 text-sm",
            validLeadsCount > 0
              ? "border-border text-foreground"
              : "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
          )}>
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {selectedFile && validLeadsCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-white/5 px-4 py-3 mt-2">
            <FileSpreadsheet className="size-5 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                Ready to dial {validLeadsCount} valid lead{validLeadsCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={!selectedFile || validLeadsCount === 0 || (outboundNumbers.length > 0 && !selectedDidInfo?.agentUrl)} onClick={handleConfirm}>
            Upload &amp; Extract Leads
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
