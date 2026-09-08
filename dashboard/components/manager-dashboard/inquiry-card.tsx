"use client";

import { useMutation } from "convex/react";
import { Copy, Mail, MessageCircle, Phone, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { shareCodeMessage, telLink, timeAgo, waLink, waMessageLink } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { api } from "../../../convex/_generated/api";
import { useInquiryStatusUpdate, type ManagerQueryArgs } from "./manager-hooks";
import type { InquiryStatus, ManagerInquiry } from "./types";

export function InquiryCard({
  queryArgs,
  inquiry,
  hostelName,
}: {
  queryArgs: ManagerQueryArgs;
  inquiry: ManagerInquiry;
  hostelName: string;
}) {
  const updateStatus = useInquiryStatusUpdate(queryArgs);
  const deleteInquiry = useMutation(api.manager.deleteInquiry);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function setStatus(status: InquiryStatus) {
    if (status === inquiry.status) return;
    try {
      await updateStatus({ hostelId: queryArgs.hostelId, inquiryId: inquiry._id, status });
    } catch {
      toast.error(content.toasts.saveFailed);
    }
  }

  return (
    <article className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground">{inquiry.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {inquiry.inquiryRef ? (
              <span className="font-mono font-medium text-foreground/70">{inquiry.inquiryRef}</span>
            ) : null}
            {inquiry.inquiryRef ? " · " : ""}
            {inquiry.roomName} · {inquiry.moveInDate} · {timeAgo(inquiry.createdAt)}
          </p>
          {inquiry.course || inquiry.level ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {inquiry.course}
              {inquiry.course && inquiry.level ? " · " : ""}
              {inquiry.level}
            </p>
          ) : null}
          {inquiry.guardianName ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {content.inquiry.guardian}: {inquiry.guardianName}
              {inquiry.guardianPhone ? (
                <>
                  {" · "}
                  <a
                    href={telLink(inquiry.guardianPhone)}
                    className="font-medium text-foreground/80 underline underline-offset-2"
                  >
                    {inquiry.guardianPhone}
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <Badge variant={inquiry.status}>{content.statuses[inquiry.status]}</Badge>
      </div>

      {inquiry.message ? (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2.5 text-sm leading-relaxed text-foreground/80">
          {inquiry.message}
        </p>
      ) : null}

      {inquiry.email ? (
        <p className="mt-3 flex min-h-9 flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Mail className="size-3.5" aria-hidden="true" />
          <span className="font-medium">{content.inquiry.email}:</span>
          <span className="text-foreground/80">{inquiry.email}</span>
        </p>
      ) : null}

      {inquiry.refCode ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed bg-muted/50 px-3 py-2.5">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{content.inquiry.roomCode}:</span>{" "}
            <span className="font-mono text-sm font-bold tracking-wide text-foreground">
              {inquiry.refCode}
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard
                .writeText(inquiry.refCode as string)
                .then(() => toast.success(content.inquiry.codeCopied))
                .catch(() => undefined);
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Copy className="size-3.5" aria-hidden="true" />
            {content.inquiry.copyCode}
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {inquiry.refCode ? (
            <Button asChild size="sm">
              <a
                href={waMessageLink(
                  inquiry.phone,
                  shareCodeMessage({
                    studentName: inquiry.name,
                    hostelName,
                    roomName: inquiry.roomName,
                    refCode: inquiry.refCode,
                  }),
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Send /> {content.inquiry.shareCode}
              </a>
            </Button>
          ) : null}
          <Button asChild size="sm" variant={inquiry.refCode ? "outline" : "default"}>
            <a href={waLink(inquiry.phone)} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> WhatsApp
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={telLink(inquiry.phone)}>
              <Phone /> Call
            </a>
          </Button>
          {confirmDelete ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                void deleteInquiry({ hostelId: queryArgs.hostelId, inquiryId: inquiry._id }).catch(() =>
                  toast.error(content.toasts.saveFailed),
                );
              }}
            >
              <Trash2 /> {content.confirmDelete}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              aria-label={content.inquiry.delete}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 />
            </Button>
          )}
        </div>
        <fieldset className="inline-flex rounded-full bg-muted p-1" aria-label="Enquiry status">
          {(["new", "contacted", "booked"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => void setStatus(status)}
              aria-pressed={inquiry.status === status}
              className={cn(
                "min-h-9 rounded-full px-3 text-xs font-medium transition-colors",
                inquiry.status === status
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {content.statuses[status]}
            </button>
          ))}
        </fieldset>
      </div>
    </article>
  );
}
