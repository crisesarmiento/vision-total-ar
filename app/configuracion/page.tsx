import Link from "next/link";
import { MonitorPlay, SlidersHorizontal } from "lucide-react";
import { SettingsForm } from "@/components/profile/settings-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireSession();
  const preferences = await prisma.userPreference.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Preferencias</p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight">Configuración personal</h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            <MonitorPlay className="h-4 w-4" />
            Volver al dashboard
          </Link>
        </Button>
      </div>

      {!preferences ? (
        <Card className="mb-6 border-white/10 bg-black/20">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Estás usando la configuración inicial.</p>
              <p className="mt-1 text-sm text-white/60">
                Ajustá tema, ticker, atajos o grilla predeterminada y guardá para que se apliquen a tu cuenta.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <SettingsForm
        initialTheme={preferences?.theme ?? "SYSTEM"}
        notificationsEnabled={preferences?.notificationsEnabled ?? true}
        tickerEnabled={preferences?.tickerEnabled ?? true}
        keyboardShortcutsEnabled={preferences?.keyboardShortcutsEnabled ?? true}
        reducedMotion={preferences?.reducedMotion ?? false}
        defaultGridPreset={preferences?.defaultGridPreset ?? "GRID_2X2"}
      />
    </main>
  );
}
