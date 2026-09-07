import QRCode from "qrcode";

/**
 * QR code for flyers / noticeboards (FR-A12): scans to this hostel's site.
 * GET /qr → PNG. In production it encodes the hostel's live URL
 * (custom domain or vercel.app); for the demo, the request origin.
 */

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const png = await QRCode.toBuffer(origin, {
    width: 640,
    margin: 2,
    color: { dark: "#23201bff", light: "#faf6efff" },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=86400",
    },
  });
}
