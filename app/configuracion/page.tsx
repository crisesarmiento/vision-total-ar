import Link from "next/link";
import { SettingsForm } from "@/components/profile/settings-form";
import { Button } from "@/components/ui/button";
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
          <Link href="/">Volver al dashboard</Link>
        </Button>
      </div>

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
