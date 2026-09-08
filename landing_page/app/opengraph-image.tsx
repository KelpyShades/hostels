// import { ImageResponse } from "next/og";
// import { getSite } from "@/lib/site-data";
// import { siteStats } from "@/lib/live";

// export const alt = "Rooms, prices and availability";
// export const size = { width: 1200, height: 630 };
// export const contentType = "image/png";
// export const dynamic = "force-dynamic";

// export default async function Image() {
//   const { site } = await getSite();
//   const { minPrice, available, branchCount } = siteStats(site);

//   const parts: string[] = [];
//   if (minPrice !== null) {
//     parts.push(`Rooms from GHS ${minPrice.toLocaleString("en-US")} a year`);
//   }
//   if (available > 0) {
//     parts.push(`${available} available now`);
//   }
//   const stats = parts.length
//     ? parts.join("  ·  ")
//     : "Live rooms, prices and availability";

//   return new ImageResponse(
//     (
//       <div
//         style={{
//           width: "100%",
//           height: "100%",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//           backgroundColor: "#f3f2ec",
//           backgroundImage:
//             "linear-gradient(135deg, #f3f2ec 0%, #faf9f4 60%, #f3f2ec 100%)",
//           padding: "72px 80px",
//           fontFamily: "sans-serif",
//         }}
//       >
//         {/* top label */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "16px",
//           }}
//         >
//           <div
//             style={{
//               width: "44px",
//               height: "3px",
//               backgroundColor: "#722f37",
//             }}
//           />
//           <div
//             style={{
//               fontSize: "26px",
//               fontWeight: 700,
//               letterSpacing: "6px",
//               color: "#722f37",
//               textTransform: "uppercase",
//             }}
//           >
//             Rooms · Prices · Availability
//           </div>
//         </div>

//         {/* name + live stats */}
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: "24px",
//             maxWidth: "980px",
//           }}
//         >
//           <div
//             style={{
//               fontSize: "88px",
//               fontWeight: 700,
//               color: "#262022",
//               lineHeight: 1.05,
//             }}
//           >
//             {site.hostel.name}
//           </div>
//           <div
//             style={{
//               fontSize: "34px",
//               color: "#4d4644",
//               lineHeight: 1.4,
//             }}
//           >
//             {stats}
//           </div>
//         </div>

//         {/* bottom strip */}
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             borderTop: "2px solid #d8a4ae",
//             paddingTop: "28px",
//           }}
//         >
//           <div style={{ fontSize: "26px", fontWeight: 700, color: "#722f37" }}>
//             Book on WhatsApp
//           </div>
//           <div style={{ fontSize: "26px", color: "#645c58" }}>
//             {branchCount > 1 ? `${branchCount} buildings` : "Live availability"}
//           </div>
//         </div>
//       </div>
//     ),
//     { ...size },
//   );
// }


import { ImageResponse } from "next/og";
import { getSite } from "@/lib/site-data";
import { siteStats } from "@/lib/live";

export const alt = "Rooms, prices and availability";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Live Convex data — must render per-request, not at build time.
export const dynamic = "force-dynamic";

// Helper to fetch font array buffer safely over the network
async function loadGoogleFont(font: string, weight: number) {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}&display=swap`;
  const css = await fetch(url).then((res) => res.text());
  // Node's fetch gets no-UA CSS (`format('truetype')`); browsers get woff2.
  const resource = css.match(/src: url\((.+?)\) format\('(?:truetype|woff2?|ttf)'\)/);
  if (!resource) throw new Error("Failed to parse font from Google Fonts");
  return await fetch(resource[1]).then((res) => res.arrayBuffer());
}

export default async function Image() {
  const { site } = await getSite();
  const { minPrice, available, branchCount } = siteStats(site);

  // Fetch the font array buffer at runtime
  const robotoBold = await loadGoogleFont("Roboto", 700);

  const parts: string[] = [];
  if (minPrice !== null) {
    parts.push(`Rooms from GHS ${minPrice.toLocaleString("en-US")} a year`);
  }
  if (available > 0) {
    parts.push(`${available} available now`);
  }
  const stats = parts.length
    ? parts.join("  ·  ")
    : "Live rooms, prices and availability";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f3f2ec",
          backgroundImage:
            "linear-gradient(135deg, #f3f2ec 0%, #faf9f4 60%, #f3f2ec 100%)",
          padding: "72px 80px",
          fontFamily: "Roboto", /* Updated matching font family */
        }}
      >
        {/* top label */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "44px", height: "3px", backgroundColor: "#722f37" }} />
          <div style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "6px", color: "#722f37", textTransform: "uppercase" }}>
            Rooms · Prices · Availability
          </div>
        </div>

        {/* name + live stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "980px" }}>
          <div style={{ fontSize: "88px", fontWeight: 700, color: "#262022", lineHeight: 1.05 }}>
            {site.hostel.name}
          </div>
          <div style={{ fontSize: "34px", color: "#4d4644", lineHeight: 1.4 }}>
            {stats}
          </div>
        </div>

        {/* bottom strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #d8a4ae", paddingTop: "28px" }}>
          <div style={{ fontSize: "26px", fontWeight: 700, color: "#722f37" }}>
            Book on WhatsApp
          </div>
          <div style={{ fontSize: "26px", color: "#645c58" }}>
            {branchCount > 1 ? `${branchCount} buildings` : "Live availability"}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Roboto",
          data: robotoBold,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
