"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updatePreferences } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SettingsFormProps = {
  initialTheme: "SYSTEM" | "DARK" | "LIGHT";
  notificationsEnabled: boolean;
  tickerEnabled: boolean;
  keyboardShortcutsEnabled: boolean;
  reducedMotion: boolean;
  defaultGridPreset:
    | "GRID_1"
    | "GRID_2X1"
    | "GRID_2X2"
    | "GRID_3X3"
    | "GRID_4X4"
    | "CUSTOM";
};

export function SettingsForm(props: SettingsFormProps) {
  const [values, setValues] = useState(props);
  const [isPending, startTransition] = useTransition();
  const selectClassName = cn(
    "flex h-10 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias</CardTitle>
        <CardDescription>
          Ajustá el comportamiento del dashboard, el ticker y tu experiencia visual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="theme">Tema</Label>
          <select
            id="theme"
            className={selectClassName}
            value={values.initialTheme}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                initialTheme: event.target.value as SettingsFormProps["initialTheme"],
              }))
            }
          >
            <option value="SYSTEM">Sistema</option>
            <option value="DARK">Oscuro</option>
            <option value="LIGHT">Claro</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grid-preset">Grilla por defecto</Label>
          <select
            id="grid-preset"
            className={selectClassName}
            value={values.defaultGridPreset}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                defaultGridPreset:
                  event.target.value as SettingsFormProps["defaultGridPreset"],
              }))
            }
          >
            <option value="GRID_1">1 x 1</option>
            <option value="GRID_2X1">2 x 1</option>
            <option value="GRID_2X2">2 x 2</option>
            <option value="GRID_3X3">3 x 3</option>
            <option value="GRID_4X4">4 x 4</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>

        {[
          {
            key: "notificationsEnabled",
            label: "Notificaciones activadas",
            description: "Avisos del navegador cuando una señal relevante cambie de estado.",
          },
          {
            key: "tickerEnabled",
            label: "Ticker de noticias activo",
            description: "Muestra titulares debajo de la grilla cuando hay datos disponibles.",
          },
          {
            key: "keyboardShortcutsEnabled",
            label: "Atajos de teclado",
            description: "Mantiene activos los controles rápidos del dashboard.",
          },
          {
            key: "reducedMotion",
            label: "Reducir movimiento",
            description: "Reduce animaciones persistentes en superficies compatibles.",
          },
        ].map((item) => {
          const id = `setting-${item.key}`;

          return (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 px-4 py-3"
            >
              <div className="space-y-1">
                <Label htmlFor={id}>{item.label}</Label>
                <p className="text-sm text-white/60">{item.description}</p>
              </div>
              <Switch
                id={id}
                checked={Boolean(values[item.key as keyof SettingsFormProps])}
                onCheckedChange={(checked) =>
                  setValues((current) => ({
                    ...current,
                    [item.key]: checked,
                  }))
                }
              />
            </div>
          );
        })}

        <Button
          onClick={() =>
            startTransition(async () => {
              try {
                await updatePreferences({
                  theme: values.initialTheme,
                  notificationsEnabled: values.notificationsEnabled,
                  tickerEnabled: values.tickerEnabled,
                  keyboardShortcutsEnabled: values.keyboardShortcutsEnabled,
                  reducedMotion: values.reducedMotion,
                  defaultGridPreset: values.defaultGridPreset,
                });
                toast.success("Preferencias guardadas");
              } catch (error) {
                toast.error(
                  error instanceof Error ? error.message : "No se pudieron guardar las preferencias",
                );
              }
            })
          }
          disabled={isPending}
        >
          {isPending ? "Guardando..." : "Guardar preferencias"}
        </Button>
      </CardContent>
    </Card>
  );
}
