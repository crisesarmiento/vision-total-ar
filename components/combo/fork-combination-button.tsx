"use client";

import { BookmarkPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { forkPublicCombination } from "@/actions/combinations";
import { Button } from "@/components/ui/button";

type ForkCombinationButtonProps = {
  combinationId: string;
};

export function ForkCombinationButton({ combinationId }: ForkCombinationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const fork = await forkPublicCombination(combinationId);
        toast.success("Guardamos la combinación en tu librería.");
        router.push(`/?combo=${fork.publicSlug}`);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No pudimos guardar la combinación.",
        );
      }
    });
  };

  return (
    <Button type="button" disabled={isPending} onClick={handleClick}>
      <BookmarkPlus className="h-4 w-4" />
      {isPending ? "Guardando…" : "Guardar en mis combinaciones"}
    </Button>
  );
}
