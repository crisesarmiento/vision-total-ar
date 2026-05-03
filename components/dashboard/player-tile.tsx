"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
  Expand,
  GripVertical,
  Maximize2,
  Minimize2,
  Pause,
  PictureInPicture2,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { NewsChannel } from "@/lib/channels";
import type { LiveChannelSnapshot } from "@/lib/youtube";
import { StaleStreamOverlay } from "@/components/dashboard/stale-stream-overlay";
import { evaluateStreamHealth, STALE_GRACE_MS } from "@/lib/stream-health";
import { compactNumber, cn } from "@/lib/utils";
import type { PlayerTile as PlayerTileState } from "@/store/dashboard-store";

type PlayerTileProps = {
  player: PlayerTileState;
  channel: NewsChannel;
  snapshot?: LiveChannelSnapshot;
  active: boolean;
  syncPlaybackSignal: "play" | "pause" | null;
  reducedMotionEnabled?: boolean;
  onToggleMute: (slotId: string) => void;
  onSetVolume: (slotId: string, volume: number) => void;
  onFocus: (slotId: string) => void;
  onSwapChannel: (slotId: string) => void;
};

function sendIframeCommand(
  iframe: HTMLIFrameElement | null,
  command: "mute" | "unMute" | "playVideo" | "pauseVideo" | "setVolume",
  args?: number[],
) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({
      event: "command",
      func: command,
      args,
    }),
    "*",
  );
}

export function PlayerTile({
  player,
  channel,
  snapshot,
  active,
  syncPlaybackSignal,
  reducedMotionEnabled = false,
  onToggleMute,
  onSetVolume,
  onFocus,
  onSwapChannel,
}: PlayerTileProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [firstSeenNotLiveAt, setFirstSeenNotLiveAt] = useState<number | null>(null);
  const [, forceTick] = useReducer((x: number) => x + 1, 0);
  const playbackLabel = isPaused
    ? `Reproducir ${channel.name}`
    : `Pausar ${channel.name}`;
  const muteLabel = player.muted
    ? `Activar audio de ${channel.name}`
    : `Silenciar ${channel.name}`;
  const fullscreenLabel = isFullscreen
    ? `Salir de pantalla completa de ${channel.name}`
    : `Ver ${channel.name} en pantalla completa`;
  const externalLabel = `Abrir ${channel.name} en YouTube`;
  const volumeLabel = `Volumen de ${channel.name}`;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: player.slotId,
  });

  useEffect(() => {
    if (player.muted) {
      sendIframeCommand(iframeRef.current, "mute");
      return;
    }

    sendIframeCommand(iframeRef.current, "unMute");
    sendIframeCommand(iframeRef.current, "setVolume", [player.volume]);
  }, [player.muted, player.volume]);

  useEffect(() => {
    if (!syncPlaybackSignal) {
      return;
    }

    if (syncPlaybackSignal === "play") {
      sendIframeCommand(iframeRef.current, "playVideo");
      setIsPaused(false);
      return;
    }

    sendIframeCommand(iframeRef.current, "pauseVideo");
    setIsPaused(true);
  }, [syncPlaybackSignal]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (snapshot?.isLive === false) {
      setFirstSeenNotLiveAt((prev) => (prev === null ? Date.now() : prev));
    } else {
      setFirstSeenNotLiveAt(null);
    }
  }, [snapshot?.isLive]);

  useEffect(() => {
    if (firstSeenNotLiveAt === null) return;
    const remaining = STALE_GRACE_MS - (Date.now() - firstSeenNotLiveAt);
    if (remaining <= 0) return;
    const timer = window.setTimeout(forceTick, remaining);
    return () => window.clearTimeout(timer);
  }, [firstSeenNotLiveAt]);

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: reducedMotionEnabled ? "none" : transition,
    }),
    [reducedMotionEnabled, transform, transition],
  );

  const healthStatus = evaluateStreamHealth(snapshot, firstSeenNotLiveAt);

  const handleRetry = () => {
    sendIframeCommand(iframeRef.current, "playVideo");
    setFirstSeenNotLiveAt(null);
  };

  const handleReloadTile = () => {
    setReloadKey((k) => k + 1);
    setFirstSeenNotLiveAt(null);
  };

  const handleSwapChannel = () => {
    onSwapChannel(player.slotId);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) {
      return;
    }

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  };

  const togglePlayback = () => {
    if (isPaused) {
      sendIframeCommand(iframeRef.current, "playVideo");
      setIsPaused(false);
      return;
    }

    sendIframeCommand(iframeRef.current, "pauseVideo");
    setIsPaused(true);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border-white/10 bg-slate-950/90",
        active && "ring-2 ring-primary",
        isDragging && "opacity-60",
      )}
    >
      <div
        ref={containerRef}
        className="relative flex h-full flex-col"
        onClick={() => onFocus(player.slotId)}
      >
        <div className="absolute left-0 top-0 z-20 flex w-full flex-wrap items-start justify-between gap-2 px-3 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/40 text-white/70 transition hover:bg-black/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              {...attributes}
              {...listeners}
              aria-label={`Reordenar ${channel.name}`}
              title={`Reordenar ${channel.name}`}
              type="button"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <Badge variant={snapshot?.isLive ? "live" : "secondary"}>
              {snapshot?.isLive ? "En vivo" : "Stand-by"}
            </Badge>
            {snapshot?.viewerCount ? (
              <Badge variant="secondary">
                {compactNumber(snapshot.viewerCount)} mirando
              </Badge>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/40 text-white hover:bg-black/60"
              onClick={togglePlayback}
              type="button"
              aria-label={playbackLabel}
              title={playbackLabel}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/40 text-white hover:bg-black/60"
              onClick={() => onToggleMute(player.slotId)}
              type="button"
              aria-label={muteLabel}
              title={muteLabel}
            >
              {player.muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/40 text-white hover:bg-black/60"
              onClick={toggleFullscreen}
              type="button"
              aria-label={fullscreenLabel}
              title={fullscreenLabel}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="bg-black/40 text-white hover:bg-black/60"
              asChild
            >
              <a
                href={`https://www.youtube.com/channel/${channel.channelId}/live`}
                target="_blank"
                rel="noreferrer"
                aria-label={externalLabel}
                title={externalLabel}
              >
                <PictureInPicture2 className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <iframe
          key={reloadKey}
          ref={iframeRef}
          className="aspect-video h-full min-h-[240px] w-full rounded-[1.5rem] border-0 bg-black"
          src={channel.liveUrl}
          title={channel.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />

        {healthStatus === "stale" ? (
          <StaleStreamOverlay
            channelName={channel.name}
            onRetry={handleRetry}
            onReloadTile={handleReloadTile}
            onSwapChannel={handleSwapChannel}
          />
        ) : null}

        <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/30 to-transparent px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">{channel.name}</p>
              <p className="line-clamp-2 text-xs text-white/70">
                {snapshot?.title ?? channel.description}
              </p>
            </div>
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: channel.accent }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Expand className="h-4 w-4 shrink-0 text-white/50" aria-hidden="true" />
            <label className="sr-only" htmlFor={`${player.slotId}-volume`}>
              {volumeLabel}
            </label>
            <input
              id={`${player.slotId}-volume`}
              type="range"
              min={0}
              max={100}
              value={player.volume}
              aria-label={volumeLabel}
              title={volumeLabel}
              onChange={(event) =>
                onSetVolume(player.slotId, Number(event.currentTarget.value))
              }
              className="h-1 w-full accent-red-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
