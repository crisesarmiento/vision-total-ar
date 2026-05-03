"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { compactNumber } from "@/lib/utils";
import { markCombinationAsUsed } from "@/actions/combinations";
import type { RankedChannel, RankedCombo } from "@/lib/home/live-now";

type Props = {
  liveChannels: RankedChannel[];
  liveNowCombos: RankedCombo[];
  user: { id: string } | null;
};

export function HomeLiveNowSection({ liveChannels, liveNowCombos, user }: Props) {
  const isEmpty = liveChannels.length === 0 && liveNowCombos.length === 0;

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Radio className="h-5 w-5 text-red-400" />
          En vivo ahora
        </CardTitle>
        <CardDescription>
          {isEmpty
            ? "Pronto en vivo — revisá más tarde."
            : "Lo que está en el aire en este momento."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEmpty ? (
          <p className="text-sm text-white/50">No hay canales en vivo en este momento.</p>
        ) : (
          <>
            {liveChannels.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Canales
                </p>
                <div className="flex flex-wrap gap-2">
                  {liveChannels.map((ch) => (
                    <span
                      key={ch.id}
                      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm"
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ch.accent }}
                      />
                      {ch.shortName}
                      {ch.viewerCount !== null && (
                        <span className="text-white/50">{compactNumber(ch.viewerCount)}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {liveNowCombos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                  Combos relevantes
                </p>
                <div className="space-y-3">
                  {liveNowCombos.map((combo) => (
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
                        <div className="flex flex-wrap gap-1">
                          {combo.liveChannelCount > 0 && (
                            <Badge variant="live">
                              {combo.liveChannelCount}/{combo.totalChannelCount} en vivo
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {combo.favoritesCount} favs
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
