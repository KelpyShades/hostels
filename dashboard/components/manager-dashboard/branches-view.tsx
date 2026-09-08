"use client";

import { Building2, ChevronRight, Pencil } from "lucide-react";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";
import { BranchDialog } from "./branch-dialog";
import { EmptyState } from "./empty-state";
import type { ManagerBranch, ManagerData } from "./types";

/**
 * The Branches hub — HOME for a multi-branch hostel (FR-B6a). The branch
 * cards are the navigation: one tap enters that branch's workspace
 * (enquiries, rooms, share). There is deliberately no aggregated
 * "all branches" inbox — each branch's work happens inside it. Branch
 * STRUCTURE is seeded by us (never added/deleted here); the pencil opens
 * the narrow edit: photos + directions note.
 */
export function BranchesView({
  hostelId,
  data,
  onSelect,
}: {
  hostelId: Id<"hostels">;
  data: ManagerData;
  onSelect: (branchId: Id<"branches">) => void;
}) {
  const [branchDialog, setBranchDialog] = useState<{ branch: ManagerBranch } | null>(null);

  const branches = [...data.branches].sort((a, b) => a.sortOrder - b.sortOrder);

  const openRooms = (branchId: Id<"branches">) =>
    data.rooms
      .filter((room) => room.branchId === branchId)
      .reduce((sum, room) => sum + (room.accepting ? room.availableCount : 0), 0);
  const newEnquiries = (branchId: Id<"branches">) =>
    data.inquiries.filter((i) => i.branchId === branchId && i.status === "new").length;

  return (
    <div>
      {branches.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title={content.rooms.emptyBranchesTitle}
            body={content.rooms.emptyBranchesBody}
          />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {branches.map((branch) => {
            return (
              <article
                key={branch._id}
                className="flex items-stretch overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onSelect(branch._id)}
                  className="flex min-h-0 flex-1 items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/40 sm:p-5"
                >
                  <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted sm:size-20">
                    <Building2 className="size-6 text-muted-foreground" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-foreground">{branch.name}</span>
                    {branch.directionsNote ? (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {branch.directionsNote}
                      </span>
                    ) : null}
                    <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span
                        className={cn(
                          "font-medium",
                          openRooms(branch._id) > 0 ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {openRooms(branch._id)} {content.branchesView.roomsOpen}
                      </span>
                      {newEnquiries(branch._id) > 0 ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                          {newEnquiries(branch._id)} {content.branchesView.newEnquiries}
                        </span>
                      ) : null}
                    </span>
                  </span>

                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </button>

                <div className="flex items-center border-l border-border pr-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setBranchDialog({ branch })}
                    aria-label={content.branch.editTitle}
                  >
                    <Pencil />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {branchDialog ? (
        <BranchDialog
          hostelId={hostelId}
          branch={branchDialog.branch}
          onClose={() => setBranchDialog(null)}
        />
      ) : null}
    </div>
  );
}
