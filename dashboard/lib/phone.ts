/**
 * Phone helpers for reaching students from the inbox.
 * Ghana-local numbers start with 0; wa.me needs the international form.
 */
export function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0") ? `233${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

/** WhatsApp with a pre-filled message — how the manager shares a room code
 *  from the inbox: one tap, the chat opens with the code already typed. */
export function waMessageLink(phone: string, text: string): string {
  return `${waLink(phone)}?text=${encodeURIComponent(text)}`;
}

/** The share-code message sent to a booked student. */
export function shareCodeMessage(args: {
  studentName: string;
  hostelName: string;
  roomName: string;
  refCode: string;
}): string {
  return [
    `Hello ${args.studentName},`,
    "",
    `Good news — your room at ${args.hostelName} is confirmed.`,
    `Room: ${args.roomName}`,
    `Your code: ${args.refCode}`,
    "",
    "Keep this message and show your code when you come to move in.",
    `— ${args.hostelName}`,
  ].join("\n");
}

export function telLink(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
