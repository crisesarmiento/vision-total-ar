import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vision AR",
    short_name: "Vision AR",
    description:
      "Multiview premium para ver todas las visiones de los medios argentinos.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#ef4444",
    lang: "es-AR",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
