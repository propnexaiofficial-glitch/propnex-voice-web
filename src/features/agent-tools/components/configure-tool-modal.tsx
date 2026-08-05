"use client";

import { Settings2 } from "lucide-react";

import { SelectField } from "@/components/forms/select-field";
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
import type { AgentTool, ToolConfig } from "@/features/agent-tools/types";

type ConfigureToolModalProps = {
  tool: AgentTool | undefined;
  config: ToolConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onConfigChange: (partial: Partial<ToolConfig>) => void;
};

const languageOptions = [
  { value: "English (US)", label: "English (US)" },
  { value: "English (UK)", label: "English (UK)" },
  { value: "Mandarin", label: "Mandarin" },
  { value: "Malay", label: "Malay" },
];

const voiceOptions = [
  { value: "voice-001", label: "Sarah — Professional Female" },
  { value: "voice-002", label: "James — Warm Male" },
  { value: "voice-003", label: "Priya — Premium Female" },
];

export function ConfigureToolModal({
  tool,
  config,
  open,
  onOpenChange,
  onSave,
  onConfigChange,
}: ConfigureToolModalProps) {
  if (!tool) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
              <Settings2 className="size-4 text-primary" />
            </div>
            <div>
              <DialogTitle>Configure {tool.name}</DialogTitle>
              <DialogDescription className="mt-0.5">
                Adjust tool settings and voice agent assignment
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label
              htmlFor="max-retries"
              className="text-xs font-medium text-muted-foreground"
            >
              Max Retries
            </label>
            <Input
              id="max-retries"
              type="number"
              min={0}
              max={10}
              value={config.maxRetries}
              onChange={(e) =>
                onConfigChange({ maxRetries: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="call-window"
              className="text-xs font-medium text-muted-foreground"
            >
              Call Window
            </label>
            <Input
              id="call-window"
              value={config.callWindow}
              onChange={(e) => onConfigChange({ callWindow: e.target.value })}
              placeholder="09:00 - 18:00"
            />
          </div>

          <SelectField
            label="Language"
            value={config.language}
            onChange={(e) => onConfigChange({ language: e.target.value })}
          >
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Voice Agent"
            value={config.voiceAgentId}
            onChange={(e) => onConfigChange({ voiceAgentId: e.target.value })}
          >
            {voiceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
