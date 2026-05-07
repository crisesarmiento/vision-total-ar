"use client";

import { toast } from "sonner";
import { UploadButton } from "@/components/uploadthing";
import { Button } from "@/components/ui/button";

type AvatarUploaderProps = {
  onUploaded: (url: string) => void;
  disabled?: boolean;
};

export function AvatarUploader({ onUploaded, disabled }: AvatarUploaderProps) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    return (
      <Button type="button" variant="secondary" disabled>
        Configurá UploadThing para habilitar avatares
      </Button>
    );
  }

  return (
    <UploadButton
      endpoint="avatarUploader"
      appearance={{
        button:
          "inline-flex h-10 items-center justify-center rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ut-ready:bg-secondary ut-uploading:cursor-not-allowed ut-uploading:opacity-60",
        container: "w-full",
      }}
      onClientUploadComplete={(response) => {
        const file = response?.[0];

        if (file?.ufsUrl) {
          onUploaded(file.ufsUrl);
          toast.success("Avatar cargado. Guardá el perfil para aplicarlo.");
        }
      }}
      onUploadError={() => {
        toast.error("No se pudo cargar el avatar.");
      }}
      disabled={disabled}
    />
  );
}
