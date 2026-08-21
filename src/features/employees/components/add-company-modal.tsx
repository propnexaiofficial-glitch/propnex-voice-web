"use client";

import { useState } from "react";
import { Building2, Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AddCompanyForm } from "@/features/employees/types";

type AddCompanyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: AddCompanyForm) => void | Promise<void>;
};

const emptyForm: AddCompanyForm = {
  name: "",
  contactEmail: "",
  contactPhone: "",
  allocatedCredits: 0,
};

export function AddCompanyModal({
  open,
  onOpenChange,
  onSubmit,
}: AddCompanyModalProps) {
  const [form, setForm] = useState<AddCompanyForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name) return;
    if (form.allocatedCredits < 0) {
      setError("Credits cannot be negative.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(emptyForm);
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add sub-company"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = (next: boolean) => {
    if (!next) {
      setForm(emptyForm);
      setError("");
    }
    onOpenChange(next);
  };

  return (
    <>
      <Button className="gap-2" onClick={() => onOpenChange(true)}>
        <Plus className="size-4" />
        Add Sub-Company
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-foreground" />
              Add Sub-Company
            </DialogTitle>
            <DialogDescription>
              Onboard a new client under your umbrella account. They will get
              their own inbound and outbound panels.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="co-name" className="text-xs font-medium text-muted-foreground">
                Company Name
              </label>
              <Input
                id="co-name"
                placeholder="e.g. Orchard Realty Group"
                value={form.name}
                disabled={submitting}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="allocated-credits" className="text-xs font-medium text-muted-foreground">
                Allocated Credits
              </label>
              <Input
                id="allocated-credits"
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={form.allocatedCredits || ""}
                disabled={submitting}
                onChange={(e) => setForm({ ...form, allocatedCredits: parseInt(e.target.value) || 0 })}
              />
              <p className="text-[10px] text-muted-foreground">
                Credits will be deducted from your main company balance.
              </p>
            </div>

            {error && (
              <p className="text-center text-xs text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              disabled={!form.name || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Company"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
