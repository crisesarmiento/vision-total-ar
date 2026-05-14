import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Layers3, MonitorPlay, Radio } from "lucide-react";
import { AdSenseScript } from "@/components/adsense/adsense-script";
import { TrackAnalyticsEvents } from "@/components/analytics/track-analytics-events";
import { PublicFooter } from "@/components/public-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  getChannelsByPublicCategory,
  getPublicCategoryRoute,
  getPublicChannelRoute,
} from "@/lib/public-channel-pages";
import { getCanonicalUrl } from "@/lib/seo";
import {
  buildBreadcrumbStructuredData,
  buildCategoryItemListStructuredData,
  buildChannelItemListStructuredData,
} from "@/lib/structured-data";

const title = "Canales argentinos en vivo | Vision AR";
const description =
  "Directorio de canales argentinos en vivo para monitorear noticias, streaming, TV y deportes desde el dashboard multiview de Vision AR.";
const canonicalUrl = getCanonicalUrl("/canales");

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

export default function ChannelsPage() {
  const categoryGroups = getChannelsByPublicCategory();
  const channelCount = categoryGroups.reduce((total, group) => total + group.channels.length, 0);
  const publicCategories = categoryGroups.map((group) => group.category);
  const publicChannels = categoryGroups.flatMap((group) => group.channels);
  const structuredData = [
    buildBreadcrumbStructuredData([
      { name: "Inicio", url: "/" },
      { name: "Canales", url: "/canales" },
    ]),
    buildCategoryItemListStructuredData(publicCategories),
    buildChannelItemListStructuredData(publicChannels),
  ];

  return (
    <>
      <AdSenseScript />
      <JsonLdScript id="channels-json-ld" data={structuredData} />
      <TrackAnalyticsEvents
        events={[
          {
            name: "search_landing_view",
            properties: {
              surface: "channels",
            },
          },
        ]}
      />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-6">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Directorio público
          </p>
          <h1 className="mt-3 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            Canales argentinos en vivo para monitorear en multiview
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
            Vision AR organiza señales argentinas para comparar coberturas, tonos y
            prioridades editoriales desde una sola pantalla. Este directorio ayuda a
            encontrar canales por categoría y abrir el dashboard cuando necesitás ver
            varias señales al mismo tiempo.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/">
                <MonitorPlay className="h-4 w-4" />
                Abrir dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="#categorias">
                <Layers3 className="h-4 w-4" />
                Ver categorías
              </a>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
            <Radio className="h-3.5 w-3.5" />
            Catálogo
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <dt className="text-sm text-white/55">Señales</dt>
              <dd className="mt-1 text-3xl font-semibold">{channelCount}</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <dt className="text-sm text-white/55">Categorías</dt>
              <dd className="mt-1 text-3xl font-semibold">{categoryGroups.length}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Las páginas públicas explican la utilidad de cada señal y enlazan al
            dashboard. La reproducción en vivo queda dentro de la experiencia
            principal de Vision AR.
          </p>
        </div>
        </section>

        <section id="categorias" className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Explorar
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Categorías de señales</h2>
          </div>
          <Badge variant="secondary">Contenido indexable</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categoryGroups.map(({ category, channels }) => (
            <Link
              key={category.slug}
              href={getPublicCategoryRoute(category)}
              className="rounded-lg border border-white/10 bg-white/5 p-5 transition hover:border-primary/40 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-primary">{category.label}</p>
                  <h3 className="mt-2 text-lg font-semibold leading-tight">{category.title}</h3>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/45" />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/65">{category.intro}</p>
              <Badge variant="outline" className="mt-4">
                {channels.length} señales
              </Badge>
            </Link>
          ))}
        </div>
        </section>

        <section className="mt-10 grid gap-5">
        {categoryGroups.map(({ category, channels }) => (
          <Card key={category.slug} className="border-white/10 bg-white/5">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{category.label}</CardTitle>
                  <CardDescription className="mt-2 text-white/60">
                    {category.context}
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={getPublicCategoryRoute(category)}>
                    Ver categoría
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {channels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={getPublicChannelRoute(channel)}
                    className="rounded-lg border border-white/10 bg-black/20 p-4 transition hover:border-primary/30 hover:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{channel.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/60">
                          {channel.description}
                        </p>
                      </div>
                      <span
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: channel.accent }}
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
