"use client";

import { useState } from "react";
import { IdCard, Plus } from "lucide-react";

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
import { SelectField } from "@/components/forms/select-field";
import { regionOptions } from "@/features/caller-id/data";
import type { AddCallerIdForm } from "@/features/caller-id/types";

type AddCallerIdModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: AddCallerIdForm) => void;
};

const emptyForm: AddCallerIdForm = {
  label: "",
  phoneNumber: "",
  region: "Singapore",
  type: "outbound",
};

export function AddCallerIdModal({
  open,
  onOpenChange,
  onSubmit,
}: AddCallerIdModalProps) {
  const [form, setForm] = useState<AddCallerIdForm>(emptyForm);

  const handleSubmit = () => {
    if (!form.label || !form.phoneNumber) return;
    onSubmit(form);
    setForm(emptyForm);
    onOpenChange(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) setForm(emptyForm);
    onOpenChange(next);
  };

  return (
    <>
      <Button className="gap-2" onClick={() => onOpenChange(true)}>
        <Plus className="size-4" />
        Add Caller ID
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IdCard className="size-5 text-primary" />
              Add Caller ID
            </DialogTitle>
            <DialogDescription>
              Register a phone number to use as your outbound or inbound caller ID.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="cid-label" className="text-xs font-medium text-muted-foreground">
                Label
              </label>
              <Input
                id="cid-label"
                placeholder="e.g. Sales Line"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="cid-number" className="text-xs font-medium text-muted-foreground">
                Phone number
              </label>
              <Input
                id="cid-number"
                placeholder="+65 6789 0100"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>

            <SelectField
              label="Region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            >
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Type"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as AddCallerIdForm["type"] })
              }
            >
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
              <option value="both">Both</option>
            </SelectField>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add number</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
