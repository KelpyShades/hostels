"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import Sequenzy from "sequenzy";

/**
 * Email receipts (SPEC.md FR-A8.3, FR-B3) via Sequenzy — the step up
 * from the WhatsApp-only flow: students get written confirmation, and a
 * booked student gets their room code by email instead of a voice note.
 *
 * Auth: SEQUENZY_API_KEY on the CONVEX deployment env (set it with
 *   npx convex env set SEQUENZY_API_KEY <key>
 * — the Next apps' .env files are irrelevant here; Convex functions read
 * their own deployment env). Unset → the actions log a skip, so dev and
 * the static demo never need an email account.
 *
 * Reply-to is PER HOSTEL (hostels.replyToEmail — the manager's address,
 * seeded per client like codePrefix): every client shares this Convex
 * deployment, so a deployment-level env var would let one hostel
 * override another's replies. The calling mutation passes it in.
 *
 * Runtime: "use node" — the Sequenzy SDK touches Node built-ins, so this
 * file contains only these Node actions (Convex runtime split rule).
 * Sender: the sending domain is ours (mail.hostels.kelpyshades.com) with
 * the hostel's name in the display part, so one verified domain sends
 * for every client. Optional SEQUENZY_FROM overrides the address.
 */

const FROM_ADDRESS = process.env.SEQUENZY_FROM ?? "hello@mail.hostels.kelpyshades.com";

function client(): Sequenzy | null {
  const apiKey = process.env.SEQUENZY_API_KEY;
  if (!apiKey) {
    console.log("[email:skipped — SEQUENZY_API_KEY unset on the Convex deployment]");
    return null;
  }
  return new Sequenzy({ apiKey });
}

interface EmailDraft {
  to: string;
  hostelName: string;
  subject: string;
  preview: string;
  html: string;
  variables: Record<string, string>;
  /** Per-hostel reply-to (the manager's address) — from the hostel row,
   *  passed by the calling mutation. Absent → no reply-to header. */
  replyTo?: string;
}

/** One delivery attempt. Failures are logged, never thrown — an email
 *  problem must never break an inquiry or a booking. */
async function deliver(email: EmailDraft): Promise<void> {
  const sequenzy = client();
  if (!sequenzy) return;
  try {
    const response = await sequenzy.transactional.send({
      to: [email.to],
      subject: email.subject,
      body: email.html,
      preview: email.preview,
      variables: email.variables,
      from: `${email.hostelName} <${FROM_ADDRESS}>`,
      ...(email.replyTo ? { replyTo: email.replyTo } : {}),
    });
    console.log(`[email:sent] to=${email.to} subject="${email.subject}"`);
    void response;
  } catch (error) {
    console.error(`[email:failed] to=${email.to} subject="${email.subject}"`, error);
  }
}

/** Receipt for a fresh inquiry: "we got your request, [hostel] will reach
 *  out on WhatsApp shortly." Email is the receipt, never the channel. */
export const sendInquiryReceipt = internalAction({
  args: {
    to: v.string(),
    hostelName: v.string(),
    studentName: v.string(),
    roomName: v.string(),
    moveInDate: v.string(),
    inquiryRef: v.optional(v.string()),
    replyTo: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await deliver({
      to: args.to,
      hostelName: args.hostelName,
      replyTo: args.replyTo ?? undefined,
      subject: `We got your room enquiry — ${args.hostelName}`,
      preview: `We received your enquiry for the ${args.roomName}.`,
      html: [
        "<p>Hello {{student_name}},</p>",
        "<p>Thank you for asking about a room at <strong>{{hostel_name}}</strong>. We received your enquiry:</p>",
        "<p>Room: <strong>{{room_name}}</strong><br />Move-in: {{move_in}}<br />Reference: <strong>{{inquiry_ref}}</strong></p>",
        "<p>The manager will reach out to you on WhatsApp shortly. If you'd like to move faster, chat with us directly on WhatsApp and quote your reference.</p>",
        "<p>— {{hostel_name}}</p>",
      ].join(""),
      variables: {
        student_name: args.studentName,
        hostel_name: args.hostelName,
        room_name: args.roomName,
        move_in: args.moveInDate,
        inquiry_ref: args.inquiryRef ?? "—",
      },
    });
    return null;
  },
});

/** Booking confirmation with the student's room code — sent the first
 *  time a manager marks the inquiry "booked". The code is their proof of
 *  a confirmed room; they show it at move-in. */
export const sendBookingConfirmation = internalAction({
  args: {
    to: v.string(),
    hostelName: v.string(),
    studentName: v.string(),
    roomName: v.string(),
    refCode: v.string(),
    replyTo: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    await deliver({
      to: args.to,
      hostelName: args.hostelName,
      replyTo: args.replyTo ?? undefined,
      subject: `Room confirmed — your code is {{ref_code}} ({{hostel_name}})`,
      preview: `Your room is confirmed. Your code is ${args.refCode}.`,
      html: [
        "<p>Hello {{student_name}},</p>",
        "<p>Good news — your room at <strong>{{hostel_name}}</strong> is confirmed.</p>",
        "<p>Room: <strong>{{room_name}}</strong><br />Your code: <strong style=\"font-size:1.2em;letter-spacing:0.06em\">{{ref_code}}</strong></p>",
        "<p>Keep this email. Show your code when you come to move in.</p>",
        "<p>— {{hostel_name}}</p>",
      ].join(""),
      variables: {
        student_name: args.studentName,
        hostel_name: args.hostelName,
        room_name: args.roomName,
        ref_code: args.refCode,
      },
    });
    return null;
  },
});
