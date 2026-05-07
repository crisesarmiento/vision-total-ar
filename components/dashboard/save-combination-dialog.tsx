"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveCombination } from "@/actions/combinations";
import type { DashboardLayout } from "@/lib/dashboard-layout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SaveCombinationDialogProps = {
  layoutPayload: DashboardLayout;
  triggerLabel?: string;
};

export function SaveCombinationDialog({
  layoutPayload,
  triggerLabel = "Guardar combinación",
}: SaveCombinationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !isPending && setOpen(nextOpen)}>
      <DialogTrigger asChild>
        <Button aria-label={triggerLabel}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar combinación</DialogTitle>
          <DialogDescription>
            Guardá tu grilla actual para abrirla en segundos o compartirla con la comunidad.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          action={(formData) => {
            const name = formData.get("name");
            const description = formData.get("description");
            const visibility = formData.get("visibility");

            startTransition(async () => {
              try {
                await saveCombination({
                  name: String(name ?? ""),
                  description: String(description ?? ""),
                  visibility:
                    visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE",
                  layoutJson: layoutPayload,
                });
                toast.success("Combinación guardada.");
                setOpen(false);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "No se pudo guardar la combinación.",
                );
              }
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="combo-name">Nombre</Label>
            <Input
              id="combo-name"
              name="name"
              placeholder="Debate nocturno"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="combo-description">Descripción</Label>
            <Textarea
              id="combo-description"
              name="description"
              placeholder="Seguimiento de política, economía y streaming alternativo."
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="combo-visibility">Visibilidad</Label>
            <select
              id="combo-visibility"
              name="visibility"
              className="flex h-10 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm"
              defaultValue="PRIVATE"
              disabled={isPending}
            >
              <option value="PRIVATE">Privada</option>
              <option value="PUBLIC">Pública</option>
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} aria-busy={isPending} className="min-w-28">
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
