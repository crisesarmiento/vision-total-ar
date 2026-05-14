import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Layers3, MonitorPlay } from "lucide-react";
import { TrackAnalyticsEvents } from "@/components/analytics/track-analytics-events";
import { PublicFooter } from "@/components/public-footer";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EVERGREEN_GUIDES_INDEX_PATH,
  getEvergreenGuideRoute,
  getEvergreenGuides,
} from "@/lib/evergreen-guides";
import { getCanonicalUrl } from "@/lib/seo";
import {
  buildBreadcrumbStructuredData,
  buildEvergreenGuideItemListStructuredData,
} from "@/lib/structured-data";

const title = "Guías de monitoreo de noticias argentinas | Vision AR";
const description =
  "Guías originales de Vision AR para seguir último momento, comparar coberturas, usar combinaciones públicas y monitorear fuentes en vivo con criterio.";
const canonicalUrl = getCanonicalUrl(EVERGREEN_GUIDES_INDEX_PATH);

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    type: "website",
    locale: "es_AR",
    siteName: "Vision AR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function GuidesPage() {
  const guides = getEvergreenGuides();
  const structuredData = [
    buildBreadcrumbStructuredData([
      { name: "Inicio", url: "/" },
      { name: "Guías", url: EVERGREEN_GUIDES_INDEX_PATH },
    ]),
    buildEvergreenGuideItemListStructuredData(guides),
  ];

  return (
    <>
      <JsonLdScript id="guides-json-ld" data={structuredData} />
      <TrackAnalyticsEvents
        events={[
          {
            name: "search_landing_view",
            properties: {
              surface: "guides",
            },
          },
        ]}
      />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-6">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Guías públicas
            </p>
            <h1 className="mt-3 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              Guías para monitorear noticias argentinas en multiview
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
              Contenido original de Vision AR para entender cuándo conviene ver
              señales en paralelo, cómo comparar coberturas y cómo usar fuentes en
              vivo sin atribuir a la plataforma transmisiones que pertenecen a
              terceros.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="/">
                  <MonitorPlay className="h-4 w-4" />
                  Abrir dashboard
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/canales">
                  <Layers3 className="h-4 w-4" />
                  Ver canales
                </Link>
              </Button>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-black/20 p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
              <BookOpenText className="h-3.5 w-3.5" />
              Contenido evergreen
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <dt className="text-sm text-white/55">Guías</dt>
                <dd className="mt-1 text-3xl font-semibold">{guides.length}</dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <dt className="text-sm text-white/55">Idioma</dt>
                <dd className="mt-1 text-lg font-semibold">es-AR</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Estas páginas agregan contexto de uso del producto. No copian
              descripciones de canales ni presentan a Vision AR como propietaria de
              señales, marcas o transmisiones.
            </p>
          </aside>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                Explorar
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Guías disponibles</h2>
            </div>
            <Badge variant="secondary">Contenido indexable</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {guides.map((guide) => (
              <Card key={guide.slug} className="border-white/10 bg-white/5">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-primary">{guide.eyebrow}</p>
                      <CardTitle className="mt-2 text-xl leading-tight">
                        {guide.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/45" />
                  </div>
                  <CardDescription className="text-white/65">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-white/65">{guide.intro}</p>
                  <Button asChild variant="outline" size="sm" className="mt-5">
                    <Link href={getEvergreenGuideRoute(guide)}>
                      Leer guía
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
