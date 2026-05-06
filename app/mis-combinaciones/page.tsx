import Link from "next/link";
import { Clock3, Eye, Library, MonitorPlay, Star } from "lucide-react";
import { DeleteCombinationButton } from "@/components/combo/delete-combination-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { compactNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SavedCombinationRecord = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  layoutJson: unknown;
  visibility: "PUBLIC" | "PRIVATE";
  favoritesCount: number;
  updatedAt: Date;
};

type RecentCombinationWithRelation = {
  id: string;
  lastViewedAt: Date;
  combination: {
    publicSlug: string;
    name: string;
    layoutJson: unknown;
    visibility: "PUBLIC" | "PRIVATE";
  };
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getComboPlayerCount(layoutJson: unknown) {
  if (layoutJson && typeof layoutJson === "object" && "players" in layoutJson) {
    const players = (layoutJson as { players?: unknown }).players;

    if (Array.isArray(players)) {
      return players.length;
    }
  }

  return 0;
}

export default async function MyCombinationsPage() {
  const session = await requireSession();
  const [savedCombinations, recentCombinations]: [
    SavedCombinationRecord[],
    RecentCombinationWithRelation[],
  ] = await Promise.all([
    prisma.savedCombination.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.recentCombination.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        lastViewedAt: "desc",
      },
      include: {
        combination: true,
      },
      take: 5,
    }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Biblioteca</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">Mis combinaciones</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <MonitorPlay className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Library className="h-5 w-5 text-primary" />
              Guardadas
            </CardTitle>
            <CardDescription>
              Layouts privados y públicos listos para reabrir o compartir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedCombinations.length ? (
              savedCombinations.map((combo) => {
                const playerCount = getComboPlayerCount(combo.layoutJson);

                return (
                  <div
                    key={combo.id}
                    className="rounded-lg border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <p className="break-words font-medium">{combo.name}</p>
                          <Badge variant="secondary">
                            {combo.visibility === "PUBLIC" ? "Pública" : "Privada"}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/60">
                          {combo.description ??
                            "Sin descripción; agregá contexto si la vas a compartir."}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/55">
                          <Badge variant="outline">{playerCount} señales</Badge>
                          <span className="inline-flex items-center gap-1">
                            <Star className="h-3.5 w-3.5" />
                            {compactNumber(combo.favoritesCount)} favs
                          </span>
                          <span>Actualizada {formatDate(combo.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="secondary">
                          <Link href={`/combo/${combo.publicSlug}`}>
                            <Eye className="h-4 w-4" />
                            Ver
                          </Link>
                        </Button>
                        <DeleteCombinationButton
                          combinationId={combo.id}
                          combinationName={combo.name}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-white/10 bg-black/20 px-5 py-6">
                <p className="font-medium">Todavía no guardaste combinaciones.</p>
                <p className="mt-2 text-sm text-white/60">
                  Armá una grilla en el dashboard y guardala para volver rápido a ese monitoreo.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/">
                    <MonitorPlay className="h-4 w-4" />
                    Crear combinación
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary" />
              Recientes
            </CardTitle>
            <CardDescription>Las últimas combinaciones abiertas o compartidas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCombinations.length ? (
              recentCombinations.map((item) => {
                const playerCount = getComboPlayerCount(item.combination.layoutJson);

                return (
                  <Link
                    key={item.id}
                    href={`/combo/${item.combination.publicSlug}`}
                    className="block rounded-lg border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 break-words font-medium">{item.combination.name}</p>
                      <Badge variant="outline">
                        {item.combination.visibility === "PUBLIC" ? "Pública" : "Privada"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {playerCount} señales · Abierta {formatDate(item.lastViewedAt)}
                    </p>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-white/15 bg-black/10 px-4 py-5">
                <p className="font-medium">Sin historial todavía.</p>
                <p className="mt-2 text-sm text-white/60">
                  Las combinaciones que abras desde enlaces compartidos van a aparecer acá.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
