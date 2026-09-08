"use client";

import { useMutation } from "convex/react";
import { Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { InquiryCard } from "./inquiry-card";
import type { ManagerQueryArgs } from "./manager-hooks";
import type { ManagerInquiry } from "./types";

/**
 * The inbox list with its management layer (FR-B3): status filter pills
 * (New first — the working queue — with All last), a search box over
 * reference, name, phone, room, code and email, per-card delete, and the
 * end-of-campaign Clear all. Enquiries are kept until deliberately
 * cleared — filtering and search are how a long admissions-season list
 * stays workable, not deletion.
 */

type StatusFilter = "new" | "contacted" | "booked" | "all";

export function InquiryList({
  queryArgs,
  inquiries,
  hostelName,
}: {
  queryArgs: ManagerQueryArgs;
  inquiries: ManagerInquiry[];
  hostelName: string;
}) {
  // "New" is the working queue — the inbox opens there, not on All.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("new");
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const clearInquiries = useMutation(api.manager.clearInquiries);

  const counts = useMemo(() => {
    const base: Record<StatusFilter, number> = { new: 0, contacted: 0, booked: 0, all: inquiries.length };
    for (const inquiry of inquiries) base[inquiry.status] += 1;
    return base;
  }, [inquiries]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      if (statusFilter !== "all" && inquiry.status !== statusFilter) return false;
      if (!needle) return true;
      return [inquiry.name, inquiry.phone, inquiry.roomName, inquiry.refCode, inquiry.inquiryRef, inquiry.email]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(needle));
    });
  }, [inquiries, statusFilter, search]);

  if (inquiries.length === 0) {
    return <EmptyState title={content.inbox.emptyTitle} body={content.inbox.emptyBody} />;
  }

  async function clearAll() {
    setConfirmClear(false);
    try {
      const count = await clearInquiries({
        hostelId: queryArgs.hostelId,
        ...(queryArgs.branchId ? { branchId: queryArgs.branchId } : {}),
      });
      toast.success(`${content.inbox.cleared} — ${count}`);
    } catch {
      toast.error(content.toasts.saveFailed);
    }
  }

  return (
    <div className="space-y-4">
      {/* Status filter pills — New leads, All trails */}
      <fieldset className="flex flex-wrap gap-1.5" aria-label="Filter by status">
        {(["new", "contacted", "booked", "all"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            aria-pressed={statusFilter === status}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors",
              statusFilter === status
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {status === "all" ? content.inbox.filterAll : content.statuses[status]}
            <span className={cn("tabular-nums", statusFilter === status ? "opacity-80" : "opacity-60")}>
              {counts[status]}
            </span>
          </button>
        ))}
      </fieldset>

      {/* Search — find a student by anything you know about them */}
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={content.inbox.searchPlaceholder}
          className="h-11 w-full rounded-lg border bg-card pr-4 pl-10 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={content.inbox.noMatchesTitle} body={content.inbox.noMatchesBody} />
      ) : (
        <div className="space-y-3">
          {filtered.map((inquiry) => (
            <InquiryCard
              key={inquiry._id}
              queryArgs={queryArgs}
              inquiry={inquiry}
              hostelName={hostelName}
            />
          ))}
        </div>
      )}

      {/* End of campaign: clear the inbox and start fresh */}
      <div className="mt-8 border-t border-border pt-6">
        {confirmClear ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="destructive" size="sm" onClick={() => void clearAll()}>
              <Trash2 /> {content.inbox.clearConfirm}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmClear(false)}>
              {content.inbox.clearKeep}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-1.5">
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex min-h-9 items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              {content.inbox.clearAll}
            </button>
            <p className="text-[11px] text-muted-foreground/70">{content.inbox.clearHint}</p>
          </div>
        )}
      </div>
    </div>
  );
}
