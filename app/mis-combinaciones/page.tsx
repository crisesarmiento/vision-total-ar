import Link from "next/link";
import { deleteCombination } from "@/actions/combinations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type SavedCombinationRecord = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
};

type RecentCombinationWithRelation = {
  id: string;
  lastViewedAt: Date;
  combination: {
    publicSlug: string;
    name: string;
  };
};

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Biblioteca</p>
          <h1 className="text-3xl font-semibold">Mis combinaciones</h1>
        </div>
        <Link className="rounded-full border border-white/10 px-4 py-2 text-sm" href="/">
          Volver al dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Guardadas</CardTitle>
            <CardDescription>
              Layouts privados y públicos listos para reabrir o compartir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedCombinations.length ? (
              savedCombinations.map((combo) => (
                <div
                  key={combo.id}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <p className="font-medium">{combo.name}</p>
                        <Badge variant="secondary">
                          {combo.visibility === "PUBLIC" ? "Pública" : "Privada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/60">
                        {combo.description ?? "Sin descripción"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="secondary">
                        <Link href={`/combo/${combo.publicSlug}`}>Ver</Link>
                      </Button>
                      <form
                        action={async () => {
                          "use server";
                          await deleteCombination(combo.id);
                        }}
                      >
                        <Button type="submit" variant="outline">
                          Eliminar
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">
                Aún no guardaste combinaciones. Volvé al dashboard y creá la primera.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recientes</CardTitle>
            <CardDescription>Las últimas combinaciones abiertas o compartidas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCombinations.length ? (
              recentCombinations.map((item) => (
                <Link
                  key={item.id}
                  href={`/combo/${item.combination.publicSlug}`}
                  className="block rounded-3xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <p className="font-medium">{item.combination.name}</p>
                  <p className="text-sm text-white/60">
                    {new Date(item.lastViewedAt).toLocaleString("es-AR")}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-white/60">Sin historial todavía.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
