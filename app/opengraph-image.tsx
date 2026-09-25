import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// readFile needs the Node runtime; the default for next/og is the edge runtime,
// where node:fs is unavailable. Reading the logo locally also keeps the build
// free of a network dependency on the production domain.
export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = "Mi Ruta · Tu próxima aventura está más cerca de lo que imaginas";

export const contentType = "image/png";

export default async function OpengraphImage() {
  // Satori types `src` as string | Blob, and readFile hands back a Node Buffer,
  // which is neither. A data URI is unambiguous and needs no cast.
  const logo = `data:image/jpeg;base64,${(
    await readFile(path.join(process.cwd(), "public", "logo.jpeg"))
  ).toString("base64")}`;

  return new ImageResponse(
    (
      // Outer 48 + card padding 52 leaves 430px of vertical room. Content below
      // measures 392px: badge 40, gap 28, headline 2 x 69, gap 18, subhead 36,
      // gap 32, logo 100. The previous 80px headline wrapped to three lines and
      // overflowed, which Satori paints on top of the subhead instead of
      // clipping, so the type scale is what keeps this card honest.
      <div
        style={{
          width: "1200px",
          height: "630px",
          backgroundColor: "#023422",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            height: "100%",
            backgroundColor: "#1E4B37",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "48px",
            padding: "52px",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#C85A32",
                color: "#FFFFFF",
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                lineHeight: 1,
                padding: "11px 20px",
                borderRadius: "999px",
              }}
            >
              TURISMO COMUNITARIO · ANTIOQUIA
            </div>

            <div
              style={{
                color: "#FFFFFF",
                fontSize: "56px",
                fontWeight: 800,
                lineHeight: 1.1,
                marginTop: "28px",
              }}
            >
              Tu próxima aventura está más cerca de lo que imaginas
            </div>

            <div
              style={{
                color: "rgba(255,255,255,0.82)",
                fontSize: "24px",
                fontWeight: 400,
                lineHeight: 1.4,
                marginTop: "18px",
              }}
            >
              Rutas reales · Clima en vivo · WhatsApp directo con prestadores
            </div>
          </div>

          {/* The logo carries the wordmark, so the old green square, the
              terracotta dash and a repeated "Mi Ruta" are gone. It sits in its
              own column because stacking everything left left the right third
              of the card empty. */}
          <img
            src={logo}
            width={260}
            height={260}
            alt="Mi Ruta"
            style={{ width: "260px", height: "260px", borderRadius: "40px" }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
