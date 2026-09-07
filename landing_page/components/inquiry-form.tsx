"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { buildInquiryLink, type ChatContact } from "@/lib/wa";
import { content } from "@/lib/content";
import type { RoomType } from "@/lib/mock-hostel";
import { PRESELECT_ROOM_EVENT } from "@/components/room-cta";

/**
 * Shared inquiry form (SPEC.md FR-A8/A9).
 * Styled entirely through the direction's CSS variables, so each design
 * skin restyles it without a fork. All copy comes from lib/content.ts.
 * Submitting: (1) opens a pre-filled WhatsApp chat to the contact — the
 * branch caretaker on a branch site, the org otherwise;
 * (2) logs the inquiry + receipt email once Convex is wired.
 * Honeypot field only — Turnstile deliberately dropped (SPEC.md §9).
 */

const t = content.form;

const inquirySchema = z.object({
  name: z.string().min(2, t.errors.name),
  phone: z.string().min(9, t.errors.phoneShort).max(15, t.errors.phoneLong),
  roomName: z.string().min(1, t.errors.room),
  moveIn: z.string().min(1, t.errors.moveIn),
  message: z.string().max(500, t.errors.messageLong).optional(),
  // Honeypot — humans never see or fill this. Bots that do are discarded.
  company: z.string().max(0).optional().or(z.literal("")),
});

type InquiryValues = z.infer<typeof inquirySchema>;

export function InquiryForm({
  contact,
  rooms,
  preselectedRoom,
}: {
  contact: ChatContact;
  rooms: RoomType[];
  preselectedRoom?: string;
}) {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      roomName: preselectedRoom ?? "",
      moveIn: "",
      company: "",
    },
  });

  // FR-A3: a room's "Check availability" CTA pre-selects that room here.
  useEffect(() => {
    const onPreselect = (event: Event) => {
      const roomName = (event as CustomEvent<{ roomName: string }>).detail?.roomName;
      if (roomName) setValue("roomName", roomName, { shouldValidate: false });
    };
    window.addEventListener(PRESELECT_ROOM_EVENT, onPreselect);
    return () => window.removeEventListener(PRESELECT_ROOM_EVENT, onPreselect);
  }, [setValue]);

  const onSubmit = (values: InquiryValues) => {
    // Honeypot filled → silently drop (pretend success, open nothing).
    if (values.company) {
      setSent(true);
      return;
    }
    const link = buildInquiryLink(contact, {
      name: values.name,
      phone: values.phone,
      roomName: values.roomName,
      moveIn: values.moveIn,
      message: values.message,
    });
    window.open(link, "_blank", "noopener");
    setSent(true);
    // TODO(Convex wiring): log inquiry + send Pingram receipt email.
  };

  const inputClass =
    "w-full rounded-none border-0 border-b border-(--line-strong) bg-transparent px-0 py-2.5 text-[15.5px] text-(--ink) placeholder:text-(--ink-muted) focus:border-(--accent) focus:outline-none";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      {/* Honeypot: hidden from humans, irresistible to bots */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("company")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-name" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.name}
          </label>
          <input
            id="inq-name"
            type="text"
            autoComplete="name"
            placeholder={t.namePlaceholder}
            className={inputClass}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="inq-phone" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.phone}
          </label>
          <input
            id="inq-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={t.phonePlaceholder}
            className={inputClass}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-room" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.roomType}
          </label>
          <select id="inq-room" className={inputClass} {...register("roomName")}>
            <option value="">{t.chooseRoom}</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.name}>
                {room.name} — GHS {room.pricePerSemester.toLocaleString("en-GH")}/sem
              </option>
            ))}
          </select>
          {errors.roomName && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.roomName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="inq-movein" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.moveIn}
          </label>
          <select id="inq-movein" className={inputClass} {...register("moveIn")}>
            <option value="">{t.whichSemester}</option>
            {content.chat.semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.moveIn && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.moveIn.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="inq-msg" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
          {t.anythingElse} <span className="text-(--ink-muted)">{t.optional}</span>
        </label>
        <textarea
          id="inq-msg"
          rows={3}
          placeholder={t.messagePlaceholder}
          className={inputClass}
          {...register("message")}
        />
      </div>

      <button
        type="submit"
        className="mt-2 flex min-h-12 items-center justify-center gap-2.5 rounded-(--radius) bg-(--accent) px-6 py-3 text-[15px] font-semibold text-(--accent-contrast) transition-transform active:scale-[0.99]"
      >
        <WhatsAppGlyph className="h-5 w-5" />
        {t.submit}
      </button>

      <p className="text-center text-[13px] text-(--ink-muted)">
        {sent ? t.sentHelper : t.helper}
      </p>
    </form>
  );
}

/** The WhatsApp glyph — a recognizable brand mark, not decorative art. */
export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.12c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24s-3.7 8.24-8.24 8.24Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}
