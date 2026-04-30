"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isSignUp = mode === "signup";

  const submit = () => {
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
        toast.error(error instanceof Error ? error.message : "No se pudo completar la autenticación");
      }
    });
  };

  const sendMagicLink = () => {
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
        toast.error(error instanceof Error ? error.message : "No se pudo enviar el magic link");
      }
    });
  };

  const signInWithGoogle = () => {
    startTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    });
  };

  return (
    <Card className="mx-auto max-w-xl" style={{ width: "calc(100vw - 2rem)" }}>
      <CardHeader>
        <CardTitle>{isSignUp ? "Crear cuenta" : "Ingresar"}</CardTitle>
        <CardDescription>
          {isSignUp
            ? "Guardá tus combinaciones, favoritos y preferencias."
            : "Volvé a tu dashboard multiview y seguí todas las señales."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSignUp ? (
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" onClick={submit} disabled={isPending}>
            {isPending ? "Procesando..." : isSignUp ? "Crear cuenta" : "Ingresar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={sendMagicLink}
            disabled={isPending || !email}
          >
            Enviar magic link
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signInWithGoogle}
          disabled={isPending}
        >
          Continuar con Google
        </Button>
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
