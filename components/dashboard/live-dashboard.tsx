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
  Command,
  LayoutGrid,
  Menu,
  MonitorPlay,
  Pause,
  Pin,
  Play,
  Star,
  Volume2,
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
import { NewsTicker } from "@/components/dashboard/news-ticker";
import { PlayerTile } from "@/components/dashboard/player-tile";
import { SaveCombinationDialog } from "@/components/dashboard/save-combination-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DashboardLayout } from "@/lib/dashboard-layout";
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

type LiveDashboardProps = {
  user: DashboardUser | null;
  featuredCombinations: FeaturedCombination[];
  favoriteChannelIds: string[];
  initialLiveSnapshots: Record<string, LiveChannelSnapshot>;
  initialTickerItems: TickerItem[];
  initialPreset: LayoutPresetId;
  initialLayout: DashboardLayout | null;
};

export function LiveDashboard({
  user,
  featuredCombinations,
  favoriteChannelIds,
  initialLiveSnapshots,
  initialTickerItems,
  initialPreset,
  initialLayout,
}: LiveDashboardProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [syncPlaybackSignal, setSyncPlaybackSignal] = useState<"play" | "pause" | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(favoriteChannelIds);
  const [isPending, startTransition] = useTransition();
  const hasAppliedInitialLayout = useRef(false);
  const lastSavedLayout = useRef<string | null>(null);
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
    queryFn: async () => {
      const response = await fetch("/api/live");
      return (await response.json()) as Record<string, LiveChannelSnapshot>;
    },
    refetchInterval: 60_000,
  });

  const { data: tickerItems } = useQuery({
    queryKey: ["ticker-items"],
    initialData: initialTickerItems,
    queryFn: async () => {
      const response = await fetch("/api/ticker");
      return (await response.json()) as TickerItem[];
    },
    refetchInterval: 300_000,
  });

  const visiblePlayers = useMemo(
    () => players.slice(0, preset.maxPlayers),
    [players, preset.maxPlayers],
  );

  const layoutPayload = useMemo(
    () => ({
      preset: layoutPreset,
      players: visiblePlayers,
    }),
    [layoutPreset, visiblePlayers],
  );

  const filteredChannels = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    return channels
      .filter((channel) =>
        `${channel.name} ${channel.description}`.toLowerCase().includes(normalizedSearch),
      )
      .sort((left, right) => {
        const leftFavorite = favoriteIds.includes(left.id);
        const rightFavorite = favoriteIds.includes(right.id);

        if (leftFavorite === rightFavorite) {
          return 0;
        }

        return leftFavorite ? -1 : 1;
      });
  }, [favoriteIds, search]);

  useEffect(() => {
    if (hasAppliedInitialLayout.current) {
      return;
    }

    if (initialLayout) {
      hydrateLayout(initialLayout);
      lastSavedLayout.current = JSON.stringify(initialLayout);
    } else {
      if (initialPreset !== layoutPreset) {
        setPreset(initialPreset);
      }
    }

    hasAppliedInitialLayout.current = true;
  }, [hydrateLayout, initialLayout, initialPreset, layoutPreset, setPreset]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
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
  }, [focusPlayer, layoutPreset, setPreset, visiblePlayers]);

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

    if (serializedLayout === lastSavedLayout.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      lastSavedLayout.current = serializedLayout;
      void persistLayoutPreference(layoutPayload.preset, layoutPayload);
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

    if (!slotId) {
      return;
    }

    setChannel(slotId, channelId);
    setSidebarOpen(false);

    if (user) {
      void trackChannelView(channelId, 5);
    }
  };

  const toggleFavorite = (channelId: string) => {
    if (!user) {
      toast.error("Ingresá para guardar favoritos.");
      return;
    }

    startTransition(async () => {
      const nextValue = await toggleFavoriteChannel(channelId);
      setFavoriteIds((current) =>
        nextValue
          ? [...current, channelId]
          : current.filter((value) => value !== channelId),
      );
    });
  };

  const setGlobalPlayback = (state: "play" | "pause") => {
    setSyncPlaybackSignal(state);
    window.setTimeout(() => setSyncPlaybackSignal(null), 500);
  };

  const gridColumns =
    preset.columns === 1 ? "grid-cols-1" : preset.columns === 2 ? "md:grid-cols-2" : preset.columns === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-[1800px] gap-6 px-4 py-4 md:px-6">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[320px] border-r border-white/10 bg-slate-950/95 p-4 backdrop-blur-xl transition-transform md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:translate-x-0 md:rounded-[2rem]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                  Vision AR
                </p>
                <h1 className="text-2xl font-semibold">Todas las visiones</h1>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
                <Menu className="h-4 w-4" />
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
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar canal o streamer"
                />
                <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                  {filteredChannels.map((channel) => {
                    const isFavorite = favoriteIds.includes(channel.id);

                    return (
                      <div
                        key={channel.id}
                        className="flex items-start justify-between rounded-3xl border border-white/10 bg-black/20 px-4 py-3 transition hover:border-primary/40 hover:bg-white/5"
                      >
                        <button
                          type="button"
                          onClick={() => assignChannel(channel.id)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{channel.shortName}</span>
                            {channel.isIndependent ? (
                              <Badge variant="secondary">Independiente</Badge>
                            ) : null}
                          </div>
                          <p className="text-sm text-white/70">{channel.description}</p>
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                          onClick={() => toggleFavorite(channel.id)}
                          disabled={isPending}
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
                  })}
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
          <header className="glass-panel sticky top-4 z-30 flex flex-col gap-4 rounded-[2rem] px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Dashboard multiview
                  </p>
                  <h2 className="text-2xl font-semibold">
                    Seguimiento en tiempo real de medios argentinos
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {user ? (
                  <>
                    <Button asChild variant="secondary">
                      <Link href="/mis-combinaciones">Mis combinaciones</Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href="/perfil">Perfil</Link>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link href="/configuracion">Configuración</Link>
                    </Button>
                  </>
                ) : null}
                <Button variant="secondary" onClick={toggleGlobalMute}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  {globalMuted ? "Activar audio" : "Silenciar todo"}
                </Button>
                <Button variant="secondary" onClick={() => setGlobalPlayback("play")}>
                  <Play className="mr-2 h-4 w-4" />
                  Play global
                </Button>
                <Button variant="secondary" onClick={() => setGlobalPlayback("pause")}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausa global
                </Button>
                {user ? (
                  <SaveCombinationDialog layoutPayload={layoutPayload} />
                ) : (
                  <Button asChild>
                    <Link href="/ingresar">Ingresar para guardar</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {GRID_PRESETS.map((option) => (
                <Button
                  key={option.id}
                  variant={layoutPreset === option.id ? "default" : "secondary"}
                  onClick={() => setPreset(option.id)}
                >
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  {option.name}
                </Button>
              ))}
            </div>

            <NewsTicker items={tickerItems} />
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
                          onToggleMute={toggleMute}
                          onSetVolume={setVolume}
                          onFocus={focusPlayer}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div className="space-y-4">
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
