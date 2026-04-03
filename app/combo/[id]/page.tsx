import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChannelById } from "@/lib/channels";
import { getPresetById, type LayoutPresetId } from "@/lib/layout-presets";
import { prisma } from "@/lib/prisma";

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

  const layout = combination.layoutJson as ComboLayout;
  const preset = getPresetById(layout.preset ?? "2x2");
  const players = layout.players ?? [];
  const gridColumns =
    preset.columns === 1 ? "grid-cols-1" : preset.columns === 2 ? "md:grid-cols-2" : preset.columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Combinación pública</p>
          <h1 className="text-3xl font-semibold">{combination.name}</h1>
          <p className="text-white/60">
            Curada por {combination.owner.name} · {combination.description ?? "Sin descripción"}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{players.length} señales</Badge>
          <Link className="rounded-full border border-white/10 px-4 py-2 text-sm" href="/">
            Ir al dashboard
          </Link>
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
                return null;
              }

              return (
                <div
                  key={player.slotId}
                  className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30"
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
                    <p className="font-medium">{channel.name}</p>
                    <p className="text-sm text-white/60">{channel.description}</p>
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
