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
  guardianName: string;
  guardianPhone: string;
  course: string;
  level: string;
  roomName: string;
  moveIn: string; // the academic year label, e.g. "2026/2027"
  message?: string;
  /** The inquiry reference (FRANCO-2026-E001), returned by submitInquiry —
   *  included in the WhatsApp message so the manager can match the chat
   *  to the inbox row instantly. */
  ref?: string;
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
    guardian: inquiry.guardianName,
    guardianPhone: inquiry.guardianPhone,
    course: inquiry.course,
    level: inquiry.level,
    room: inquiry.roomName,
    moveIn: inquiry.moveIn,
    ref: inquiry.ref ?? "",
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

/** The speakable category — "4 in 1", "2 in 1", "1 in 1" — how students
 *  and managers actually say it. */
function categoryOf(occupancy: number): string {
  return `${occupancy} in 1`;
}

/** Room name → speakable descriptor: category + variant.
 *  "2 in a room — Old block (No TV)" → "2 in 1 — Old block (No TV)";
 *  "4 in a room" → "4 in 1". Manager-named rooms that don't follow the
 *  pattern pass through untouched. */
export function roomDescriptor(room: RoomType): string {
  const match = room.name.match(/^[1-4] in a room(?:\s+—\s+(.+))?$/);
  if (!match) return room.name;
  const variant = match[1];
  return variant ? `${categoryOf(room.occupancy)} — ${variant}` : categoryOf(room.occupancy);
}

export function buildRoomChatLink(
  contact: ChatContact,
  room: RoomType,
): string {
  const text = fillTemplate([content.chat.roomGreeting], {
    room: roomDescriptor(room),
    hostel: contact.name,
  });
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function buildGeneralChatLink(
  contact: Pick<ChatContact, "whatsappNumber">,
  rooms?: RoomType[],
): string {
  // With room context, the greeting names the categories from the UI —
  // "your 4 in 1, 2 in 1 and 1 in 1 rooms" — so the manager knows what
  // the chat is about before it starts.
  const occupancies = [...new Set((rooms ?? []).map((room) => room.occupancy))].sort((a, b) => b - a);
  let text: string = content.chat.generalGreeting;
  if (occupancies.length > 0) {
    const categories = occupancies.map(categoryOf);
    const list =
      categories.length === 1
        ? categories[0]
        : `${categories.slice(0, -1).join(", ")} and ${categories[categories.length - 1]}`;
    text = fillTemplate([content.chat.generalGreetingRooms], { categories: list });
  }
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
