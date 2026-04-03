import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#020617",
          color: "white",
          fontSize: 220,
          fontWeight: 700,
          borderRadius: 120,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: 9999,
            backgroundColor: "rgba(239,68,68,0.25)",
            filter: "blur(36px)",
          }}
        />
        <div style={{ position: "relative" }}>VA</div>
      </div>
    ),
    size,
  );
}
