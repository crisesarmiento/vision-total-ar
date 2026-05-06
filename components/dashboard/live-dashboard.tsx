"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  Command,
  Library,
  LayoutGrid,
  Menu,
  MonitorPlay,
  MonitorSmartphone,
  Pause,
  Pin,
  Play,
  Radio,
  Settings2,
  Share2,
  Star,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  markCombinationAsUsed,
  toggleFavoriteChannel,
  trackChannelView,
} from "@/actions/combinations";
import { saveLayoutPreference as persistLayoutPreference } from "@/actions/user";
import { HomeLiveNowSection } from "@/components/dashboard/home-live-now-section";
import { LayoutImportExport } from "@/components/dashboard/layout-import-export";
import { NewsTicker } from "@/components/dashboard/news-ticker";
import { PlayerTile } from "@/components/dashboard/player-tile";
import { SaveCombinationDialog } from "@/components/dashboard/save-combination-dialog";
import { ShareDashboardButton } from "@/components/dashboard/share-dashboard-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  filterSidebarChannels,
  SIDEBAR_CHANNEL_FILTERS,
  type SidebarChannelFilter,
} from "@/lib/channel-filters";
import { useLiveAlerts } from "@/lib/use-live-alerts";
import { useWakeLock } from "@/lib/use-wake-lock";
import type { DashboardLayout } from "@/lib/dashboard-layout";
import type { RankedChannel, RankedCombo } from "@/lib/home/live-now";
import type { CanonicalDashboardShare } from "@/lib/dashboard-share";
import { channels, getChannelById } from "@/lib/channels";
import { GRID_PRESETS, getPresetById, type LayoutPresetId } from "@/lib/layout-presets";
import type { TickerItem } from "@/lib/rss";
import { compactNumber, cn } from "@/lib/utils";
import type { LiveChannelSnapshot } from "@/lib/youtube";
import { useDashboardStore } from "@/store/dashboard-store";

type DashboardUser = {
  id: string;
  name: string;
  image?: string | null;
};

type FeaturedCombination = {
  id: string;
  publicSlug: string;
  name: string;
  description: string | null;
  favoritesCount: number;
};

const CHANNEL_CATEGORY_LABELS = {
  noticias: "Noticias",
  streaming: "Streaming",
  tv: "TV",
  deportes: "Deportes",
} as const;

type LayoutSaveStatus = "idle" | "saving" | "saved" | "error";

type LiveDashboardProps = {
  user: DashboardUser | null;
  featuredCombinations: FeaturedCombination[];
  favoriteChannelIds: string[];
  initialLiveSnapshots: Record<string, LiveChannelSnapshot>;
  initialTickerItems: TickerItem[];
  initialPreset: LayoutPresetId;
  initialLayout: DashboardLayout | null;
  comboLayout?: DashboardLayout | null;
  canonicalShare?: CanonicalDashboardShare | null;
  reducedMotionEnabled?: boolean;
  tickerEnabled?: boolean;
  liveAlertsEnabled?: boolean;
  liveNowChannels: RankedChannel[];
  liveNowCombos: RankedCombo[];
};

class PollingRateLimitError extends Error {
  constructor() {
    super("Polling request was rate limited");
    this.name = "PollingRateLimitError";
  }
}

async function fetchPollingJson<T>(url: string) {
  const response = await fetch(url);

  if (response.status === 429) {
    throw new PollingRateLimitError();
  }

  if (!response.ok) {
    throw new Error(`Polling request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function retryPollingQuery(failureCount: number, error: Error) {
  return !(error instanceof PollingRateLimitError) && failureCount < 3;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);

    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  return prefersReducedMotion;
}

export function LiveDashboard({
  user,
  featuredCombinations,
  favoriteChannelIds,
  initialLiveSnapshots,
  initialTickerItems,
  initialPreset,
  initialLayout,
  comboLayout,
  canonicalShare,
  reducedMotionEnabled = false,
  tickerEnabled = true,
  liveAlertsEnabled = false,
  liveNowChannels,
  liveNowCombos,
}: LiveDashboardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = reducedMotionEnabled || prefersReducedMotion;
  const sensors = useSensors(useSensor(PointerSensor));
  const [syncPlaybackSignal, setSyncPlaybackSignal] = useState<"play" | "pause" | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState<SidebarChannelFilter>("all");
  const [favoriteIds, setFavoriteIds] = useState(favoriteChannelIds);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{
    slotId: string;
    channelName: string;
  } | null>(null);
  const [layoutSaveStatus, setLayoutSaveStatus] = useState<LayoutSaveStatus>("idle");
  const [pendingFavoriteId, setPendingFavoriteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasAppliedInitialLayout = useRef(false);
  const sidebarOpenButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarSearchRef = useRef<HTMLInputElement | null>(null);
  const shouldRestoreSidebarFocus = useRef(false);
  const lastSavedLayout = useRef<string | null>(null);
  const queuedLayout = useRef<DashboardLayout | null>(null);
  const queuedLayoutKey = useRef<string | null>(null);
  const isSavingLayout = useRef(false);
  const layoutSaveErrorNotified = useRef(false);
  const {
    focusedPlayerId,
    focusPlayer,
    globalMuted,
    hydrateLayout,
    layoutPreset,
    players,
    reorderPlayers,
    setChannel,
    setPreset,
    setVolume,
    toggleGlobalMute,
    toggleMute,
  } = useDashboardStore();

  const preset = getPresetById(layoutPreset);

  const { data: liveSnapshots } = useQuery({
    queryKey: ["live-snapshots"],
    initialData: initialLiveSnapshots,
    queryFn: () => fetchPollingJson<Record<string, LiveChannelSnapshot>>("/api/live"),
    refetchInterval: 60_000,
    retry: retryPollingQuery,
  });

  const { data: tickerItems } = useQuery({
    queryKey: ["ticker-items"],
    initialData: initialTickerItems,
    queryFn: () => fetchPollingJson<TickerItem[]>("/api/ticker"),
    enabled: tickerEnabled,
    refetchInterval: 300_000,
    retry: retryPollingQuery,
  });

  useLiveAlerts({
    liveSnapshots,
    favoriteChannelIds: favoriteIds,
    enabled: liveAlertsEnabled && Boolean(user),
  });

  const { isActive: wakeLockActive, isSupported: wakeLockSupported, toggle: toggleWakeLock } = useWakeLock();

  const visiblePlayers = useMemo(
    () => players.slice(0, preset.maxPlayers),
    [players, preset.maxPlayers],
  );
  const focusedPlayer = useMemo(
    () => visiblePlayers.find((player) => player.slotId === focusedPlayerId) ?? visiblePlayers[0],
    [focusedPlayerId, visiblePlayers],
  );
  const focusedPlayerIndex = focusedPlayer
    ? visiblePlayers.findIndex((player) => player.slotId === focusedPlayer.slotId)
    : -1;
  const focusedPlayerChannel = focusedPlayer
    ? getChannelById(focusedPlayer.channelId)
    : null;
  const selectedChannelSlots = useMemo(
    () =>
      new Map(
        visiblePlayers.map((player, index) => [
          player.channelId,
          {
            slotId: player.slotId,
            position: index + 1,
          },
        ]),
      ),
    [visiblePlayers],
  );

  const layoutPayload = useMemo(
    () => ({
      preset: layoutPreset,
      players: visiblePlayers,
    }),
    [layoutPreset, visiblePlayers],
  );

  const filteredChannels = useMemo(
    () =>
      filterSidebarChannels({
        channels,
        favoriteIds,
        filter: sidebarFilter,
        liveSnapshots,
        search,
      }),
    [favoriteIds, liveSnapshots, search, sidebarFilter],
  );

  const channelListEmptyMessage = useMemo(() => {
    const hasSearch = Boolean(search.trim());

    if (sidebarFilter === "favorites") {
      if (hasSearch) {
        return "No hay favoritos que coincidan con esa búsqueda.";
      }

      return user
        ? "Todavía no marcaste señales como favoritas."
        : "Ingresá para guardar favoritos y verlos acá.";
    }

    if (sidebarFilter === "live") {
      return hasSearch
        ? "No hay señales en vivo que coincidan con esa búsqueda."
        : "No detectamos señales en vivo con este filtro.";
    }

    if (hasSearch) {
      return "No hay señales que coincidan con esa búsqueda.";
    }

    return "No hay señales disponibles para este filtro.";
  }, [search, sidebarFilter, user]);

  useEffect(() => {
    if (!assignmentFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAssignmentFeedback(null);
    }, 3_500);

    return () => window.clearTimeout(timeoutId);
  }, [assignmentFeedback]);

  useEffect(() => {
    if (layoutSaveStatus !== "saved") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setLayoutSaveStatus("idle");
    }, 2_500);

    return () => window.clearTimeout(timeoutId);
  }, [layoutSaveStatus]);

  useEffect(() => {
    if (hasAppliedInitialLayout.current) {
      return;
    }

    if (comboLayout) {
      hydrateLayout(comboLayout);
    } else if (initialLayout) {
      hydrateLayout(initialLayout);
      lastSavedLayout.current = JSON.stringify(initialLayout);
    } else {
      if (initialPreset !== layoutPreset) {
        setPreset(initialPreset);
      }
    }

    hasAppliedInitialLayout.current = true;
  }, [comboLayout, hydrateLayout, initialLayout, initialPreset, layoutPreset, setPreset]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && sidebarOpen) {
        shouldRestoreSidebarFocus.current = true;
        setSidebarOpen(false);
        return;
      }

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key >= "1" && event.key <= "9") {
        const index = Number(event.key) - 1;
        const player = visiblePlayers[index];

        if (player) {
          focusPlayer(player.slotId);
        }
      }

      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        const currentIndex = GRID_PRESETS.findIndex((item) => item.id === layoutPreset);
        const delta = event.key === "ArrowRight" ? 1 : -1;
        const nextPreset = GRID_PRESETS[(currentIndex + GRID_PRESETS.length + delta) % GRID_PRESETS.length];
        setPreset(nextPreset.id);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusPlayer, layoutPreset, setPreset, sidebarOpen, visiblePlayers]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const interval = window.setInterval(() => {
      visiblePlayers.forEach((player) => {
        void trackChannelView(player.channelId, 20);
      });
    }, 20_000);

    return () => window.clearInterval(interval);
  }, [user, visiblePlayers]);

  useEffect(() => {
    if (!user || !hasAppliedInitialLayout.current) {
      return;
    }

    const serializedLayout = JSON.stringify(layoutPayload);

    if (!lastSavedLayout.current) {
      lastSavedLayout.current = serializedLayout;
      return;
    }

    if (serializedLayout === lastSavedLayout.current || serializedLayout === queuedLayoutKey.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      queuedLayout.current = layoutPayload;
      queuedLayoutKey.current = serializedLayout;

      const processSaveQueue = async () => {
        if (isSavingLayout.current) {
          return;
        }

        isSavingLayout.current = true;

        try {
          while (queuedLayout.current && queuedLayoutKey.current !== lastSavedLayout.current) {
            const nextLayout = queuedLayout.current;
            const nextLayoutKey = queuedLayoutKey.current;

            try {
              setLayoutSaveStatus("saving");
              await persistLayoutPreference(nextLayout.preset, nextLayout);
              lastSavedLayout.current = nextLayoutKey;
              layoutSaveErrorNotified.current = false;
              setLayoutSaveStatus("saved");

              if (queuedLayoutKey.current === nextLayoutKey) {
                queuedLayout.current = null;
                queuedLayoutKey.current = null;
              }
            } catch {
              setLayoutSaveStatus("error");

              if (!layoutSaveErrorNotified.current) {
                toast.error(
                  "No se pudieron guardar los cambios de grilla. Reintentamos en segundo plano.",
                );
                layoutSaveErrorNotified.current = true;
              }

              await new Promise((resolve) => window.setTimeout(resolve, 5_000));
            }
          }
        } finally {
          isSavingLayout.current = false;

          if (queuedLayout.current && queuedLayoutKey.current !== lastSavedLayout.current) {
            void processSaveQueue();
          }
        }
      };

      void processSaveQueue();
    }, 1_500);

    return () => window.clearTimeout(timeoutId);
  }, [layoutPayload, user]);

  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over) {
      return;
    }

    reorderPlayers(String(event.active.id), String(event.over.id));
  };

  const assignChannel = (channelId: string) => {
    const slotId = focusedPlayerId ?? visiblePlayers[0]?.slotId;
    const channel = getChannelById(channelId);

    if (!slotId) {
      return;
    }

    setChannel(slotId, channelId);
    setAssignmentFeedback({
      slotId,
      channelName: channel?.shortName ?? channelId,
    });
    shouldRestoreSidebarFocus.current = true;
    setSidebarOpen(false);

    if (user) {
      void trackChannelView(channelId, 5);
    }
  };

  const openSidebar = () => {
    shouldRestoreSidebarFocus.current = true;
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    shouldRestoreSidebarFocus.current = true;
    setSidebarOpen(false);
  };

  const swapChannel = (slotId: string) => {
    focusPlayer(slotId);
    setSidebarOpen(true);
  };

  const toggleFavorite = (channelId: string) => {
    if (!user) {
      toast.error("Ingresá para guardar favoritos.");
      return;
    }

    setPendingFavoriteId(channelId);

    startTransition(async () => {
      try {
        const nextValue = await toggleFavoriteChannel(channelId);
        setFavoriteIds((current) =>
          nextValue
            ? [...current, channelId]
            : current.filter((value) => value !== channelId),
        );
        toast.success(
          nextValue ? "Señal agregada a favoritos." : "Señal quitada de favoritos.",
        );
      } catch {
        toast.error("No se pudo actualizar el favorito.");
      } finally {
        setPendingFavoriteId(null);
      }
    });
  };

  const setGlobalPlayback = (state: "play" | "pause") => {
    setSyncPlaybackSignal(state);
    window.setTimeout(() => setSyncPlaybackSignal(null), 500);
  };

  const gridColumns =
    preset.columns === 1 ? "grid-cols-1" : preset.columns === 2 ? "md:grid-cols-2" : preset.columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4";
  const assignmentFeedbackSlotIndex = assignmentFeedback
    ? visiblePlayers.findIndex((player) => player.slotId === assignmentFeedback.slotId)
    : -1;
  const assignmentFeedbackTarget =
    assignmentFeedbackSlotIndex >= 0
      ? `pantalla ${assignmentFeedbackSlotIndex + 1}`
      : "la pantalla enfocada";

  useEffect(() => {
    if (sidebarOpen) {
      window.setTimeout(() => sidebarSearchRef.current?.focus(), 0);
      return;
    }

    if (shouldRestoreSidebarFocus.current) {
      sidebarOpenButtonRef.current?.focus();
      shouldRestoreSidebarFocus.current = false;
    }
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1800px] gap-6 px-4 py-4 md:px-6">
        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Cerrar selector de señales"
            className="fixed inset-0 z-[35] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeSidebar}
          />
        ) : null}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[320px] overflow-y-auto border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur-xl md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:translate-x-0 md:rounded-[2rem]",
            !shouldReduceMotion && "motion-safe:transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
          aria-label="Selector de señales"
        >
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                  Vision AR
                </p>
                <h1 className="text-2xl font-semibold">Todas las visiones</h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={closeSidebar}
                aria-label="Cerrar selector de señales"
                title="Cerrar selector de señales"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Card className="border-white/5 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Buscador de señales</CardTitle>
                <CardDescription>
                  Elegí la pantalla enfocada y reemplazá su contenido al instante.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl border border-primary/20 bg-primary/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/80">
                    Pantalla enfocada
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="live">
                      {focusedPlayerIndex >= 0 ? `Pantalla ${focusedPlayerIndex + 1}` : "Pantalla"}
                    </Badge>
                    <span className="min-w-0 text-sm font-medium text-white">
                      {focusedPlayerChannel?.shortName ?? "Sin señal"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/60">
                    La próxima señal elegida reemplaza esta pantalla.
                  </p>
                </div>
                <Input
                  ref={sidebarSearchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar canal o streamer"
                  aria-label="Buscar canal o streamer"
                />
                <div
                  className="flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filtros rápidos de señales"
                >
                  {SIDEBAR_CHANNEL_FILTERS.map((filter) => (
                    <Button
                      key={filter.value}
                      type="button"
                      size="sm"
                      variant={sidebarFilter === filter.value ? "default" : "secondary"}
                      className="h-8 px-3 text-xs"
                      onClick={() => setSidebarFilter(filter.value)}
                      aria-pressed={sidebarFilter === filter.value}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
                <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                  {filteredChannels.length ? (
                    filteredChannels.map((channel) => {
                      const isFavorite = favoriteIds.includes(channel.id);
                      const isLive = liveSnapshots[channel.id]?.isLive;
                      const assignedSlot = selectedChannelSlots.get(channel.id);
                      const isFocusedChannel = focusedPlayer?.channelId === channel.id;

                      return (
                        <div
                          key={channel.id}
                          className={cn(
                            "flex items-start justify-between gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-primary/40 hover:bg-white/5",
                            isFocusedChannel && "border-primary/50 bg-primary/10",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => assignChannel(channel.id)}
                            className="min-w-0 flex-1 rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Asignar ${channel.name} a ${
                              focusedPlayerIndex >= 0
                                ? `pantalla ${focusedPlayerIndex + 1}`
                                : "la pantalla enfocada"
                            }`}
                          >
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="min-w-0 font-medium">{channel.shortName}</span>
                              <span
                                aria-hidden="true"
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: channel.accent }}
                              />
                              <Badge variant={isLive ? "live" : "secondary"}>
                                {isLive ? "En vivo" : "Stand-by"}
                              </Badge>
                              <Badge variant="outline">
                                {CHANNEL_CATEGORY_LABELS[channel.category]}
                              </Badge>
                              {channel.isIndependent ? (
                                <Badge variant="secondary">Independiente</Badge>
                              ) : null}
                              {assignedSlot ? (
                                <Badge variant={isFocusedChannel ? "live" : "outline"}>
                                  En pantalla {assignedSlot.position}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="line-clamp-2 text-sm text-white/70">
                              {channel.description}
                            </p>
                          </button>
                          <button
                            type="button"
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => toggleFavorite(channel.id)}
                            disabled={isPending}
                            aria-busy={pendingFavoriteId === channel.id}
                            aria-label={
                              isFavorite
                                ? `Quitar ${channel.name} de favoritos`
                                : `Agregar ${channel.name} a favoritos`
                            }
                            aria-pressed={isFavorite}
                            title={
                              isFavorite
                                ? `Quitar ${channel.name} de favoritos`
                                : `Agregar ${channel.name} a favoritos`
                            }
                          >
                            <Star
                              className={cn(
                                "h-4 w-4",
                                isFavorite && "fill-current text-amber-300",
                              )}
                            />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-white/65">
                      <p>{channelListEmptyMessage}</p>
                      <p className="mt-2 text-xs text-white/45">
                        Probá limpiar la búsqueda o cambiar el filtro rápido.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-white/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Atajos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-white/70">
                <p className="flex items-center gap-2">
                  <Command className="h-4 w-4" />
                  `1-9` enfoca una pantalla.
                </p>
                <p className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4" />
                  Flechas cambian la grilla.
                </p>
                <p className="flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Arrastrá tarjetas para reordenar.
                </p>
              </CardContent>
            </Card>

            <div className="mt-auto text-xs text-white/45">
              {user ? `Sesión iniciada como ${user.name}` : "Explorá sin sesionarte o ingresá para guardar combinaciones."}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="glass-panel sticky top-4 z-30 flex flex-col gap-2 rounded-[2rem] px-3 py-3 md:gap-3 md:px-6 md:py-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  ref={sidebarOpenButtonRef}
                  variant="secondary"
                  size="icon"
                  className="mt-1 shrink-0 md:hidden"
                  onClick={openSidebar}
                  aria-label="Abrir selector de señales"
                  title="Abrir selector de señales"
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Dashboard multiview
                  </p>
                  <h2 className="text-balance text-xl font-semibold leading-tight sm:text-2xl">
                    Seguimiento en tiempo real de medios argentinos
                  </h2>
                  {assignmentFeedback ? (
                    <p
                      className="mt-2 flex items-center gap-2 text-sm text-primary"
                      role="status"
                      aria-live="polite"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {assignmentFeedback.channelName} asignado a {assignmentFeedbackTarget}
                    </p>
                  ) : null}
                  {user && layoutSaveStatus !== "idle" ? (
                    <p
                      className={cn(
                        "mt-2 flex items-center gap-2 text-sm",
                        layoutSaveStatus === "error" ? "text-amber-200" : "text-white/55",
                      )}
                      role="status"
                      aria-live="polite"
                    >
                      {layoutSaveStatus === "error" ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {layoutSaveStatus === "saving"
                        ? "Guardando cambios de grilla..."
                        : layoutSaveStatus === "saved"
                          ? "Grilla guardada"
                          : "Reintentando guardado de grilla"}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                {user ? (
                  <div
                    className="flex w-full flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-black/20 p-2 sm:w-auto"
                    role="navigation"
                    aria-label="Navegación de cuenta"
                  >
                    <Button asChild variant="ghost" size="sm" className="flex-1 whitespace-normal sm:flex-none">
                      <Link href="/mis-combinaciones">
                        <Library className="h-4 w-4" />
                        Mis combinaciones
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="flex-1 whitespace-normal sm:flex-none">
                      <Link href="/perfil">
                        <UserRound className="h-4 w-4" />
                        Perfil
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm" className="flex-1 whitespace-normal sm:flex-none">
                      <Link href="/configuracion">
                        <Settings2 className="h-4 w-4" />
                        Configuración
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="min-w-0 rounded-3xl border border-white/10 bg-black/20 p-2 md:p-3">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45 md:mb-2">
                  <Radio className="h-3.5 w-3.5" />
                  Monitoreo
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 min-w-[8.5rem] justify-start px-3 text-left leading-tight sm:min-w-0"
                    onClick={toggleGlobalMute}
                  >
                    <Volume2 className="h-4 w-4 shrink-0" />
                    {globalMuted ? "Activar audio" : "Silenciar todo"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 min-w-[8rem] justify-start px-3 text-left leading-tight sm:min-w-0"
                    onClick={() => setGlobalPlayback("play")}
                  >
                    <Play className="h-4 w-4 shrink-0" />
                    Play global
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-9 min-w-[8rem] justify-start px-3 text-left leading-tight sm:min-w-0"
                    onClick={() => setGlobalPlayback("pause")}
                  >
                    <Pause className="h-4 w-4 shrink-0" />
                    Pausa global
                  </Button>
                  <Button
                    variant={wakeLockActive ? "default" : "secondary"}
                    size="sm"
                    className="h-9 min-w-[11rem] justify-start px-3 text-left leading-tight sm:min-w-0"
                    onClick={() => void toggleWakeLock()}
                    disabled={!wakeLockSupported}
                    title={
                      wakeLockSupported
                        ? wakeLockActive
                          ? "Desactivar modo monitoreo (la pantalla puede apagarse)"
                          : "Mantener pantalla encendida durante el monitoreo"
                        : "Tu navegador no admite mantener la pantalla activa"
                    }
                  >
                    <MonitorSmartphone className="h-4 w-4 shrink-0" />
                    {wakeLockActive ? "Pantalla activa" : "Mantener pantalla"}
                  </Button>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl border border-white/10 bg-black/20 p-2 md:p-3">
                <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45 md:mb-2">
                  <Share2 className="h-3.5 w-3.5" />
                  Layout y compartir
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                  {user ? (
                    <SaveCombinationDialog layoutPayload={layoutPayload} />
                  ) : (
                    <Button asChild className="min-w-[11rem] flex-none">
                      <Link href="/ingresar">Ingresar para guardar</Link>
                    </Button>
                  )}
                  <ShareDashboardButton
                    layoutPayload={layoutPayload}
                    canonicalShare={canonicalShare}
                  />
                  <LayoutImportExport
                    layoutPayload={layoutPayload}
                    onImport={hydrateLayout}
                  />
                </div>
              </div>
            </div>

            <div className="min-w-0 rounded-3xl border border-white/10 bg-black/20 p-2 md:p-3">
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/45 md:mb-2">
                <LayoutGrid className="h-3.5 w-3.5" />
                Grilla
              </div>
              <div
                className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
                role="group"
                aria-label="Presets de grilla"
              >
                {GRID_PRESETS.map((option) => (
                  <Button
                    key={option.id}
                    size="sm"
                    variant={layoutPreset === option.id ? "default" : "secondary"}
                    className="h-9 min-w-[5.5rem] px-3 leading-tight"
                    onClick={() => setPreset(option.id)}
                    aria-pressed={layoutPreset === option.id}
                  >
                    {option.name}
                  </Button>
                ))}
              </div>
            </div>

            {tickerEnabled ? (
              <NewsTicker
                items={tickerItems}
                reducedMotionEnabled={shouldReduceMotion}
              />
            ) : null}
          </header>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={visiblePlayers.map((player) => player.slotId)} strategy={rectSortingStrategy}>
                  <div className={cn("grid gap-4", gridColumns)}>
                    {visiblePlayers.map((player) => {
                      const channel = getChannelById(player.channelId);

                      if (!channel) {
                        return null;
                      }

                      return (
                        <PlayerTile
                          key={player.slotId}
                          player={player}
                          channel={channel}
                          snapshot={liveSnapshots[player.channelId]}
                          active={focusedPlayerId === player.slotId}
                          syncPlaybackSignal={syncPlaybackSignal}
                          reducedMotionEnabled={shouldReduceMotion}
                          onToggleMute={toggleMute}
                          onSetVolume={setVolume}
                          onFocus={focusPlayer}
                          onSwapChannel={swapChannel}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="space-y-4">
              <HomeLiveNowSection
                liveChannels={liveNowChannels}
                liveNowCombos={liveNowCombos}
                user={user}
              />
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MonitorPlay className="h-5 w-5 text-primary" />
                    Combinaciones destacadas
                  </CardTitle>
                  <CardDescription>
                    Las más compartidas por la comunidad.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {featuredCombinations.length ? (
                    featuredCombinations.map((combo) => (
                      <Link
                        key={combo.id}
                        href={`/combo/${combo.publicSlug}`}
                        onClick={() => {
                          if (user) {
                            void markCombinationAsUsed(combo.id);
                          }
                        }}
                        className="block rounded-3xl border border-white/10 bg-black/20 p-4 transition hover:border-primary/30 hover:bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{combo.name}</p>
                            <p className="text-sm text-white/65">
                              {combo.description ?? "Sin descripción"}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {compactNumber(combo.favoritesCount)} favs
                          </Badge>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">
                      Todavía no hay combinaciones públicas destacadas.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">Modo editorial libre</CardTitle>
                  <CardDescription>
                    Vision AR no prioriza una mirada: te da todas las pantallas al mismo tiempo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-white/70">
                  <p>Arrastrá señales para comparar coberturas, tonos y tiempos de reacción.</p>
                  <p>Guardá layouts privados o publicalos para compartir una curaduría útil.</p>
                  <p>La barra superior mantiene el ritmo con un ticker opcional y la grilla nunca deja de ser la protagonista.</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
