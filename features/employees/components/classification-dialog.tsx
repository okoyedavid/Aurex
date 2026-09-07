"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/components/ui/select";
import type { EmployeeClassificationStatus, EmployeeGroup, EmployeeType } from "@/lib/employee-classifications-api";

export type ClassificationRecord = EmployeeType | EmployeeGroup;
export type ClassificationSaveBody =
  | { mode: "custom"; name: string; description: string; status: EmployeeClassificationStatus }
  | { mode: "template"; templateKey: string; status: EmployeeClassificationStatus };

export function ClassificationDialog({ kind, item, templates, pending, open, onOpenChange, onSave }: { kind: "types" | "groups"; item?: ClassificationRecord; templates: Array<{ key: string; name: string }>; pending: boolean; open: boolean; onOpenChange: (open: boolean) => void; onSave: (body: ClassificationSaveBody) => void }) {
  const [mode, setMode] = useState<"custom" | "template">("custom");
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [templateKey, setTemplateKey] = useState("");
  const [status, setStatus] = useState<EmployeeClassificationStatus>(item?.status ?? "active");
  return (
    <Dialog open={open} onOpenChange={(value) => !pending && onOpenChange(value)}>
      <DialogContent>
        <DialogHeader><DialogTitle>{item ? "Edit" : "Create"} employee {kind === "types" ? "type" : "group"}</DialogTitle><DialogDescription>Records remain available for referenced employees. Archive them instead of deleting.</DialogDescription></DialogHeader>
        <form onSubmit={(event) => { event.preventDefault(); if (!item && mode === "template") onSave({ mode, templateKey, status }); else onSave({ mode: "custom", name: name.trim(), description: description.trim(), status }); }} className="space-y-4">
          {!item ? <label className="space-y-2 text-sm font-medium">Source<SelectControl value={mode} onChange={(event) => setMode(event.target.value as "custom" | "template")} className="h-9 w-full"><option value="custom">Custom business record</option><option value="template">System default</option></SelectControl></label> : null}
          {!item && mode === "template" ? <label className="space-y-2 text-sm font-medium">System default<SelectControl required value={templateKey} onChange={(event) => setTemplateKey(event.target.value)} className="h-9 w-full"><option value="">Select a default</option>{templates.map((template) => <option key={template.key} value={template.key}>{template.name}</option>)}</SelectControl></label> : <><label className="space-y-2 text-sm font-medium">Name<Input required value={name} onChange={(event) => setName(event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Description<Input value={description} onChange={(event) => setDescription(event.target.value)} /></label></>}
          {item ? <label className="space-y-2 text-sm font-medium">Status<SelectControl value={status} onChange={(event) => setStatus(event.target.value as EmployeeClassificationStatus)} className="h-9 w-full"><option value="active">Active</option><option value="archived">Archived</option></SelectControl></label> : null}
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null}Save</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
