"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { buildInquiryLink, type ChatContact } from "@/lib/wa";
import { academicYears, content } from "@/lib/content";
import type { RoomType } from "@/lib/mock-hostel";
import { useLiveClient, useLiveRooms } from "@/components/live-data";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

/**
 * Shared inquiry form (SPEC.md FR-A8/A9) — lives on the dedicated inquiry
 * page (unit: /inquire, branch: /b/[slug]/inquire).
 * Styled entirely through the direction's CSS variables, so each design
 * skin restyles it without a fork. All copy comes from lib/content.ts.
 * A room CTA pre-selects its room via the `preselectedRoom` prop
 * (?room=… on the page URL, FR-A3).
 * Submitting: (1) opens a pre-filled WhatsApp chat to the contact — the
 * branch caretaker on a branch site, the org otherwise;
 * (2) logs the inquiry + receipt email once Convex is wired.
 * Honeypot field only — Turnstile deliberately dropped (SPEC.md §9).
 */

const t = content.form;

const inquirySchema = z.object({
  name: z.string().min(2, t.errors.name),
  phone: z.string().min(9, t.errors.phoneShort).max(15, t.errors.phoneLong),
  email: z.string().email(t.errors.emailInvalid),
  guardianName: z.string().min(2, t.errors.guardianName),
  guardianPhone: z.string().min(9, t.errors.phoneShort).max(15, t.errors.phoneLong),
  course: z.string().min(2, t.errors.course),
  level: z.string().min(1, t.errors.level),
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
  branchId,
  preselectedRoom,
}: {
  contact: ChatContact;
  rooms: RoomType[];
  branchId?: string;
  preselectedRoom?: string;
}) {
  const liveRooms = useLiveRooms(rooms, branchId);
  const convex = useLiveClient();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      roomName: preselectedRoom ?? "",
      // The next academic year, already chosen (FR-A8): June 2026 →
      // "2026/2027". Correctable via the select, never blank.
      moveIn: academicYears(2)[0],
      email: "",
      company: "",
    },
  });

  // FR-A3: a room's "Check availability" CTA lands here with ?room=… —
  // the page passes it through as `preselectedRoom`.

  const onSubmit = async (values: InquiryValues) => {
    // Honeypot filled → silently drop (pretend success, open nothing).
    if (values.company) {
      setSent(true);
      return;
    }
    // Open a blank tab synchronously inside the user gesture — mobile
    // Safari blocks window.open after an await — then log the inquiry
    // (the mutation returns the reference, FRANCO-2026-E001) and navigate
    // the held tab to WhatsApp with the reference already in the message.
    const draft = {
      name: values.name,
      phone: values.phone,
      guardianName: values.guardianName,
      guardianPhone: values.guardianPhone,
      course: values.course,
      level: values.level,
      roomName: values.roomName,
      moveIn: values.moveIn,
      message: values.message,
    };
    const needsRef = Boolean(convex && branchId);
    const held = needsRef ? window.open("", "_blank") : null;

    let ref: string | null = null;
    if (convex && branchId) {
      try {
        const result = await convex.client.mutation(api.public.submitInquiry, {
          hostelId: convex.hostelId as Id<"hostels">,
          branchId: branchId as Id<"branches">,
          name: values.name,
          phone: values.phone,
          email: values.email,
          guardianName: values.guardianName,
          guardianPhone: values.guardianPhone,
          course: values.course,
          level: values.level,
          roomName: values.roomName,
          moveInDate: values.moveIn,
          message: values.message,
          company: values.company ?? "",
        });
        ref = result?.ref ?? null;
      } catch {
        ref = null;
      }
    }

    const link = buildInquiryLink(contact, {
      ...draft,
      ...(ref ? { ref } : {}),
    });
    if (held && !held.closed) {
      held.location.href = link;
    } else {
      window.open(link, "_blank", "noopener");
    }
    setSent(true);
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
          <label htmlFor="inq-email" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.email}
          </label>
          <input
            id="inq-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t.emailPlaceholder}
            className={inputClass}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="inq-course" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.course}
          </label>
          <input
            id="inq-course"
            type="text"
            placeholder={t.coursePlaceholder}
            className={inputClass}
            {...register("course")}
          />
          {errors.course && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.course.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-guardian-name" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.guardianName}
          </label>
          <input
            id="inq-guardian-name"
            type="text"
            autoComplete="off"
            placeholder={t.guardianNamePlaceholder}
            className={inputClass}
            {...register("guardianName")}
          />
          {errors.guardianName && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.guardianName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="inq-guardian-phone" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.guardianPhone}
          </label>
          <input
            id="inq-guardian-phone"
            type="tel"
            inputMode="tel"
            placeholder={t.phonePlaceholder}
            className={inputClass}
            {...register("guardianPhone")}
          />
          {errors.guardianPhone && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.guardianPhone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inq-level" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.level}
          </label>
          <select id="inq-level" className={inputClass} {...register("level")}>
            <option value="">{t.level}</option>
            {t.levelOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.level && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.level.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="inq-movein" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
            {t.academicYear}
          </label>
          <select id="inq-movein" className={inputClass} {...register("moveIn")}>
            {academicYears(2).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.moveIn && (
            <p className="mt-1.5 text-[13px] text-(--error)">{errors.moveIn.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="inq-room" className="mb-1.5 block text-[13px] font-medium text-(--ink)">
          {t.roomType}
        </label>
        <select
          id="inq-room"
          className={inputClass}
          defaultValue={preselectedRoom ?? ""}
          {...register("roomName")}
        >
          <option value="">{t.chooseRoom}</option>
          {liveRooms.map((room) => (
            <option key={room.id} value={room.name}>
              {room.name} — GHS {room.pricePerYear.toLocaleString("en-GH")}/yr
            </option>
          ))}
        </select>
        {errors.roomName && (
          <p className="mt-1.5 text-[13px] text-(--error)">{errors.roomName.message}</p>
        )}
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
