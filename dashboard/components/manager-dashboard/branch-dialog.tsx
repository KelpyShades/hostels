"use client";

import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
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
import { Label } from "@/components/ui/label";
import { content } from "@/lib/content";
import type { ManagerBranch } from "./types";

/**
 * Branch edit — deliberately narrow (FR-B6a): the branch structure (name,
 * existence, order, PHOTOS) is seeded by us and never editable here — the
 * name is the stable key the public site's curated shell matches on, and
 * all imagery is bundled static assets curated at the annual refresh.
 * The manager touches only the directions note.
 */
export function BranchDialog({
  hostelId,
  branch,
  onClose,
}: {
  hostelId: Id<"hostels">;
  branch: ManagerBranch;
  onClose: () => void;
}) {
  const updateBranch = useMutation(api.manager.updateBranch);

  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(branch.directionsNote ?? "");

  function close() {
    setOpen(false);
    setTimeout(onClose, 150);
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateBranch({
        hostelId,
        branchId: branch._id,
        directionsNote: note,
      });
      toast.success(content.toasts.branchSaved);
      close();
    } catch {
      toast.error(content.toasts.saveFailed);
    }
    setSaving(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {content.branch.editTitle} — {branch.name}
          </DialogTitle>
          <DialogDescription>{content.branch.editDescription}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={onSubmit} noValidate>
          <div className="grid gap-2">
            <Label htmlFor="branch-note">{content.branch.note}</Label>
            <Input
              id="branch-note"
              placeholder={content.branch.notePlaceholder}
              autoComplete="off"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {content.branch.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
