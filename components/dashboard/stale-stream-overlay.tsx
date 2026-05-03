"use client";

import { AlertTriangle, ArrowLeftRight, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type StaleStreamOverlayProps = {
  channelName: string;
  onRetry: () => void;
  onReloadTile: () => void;
  onSwapChannel: () => void;
};

export function StaleStreamOverlay({
  channelName,
  onRetry,
  onReloadTile,
  onSwapChannel,
}: StaleStreamOverlayProps) {
  return (
    <div
      role="status"
      aria-label={`La señal ${channelName} parece inactiva`}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 rounded-[1.5rem] bg-black/80 backdrop-blur-sm"
    >
      <AlertTriangle className="h-8 w-8 text-amber-400" aria-hidden="true" />
      <div className="text-center">
        <p className="text-sm font-semibold text-white">Señal inactiva</p>
        <p className="mt-1 text-xs text-white/60">
          {channelName} no está transmitiendo.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/20"
          onClick={onRetry}
          aria-label={`Reintentar reproducción de ${channelName}`}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Reintentar
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/20"
          onClick={onReloadTile}
          aria-label={`Recargar tile de ${channelName}`}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Recargar tile
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="bg-white/10 text-white hover:bg-white/20"
          onClick={onSwapChannel}
          aria-label="Cambiar señal en este tile"
        >
          <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
          Cambiar señal
        </Button>
      </div>
    </div>
  );
}
