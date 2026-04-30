import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <Link href="/">Volver al dashboard</Link>
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
            <CardTitle>Más vistas</CardTitle>
            <CardDescription>Tus señales con mayor tiempo de seguimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.length ? (
              analytics.map((item) => (
                <div
                  key={item.channelId}
                  className="rounded-lg border border-white/10 bg-black/20 px-4 py-3"
                >
                  <p className="font-medium">{item.channelId}</p>
                  <p className="text-sm text-white/60">
                    {item.sessionsCount} sesiones · {item.secondsWatched}s acumulados
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">
                Todavía no registramos señales vistas en esta cuenta.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
