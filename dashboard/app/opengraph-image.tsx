import { ImageResponse } from "next/og";
import { getHostelName } from "@/lib/site";

export const alt = "Manager dashboard — enquiries, rooms and branches";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default async function Image() {
  const name = (await getHostelName()) ?? "Your hostel";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#2e131b",
          backgroundImage:
            "radial-gradient(ellipse 900px 500px at 85% -10%, #4a1f2a 0%, #2e131b 60%)",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "3px",
              backgroundColor: "#d8a4ae",
            }}
          />
          <div
            style={{
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "6px",
              color: "#d8a4ae",
              textTransform: "uppercase",
            }}
          >
            Manager dashboard
          </div>
        </div>

        {/* title + description */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            maxWidth: "920px",
          }}
        >
          <div
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#ede9dd",
              lineHeight: 1.08,
            }}
          >
            Enquiries, rooms &amp; branches — one dashboard.
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#c9b8a8",
              lineHeight: 1.4,
            }}
          >
            Keep room availability live and accept bookings on WhatsApp.
          </div>
        </div>

        {/* bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #722f37",
            paddingTop: "28px",
          }}
        >
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#ede9dd" }}>
            {name}
          </div>
          <div style={{ fontSize: "26px", color: "#c9b8a8" }}>
            Manager access only
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
