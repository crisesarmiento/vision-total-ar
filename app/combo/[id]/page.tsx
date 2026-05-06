import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Eye, MonitorPlay, Share2 } from "lucide-react";
import { CopyLinkButton } from "@/components/combo/copy-link-button";
import { FavoriteCombinationButton } from "@/components/combo/favorite-combination-button";
import { ForkCombinationButton } from "@/components/combo/fork-combination-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChannelById } from "@/lib/channels";
import { getPresetById, type LayoutPresetId } from "@/lib/layout-presets";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { compactNumber } from "@/lib/utils";

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

export default async function PublicCombinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const layout = combination.layoutJson as ComboLayout;
  const preset = getPresetById(layout.preset ?? "2x2");
  const players = layout.players ?? [];
  const missingChannelsCount = players.filter(
    (player) => !getChannelById(player.channelId),
  ).length;
  const gridColumns =
    preset.columns === 1
      ? "grid-cols-1"
      : preset.columns === 2
        ? "md:grid-cols-2"
        : preset.columns === 3
          ? "md:grid-cols-2 xl:grid-cols-3"
          : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Combinación pública</p>
          <h1 className="mt-2 break-words text-3xl font-semibold leading-tight">
            {combination.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Badge variant="secondary">{players.length} señales</Badge>
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
        <div className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
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
        </div>
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
                          <p className="font-medium">{channel.name}</p>
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: channel.accent }}
                          />
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
  );
}
