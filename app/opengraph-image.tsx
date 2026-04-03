import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          backgroundColor: "#020617",
          color: "white",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              marginTop: -120,
              width: 900,
              height: 900,
              borderRadius: 9999,
              backgroundColor: "rgba(239,68,68,0.24)",
              filter: "blur(80px)",
            }}
          />
        </div>
        <div
          style={{
            position: "relative",
            fontSize: 34,
            opacity: 0.7,
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Vision AR
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: "78%",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 84, fontWeight: 700 }}>
            Todas las visiones de los medios, en tiempo real.
          </div>
          <div style={{ fontSize: 34, opacity: 0.78 }}>
            Multiview premium para seguir noticias argentinas en una sola pantalla.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 18,
            fontSize: 28,
            position: "relative",
          }}
        >
          <div>Grillas drag & drop</div>
          <div>Señales en vivo</div>
          <div>Combinaciones guardadas</div>
        </div>
      </div>
    ),
    size,
  );
}
