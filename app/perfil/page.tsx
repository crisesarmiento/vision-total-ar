import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  const analytics = await prisma.channelAnalytics.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: [{ sessionsCount: "desc" }, { secondsWatched: "desc" }],
    take: 5,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Cuenta</p>
          <h1 className="text-3xl font-semibold">Tu perfil</h1>
        </div>
        <div className="flex gap-2">
          <Link className="rounded-full border border-white/10 px-4 py-2 text-sm" href="/">
            Volver al dashboard
          </Link>
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
                  className="rounded-3xl border border-white/10 bg-black/20 px-4 py-3"
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
