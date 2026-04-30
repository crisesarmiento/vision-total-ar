import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/combo/copy-link-button";
import { FavoriteCombinationButton } from "@/components/combo/favorite-combination-button";
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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Combinación pública</p>
          <h1 className="mt-2 break-words text-3xl font-semibold leading-tight">
            {combination.name}
          </h1>
          <p className="mt-2 text-sm text-white/60 sm:text-base">
            Curada por {combination.owner.name} · {combination.description ?? "Sin descripción"}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          <Badge variant="secondary">{players.length} señales</Badge>
          {session ? (
            <FavoriteCombinationButton
              combinationId={combination.id}
              initialFavorited={Boolean(favoriteRecord)}
              initialFavoritesCount={combination.favoritesCount}
            />
          ) : (
            <Badge variant="secondary">{compactNumber(combination.favoritesCount)} favs</Badge>
          )}
          <CopyLinkButton />
          <Button asChild variant="outline">
            <Link href={`/?combo=${combination.publicSlug}`}>Abrir en dashboard</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista solo lectura</CardTitle>
          <CardDescription>
            Ideal para compartir una curaduría puntual sin editar la grilla original.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                          Esta combinación referencia una señal que ya no está en el catálogo.
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
        </CardContent>
      </Card>
    </main>
  );
}
