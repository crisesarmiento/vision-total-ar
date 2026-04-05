"use client";

import { useEffect, useRef, useState } from "react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("No se pudo copiar el enlace.");
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={handleClick}>
      <Link2 className="h-4 w-4" />
      {copied ? "¡Copiado!" : "Copiar enlace"}
    </Button>
  );
}
