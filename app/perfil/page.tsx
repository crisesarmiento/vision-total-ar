import Link from "next/link";
import { BarChart3, MonitorPlay } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getChannelById } from "@/lib/channels";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type ChannelAnalyticsRecord = {
  channelId: string;
  sessionsCount: number;
  secondsWatched: number;
};

export default async function ProfilePage() {
  const session = await requireSession();
  const analytics: ChannelAnalyticsRecord[] = await prisma.channelAnalytics.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [{ sessionsCount: "desc" }, { secondsWatched: "desc" }],
    take: 5,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Cuenta</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">Tu perfil</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/">
              <MonitorPlay className="h-4 w-4" />
              Volver al dashboard
            </Link>
          </Button>
          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ProfileForm
          initialName={session.user.name}
          initialImage={session.user.image}
          email={session.user.email}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Más vistas
            </CardTitle>
            <CardDescription>Tus señales con mayor tiempo de seguimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.length ? (
              analytics.map((item) => {
                const channel = getChannelById(item.channelId);

                return (
                  <div
                    key={item.channelId}
                    className="rounded-lg border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{channel?.shortName ?? item.channelId}</p>
                      {channel ? (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: channel.accent }}
                        />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {item.sessionsCount} sesiones · {item.secondsWatched}s acumulados
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-white/15 bg-black/10 px-4 py-5">
                <p className="font-medium">Todavía no hay señales destacadas.</p>
                <p className="mt-2 text-sm text-white/60">
                  Abrí señales desde el dashboard y este resumen va a ordenar las más vistas.
                </p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href="/">
                    <MonitorPlay className="h-4 w-4" />
                    Ver dashboard
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
