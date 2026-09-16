import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const alt = "Conecta Rural · Descubre lo mejor del campo antes de llegar";

export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
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
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px",
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#C85A32",
              color: "#FFFFFF",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "2px",
              padding: "12px 24px",
              borderRadius: "999px",
            }}
          >
            TURISMO COMUNITARIO · ANTIOQUIA
          </div>
          <div
            style={{
              color: "#FFFFFF",
              fontSize: "80px",
              fontWeight: 800,
              lineHeight: 1.05,
              marginTop: "32px",
            }}
          >
            Descubre lo mejor del campo antes de llegar
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: "30px",
              fontWeight: 600,
              marginTop: "24px",
            }}
          >
            Rutas reales · Clima en vivo · WhatsApp directo con prestadores
            verificados
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "40px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#7FB069",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "8px",
                backgroundColor: "#C85A32",
                borderRadius: "999px",
                marginLeft: "12px",
              }}
            />
            <div
              style={{
                color: "#FFFFFF",
                fontSize: "32px",
                fontWeight: 800,
                marginLeft: "16px",
              }}
            >
              Conecta Rural
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
