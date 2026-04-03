import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Vision AR",
    template: "%s | Vision AR",
  },
  description:
    "Multiview premium para ver todas las visiones de los medios argentinos en tiempo real.",
  applicationName: "Vision AR",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Vision AR",
    description:
      "Seguimiento simultáneo de noticias argentinas con grilla multiview, combinaciones guardadas y señales en vivo.",
    type: "website",
    locale: "es_AR",
    siteName: "Vision AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vision AR",
    description:
      "Todas las visiones de los medios argentinos, en una sola pantalla.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
