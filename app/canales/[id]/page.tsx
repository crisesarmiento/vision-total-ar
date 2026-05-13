import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers3, MonitorPlay, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getChannelSeoDescription,
  getChannelsForCategory,
  getPublicCategories,
  getPublicCategoryRoute,
  getPublicChannelBySlug,
  getPublicChannelRoute,
  getRefreshTierLabel,
  PUBLIC_CHANNEL_CATEGORIES,
} from "@/lib/public-channel-pages";
import { getCanonicalUrl } from "@/lib/seo";

type ChannelPageParams = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getPublicCategories()
    .flatMap((category) => getChannelsForCategory(category.slug))
    .map((channel) => ({ id: channel.id }));
}

export async function generateMetadata({ params }: ChannelPageParams): Promise<Metadata> {
  const { id } = await params;
  const channel = getPublicChannelBySlug(id);

  if (!channel) {
    return {
      title: "Canal no disponible",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${channel.shortName} en vivo | Vision AR`;
  const description = getChannelSeoDescription(channel);
  const canonicalUrl = getCanonicalUrl(getPublicChannelRoute(channel));

  return {
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
}

export default async function ChannelPage({ params }: ChannelPageParams) {
  const { id } = await params;
  const channel = getPublicChannelBySlug(id);

  if (!channel) {
    notFound();
  }

  const category = PUBLIC_CHANNEL_CATEGORIES[channel.category];
  const relatedChannels = getChannelsForCategory(channel.category)
    .filter((item) => item.id !== channel.id)
    .slice(0, 4);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/60">
        <Link href="/canales" className="inline-flex items-center gap-2 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Canales
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={getPublicCategoryRoute(category)} className="hover:text-white">
          {category.label}
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">
            Señal pública
          </p>
          <h1 className="mt-3 break-words text-4xl font-semibold leading-tight sm:text-5xl">
            {channel.name} en vivo
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{category.label}</Badge>
            {channel.isIndependent ? <Badge variant="outline">Independiente</Badge> : null}
            <Badge variant="outline">{getRefreshTierLabel(channel)}</Badge>
          </div>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
            {getChannelSeoDescription(channel)}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
            {category.context} Vision AR muestra esta señal dentro de un entorno
            multiview para comparar agenda, ritmo de cobertura y contexto junto a
            otros canales argentinos.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/">
                <MonitorPlay className="h-4 w-4" />
                Abrir dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={getPublicCategoryRoute(category)}>
                <Layers3 className="h-4 w-4" />
                Ver {category.label.toLowerCase()}
              </Link>
            </Button>
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-black/20 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
            <Radio className="h-3.5 w-3.5" />
            Ficha de señal
          </div>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-white/45">Nombre corto</dt>
              <dd className="mt-1 font-medium">{channel.shortName}</dd>
            </div>
            <div>
              <dt className="text-white/45">Categoría</dt>
              <dd className="mt-1 font-medium">{category.title}</dd>
            </div>
            <div>
              <dt className="text-white/45">Uso recomendado</dt>
              <dd className="mt-1 text-white/70">{getRefreshTierLabel(channel)}</dd>
            </div>
          </dl>
          <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm leading-6 text-white/65">{channel.description}</p>
          </div>
        </aside>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Relacionados
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Más señales de {category.label}</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/canales">Ver todo el catálogo</Link>
          </Button>
        </div>

        {relatedChannels.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {relatedChannels.map((relatedChannel) => (
              <Link
                key={relatedChannel.id}
                href={getPublicChannelRoute(relatedChannel)}
                className="rounded-lg border border-white/10 bg-white/5 p-5 transition hover:border-primary/40 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{relatedChannel.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {relatedChannel.description}
                    </p>
                  </div>
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: relatedChannel.accent }}
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle>Sin señales relacionadas</CardTitle>
              <CardDescription>
                Esta categoría todavía no tiene otros canales en el catálogo público.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/canales">Volver al catálogo</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
