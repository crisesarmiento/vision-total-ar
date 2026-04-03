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
          "ut-ready:bg-red-500 ut-uploading:cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white",
        container: "w-full",
      }}
      onClientUploadComplete={(response) => {
        const file = response?.[0];

        if (file?.ufsUrl) {
          onUploaded(file.ufsUrl);
          toast.success("Avatar cargado");
        }
      }}
      onUploadError={(error) => {
        toast.error(error.message);
      }}
      disabled={disabled}
    />
  );
}
