import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, MonitorPlay, Radio } from "lucide-react";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getChannelsForCategory,
  getPublicCategories,
  getPublicCategoryBySlug,
  getPublicCategoryRoute,
  getPublicChannelRoute,
} from "@/lib/public-channel-pages";
import { getCanonicalUrl } from "@/lib/seo";
import {
  buildBreadcrumbStructuredData,
  buildChannelItemListStructuredData,
} from "@/lib/structured-data";

type CategoryPageParams = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPublicCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageParams): Promise<Metadata> {
  const { slug } = await params;
  const category = getPublicCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoría no disponible",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalUrl = getCanonicalUrl(getPublicCategoryRoute(category));

  return {
    title: {
      absolute: `${category.title} | Vision AR`,
    },
    description: category.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: category.title,
      description: category.description,
      url: canonicalUrl,
      type: "website",
      locale: "es_AR",
      siteName: "Vision AR",
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageParams) {
  const { slug } = await params;
  const category = getPublicCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryChannels = getChannelsForCategory(category.slug);

  if (!categoryChannels.length) {
    notFound();
  }

  const structuredData = [
    buildBreadcrumbStructuredData([
      { name: "Inicio", url: "/" },
      { name: "Canales", url: "/canales" },
      { name: category.label, url: getPublicCategoryRoute(category) },
    ]),
    buildChannelItemListStructuredData(
      categoryChannels,
      `Canales de ${category.label} en Vision AR`,
    ),
  ];

  return (
    <>
      <JsonLdScript id="category-json-ld" data={structuredData} />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60">
        <Link href="/canales" className="inline-flex items-center gap-2 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Canales
        </Link>
        <span aria-hidden="true">/</span>
        <span>{category.label}</span>
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Categoría pública
          </p>
          <h1 className="mt-3 max-w-4xl text-balance text-4xl font-semibold leading-tight sm:text-5xl">
            {category.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
            {category.intro}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
            {category.context} Usá esta página para encontrar señales relacionadas y
            abrir el dashboard cuando necesites ver varias fuentes en paralelo.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/">
                <MonitorPlay className="h-4 w-4" />
                Abrir dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/canales">Ver todo el catálogo</Link>
            </Button>
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
            <Radio className="h-3.5 w-3.5" />
            Resumen
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <dt className="text-sm text-white/55">Señales</dt>
              <dd className="mt-1 text-3xl font-semibold">{categoryChannels.length}</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <dt className="text-sm text-white/55">Formato</dt>
              <dd className="mt-1 text-lg font-semibold">Multiview</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-white/60">
            Las páginas de categoría tienen contenido propio y enlaces internos. La
            reproducción queda en el dashboard para evitar páginas públicas delgadas.
          </p>
        </aside>
        </section>

        <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Señales
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Canales de {category.label}</h2>
          </div>
          <Badge variant="secondary">{categoryChannels.length} disponibles</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryChannels.map((channel) => (
            <Link
              key={channel.id}
              href={getPublicChannelRoute(channel)}
              className="rounded-lg border border-white/10 bg-white/5 p-5 transition hover:border-primary/40 hover:bg-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{channel.name}</h3>
                    {channel.isIndependent ? (
                      <Badge variant="outline">Independiente</Badge>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/65">
                    {channel.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/45" />
              </div>
            </Link>
          ))}
        </div>
        </section>
      </main>
    </>
  );
}
