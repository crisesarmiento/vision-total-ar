"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Library, MonitorPlay } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthPanelProps = {
  mode: "signin" | "signup";
};

type PendingAction = "email" | "magic" | "google" | null;

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignUp = mode === "signup";

  const submit = () => {
    setPendingAction("email");

    startTransition(async () => {
      try {
        if (isSignUp) {
          const result = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/",
          });

          if (result.error) {
            throw new Error(result.error.message);
          }
        } else {
          const result = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/",
          });

          if (result.error) {
            throw new Error(result.error.message);
          }
        }

        router.push("/");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "No se pudo completar la autenticación.",
        );
      } finally {
        setPendingAction(null);
      }
    });
  };

  const sendMagicLink = () => {
    setPendingAction("magic");

    startTransition(async () => {
      try {
        const result = await authClient.signIn.magicLink({
          email,
          callbackURL: "/",
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        toast.success("Revisá tu correo para completar el ingreso.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo enviar el magic link.",
        );
      } finally {
        setPendingAction(null);
      }
    });
  };

  const signInWithGoogle = () => {
    setPendingAction("google");

    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: "/",
        });
      } catch {
        toast.error("No se pudo iniciar el ingreso con Google.");
        setPendingAction(null);
      }
    });
  };

  return (
    <Card className="mx-auto max-w-xl" style={{ width: "calc(100vw - 2rem)" }}>
      <CardHeader>
        <CardTitle>{isSignUp ? "Crear cuenta" : "Ingresar"}</CardTitle>
        <CardDescription>
          {isSignUp
            ? "Guardá grillas, favoritos y preferencias para retomar el monitoreo desde cualquier equipo."
            : "Recuperá tus combinaciones guardadas, favoritos y ajustes personales."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSignUp ? (
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isPending}
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isPending}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            onClick={submit}
            disabled={isPending}
            aria-busy={pendingAction === "email"}
            className="min-w-32"
          >
            {pendingAction === "email"
              ? isSignUp
                ? "Creando..."
                : "Ingresando..."
              : isSignUp
                ? "Crear cuenta"
                : "Ingresar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={sendMagicLink}
            disabled={isPending || !email}
            aria-busy={pendingAction === "magic"}
            className="min-w-40"
          >
            {pendingAction === "magic" ? "Enviando..." : "Enviar magic link"}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signInWithGoogle}
          disabled={isPending}
          aria-busy={pendingAction === "google"}
        >
          {pendingAction === "google" ? "Conectando..." : "Continuar con Google"}
        </Button>
        <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
          <div className="flex items-center gap-2 font-medium text-white/80">
            {isSignUp ? <Library className="h-4 w-4" /> : <MonitorPlay className="h-4 w-4" />}
            {isSignUp ? "Tu biblioteca queda lista" : "Volvés directo al dashboard"}
          </div>
          <p className="mt-1">
            {isSignUp
              ? "Después podés guardar combinaciones públicas o privadas sin cambiar la grilla actual."
              : "Si todavía no guardaste una grilla, podés entrar y crearla desde el dashboard."}
          </p>
        </div>
        <p className="text-sm text-white/60">
          {isSignUp ? "¿Ya tenés cuenta?" : "¿Todavía no tenés cuenta?"}{" "}
          <Link href={isSignUp ? "/ingresar" : "/registrarse"} className="text-primary hover:underline">
            {isSignUp ? "Ingresá" : "Registrate"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
