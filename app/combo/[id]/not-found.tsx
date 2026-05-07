import Link from "next/link";
import { AlertTriangle, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CombinationNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <Card className="w-full border-white/10 bg-black/20">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">
                Combinación no disponible
              </p>
              <h1 className="mt-2 text-2xl font-semibold leading-tight">
                No encontramos esta combinación.
              </h1>
              <p className="mt-3 text-sm text-white/60">
                El enlace puede estar vencido, ser privado o haber sido eliminado. Podés volver al
                dashboard y crear una nueva grilla.
              </p>
              <Button asChild className="mt-5">
                <Link href="/">
                  <MonitorPlay className="h-4 w-4" />
                  Volver al dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
