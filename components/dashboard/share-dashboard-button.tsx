"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  getDashboardShareUrl,
  type CanonicalDashboardShare,
} from "@/lib/dashboard-share";
import type { DashboardLayout } from "@/lib/dashboard-layout";

type ShareDashboardButtonProps = {
  layoutPayload: DashboardLayout;
  canonicalShare?: CanonicalDashboardShare | null;
};

export function ShareDashboardButton({
  layoutPayload,
  canonicalShare,
}: ShareDashboardButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleShare = async () => {
    setIsPending(true);

    try {
      const url = getDashboardShareUrl(
        window.location.origin,
        layoutPayload,
        canonicalShare,
      );
      const shareData = {
        title: "Vision AR",
        text: "Mirá esta grilla en Vision AR.",
        url,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          toast.success("Enlace compartido");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo compartir la grilla.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleShare}
      disabled={isPending}
      aria-label="Compartir grilla actual"
    >
      <Share2 className="h-4 w-4" />
      {isPending ? "Compartiendo..." : "Compartir"}
    </Button>
  );
}
