import type { Branch, Hostel, RoomType } from "./mock-hostel";
import { content } from "./content";

/**
 * WhatsApp deep-link builders (SPEC.md FR-A8).
 * The whole product's job is to start a structured conversation —
 * the owner should be able to answer immediately, not decode "hi is
 * there a room". All message templates live in lib/content.ts.
 *
 * Chats target a ChatContact: the org itself, or a branch's caretaker —
 * the branch's own number wins when it has one (SPEC.md §5), so in a
 * multi-branch org the conversation lands with the person on site.
 */

/** A WhatsApp chat target. */
export interface ChatContact {
  whatsappNumber: string; // E.164
  name: string; // appears in message templates ("... at {name}")
}

/** The org's own line — used where no branch context exists. */
export function orgContact(hostel: Hostel): ChatContact {
  return { whatsappNumber: hostel.whatsappNumber, name: hostel.name };
}

/** A branch's caretaker: the branch's line when it has one, the org's otherwise. */
export function branchContact(hostel: Hostel, branch: Branch): ChatContact {
  return {
    whatsappNumber: branch.whatsappNumber ?? hostel.whatsappNumber,
    name: branch.name,
  };
}

export interface InquiryDraft {
  name: string;
  phone: string;
  roomName: string;
  moveIn: string;
  message?: string;
}

function fillTemplate(
  template: readonly string[],
  tokens: Record<string, string>,
): string {
  const lines = template.map((line) =>
    line.replace(/\{(\w+)\}/g, (_, key: string) => tokens[key] ?? ""),
  );
  // Collapse runs of blank lines left by unfilled optional tokens.
  return lines.filter((line, i) => line !== "" || (i > 0 && lines[i - 1] !== "")).join("\n");
}

export function buildInquiryMessage(
  contactName: string,
  inquiry: InquiryDraft,
): string {
  return fillTemplate(content.chat.inquiryMessage, {
    hostel: contactName,
    name: inquiry.name,
    phone: inquiry.phone,
    room: inquiry.roomName,
    moveIn: inquiry.moveIn,
    note: inquiry.message?.trim()
      ? `${content.chat.notePrefix} ${inquiry.message.trim()}`
      : "",
  });
}

export function buildInquiryLink(
  contact: ChatContact,
  inquiry: InquiryDraft,
): string {
  const text = encodeURIComponent(buildInquiryMessage(contact.name, inquiry));
  return `https://wa.me/${contact.whatsappNumber}?text=${text}`;
}

export function buildRoomChatLink(
  contact: ChatContact,
  room: RoomType,
): string {
  const text = fillTemplate([content.chat.roomGreeting], {
    room: room.name,
    hostel: contact.name,
  });
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function buildGeneralChatLink(
  contact: Pick<ChatContact, "whatsappNumber">,
): string {
  const text = encodeURIComponent(content.chat.generalGreeting);
  return `https://wa.me/${contact.whatsappNumber}?text=${text}`;
}
