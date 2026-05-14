import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Eye, MonitorPlay, Share2 } from "lucide-react";
import { AdSenseScript } from "@/components/adsense/adsense-script";
import { TrackAnalyticsEvents } from "@/components/analytics/track-analytics-events";
import { CopyLinkButton } from "@/components/combo/copy-link-button";
import { FavoriteCombinationButton } from "@/components/combo/favorite-combination-button";
import { ForkCombinationButton } from "@/components/combo/fork-combination-button";
import { PublicFooter } from "@/components/public-footer";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChannelById } from "@/lib/channels";
import { getPresetById, type LayoutPresetId } from "@/lib/layout-presets";
import { prisma } from "@/lib/prisma";
import {
  analyzePublicCombinationSeo,
  getPublicCombinationChannelRoute,
  getPublicCombinationRoute,
} from "@/lib/public-combination-seo";
import { getCanonicalUrl } from "@/lib/seo";
import { getSession } from "@/lib/session";
import {
  buildBreadcrumbStructuredData,
  buildPublicCombinationChannelItemListStructuredData,
} from "@/lib/structured-data";
import { compactNumber } from "@/lib/utils";
import { bucketCount, bucketFavoriteCount } from "@/lib/analytics";

export const dynamic = "force-dynamic";

type ComboLayout = {
  preset?: LayoutPresetId;
  players?: Array<{
    slotId: string;
    channelId: string;
  }>;
};

function formatUpdatedAt(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

type PublicCombinationPageParams = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PublicCombinationPageParams): Promise<Metadata> {
  const { id } = await params;
  const combination = await prisma.savedCombination.findUnique({
    where: {
      publicSlug: id,
    },
    select: {
      name: true,
      description: true,
      publicSlug: true,
      visibility: true,
      layoutJson: true,
      updatedAt: true,
    },
  });

  if (!combination || combination.visibility !== "PUBLIC") {
    return {
      title: "Combinación no disponible",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const seoSummary = analyzePublicCombinationSeo(combination);
  const title = combination.name;
  const updatedAt = formatUpdatedAt(combination.updatedAt);
  const description =
    seoSummary.isIndexable
      ? `${seoSummary.description} Incluye ${seoSummary.uniqueChannels.length} señales argentinas en vivo y fue actualizada el ${updatedAt}.`
      : seoSummary.description ||
        "Combinación pública de Vision AR para abrir una grilla multiview de señales argentinas en vivo.";
  const canonicalUrl = getCanonicalUrl(getPublicCombinationRoute(combination.publicSlug));

  return {
    title: {
      absolute: `${title} | Vision AR`,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: seoSummary.isIndexable,
      follow: true,
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

export default async function PublicCombinationPage({
  params,
}: PublicCombinationPageParams) {
  const { id } = await params;
  const session = await getSession();
  const combination = await prisma.savedCombination.findUnique({
    where: {
      publicSlug: id,
    },
    include: {
      owner: true,
    },
  });

  if (!combination || combination.visibility !== "PUBLIC") {
    notFound();
  }

  const favoriteRecord = session
    ? await prisma.favoritedCombination.findUnique({
        where: {
          userId_combinationId: {
            userId: session.user.id,
            combinationId: combination.id,
          },
        },
      })
    : null;

  const seoSummary = analyzePublicCombinationSeo(combination);
  const layout = seoSummary.layout as ComboLayout | null;
  const preset = getPresetById(layout?.preset ?? "2x2");
  const players = layout?.players ?? [];
  const missingChannelsCount = seoSummary.missingChannelIds.length;
  const gridColumns =
    preset.columns === 1
      ? "grid-cols-1"
      : preset.columns === 2
        ? "md:grid-cols-2"
        : preset.columns === 3
          ? "md:grid-cols-2 xl:grid-cols-3"
          : "md:grid-cols-2 xl:grid-cols-4";
  const structuredData = [
    buildBreadcrumbStructuredData([
      { name: "Inicio", url: "/" },
      { name: combination.name, url: getPublicCombinationRoute(combination.publicSlug) },
    ]),
    ...(seoSummary.isIndexable && seoSummary.uniqueChannels.length
      ? [
          buildPublicCombinationChannelItemListStructuredData(
            seoSummary.uniqueChannels,
            combination.name,
          ),
        ]
      : []),
  ];

  return (
    <>
      {seoSummary.isIndexable ? <AdSenseScript /> : null}
      <JsonLdScript id="combo-json-ld" data={structuredData} />
      <TrackAnalyticsEvents
        events={[
          {
            name: "search_landing_view",
            properties: {
              surface: "public_combo",
            },
          },
          {
            name: "public_combo_open",
            properties: {
              indexable: seoSummary.isIndexable,
              channel_count_bucket: bucketCount(seoSummary.uniqueChannels.length),
              missing_channel_count_bucket: bucketCount(missingChannelsCount),
              favorite_count_bucket: bucketFavoriteCount(combination.favoritesCount),
            },
          },
        ]}
      />
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Combinación pública</p>
          <h1 className="mt-2 break-words text-3xl font-semibold leading-tight">
            {combination.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Badge variant="secondary">{players.length} señales</Badge>
            <Badge variant="outline">{seoSummary.uniqueChannels.length} únicas</Badge>
            <Badge variant="outline">{preset.name}</Badge>
            <Badge variant="outline">{compactNumber(combination.favoritesCount)} favs</Badge>
            <span>Actualizada {formatUpdatedAt(combination.updatedAt)}</span>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-white/65 sm:text-base">
            {combination.description ??
              "Curaduría compartida para abrir una grilla de señales sin editar el original."}
          </p>
          <p className="mt-2 text-sm text-white/50">Curada por {combination.owner.name}</p>
        </div>
        <aside className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45">
            <Share2 className="h-3.5 w-3.5" />
            Acciones
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2 lg:max-w-sm lg:justify-end">
            <Button asChild>
              <Link href={`/?combo=${combination.publicSlug}`}>
                <MonitorPlay className="h-4 w-4" />
                Abrir en dashboard
              </Link>
            </Button>
            <CopyLinkButton />
            {session ? (
              <FavoriteCombinationButton
                combinationId={combination.id}
                initialFavorited={Boolean(favoriteRecord)}
                initialFavoritesCount={combination.favoritesCount}
              />
            ) : (
              <Badge variant="secondary">{compactNumber(combination.favoritesCount)} favs</Badge>
            )}
            {session ? <ForkCombinationButton combinationId={combination.id} /> : null}
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
            <div>
              <dt className="text-white/45">Señales</dt>
              <dd className="mt-1 font-medium">{players.length}</dd>
            </div>
            <div>
              <dt className="text-white/45">Únicas</dt>
              <dd className="mt-1 font-medium">{seoSummary.uniqueChannels.length}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-white/45">Cobertura</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {seoSummary.categories.length ? (
                  seoSummary.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={category.route}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-white/70 transition hover:border-primary/40 hover:text-white"
                    >
                      {category.label}
                    </Link>
                  ))
                ) : (
                  <span className="text-white/55">Sin categorías públicas</span>
                )}
              </dd>
            </div>
          </dl>
        </aside>
        </div>

        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Vista solo lectura
          </CardTitle>
          <CardDescription>
            Ideal para compartir una curaduría puntual sin editar la grilla original.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {players.length ? (
            <>
              {missingChannelsCount ? (
                <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    {missingChannelsCount} señal{missingChannelsCount === 1 ? "" : "es"} sin catálogo
                  </div>
                  <p className="mt-1 text-amber-100/75">
                    La combinación se puede abrir igual; reemplazá esas pantallas desde el dashboard.
                  </p>
                </div>
              ) : null}
              <div className={`grid gap-4 ${gridColumns}`}>
                {players.map((player) => {
                  const channel = getChannelById(player.channelId);

                  if (!channel) {
                    return (
                      <div
                        key={player.slotId}
                        className="overflow-hidden rounded-lg border border-white/10 bg-black/30"
                      >
                        <div className="flex aspect-video min-h-[220px] items-center justify-center bg-muted/10 p-6 text-center">
                          <div>
                            <p className="font-medium">Señal no disponible</p>
                            <p className="mt-2 text-sm text-white/60">
                              Abrí la combinación en el dashboard y reemplazá esta pantalla.
                            </p>
                          </div>
                        </div>
                        <div className="border-t border-white/10 px-4 py-3">
                          <Badge variant="outline">ID: {player.channelId}</Badge>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={player.slotId}
                      className="overflow-hidden rounded-lg border border-white/10 bg-black/30"
                    >
                      <iframe
                        src={channel.liveUrl}
                        title={channel.name}
                        loading="lazy"
                        className="aspect-video h-full min-h-[240px] w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                      <div className="border-t border-white/10 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={getPublicCombinationChannelRoute(channel)}
                            className="font-medium hover:text-primary"
                          >
                            {channel.name}
                          </Link>
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: channel.accent }}
                          />
                          <Link
                            href={
                              seoSummary.categories.find(
                                (category) => category.slug === channel.category,
                              )?.route ?? "/canales"
                            }
                            className="text-xs text-white/50 hover:text-white"
                          >
                            Ver categoría
                          </Link>
                        </div>
                        <p className="mt-1 text-sm text-white/60">{channel.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-white/10 bg-black/20 px-5 py-6">
              <p className="font-medium">Esta combinación no tiene señales activas.</p>
              <p className="mt-2 text-sm text-white/60">
                Abrila en el dashboard para elegir señales y guardar una nueva curaduría.
              </p>
              <Button asChild className="mt-4">
                <Link href={`/?combo=${combination.publicSlug}`}>Abrir en dashboard</Link>
              </Button>
            </div>
          )}
        </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </>
  );
}
