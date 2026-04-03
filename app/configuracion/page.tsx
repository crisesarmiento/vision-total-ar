import Link from "next/link";
import { SettingsForm } from "@/components/profile/settings-form";
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Preferencias</p>
          <h1 className="text-3xl font-semibold">Configuración personal</h1>
        </div>
        <Link className="rounded-full border border-white/10 px-4 py-2 text-sm" href="/">
          Volver al dashboard
        </Link>
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
