"use client";

import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleFavoriteCombination } from "@/actions/combinations";
import { Button } from "@/components/ui/button";
import { cn, compactNumber } from "@/lib/utils";

type FavoriteCombinationButtonProps = {
  combinationId: string;
  initialFavorited: boolean;
  initialFavoritesCount: number;
};

export function FavoriteCombinationButton({
  combinationId,
  initialFavorited,
  initialFavoritesCount,
}: FavoriteCombinationButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoritesCount, setFavoritesCount] = useState(initialFavoritesCount);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await toggleFavoriteCombination(combinationId);
        setFavorited(result.favorited);
        setFavoritesCount(result.favoritesCount);
        toast.success(
          result.favorited
            ? "Combinación agregada a favoritos."
            : "Combinación quitada de favoritos.",
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo actualizar el favorito.",
        );
      }
    });
  };

  return (
    <Button
      variant="secondary"
      type="button"
      disabled={isPending}
      onClick={handleClick}
      aria-pressed={favorited}
      aria-busy={isPending}
      className="min-w-32"
    >
      <Heart
        className={cn("h-4 w-4", favorited && "fill-current text-rose-400")}
      />
      {isPending ? "Actualizando..." : favorited ? "Te gusta" : "Me gusta"} ·{" "}
      {compactNumber(favoritesCount)}
    </Button>
  );
}
