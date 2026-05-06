"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/actions/user";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfileFormProps = {
  initialName: string;
  initialImage?: string | null;
  email: string;
};

export function ProfileForm({
  initialName,
  initialImage,
  email,
}: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [image, setImage] = useState(initialImage ?? "");
  const [isPending, startTransition] = useTransition();
  const trimmedName = name.trim();
  const canSave = trimmedName.length >= 2 && !isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Actualizá tu identidad visual, nombre público y avatar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <p className="text-sm text-white/70">{email}</p>
            <AvatarUploader onUploaded={setImage} disabled={isPending} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-name">Nombre visible</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isPending}
          />
          {trimmedName.length < 2 ? (
            <p className="text-xs text-white/50">Usá al menos 2 caracteres.</p>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={() => {
            if (!canSave) {
              toast.error("El nombre visible necesita al menos 2 caracteres.");
              return;
            }

            startTransition(async () => {
              try {
                await updateProfile({
                  name: trimmedName,
                  image,
                });
                toast.success("Perfil actualizado.");
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "No se pudo guardar el perfil.",
                );
              }
            });
          }}
          disabled={!canSave}
          aria-busy={isPending}
          className="min-w-36"
        >
          {isPending ? "Guardando..." : "Guardar perfil"}
        </Button>
      </CardContent>
    </Card>
  );
}
